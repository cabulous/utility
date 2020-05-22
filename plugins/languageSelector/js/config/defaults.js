const defaults = {
    // Logging to console
    debug: false,

    availableLocalesById: {},
    availableLocales: [],
    primaryLocaleById: {},
    merchantSelectedLocale: 'shop_base',
    selectorFlagMap: {},
    backgroundColor: '#FFFFFF',
    backgroundOpacity: '1.0',
    displayType: 'language_name',
    fontColor: '#000000',

    hasFlag: 'yes',

    storage: {
        enabled: true,
        key: 'tms',
    },

    selectors: {
        label: '.ht-tms-dropdown-label',
        dropdown: '.ht-tms-dropdown',
        selected: '.ht-tms-dropdown__selected',
        arrow: '.ht-tms-dropdown__arrow',
        listContainer: '.ht-tms-dropdown__list-container',
        list: '.ht-tms-dropdown__list',
        item: '.ht-tms-dropdown__list-item',
    },

    classNames: {
        dropdown: 'ht-tms-dropdown',
        dropdownFloat: 'ht-tms--float',
        position: {
            bottom: 'ht-tms--float-bottom',
            right: 'ht-tms--float-right',
        },
        label: 'ht-tms-dropdown__label',
        selected: 'ht-tms-dropdown__selected',
        arrow: 'ht-tms-dropdown__arrow',
        listContainer: 'ht-tms-dropdown__list-container',
        list: 'ht-tms-dropdown__list',
        item: 'ht-tms-dropdown__list-item',
        itemLabel: 'ht-tms-dropdown__list-item__label',
        flagHidden: 'ht-tms-dropdown__hide-flag',
        languageCode: 'ht-tms-dropdown--language-code',
    },

    cssVariables: {
        backgroundColorRgb: '--tms-selector-background-color-rgb',
        backgroundColorHex: '--tms-selector-background-color-hex',
        backgroundOpacity: '--tms-selector-background-opacity',
        fontColor: '--tms-selector-color',
    }
};

export default defaults;
