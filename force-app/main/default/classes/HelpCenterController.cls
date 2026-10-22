public with sharing class HelpCenterController {
    public class ArticleDTO {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String summary { get; set; }
        @AuraEnabled public String urlName { get; set; }
        public ArticleDTO(Knowledge__kav a) {
            id = a.Id; title = a.Title; summary = a.Summary; urlName = a.UrlName;
        }
    }
    private static void checkAccess() {
        if (!Schema.sObjectType.Knowledge__kav.isAccessible() ||
            !Schema.sObjectType.Knowledge__kav.fields.Title.isAccessible() ||
            !Schema.sObjectType.Knowledge__kav.fields.Summary.isAccessible() ||
            !Schema.sObjectType.Knowledge__kav.fields.UrlName.isAccessible()) {
            throw new AuraHandledException('Knowledge access is unavailable.');
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<ArticleDTO> getFaqs() {
        checkAccess();
        List<ArticleDTO> output = new List<ArticleDTO>();
        for (Knowledge__kav a : [
            SELECT Id, Title, Summary, UrlName FROM Knowledge__kav
            WHERE PublishStatus = 'Online' AND Language = 'en_US'
              AND IsVisibleInPkb = true
            WITH USER_MODE
            ORDER BY Title ASC LIMIT 10
        ]) output.add(new ArticleDTO(a));
        return output;
    }
    @AuraEnabled(cacheable=true)
    public static List<ArticleDTO> searchArticles(String searchTerm) {
        checkAccess();
        List<ArticleDTO> output = new List<ArticleDTO>();
        if (String.isBlank(searchTerm)) return output;
        String term = searchTerm.trim();
        if (term.length() < 2 || term.length() > 100)
            throw new AuraHandledException('Search must be 2–100 characters.');
        // Static SOSL with a bound parameter prevents query-string injection.
        List<List<SObject>> groups = [
            FIND :term IN ALL FIELDS
            RETURNING Knowledge__kav(
                Id, Title, Summary, UrlName
                WHERE PublishStatus = 'Online' AND Language = 'en_US'
                  AND IsVisibleInPkb = true
                LIMIT 50
            )
        ];
        for (SObject record : groups[0]) output.add(new ArticleDTO((Knowledge__kav)record));
        return output;
    }
    @AuraEnabled(cacheable=true)
    public static ArticleDTO getArticle(String urlName) {
        checkAccess();
        if (String.isBlank(urlName) ||
            !Pattern.matches('^[a-zA-Z0-9-]{1,255}$', urlName)) return null;
        List<Knowledge__kav> articles = [
            SELECT Id, Title, Summary, UrlName FROM Knowledge__kav
            WHERE UrlName = :urlName AND PublishStatus = 'Online'
              AND Language = 'en_US' AND IsVisibleInPkb = true
            WITH USER_MODE LIMIT 1
        ];
        return articles.isEmpty() ? null : new ArticleDTO(articles[0]);
    }
}