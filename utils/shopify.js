// ==========================================================================
// Shopify
// ==========================================================================

import is from './is';

/**
 * Get domain from on page variables
 * @return {string}
 */
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
        shopDomain = scripts[i].src.substring(
          scripts[i].src.indexOf('shop=') + 5, scripts[i].src.length);
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

/**
 * Get product ID from the on page variables
 * @return {null|number}
 */
export function getProductId() {
  if (is.nullOrUndefined(window.meta) ||
    is.nullOrUndefined(window.meta.product) ||
    is.empty(window.meta.product.id)) {
    return null;
  }

  return window.meta.product.id;
}

/**
 * Get product handle from the current location
 * @return {string}
 */
export function getProductHandle() {
  const loc = window.location.href;
  let handle = loc.substr(loc.toLowerCase().indexOf('/products/') + 10);
  let end = handle.indexOf('?');
  if (end === -1) {
    end = handle.length;
  }
  handle = handle.substr(0, end);

  return handle;
}

/**
 * Get the locale from the string or current location
 * @param {string?} aPath
 * @return {null|string}
 */
export function getLocale(aPath) {
  const path = aPath || window.location.pathname;
  let pathParts = path.split('/');
  pathParts = pathParts.splice(1, pathParts.length);

  const localeRegexCase1 = /^[a-zA-Z]{2}$/;
  const localeRegexCase2 = /^[a-zA-Z]{2}-[a-zA-Z]{2}$/;
  const locale = pathParts[0].match(localeRegexCase1) ||
    pathParts[0].match(localeRegexCase2);

  if (locale === null) {
    return null;
  }

  return locale[0];
}

/**
 * Get pathname without locale
 */
export function getPathname() {
  const { pathname } = window.location;
  if (is.nullOrUndefined(pathname)) {
    throw new Error(`Expect a pathname but got ${pathname}`);
  }
  const locale = getLocale(pathname);
  if (is.nullOrUndefined(locale)) {
    return pathname;
  }
  if (pathname === `/${locale}`) {
    return '/';
  }
  return pathname.replace(`/${locale}`, '');
}

export function removeShopifyCustomPlayer() {
  const playerWrapperSelectors = ['.product-single__media--video'];
  let shopifyPlayerWrapper;

  for (let i = 0; i < playerWrapperSelectors.length; i += 1) {
    shopifyPlayerWrapper = document.querySelectorAll(playerWrapperSelectors[i]);
    if (shopifyPlayerWrapper.length > 0) break;
  }

  if (is.nullOrUndefined(shopifyPlayerWrapper)) return {
    result: false,
    elements: null,
  };

  Array.from(shopifyPlayerWrapper).forEach(playerWrapper => {
    // Cache video element
    const wrapper = playerWrapper;
    const videoElm = wrapper.getElementsByTagName('video')[0];
    const source = videoElm.getElementsByTagName('source')[0].src;
    const vimotiaVideoSourceElm = document.createElement('source');
    vimotiaVideoSourceElm.setAttribute('src', source);
    vimotiaVideoSourceElm.setAttribute('type', 'video/mp4');

    const vimotiaVideoElm = document.createElement('video');
    vimotiaVideoElm.setAttribute('class', 'vimotia__video-target');
    vimotiaVideoElm.setAttribute('playsinline', 'playsinline');
    vimotiaVideoElm.setAttribute('controls', 'controls');

    vimotiaVideoElm.appendChild(vimotiaVideoSourceElm);

    // Remove Shopify custom player
    wrapper.innerHTML = '';
    wrapper.appendChild(vimotiaVideoElm);
  });

  return { result: true, elements: shopifyPlayerWrapper };
}

/**
 * Check whether the container is a correct product image container
 * @param {HTMLElement} container
 * @return {boolean}
 */
export function isCorrectProductImageContainer(container) {
  const wrongContainerHints = [
    // Ella
    '.sidebar',
    // Avenue
    '#shopify-section-header',
    // Fastor(popup modal)
    '.mfp-container',
    // Boost theme (side related products)
    '.sticky-element .product-detail__adjacent',
    // Loft
    '.quick-smart-wrapper',
    // Annabelle
    '.modal.quick-view',
    // Wokiee
    '.modal .modal-body',
  ];

  for (let i = 0; i < wrongContainerHints.length; i += 1) {
    const wrongContainer = container.closest(wrongContainerHints[i]);
    if (wrongContainer && wrongContainer.length > 0) {
      return false;
    }
  }

  return true;
}

/**
 * Get all available Add to Cart forms on the page
 * @return {HTMLFormElement[]}
 */
export function getAddToCartForms() {
  return Array.from(document.getElementsByTagName('form'))
    .filter(
      form => form.action.includes('cart') || form.action.includes('checkout'),
    );
}

/**
 * @return {boolean}
 */
export function isProductPage() {
  return window.location.href.toLowerCase().indexOf('/products') > -1;
}

/**
 * @return {boolean}
 */
export function isCollectionPage() {
  return window.location.href.toLowerCase().indexOf('/collections') > -1;
}

/**
 * @return {boolean}
 */
export function isCartPage() {
  return window.location.href.toLowerCase().indexOf('/cart') > -1;
}

/**
 * @return {boolean}
 */
export function isBlogPage() {
  let pageType;
  try {
    pageType = window.meta.page.pageType;
  } catch (e) {
    throw new Error(e);
  }

  if (!is.nullOrUndefined(pageType)) {
    if (pageType === 'article') {
      return true;
    }
  }

  return window.location.href.toLowerCase().indexOf('/blogs') > -1;
}

/**
 * @return {boolean}
 */
export function isPagePage() {
  let pageType;
  try {
    pageType = window.meta.page.pageType;
  } catch (e) {
    throw new Error(e);
  }

  if (!is.nullOrUndefined(pageType)) {
    if (pageType === 'page') {
      return true;
    }
  }

  return window.location.href.toLowerCase().indexOf('/pages') > -1;
}

/**
 * @return {boolean}
 */
export function isCheckoutPage() {
  return window.location.href.toLowerCase().indexOf('/checkouts/') > -1;
}

/**
 * @return {boolean}
 */
export function isCheckoutShippingPaymentPage() {
  return window.location.href.toLowerCase().indexOf('step=payment_method') > -1
    || window.location.href.toLowerCase().indexOf('step=shipping_method') >
    -1;
}

/**
 * @return {boolean|boolean}
 */
export function isThankYouPage() {
  const { pathname } = window.location;
  return (
    (pathname.indexOf('/orders/') !== -1)
    || (pathname.indexOf('thank_you') !== -1)
  ); // for shopify_plus
}

/**
 * @param {string?} aPath
 * @return {boolean}
 */
export function isHomepage(aPath) {
  // home, meta = {"page":{"pageType":"home"}};
  // Free: Narrative, Debut, Jumpstart, Venture, Boundless, Simple, Brooklyn, Pop, Supply, Minimal
  // Paid: Reach, Modular, Motion, Loft, Split, Empire, Local, Venue, Editorial, Handy, Trademark, Capital, Vogue, Flow, Lorenza, Launch, Ira, Palo Alto, Maker, Label, Pipeline, Colors, Kagami, District, Elda, Kingdom, Grid, Showtime, Focal, Pacific, California, Icon, Parallax, Showcase, Alchemy, Startup, Testament, Blockshop, Retina, Mr Parker, Providence, Symmetry, Atlantic, Vantage, Mobilia, Editions, Masonry, Envy, Responsive, Expression, Fashionopolism
  // Wild: Turbo, Ella, MyShop
  // Sunrise demo missing meta tag
  let pageType;
  try {
    pageType = window.meta.page.pageType;
  } catch (e) {
    // console.log(e);
  }

  if (!is.nullOrUndefined(pageType)) {
    if (pageType === 'home') {
      return true;
    }

    if (
      pageType === 'collections' ||
      pageType === 'collection' ||
      pageType === 'product'
    ) {
      return false;
    }
  }

  const hints = [
    // Free: Narrative, Debut, Jumpstart, Venture, Boundless, Simple, Brooklyn, Pop, Supply, Minimal
    // Paid: Galleria, Modular, Motion, Loft, Split, Venue, Editorial, Trademark, Capital, Vogue, Flow, Lorenza, Launch, Ira, Palo Alto, Label, Pipeline, Colors, Kagami, District, Elda, Kingdom, Grid, Showtime, Focal, Pacific, California, Showcase, Alchemy, Startup, Blockshop, Symmetry, Atlantic, Editions, Masonry, Envy
    'body.template-index',
    // Paid: Sunrise
    'body#index',
    // Don't use div.index-section as an indicator. Motion theme product page has it
  ];

  for (let i = 0; i < hints.length; i += 1) {
    const element = document.querySelector(hints[i]);
    if (!is.nullOrUndefined(element)) {
      return true;
    }
  }

  const path = aPath || window.location.pathname;
  const locale = getLocale(path);
  return path === '/' || path === `/${locale}` || path === `/${locale}/`;
}

/**
 * Display a price based on money format settings on the store
 * @param {string} price
 * @return {string}
 */
export function addCurrencySymbol(price) {
  const regexAmount = new RegExp('{{.*?}}', 'i');
  const regexHTML = new RegExp('<("[^"]*"|\'[^\']*\'|[^\'">])*>', 'ig');
  let format;

  if (window.theme && window.theme.moneyFormat) {
    format = window.theme.moneyFormat;
  }

  if (window.theme
    && window.theme.strings
    && window.theme.strings.moneyFormat
  ) {
    format = window.theme.strings.moneyFormat;
  }

  if (window.moneyFormat) {
    format = window.moneyFormat;
  }

  // Turbo
  if (window.shopCurrency && window.Currency && window.Currency.money_format) {
    format = window.Currency.money_format[window.shopCurrency];
  } else if (window.Currency && window.Currency.money_format) {
    format = window.Currency.money_format;
  }

  if (!is.nullOrUndefined(format) && is.string(format)) {
    // Remove HTML tags in the money format because of money converter apps
    const matchesHTML = [...format.matchAll(regexHTML)];
    matchesHTML.forEach(match => {
      const content = match[0];
      if (is.string(content)) {
        format = format.replace(content, '');
      }
    });
    return format.replace(regexAmount, price);
  }

  // Otherwise, return Shopify currency
  if (window.Shopify
    && window.Shopify.currency
    && window.Shopify.currency.active
  ) {
    return `${price} ${window.Shopify.currency.active}`;
  }

  return `$${price}`;
}

/**
 * Redirect to cart page
 */
export function goToCartPage() {
  const { host } = window.location;
  const locale = is.nullOrUndefined(getLocale())
    ? ''
    : `${getLocale()}`;
  window.open(`https://${host}/${locale}/cart`, '_self');
}

/**
 * Get an image with a target size
 * @param {string} src
 * @param {number} size
 * @param {string=} resolution
 * @return {string}
 */
export function getImageAtSize(src, size, resolution = '2x') {
  const imageSuffix = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  let fileFormat = '';
  let fileFormatSuffixIndex = -1;

  for (let i = 0; i < imageSuffix.length; i += 1) {
    if (src.toLowerCase().includes(imageSuffix[i])) {
      fileFormat = imageSuffix[i];
      fileFormatSuffixIndex = src.toLowerCase().lastIndexOf(imageSuffix[i]);
      break;
    }
  }

  if (fileFormatSuffixIndex === -1) {
    return src;
  }

  let head = src.substring(0, fileFormatSuffixIndex);
  const sizeStr = `_${size}x${size}@${resolution}`;
  const tail = src.substring(fileFormatSuffixIndex, src.length);
  const sizeRegStr = '_[0-9]+x[0-9]+(@[0-9]+x)?';
  const sizeReg = new RegExp(sizeRegStr);
  const sizeAndFormatReg = new RegExp(`${sizeRegStr}${fileFormat}(\\?v)?`);
  const existingSizeStr = src.match(sizeReg);
  const existingSizeAndFormatStr = src.match(sizeAndFormatReg);

  if (existingSizeAndFormatStr === null) {
    return head + sizeStr + tail;
  }

  const indexOfSize = head.indexOf(existingSizeStr[0]);

  // This should not happen
  if (indexOfSize === -1) {
    return head + sizeStr + tail;
  }

  head = head.substring(0, indexOfSize);

  return head + sizeStr + tail;
}

export function isInShopifyAppIFrame() {
  try {
    return window.self !== window.top && window.name === 'app-iframe';
  } catch (e) {
    return true;
  }
}
