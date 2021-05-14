// eslint-disable-next-line import/prefer-default-export
export function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
