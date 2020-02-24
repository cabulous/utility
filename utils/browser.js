// ==========================================================================
// Browser sniffing
// Unfortunately, due to mixed support, UA sniffing is required
// ==========================================================================

const browser = {
    isIPhone: /(iPhone|iPod)/gi.test(navigator.platform),
    isIos: /(iPad|iPhone|iPod)/gi.test(navigator.platform),
    // Internet Explorer 6-11
    isIE: /* @cc_on!@ */ false || !!document.documentMode,
    // Edge 20+
    isEdge: window.navigator.userAgent.includes('Edge') || (!browser.isIE && !!window.StyleMedia),
    // Opera 8.0+
    isOpera: (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
    // Firefox 1.0+
    isFirefox: typeof InstallTrigger !== 'undefined',
    // Safari 3.0+ "[object HTMLElementConstructor]"
    isSafari: /constructor/i.test(window.HTMLElement) || (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)),
    // Chrome 1 - 79
    isChrome: !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
    // Edge (based on chromium) detection
    isEdgeChromium: browser.isChrome && (navigator.userAgent.indexOf("Edg") != -1),
    // Blink engine detection
    isBlink: (browser.isChrome || browser.isOpera) && !!window.CSS,
    // Webkit engine detection
    isWebkit: 'WebkitAppearance' in document.documentElement.style && !/Edge/.test(navigator.userAgent),
};

export default browser;
