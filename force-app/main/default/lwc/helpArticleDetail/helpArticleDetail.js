import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getArticle from '@salesforce/apex/HelpCenterController.getArticle';

export default class HelpArticleDetail extends NavigationMixin(LightningElement) {
    article;
    errorMessage;
    requestNumber = 0;
    @wire(CurrentPageReference)
    async handlePageReference(pageRef) {
        const urlName = pageRef?.state?.article;
        const request = ++this.requestNumber;
        this.article = null;
        this.errorMessage = null;
        if (!urlName) { this.errorMessage = 'No article selected.'; return; }
        try {
            const result = await getArticle({ urlName });
            if (request !== this.requestNumber) return;
            if (result) this.article = result;
            else this.errorMessage = 'Article not found or unavailable.';
        } catch (error) {
            if (request === this.requestNumber) this.errorMessage = 'Unable to load this article.';
        }
    }
    backToHelp() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: { name: 'Help_Center' }
        });
    }
}