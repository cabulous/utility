// ==========================================================================
// Shopify
// ==========================================================================

import is from './is';

export function getShopDomain() {
    let shopDomain = '';

    // try get from on-page data
    if (is.object(window.Shopify) && is.string(window.Shopify.shop)) {
        shopDomain = window.Shopify.shop;
    }

    // try getting the myshopify domain from the Vimotia script
    if (!shopDomain) {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i += 1) {

            if (scripts[i].src.indexOf('vimotia') > -1) {
                shopDomain = scripts[i].src.substring(scripts[i].src.indexOf('shop=') + 5, scripts[i].src.length);
            }

            if (shopDomain) break;
        }
    }

    // try getting the custom domain from the URL
    if (!shopDomain) {
        shopDomain = document.domain;
    }

    return shopDomain;
}

export function getProductId() {
    if (is.nullOrUndefined(window.meta) || is.nullOrUndefined(window.meta.product) || is.empty(window.meta.product.id)) {
        return null;
    }

    return window.meta.product.id;
}
