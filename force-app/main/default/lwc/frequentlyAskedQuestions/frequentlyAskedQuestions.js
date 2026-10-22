import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getFaqs from '@salesforce/apex/HelpCenterController.getFaqs';

export default class FrequentlyAskedQuestions extends NavigationMixin(LightningElement) {
    faqs = [];
    faqError = '';
    pageReferenceType = '';

    @wire(CurrentPageReference)
    wiredPageReference(pageRef) { this.pageReferenceType = pageRef?.type || ''; }

    @wire(getFaqs)
    wiredFaqs({ data, error }) {
        if (data) {
            this.faqs = data.map(faq => ({ ...faq, expanded: false, symbol: '+', answerId: `faq-answer-${faq.id}` }));
            this.faqError = '';
        } else if (error) {
            this.faqError = 'Unable to load frequently asked questions.';
        }
    }

    toggleFaq(event) {
        const id = event.currentTarget.dataset.id;
        this.faqs = this.faqs.map(faq => faq.id === id
            ? { ...faq, expanded: !faq.expanded, symbol: faq.expanded ? '+' : '-' } : faq);
    }

    openArticle(event) {
        const isCommunity = this.pageReferenceType.startsWith('comm__');
        this[NavigationMixin.Navigate]({
            type: isCommunity ? 'comm__namedPage' : 'standard__appPage',
            attributes: isCommunity ? { name: 'Help_Article' } : { appPageName: 'Help_Article' },
            state: { article: event.currentTarget.dataset.url }
        });
    }
}
