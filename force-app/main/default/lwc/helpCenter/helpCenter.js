import { LightningElement } from 'lwc';

export default class HelpCenter extends LightningElement {}
/*
    handleInput(event) { this.searchTerm = event.target.value; }
    async handleSearch(event) {
        event.preventDefault();
        const term = (this.searchTerm || '').trim();
        if (term.length < 2 || term.length > 100) {
            this.errorMessage = 'Enter 2–100 characters to search.';
            this.hasSearched = true;
            this.results = [];
            return;
        }
        const sequence = ++this.searchSequence;
        this.hasSearched = true;
        this.isLoading = true;
        this.errorMessage = '';
        this.results = [];
        try {
            const results = await searchArticles({ searchTerm: term });
            if (sequence === this.searchSequence) this.results = results;
        } catch (error) {
            if (sequence === this.searchSequence) this.errorMessage = 'Search is temporarily unavailable.';
        } finally {
            if (sequence === this.searchSequence) this.isLoading = false;
        }
    }
    clearSearch() {
        this.searchSequence++;
        this.searchTerm = '';
        this.results = [];
        this.hasSearched = false;
        this.errorMessage = '';
        this.isLoading = false;
    }
    toggleFaq(event) {
        const id = event.currentTarget.dataset.id;
        this.faqs = this.faqs.map(faq => faq.id === id
            ? { ...faq, expanded: !faq.expanded, symbol: faq.expanded ? '+' : '−' }
            : faq);
    }
    openArticle(event) {
        const isCommunity = this.pageReferenceType.startsWith('comm__');
        this[NavigationMixin.Navigate]({
            type: isCommunity ? 'comm__namedPage' : 'standard__appPage',
            attributes: isCommunity ? { name: 'Help_Article' } : { appPageName: 'Help_Article' },
            state: { article: event.currentTarget.dataset.url }
        });
    }
    get hasResults() { return this.results.length > 0; }
    get resultCount() { return this.results.length; }
    get hasError() { return Boolean(this.errorMessage); }
    get showInlineFaq() { return false; }
}*/
