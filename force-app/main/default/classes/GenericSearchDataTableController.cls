public with sharing class GenericSearchDataTableController {
    public class TableResult {
        @AuraEnabled public List<Map<String, Object>> rows;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public List<String> fields;
    }

    @AuraEnabled
    public static TableResult searchRecords(String objectApiName, String columnFields,
        String searchFields, String searchTerm, Integer pageSize, Integer pageNumber) {
        if (String.isBlank(objectApiName) || !Schema.getGlobalDescribe().containsKey(objectApiName)) {
            throw new AuraHandledException('Invalid object API name.');
        }
        Schema.DescribeSObjectResult objectInfo =
            Schema.getGlobalDescribe().get(objectApiName).getDescribe();
        if (!objectInfo.isAccessible() || !objectInfo.isQueryable()) {
            throw new AuraHandledException('Object is not accessible.');
        }
        Map<String, Schema.SObjectField> fieldMap = objectInfo.fields.getMap();
        List<String> columns = parseFields(columnFields, fieldMap, true);
        List<String> searchable = parseFields(searchFields, fieldMap, false);
        if (columns.isEmpty()) throw new AuraHandledException('Configure at least one column.');
        if (searchable.isEmpty()) throw new AuraHandledException('Configure at least one search field.');

        Integer size = pageSize == null ? 20 : Math.max(1, Math.min(100, pageSize));
        Integer page = pageNumber == null ? 1 : Math.max(1, pageNumber);
        if (page > 2001) throw new AuraHandledException('Maximum supported offset is 2000. Narrow your search.');
        Integer offsetValue = (page - 1) * size;
        if (offsetValue > 2000) throw new AuraHandledException('Maximum supported offset is 2000. Narrow your search.');

        List<String> selectFields = new List<String>{ 'Id' };
        for (String fieldName : columns) if (!selectFields.contains(fieldName)) selectFields.add(fieldName);

        Map<String, Object> binds = new Map<String, Object>{
            'limitValue' => size,
            'offsetValue' => offsetValue
        };
        String filterClause = '';
        if (!String.isBlank(searchTerm)) {
            String term = searchTerm.trim();
            if (term.length() > 100) throw new AuraHandledException('Search must be 100 characters or fewer.');
            String escapedTerm = term.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
            binds.put('pattern', '%' + escapedTerm + '%');
            List<String> conditions = new List<String>();
            for (String fieldName : searchable) conditions.add(fieldName + ' LIKE :pattern');
            filterClause = ' WHERE (' + String.join(conditions, ' OR ') + ')';
        }

        String baseQuery = ' FROM ' + objectInfo.getName() + filterClause;
        Integer total = Database.countQueryWithBinds(
            'SELECT COUNT()' + baseQuery, binds, AccessLevel.USER_MODE);
        List<SObject> records = Database.queryWithBinds(
            'SELECT ' + String.join(selectFields, ',') + baseQuery +
            ' ORDER BY Id ASC LIMIT :limitValue OFFSET :offsetValue',
            binds, AccessLevel.USER_MODE);
        TableResult result = new TableResult();
        result.rows = new List<Map<String, Object>>();
        result.totalCount = total;
        result.fields = columns;
        for (SObject record : records) {
            Map<String, Object> row = new Map<String, Object>{ 'Id' => record.get('Id') };
            for (String fieldName : columns) row.put(fieldName, record.get(fieldName));
            result.rows.add(row);
        }
        return result;
    }

    private static List<String> parseFields(String csv,
        Map<String, Schema.SObjectField> available, Boolean allowAllTypes) {
        List<String> result = new List<String>();
        if (String.isBlank(csv)) return result;
        for (String token : csv.split(',')) {
            String name = token.trim();
            if (String.isBlank(name) || !available.containsKey(name)) {
                throw new AuraHandledException('Invalid field: ' + name);
            }
            Schema.DescribeFieldResult info = available.get(name).getDescribe();
            if (!info.isAccessible()) throw new AuraHandledException('Field is not accessible: ' + name);
            if (!allowAllTypes && !isSearchableType(info.getType())) {
                throw new AuraHandledException('Search field must be text-compatible: ' + name);
            }
            if (!result.contains(name)) result.add(name);
            if (result.size() > 20) throw new AuraHandledException('Maximum 20 fields.');
        }
        return result;
    }

    private static Boolean isSearchableType(Schema.DisplayType type) {
        return type == Schema.DisplayType.String ||
            type == Schema.DisplayType.Email ||
            type == Schema.DisplayType.Phone ||
            type == Schema.DisplayType.Url;
    }
}