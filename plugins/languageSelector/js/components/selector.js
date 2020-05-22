import {
    DEFAULT_LOCALE_COOKIE_KEY,
    DOWN_ARROW_KEY,
    ENTER_KEY,
    ESCAPE_KEY,
    INSTALLATION_VERIFY_KEY,
    INSTALLATION_VERIFY_TRUE_VALUE,
    PREVIOUS_PATHNAME_COOKIE_KEY,
    SPACEBAR_KEY,
    UP_ARROW_KEY,
} from '../config/constants';
import defaults from "../config/defaults";
import Console from "../utils/console";
import { readCookie, removeCookie, writeCookie } from '../utils/cookies';
import { removeElement, createElement } from '../utils/elements';
import { unbindListeners } from '../utils/events';
import fetch from '../utils/fetch';
import { inIframe } from '../utils/iframe';
import is from '../utils/is';
import { extend } from "../utils/objects";
import { getLocale, isHomepage } from '../utils/shopify';
import Storage from '../utils/storage';
import Dialog from './dialog';
import Listeners from './listeners';
import ui from "./ui";

class Selector {
    constructor(aTarget, options = {}) {
        this.debug = new Console();

        this.install = true;

        this.config = extend(
            {},
            defaults,
            options,
        );

        // Take case of unexpected data type
        if (is.nullOrUndefined(this.config.selectorFlagMap) || is.string(this.config.selectorFlagMap)) {
            this.config.selectorFlagMap = {};
        }

        if (is.nullOrUndefined(this.config.displayType)) {
            this.config.displayType = "language_name";
        }

        this.elements = {
            body: document.querySelector('body'),
            target: aTarget || {
                desktop: document.querySelector('body'),
                mobile: document.querySelector('body'),
            },
            dropdown: null,
            list: null,
            listContainer: null,
            dropdownArrow: null,
            listItemsById: {},
            listItems: [],
            dropdownSelectedNode: null,
        };

        // Get elements on page if the HTML structure exists
        // It happens when the user chooses the "float" option, which inserting the HTML and CSS in the Liquid code.
        this.getElements();

        this.inIframe = inIframe();
        this.inWhiteList = Selector.isWhiteList();

        // Log config options
        this.debug.log('Config', this.config);

        this.eventListeners = [];

        // Create listeners
        this.listeners = new Listeners(this);

        // Create local storage
        this.storage = new Storage(this);

        // Setup interface
        if (is.nullOrUndefined(this.elements.dropdown)) {
            this.debug.log("No elements found. Injecting UI...")
            ui.inject.call(this);
        }

        // Attach listeners
        this.listeners.container();

        // Display the selector
        this.displayCurrentLanguage();

        // Check install and redirect
        this.checkInstall();

        // Create dialog
        if (this.inIframe) {
            this.debug.log('We are in an iframe, creating dialog...');

            this.dialog = new Dialog({
                title: 'View TMS selector on your live site',
                bodyText: `To offer the best user experience, we disabled some TMS selector features in the Shopify theme editor, such as the locale redirection. The best way to experience the selector is by viewing it on your live site at ${window.location.origin}.`,
                confirmButtonText: '👍 Got it',
            });

            this.dialog.inject();
        }

        // Log elements and event listeners
        this.debug.log('Elements', this.elements);
        this.debug.log('Event listeners', this.eventListeners);
    }

    // ---------------------------------------
    // API
    // ---------------------------------------

    checkInstall() {
        this.debug.log('Checking installation status...');

        const installedCache = this.storage.get(INSTALLATION_VERIFY_KEY);
        const currentPathname = window.location.pathname;
        const previousPathname = readCookie('tms_previous_pathname');

        writeCookie(PREVIOUS_PATHNAME_COOKIE_KEY, window.location.pathname);

        if (installedCache === null || currentPathname === previousPathname) {
            // Fetch the latest installation status when
            //  - it is an initial check
            //  - the merchant refresh the page

            const installationEndpoint = process.env.NODE_ENV === 'development'
                ? 'https://tmsbeta.hexjerry.com/tms_install_check'
                : 'https://tms.hextom.com/tms_install_check';

            const url = new URL(installationEndpoint);
            url.searchParams.append('shop', window.Shopify.shop || '');

            fetch(url, 'json')
                .then(response => {
                    const installed = response[INSTALLATION_VERIFY_KEY]; // installed, uninstalled,

                    if (installed !== INSTALLATION_VERIFY_TRUE_VALUE) {
                        this.debug.log('The app was uninstalled. Destroy the selector.');

                        this.install = false;

                        this.destroy();
                    }

                    // Cache installation status
                    this.storage.set({
                        [INSTALLATION_VERIFY_KEY]: installed,
                    });

                    if (this.inWhiteList) {
                        this.debug.log("White list: Go to primary locale.");
                        this.goToLocale(Object.keys(this.config.primaryLocaleById)[0]);
                    } else {
                        this.goToDefaultLocale();
                    }

                    this.applyFormsActionLocale();
                })
                .catch(error => {
                    this.debug.error('Fetch error', error);
                })

        } else if (installedCache === INSTALLATION_VERIFY_TRUE_VALUE) {
            if (this.inWhiteList) {
                this.debug.log("White list: Go to primary locale.");
                this.goToLocale(Object.keys(this.config.primaryLocaleById)[0]);
            } else {
                this.goToDefaultLocale();
            }

            this.applyFormsActionLocale();

        } else {
            this.debug.log('The app was uninstalled. Destroy the selector.');

            this.install = false;

            this.destroy();
        }
    }

    getElements() {
        this.elements.dropdown = document.querySelector(this.config.selectors.dropdown);

        if (is.nullOrUndefined(this.elements.dropdown)) {
            this.debug.log("There is no selector instance on page.");
            return;
        }

        this.elements.list = document.querySelector(this.config.selectors.list);
        this.elements.listContainer = document.querySelector(this.config.selectors.listContainer);
        this.elements.dropdownArrow = document.querySelector(this.config.selectors.arrow);
        this.elements.dropdownSelectedNode = document.querySelector(this.config.selectors.selected);

        const listItems = document.querySelectorAll(this.config.selectors.item);

        listItems.forEach(item => {
            this.elements.listItems.push(item.id);
            this.elements.listItemsById[item.id] = item;
        });
    }

    // This is implemented because pages are not ready for locale.
    // Usually, these pages are created by 3rd-party apps.
    static isWhiteList() {
        const whiteListURLs = [
            '/pages/order-tracking-form',
            '/apps/trackorder',
            '/apps/shipway_track',
            '/apps/trackingmore',
            '/a/contact',
            '/a/returns',
            '/a/wishlist',
            '/apps/parcelpanel'
        ];

        for (let i = 0; i < whiteListURLs.length; i+=1) {
            if (window.location.pathname.toLowerCase().indexOf(whiteListURLs[i]) >= 0) {
                return true;
            }
        }

        return false;
    }

    goToDefaultLocale() {
        // Bail if the app is uninstalled
        if (!this.install) return;

        const primaryLocale = Object.keys(this.config.primaryLocaleById)[0];
        const defaultLocale = readCookie(DEFAULT_LOCALE_COOKIE_KEY);
        const isAvailable = this.config.availableLocales.includes(defaultLocale);
        const visitorPriorityLocale = this.getVisitorLocale() || primaryLocale;
        const merchantSelectedLocale = this.config.merchantSelectedLocale === 'shop_base' ? primaryLocale : visitorPriorityLocale;
        const currentLocale = getLocale() || primaryLocale;

        this.debug.log(`Default locale is: ${defaultLocale}`);
        this.debug.log(`Default locale is available:  ${isAvailable}`);
        this.debug.log(`Visitor priority locale is: ${visitorPriorityLocale}`);
        this.debug.log(`Merchant selected locale is: ${merchantSelectedLocale}`);
        this.debug.log(`Current locale is: ${currentLocale}`);
        this.debug.log(`Current page is homepage: ${isHomepage()}`);

        // Bail if the TMS store config is missing
        // This check guarantees the function stops when the app is uninstalled
        if (is.nullOrUndefined(merchantSelectedLocale) &&
            is.nullOrUndefined(visitorPriorityLocale) &&
            !isAvailable
        ) {
            this.debug.log('Stop: No TMS config. Stop goToDefaultLocale.');
            return;
        }

        // Bail if the TMS is running in the Shopify editor
        if (this.inIframe) {
            this.debug.log('Stop: We are in an iframe. Stop goToDefaultLocale.');
            return;
        }

        // First-time visit OR the default locale is not available due to the locale removal in Shopify Admin
        if (is.nullOrUndefined(defaultLocale) || !isAvailable) {
            this.debug.log('No default locale.');

            if (currentLocale === primaryLocale) {
                this.debug.log('No explicit locale in URL. Go to merchant selected locale.');
                writeCookie(DEFAULT_LOCALE_COOKIE_KEY, merchantSelectedLocale, 86400);
                this.goToLocale(merchantSelectedLocale);
            } else {
                this.debug.log('Visit a explicit locale in URL. Update default locale. Stay.');
                writeCookie(DEFAULT_LOCALE_COOKIE_KEY, currentLocale, 86400);
            }

            return;
        }

        // Stay if the visitor is in the default locale
        if (defaultLocale.toLowerCase() === currentLocale.toLowerCase()) {
            this.debug.log('Stop: already at default locale. Stop goToDefaultLocale.');
            return;
        }

        // Stay if the visitor explicit visit a URL
        if (document.referrer.length === 0) {
            this.debug.log('Visit a explicit locale in URL. Update default locale. Stay.');
            writeCookie(DEFAULT_LOCALE_COOKIE_KEY, currentLocale, 86400);
            return;
        }

        // Go to default locale
        this.debug.log('Go to default locale.');
        this.goToLocale(defaultLocale);
    }

    applyFormsActionLocale() {
        // Bail if the app is uninstalled
        if (!this.install) return;

        const forms =
            Array.from(document.getElementsByTagName('form'))
                .filter(form => {
                    return form.action.includes('cart') || form.action.includes('checkout') || form.action.includes('search');
                });

        forms.forEach(form => {
            const newForm = form;
            const formActionPath = form.action.replace(window.location.origin, '');
            const formActionLocale = getLocale(formActionPath) || Object.keys(this.config.primaryLocaleById)[0];
            const defaultLocale = readCookie(DEFAULT_LOCALE_COOKIE_KEY) || Object.keys(this.config.primaryLocaleById)[0];

            if (formActionLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
                newForm.action = `/${defaultLocale}${formActionPath}`;
            }
        });
    }

    getVisitorLocale() {
        if (!window.navigator.language) {
            return null;
        }

        const visitorLanIsoCodes = [window.navigator.language.slice(0, 2), window.navigator.language];

        for (let i = 0; i < visitorLanIsoCodes.length; i += 1) {
            if (this.elements.listItems.includes(visitorLanIsoCodes[i])) {
                return visitorLanIsoCodes[i];
            }
        }

        return null;
    }

    /**
     * @param {String} locale
     */
    goToLocale(locale) {
        const primaryLocaleIsoCode = Object.keys(this.config.primaryLocaleById)[0];
        const currentLocale = getLocale() || primaryLocaleIsoCode;
        let nextLocale = locale;

        if (is.nullOrUndefined(primaryLocaleIsoCode)) {
            this.debug.error("No primary locale ISO code.");
            return;
        }

        if (is.nullOrUndefined(nextLocale)) {
            this.debug.error("No locale argument.");
            return;
        }

        // Bail if the user is at the correct locale
        if (nextLocale.toLowerCase() === currentLocale.toLowerCase()) {
            this.debug.log("Stop: user is at the correct locale");
            return;
        }

        // Remove locale ISO code in the URL
        let path = window.location.pathname;
        const pathParts = window.location.pathname.split('/');
        const hasLocaledInUrl = getLocale();
        if (hasLocaledInUrl) {
            path = pathParts.slice(2, pathParts.length).join('/');
        }

        // Remove the next locale ISO code if it is the primary locale
        // The primary one doesn't have a locale code in its URL
        if (primaryLocaleIsoCode.toLowerCase() === nextLocale.toLowerCase()) {
            nextLocale = '/';
        } else if (hasLocaledInUrl !== null) {
            nextLocale = `/${nextLocale}/`;
        } else {
            nextLocale = `/${nextLocale}`;
        }

        window.location.href = nextLocale + path;
    }

    setSelectedListItem(e) {
        const node = this.elements.dropdownSelectedNode;
        const container = createElement('div', {class: this.config.classNames.item});
        container.innerHTML = e.currentTarget.innerHTML;
        node.innerHTML = null;
        node.appendChild(container);
    }

    closeList() {
        this.elements.list.classList.remove("ht-tms-open");
        this.elements.dropdownArrow.classList.remove("ht-tms-expanded");
        this.elements.listContainer.setAttribute("aria-expanded", false);
    }

    toggleListVisibility(e) {
        const openDropDown = e.key === SPACEBAR_KEY || e.key === ENTER_KEY;

        if (e.key === ESCAPE_KEY) {
            this.closeList();
        }

        if (e.type === "click" || openDropDown || e.type === "mouseenter") {
            this.elements.list.classList.toggle("ht-tms-open");
            this.elements.dropdownArrow.classList.toggle("ht-tms-expanded");
            this.elements.listContainer.setAttribute(
                "aria-expanded",
                this.elements.list.classList.contains("open"),
            );

            if (e.key === DOWN_ARROW_KEY) {
                this.focusNextListItem(DOWN_ARROW_KEY);
            }

            if (e.key === UP_ARROW_KEY) {
                this.focusNextListItem(UP_ARROW_KEY);
            }
        }
    }

    focusNextListItem(direction) {
        const activeElementId = document.activeElement.id;

        if (activeElementId === "ht-tms-dropdown__selected") {
            document.querySelector(this.elements.listItems[0]).focus();
        } else {
            const currentActiveElementIndex = this.elements.listItems.indexOf(activeElementId);
            let nextListItemId = null;

            if (direction === DOWN_ARROW_KEY) {
                const currentActiveElementIsNotLastItem = currentActiveElementIndex < this.elements.listItems.length - 1;

                if (currentActiveElementIsNotLastItem) {
                    nextListItemId = this.elements.listItems[currentActiveElementIndex + 1];
                    document.querySelector(`#${nextListItemId}`).focus();
                }
            } else if (direction === UP_ARROW_KEY) {
                const currentActiveElementIsNotFirstItem = currentActiveElementIndex > 0;

                if (currentActiveElementIsNotFirstItem) {
                    nextListItemId = this.elements.listItems[currentActiveElementIndex - 1];
                    document.querySelector(`#${nextListItemId}`).focus();
                }
            }
        }
    }

    displayCurrentLanguage() {
        const currentLocale = getLocale() || Object.keys(this.config.primaryLocaleById)[0];
        let selectedItem = null;

        Object.keys(this.elements.listItemsById).forEach(id => {
            if (is.nullOrUndefined(id)) {
                this.debug.error('No id.');
                return;
            }

            if (id.toLowerCase() === currentLocale.toLowerCase()) {
                selectedItem = this.elements.listItemsById[id];
            }
        });

        if (selectedItem === null) return;

        const selectedItemHtml = selectedItem.innerHTML;
        const container = createElement('div', {class: this.config.classNames.item});
        container.innerHTML = selectedItemHtml;

        const selectedNode = this.elements.dropdownSelectedNode;
        selectedNode.innerHTML = null;
        selectedNode.appendChild(container);

        this.elements.dropdown.classList.add('ht-tms-ready');
    }

    destroy() {
        // Unbind listeners
        unbindListeners.call(this);

        // Remove the element
        removeElement(this.elements.dropdown);

        // Clear cookies
        removeCookie(DEFAULT_LOCALE_COOKIE_KEY);

        // Clear for garbage collection
        setTimeout(() => {
            this.elements = null;
        }, 200);
    }
}

export default Selector;
