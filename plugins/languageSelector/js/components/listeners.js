import { DEFAULT_LOCALE_COOKIE_KEY, DOWN_ARROW_KEY, ENTER_KEY, ESCAPE_KEY, UP_ARROW_KEY } from '../config/constants';
import { writeCookie } from '../utils/cookies';
import { on } from '../utils/events';

class Listeners {
    constructor(selector) {
        this.selector = selector;
    }

    container() {
        const { selector } = this;
        const { elements } = selector;

        on.call(
            selector,
            elements.dropdownSelectedNode,
            'click keydown mouseenter',
            event => {
                selector.debug.log(`${event.type} event trigger on`, event.currentTarget);
                selector.toggleListVisibility(event);
            },
        );

        on.call(
            selector,
            elements.dropdown,
            'mouseleave',
            event => {
                selector.debug.log(`${event.type} event trigger off`, event.currentTarget);
                selector.closeList();
            },
        );

        Object.keys(elements.listItemsById).forEach(id => {
            on.call(
                selector,
                elements.listItemsById[id],
                'click keydown',
                event => {
                    selector.debug.log(`${event.type} event trigger on`, event.currentTarget);

                    if (event.type === 'click') {
                        writeCookie(DEFAULT_LOCALE_COOKIE_KEY, event.currentTarget.id, 86400);
                        selector.setSelectedListItem(event);
                        selector.closeList();

                        if (selector.inIframe) {
                            selector.dialog.show();
                            selector.debug.log('The selector is in Shopify theme editor, don\'t redirect.');
                        } else {
                            selector.goToLocale(event.currentTarget.id);
                        }
                    }

                    if (event.type === 'keydown') {
                        switch (event.key) {
                            case ENTER_KEY:
                                writeCookie(DEFAULT_LOCALE_COOKIE_KEY, event.currentTarget.id, 86400);
                                selector.setSelectedListItem(event);
                                selector.closeList();

                                if (!selector.inIframe) {
                                    selector.goToLocale(event.currentTarget.id);
                                } else {
                                    selector.debug.log('The selector is in Shopify theme editor, don\'t redirect.');
                                }

                                break;

                            case DOWN_ARROW_KEY:
                                selector.focusNextListItem(DOWN_ARROW_KEY);
                                break;

                            case UP_ARROW_KEY:
                                selector.focusNextListItem(UP_ARROW_KEY);
                                break;

                            case ESCAPE_KEY:
                                selector.closeList();
                                break;

                            default:
                                break;
                        }
                    }
                },
            )
        });
    }
}

export default Listeners;
