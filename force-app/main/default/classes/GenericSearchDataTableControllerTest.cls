@IsTest
private class GenericSearchDataTableControllerTest {
    @IsTest
    static void searchesAndPaginatesAccessibleAccounts() {
        insert new List<Account>{
            new Account(Name='GenericSearch Alpha'),
            new Account(Name='GenericSearch Beta')
        };
        Test.startTest();
        GenericSearchDataTableController.TableResult result =
            GenericSearchDataTableController.searchRecords(
                'Account', 'Name', 'Name', 'GenericSearch', 1, 1);
        Test.stopTest();
        System.assertEquals(2, result.totalCount);
        System.assertEquals(1, result.rows.size());
        System.assert(result.rows[0].containsKey('Id'));
    }
    @IsTest
    static void rejectsUnapprovedFields() {
        try {
            GenericSearchDataTableController.searchRecords(
                'Account', 'DoesNotExist__c', 'Name', '', 20, 1);
            System.assert(false, 'Expected invalid field exception');
        } catch (AuraHandledException expected) {
            System.assertNotEquals(null, expected);
        }
    }
    @IsTest
    static void rejectsUnknownObject() {
        try {
            GenericSearchDataTableController.searchRecords(
                'NotARealObject__c', 'Name', 'Name', '', 20, 1);
            System.assert(false, 'Expected invalid object exception');
        } catch (AuraHandledException expected) {
            System.assertNotEquals(null, expected);
        }
    }
}