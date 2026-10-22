# PSCPOC — Salesforce LWR Permit Help Center

A Salesforce DX proof of concept for the public Help Center wireframe: purple/yellow hero, Knowledge search, expandable FAQs, and article detail navigation.

## Contents
- `helpCenter` LWC: search + FAQ accordion + results.
- `helpArticleDetail` LWC: article summary detail view.
- `HelpCenterController` Apex: published Knowledge queries.
- Salesforce DX project configuration.

## Org prerequisites
1. Enable Salesforce Knowledge and an LWR Experience Cloud site.
2. On `Knowledge__kav`, create `Display_as_FAQ__c` (Checkbox) and `FAQ_Order__c` (Number 3,0). Verify field API names.
3. Publish English (`en_US`) articles with Public Knowledge Base visibility. Set FAQ flags/order for the FAQ subset.
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
