import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import isGuest from '@salesforce/user/isGuest';
import userId from '@salesforce/user/Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_NAME from '@salesforce/schema/User.Name';
import basePath from '@salesforce/community/basePath';

export default class PortalHeader extends NavigationMixin(LightningElement) {
    @api homePageName = 'Home';
    @api helpPageName = 'Help_Center';
    @api dashboardPageName = 'Dashboard';
    @api loginPath = 'login';
    @api registerPath = 'register';
    @api profilePath = 'profile';
    @api settingsPath = 'settings';
    mobileMenuOpen = false;
    activePage = '';

    @wire(CurrentPageReference)
    pageReferenceChanged(pageRef) {
        this.activePage = pageRef?.attributes?.name || '';
    }

    @wire(getRecord, { recordId: userId, fields: [USER_NAME] })
    userRecord;

    get isGuestUser() { return isGuest; }
    get isAuthenticated() { return !isGuest; }
    get profileName() {
        return getFieldValue(this.userRecord?.data, USER_NAME) || 'My Profile';
    }
    get homeHref() { return this.siteUrl(''); }
    get helpHref() { return this.siteUrl('help'); }
    get dashboardHref() { return this.siteUrl('dashboard'); }
    get loginHref() { return this.siteUrl(this.loginPath); }
    get registerHref() { return this.siteUrl(this.registerPath); }
    get navigationClass() { return this.mobileMenuOpen ? 'navigation open' : 'navigation'; }
    get mobileIcon() { return this.mobileMenuOpen ? 'utility:close' : 'utility:rows'; }
    get homeClass() { return this.activePage === this.homePageName ? 'nav-link active' : 'nav-link'; }
    get helpClass() { return this.activePage === this.helpPageName ? 'nav-link active' : 'nav-link'; }
    get dashboardClass() { return this.activePage === this.dashboardPageName ? 'nav-link active' : 'nav-link'; }
    get homeAriaCurrent() { return this.activePage === this.homePageName ? 'page' : null; }
    get helpAriaCurrent() { return this.activePage === this.helpPageName ? 'page' : null; }
    get dashboardAriaCurrent() { return this.activePage === this.dashboardPageName ? 'page' : null; }

    siteUrl(relativePath) {
        const root = (basePath || '').replace(/\/$/, '');
        const path = (relativePath || '').replace(/^\/+/, '');
        return path ? `${root}/${path}` : `${root}/`;
    }
    toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
    navigateHome(event) {
        event.preventDefault();
        this.navigateNamedPage(this.homePageName);
    }
    navigateToPage(event) {
        event.preventDefault();
        const name = event.currentTarget.dataset.page;
        const pageNames = {
            Home: this.homePageName,
            Help_Center: this.helpPageName,
            Dashboard: this.dashboardPageName
        };
        this.navigateNamedPage(pageNames[name]);
    }
    navigateNamedPage(name) {
        this.mobileMenuOpen = false;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: { name }
        });
    }
    handleProfileMenu(event) {
        switch (event.detail.value) {
            case 'profile':
                window.location.assign(this.siteUrl(this.profilePath));
                break;
            case 'settings':
                window.location.assign(this.siteUrl(this.settingsPath));
                break;
            case 'logout':
                // Salesforce session logout endpoint; confirm the resulting return page in your site.
                window.location.assign('/secur/logout.jsp');
                break;
            default:
                break;
        }
    }
}