# PSCPOC — Salesforce LWR Permit Help Center

A Salesforce DX proof of concept for the public Help Center wireframe: purple/yellow hero, Knowledge search, expandable FAQs, and article detail navigation.

## Contents
- `helpCenter` LWC: search + FAQ accordion + results.
- `helpArticleDetail` LWC: article summary detail view.
- `HelpCenterController` Apex: published Knowledge queries.
- Salesforce DX project configuration.

## Org prerequisites
1. Enable Salesforce Knowledge and an LWR Experience Cloud site.
2. No custom FAQ fields are required. The FAQ section shows up to 10 eligible public Knowledge articles, sorted alphabetically by Title.
3. Publish English (`en_US`) articles with Public Knowledge Base visibility. All eligible public articles may appear in FAQs; consider Data Categories later for curated FAQ selection.
4. Create LWR named pages with API names `Help_Center` and `Help_Article`. Place the matching LWCs on each page.
5. Configure the shared site header with Home, Help, Login, Register navigation; login and registration depend on site authentication setup.
6. Grant the Apex class and minimum Knowledge/field access to the site guest user and authenticated audiences as required. Test visibility in an incognito session.
7. Publish the Experience Cloud site.

## Deploy
```bash
sf org login web --alias pscpoc
sf project deploy start --target-org pscpoc
```

## Important POC limitations
- **Not production-certified**: no org deployment or Apex test execution has been performed.
- Search is SOSL-based, with published, English, public-channel filters; verify that site/network, Data Category, and guest visibility enforce your intended audience.
- Article detail currently displays **Summary**, not the full article body.
- No custom header/theme metadata or site pages are deployed automatically; configure those in Experience Builder.
- API version 65.0 is a project default; change if your org does not support it.
- Add Apex unit tests and validate SOSL syntax, Knowledge permissions, field access, search indexing, and LWR routing in the target org before production use.

## Shared LWR portal header
The `portalHeader` LWC provides a responsive shared header. Guests see **Home**, **Help**, **Log In**, **Register**. Signed-in users see **Home**, **Help**, **Dashboard**, and a profile-name dropdown with **My Profile**, **Account Settings**, and **Log Out**.

1. Deploy the LWC, open **Experience Builder**, and add **PSC Portal Header** to the **shared Header region** of your LWR theme layout. Remove existing header/navigation components to prevent duplication. **This repository does not deploy or automatically replace the site's theme/header.**
2. Create or confirm named page API names `Home`, `Help_Center`, and `Dashboard`. Change the exposed header properties in Experience Builder if your actual API names differ.
3. Set the login, registration, profile, and account settings relative paths to the **actual site routes** in your Experience Cloud site. Defaults (`login`, `register`, `profile`, `settings`) are placeholders and may not exist. The component builds site-relative URLs using `@salesforce/community/basePath`.
4. The header uses `@salesforce/user/isGuest` and reads `User.Name` via UI API for the signed-in user's menu label. Validate the profile name visibility and account page permissions for external users.
5. The dropdown logout action uses Salesforce's `/secur/logout.jsp` endpoint. **Verify this endpoint and its redirect behavior for your LWR domain and SSO configuration**; adapt if your org requires a different logout flow.
6. Replace the **placeholder heart icon** with your approved department logo when an asset is available. Test desktop/mobile, guest, authenticated, keyboard navigation, and active tab behavior, then **Publish** the site.

**Security:** Hiding Dashboard for guests does not secure it. Enforce page access, object permissions, and Apex sharing separately.

## INDOT Build Your Own (LWR) theme layout

The screenshot-inspired `dpsTheme` is an LWR **theme layout component** (`lightningCommunity__Theme_Layout`), with:
- Shared responsive `c-portal-header` (INDOT branding, Home/Help, guest Log In/Register; Dashboard and account dropdown for signed-in users)
- Unnamed default `<slot></slot>` for Experience Builder page content
- Responsive four-column INDOT footer, collapsing to two columns and one column on smaller screens
- Flexbox sticky-bottom footer behavior for short pages, accessible semantic landmarks and F6 regions

**Activate in Experience Builder:** Deploy `portalHeader` and `dpsTheme`, open **Settings → Theme → New Theme Layout**, choose **DPS Theme** as the theme layout component, and assign the theme layout to the appropriate pages (or as the default where supported). Publish the site. Do **not** add another `portalHeader` in the page header, because this theme already renders it.

**Important setup:** The screenshot's Emergency Permits card is page content, not theme content. Add that card on the Home page separately. The D:PS logo is a CSS/text placeholder, not the official INDOT logo; replace with a licensed/approved logo asset for exact fidelity. Footer application/support routes are provisional: create matching site routes or update the getters in `dpsTheme.js`. Existing header route defaults and the logout redirect also need validation in the org. The screenshot's chat bubble is not implemented (requires a configured chat/messaging service). This is source code only; no Salesforce org deployment or pixel-perfect browser validation has been performed.

### Salesforce LWR layout standards
The `dpsTheme` component follows [Salesforce's LWR custom layout documentation](https://developer.salesforce.com/docs/platform/exp-cloud-lwr/guide/get-started-layout.html): `lightningCommunity__Theme_Layout` target, unnamed default `<slot></slot>` for page content, a `@slot` JSDoc annotation immediately preceding the LWC class declaration, and `data-f6-region` landmarks. There are no Experience Builder design properties; if added later, declare them under `lightningCommunity__Default` in the metadata file. Assign **DPS Theme** as the page theme layout in Experience Builder after deployment.
