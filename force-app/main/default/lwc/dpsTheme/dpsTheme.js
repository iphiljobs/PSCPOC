import { LightningElement } from 'lwc';
import basePath from '@salesforce/community/basePath';

/**
 * Shared LWR theme layout.
 * @slot
 */
export default class DpsTheme extends LightningElement {
    siteUrl(path) {
        const root = (basePath || '').replace(/\/$/, '');
        return `${root}/${path}`;
    }
    get applyPermitUrl() { return this.siteUrl('apply-for-a-permit'); }
    get replacementPlatesUrl() { return this.siteUrl('replacement-plates'); }
    get billboardTransferUrl() { return this.siteUrl('billboard-ownership-transfer'); }
    get dashboardUrl() { return this.siteUrl('dashboard'); }
    get helpUrl() { return this.siteUrl('help'); }
    get complaintUrl() { return this.siteUrl('file-a-complaint'); }
    get contactUrl() { return this.siteUrl('contact-indot'); }
    get districtUrl() { return this.siteUrl('district-offices'); }
}