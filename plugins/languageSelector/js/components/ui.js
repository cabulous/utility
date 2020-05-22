import { FLAG_URL } from '../config/constants';
import { breakpoint } from '../utils/browser';
import { hexToRgb } from '../utils/colors';
import { createElement } from '../utils/elements';
import is from '../utils/is';
import { toTitleCase } from '../utils/strings';

const ui = {
    createLocaleItem(id) {
        const item = createElement('div', {
            class: this.config.classNames.item,
            tabindex: "0",
            id: `${id}`,
        });
        const flagFilename = this.config.selectorFlagMap[id] || id;

        if (this.config.hasFlag === 'yes') {
            const flag = createElement('img', {
                src: `${FLAG_URL}/${flagFilename}.png`,
            });
            item.appendChild(flag);
        }

        let nameText;
        if (this.config.displayType === 'language_code') {
            nameText = id.toUpperCase();
        } else {
            // displayType === 'language_name'
            nameText = toTitleCase(this.config.availableLocalesById[id]);
        }

        const name = createElement('span', {class: this.config.classNames.itemLabel}, nameText);

        item.appendChild(name);

        return item;
    },

    create() {
        const {createLocaleItem} = ui;
        const flagHiddenClassNames = this.config.hasFlag === 'yes' ? '' : this.config.classNames.flagHidden;
        const languageCodeClassNames = this.config.displayType === 'language_code' ? this.config.classNames.languageCode : '';
        const {r, g, b} = hexToRgb(this.config.backgroundColor);
        const backgroundColorAsRgb = `${r}, ${g}, ${b}`;
        const backgroundOpacity = parseFloat(this.config.backgroundOpacity);

        this.elements.dropdown = null;

        const container = createElement('div', {
            class: `${this.config.classNames.dropdown} ${flagHiddenClassNames} ${languageCodeClassNames}`,
            style: `${this.config.cssVariables.backgroundColorRgb}: ${backgroundColorAsRgb};
                    ${this.config.cssVariables.backgroundOpacity}: ${backgroundOpacity};
                    ${this.config.cssVariables.fontColor}: ${this.config.fontColor};
                    `
        });
        this.elements.dropdown = container;

        // Create label
        const label = createElement('span', {
            id: this.config.classNames.label,
            class: this.config.classNames.label,
        });

        container.appendChild(label);

        // Create selected node
        const dropdownSelectedNode = createElement('div', {
            role: 'button',
            'aria-labelledby': this.config.classNames.label,
            id: this.config.classNames.selected,
            class: this.config.classNames.selected,
            tabIndex: '0',
        });

        this.elements.dropdownSelectedNode = dropdownSelectedNode;

        const dropdownSelectedItem = createLocaleItem.call(this, Object.keys(this.config.primaryLocaleById)[0]);
        dropdownSelectedNode.appendChild(dropdownSelectedItem);

        container.appendChild(dropdownSelectedNode);

        // Create arrow
        const arrow = createElement('svg', {
            class: this.config.classNames.arrow,
            width: "10",
            height: "5",
            viewBox: "0 0 10 5",
            'fill-rule': "evenodd",
            fill: "#5C5C5C",
        }, '', true);

        this.elements.dropdownArrow = arrow;

        const arrowTitle = createElement('title', {}, 'Open drop down', true);
        const arrowPath = createElement('path', {d: "M10 0L5 5 0 0z"}, '', true);

        arrow.appendChild(arrowTitle);
        arrow.appendChild(arrowPath);

        container.appendChild(arrow);

        // Create list
        const listContainer = createElement('div', {
            'aria-expanded': "false",
            role: "list",
            class: this.config.classNames.listContainer,
        });

        this.elements.listContainer = listContainer;

        const list = createElement('div', {class: this.config.classNames.list});

        this.elements.list = list;

        Object.keys(this.config.availableLocalesById).forEach(id => {
            const item = createLocaleItem.call(this, id);
            list.appendChild(item);
            this.elements.listItemsById[id] = item;
            this.elements.listItems.push(id);
        });

        listContainer.appendChild(list);
        container.appendChild(listContainer);

        return container;
    },

    inject() {
        const selector = ui.create.call(this);
        const {target} = this.elements;
        const floatPositionClassName = `${this.config.classNames.position.bottom} ${this.config.classNames.position.right}`;
        const floatContainer = createElement('div', {
            class: `${this.config.classNames.dropdownFloat} ${floatPositionClassName}`,
        });
        let targetIsValid = true;

        Object.keys(target).forEach(key => {
            if (is.nullOrUndefined(target[key])) {
                targetIsValid = false;
                this.debug.error(`No target container found on ${key}. Cannot inject UI.`);
            }
        });

        // Bail if the target is null or undefined
        if (!targetIsValid) {
            return;
        }

        if (window.innerWidth > breakpoint.tabletPortrait.max) {
            if (target.desktop.tagName.toUpperCase() === 'BODY') {
                floatContainer.appendChild(selector);
                target.desktop.appendChild(floatContainer);
            } else if (target.desktopReferenceNode) {
                target.desktop.insertBefore(selector, target.desktopReferenceNode);
            } else {
                target.desktop.appendChild(selector);
            }
        } else {
            if (target.mobile.tagName.toUpperCase() === 'BODY') {
                floatContainer.appendChild(selector);
                target.mobile.appendChild(floatContainer);
            } else {
                target.mobile.appendChild(selector);
            }
        }
    },
};

export default ui;
