import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import searchRecords from '@salesforce/apex/GenericSearchDataTableController.searchRecords';

export default class GenericSearchDataTable extends NavigationMixin(LightningElement) {
    @api objectApiName = 'Account';
    @api columnFields = 'Name,Phone';
    @api searchFields = 'Name,Phone';
    @api pageSize = 20;

    searchTerm = '';
    rows = [];
    totalCount = 0;
    pageNumber = 1;
    isLoading = false;
    errorMessage = '';
    requestId = 0;
    searchTimer;

    connectedCallback() { this.loadRecords(); }
    disconnectedCallback() {
        clearTimeout(this.searchTimer);
        this.requestId++;
    }

    get parsedFields() {
        return (this.columnFields || '').split(',').map(field => field.trim()).filter(Boolean);
    }
    get configurationError() {
        return !this.objectApiName || !this.parsedFields.length || !this.searchFields?.trim()
            ? 'Configure an object, display columns, and search fields.' : '';
    }
    get columns() {
        return [
            ...this.parsedFields.map(field => ({
                label: field.replace(/__c$/, '').replace(/_/g, ' '),
                fieldName: field,
                type: 'text'
            })),
            { type: 'action', typeAttributes: { rowActions: [{ label: 'View', name: 'view' }] } }
        ];
    }
    get countLabel() { return `${this.totalCount} records`; }
    get pageLabel() {
        const totalPages = Math.max(1, Math.ceil(this.totalCount / this.normalizedPageSize));
        return `Page ${this.pageNumber} of ${totalPages}`;
    }
    get normalizedPageSize() {
        const size = Number(this.pageSize);
        return Number.isFinite(size) ? Math.max(1, Math.min(100, Math.floor(size))) : 20;
    }
    get disablePrevious() { return this.isLoading || this.pageNumber <= 1; }
    get disableNext() {
        return this.isLoading || this.pageNumber * this.normalizedPageSize >= this.totalCount ||
            this.pageNumber * this.normalizedPageSize > 2000;
    }
    get showEmpty() { return !this.isLoading && !this.errorMessage && !this.rows.length; }

    handleSearchChange(event) {
        this.searchTerm = event.target.value || '';
        this.pageNumber = 1;
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.loadRecords(), 350);
    }
    async loadRecords() {
        if (this.configurationError) return;
        const currentRequest = ++this.requestId;
        this.isLoading = true;
        this.errorMessage = '';
        try {
            const result = await searchRecords({
                objectApiName: this.objectApiName,
                columnFields: this.columnFields,
                searchFields: this.searchFields,
                searchTerm: this.searchTerm,
                pageSize: this.normalizedPageSize,
                pageNumber: this.pageNumber
            });
            if (currentRequest !== this.requestId) return;
            this.rows = result.rows || [];
            this.totalCount = result.totalCount || 0;
        } catch (error) {
            if (currentRequest !== this.requestId) return;
            this.rows = [];
            this.totalCount = 0;
            this.errorMessage = error?.body?.message || 'Unable to load records.';
        } finally {
            if (currentRequest === this.requestId) this.isLoading = false;
        }
    }
    previousPage() { if (!this.disablePrevious) { this.pageNumber--; this.loadRecords(); } }
    nextPage() { if (!this.disableNext) { this.pageNumber++; this.loadRecords(); } }
    handleRowAction(event) {
        if (event.detail.action.name !== 'view') return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.row.Id,
                objectApiName: this.objectApiName,
                actionName: 'view'
            }
        });
    }
}