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

export function getLocale(aPath) {
    const path = aPath || window.location.pathname;
    let pathParts = path.split('/');
    pathParts = pathParts.splice(1, pathParts.length);

    const localeRegexCase1 = /^[a-zA-Z]{2}$/;
    const localeRegexCase2 = /^[a-zA-Z]{2}-[a-zA-Z]{2}$/;
    const locale = pathParts[0].match(localeRegexCase1) || pathParts[0].match(localeRegexCase2);

    if (locale === null) {
        return null;
    }

    return locale[0];
}

export function getAddToCartForms() {
    return Array.from(document.getElementsByTagName('form'))
        .filter(form => {
            return form.action.includes('cart') || form.action.includes('checkout');
        });
}

export function isProductPage() {
    return window.location.href.toLowerCase().indexOf('/products/') > -1;
}

export function isCollectionpage() {
    return window.location.href.toLowerCase().indexOf('/collections') > -1;
}

export function isCartPage() {
    return window.location.href.toLowerCase().indexOf('/cart') > -1;
}

export function isCheckoutPage() {
    return window.location.href.toLowerCase().indexOf('/checkouts/') > -1;
}

export function isCheckoutShippingPaymentPage() {
    return window.location.href.toLowerCase().indexOf('step=payment_method') > -1
        || window.location.href.toLowerCase().indexOf('step=shipping_method') > -1;
}

export function isThankYouPage() {
    const {pathname} = window.location;
    return (pathname.indexOf('checkout') !== -1) && (pathname.indexOf('thank_you') !== -1); // for shopify_plus
}

export function isHomepage(aPath) {
    const path = aPath || window.location.pathname;
    const locale = getLocale(path);

    return path === '/' || path === `/${locale}` || path === `/${locale}/`;
}
