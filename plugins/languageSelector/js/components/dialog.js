import { createElement, removeElement, toggleClass } from '../utils/elements';
import { on } from '../utils/events';
import is from '../utils/is';

class Dialog {
    constructor(dialog) {
        this.title = dialog.title || 'Title';
        this.bodyText = dialog.bodyText || 'Body text';
        this.cancelButtonText = dialog.cancelButtonText;
        this.confirmButtonText = dialog.confirmButtonText || 'Confirm';
        this.confirmButtonLink = dialog.confirmButtonLink || null;

        this.elements = {
            container: null,
            closeButton: null,
            cancelButton: null,
            confirmButton: null,
            backdrop: null,
        };

        this.classNames = {
            open: 'tms-modal-open',
            backdrop: 'tms-modal-backdrop',
            fade: 'tms-fade',
            show: 'tms-show',
            closeIcon: 'tms-close-icon',
        };
    }

    createDialog() {
        const container = createElement('div', {
            class: 'tms-modal tms-fade',
            tabindex: '-1',
            role: 'dialog',
            'aria-labelledby': 'PreviewInLiveSite',
            'aria-hidden': "true",
        });

        const modalDialog = createElement('div', {
            class: 'tms-modal-dialog tms-modal-dialog-centered',
            role: 'document',
        });
        const modalContent = createElement('div', { class: 'tms-modal-content' });
        const modalHeader = createElement('div', { class: 'tms-modal-header' });
        const modalTitle = createElement('h5', { class: 'tms-modal-title' }, this.title);
        const modalHeaderCloseButton = createElement('button', {
            type: 'button',
            class: 'tms-modal-close',
            'data-dismiss': 'modal',
            'aria-label': 'Close',
        });
        const modalCloseIconWrapper = createElement('span', { 'aria-hidden': 'true' });
        const modalCloseIcon = this.createSvgIconClose();
        const modalBody = createElement('div', { class: 'tms-modal-body' });
        const modalBodyContent = createElement('p', {}, this.bodyText);
        const modalFooter = createElement('div', { class: 'tms-modal-footer' });
        let modalCancelButton = createElement('span');

        if (!is.nullOrUndefined(this.cancelButtonText)) {
            modalCancelButton = createElement('button', {
                type: 'button',
                class: 'tms-modal-btn tms-modal-btn-secondary',
                'data-dismiss': 'modal',
            }, this.cancelButtonText);
        }

        const modalConfirmButton = createElement('button', {
            class: 'tms-modal-btn tms-modal-btn-primary',
        }, this.confirmButtonText);

        this.elements.container = container;
        this.elements.closeButton = modalHeaderCloseButton;
        this.elements.cancelButton = modalCancelButton;
        this.elements.confirmButton = modalConfirmButton;

        modalCloseIconWrapper.appendChild(modalCloseIcon);
        modalHeaderCloseButton.appendChild(modalCloseIconWrapper);
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(modalHeaderCloseButton);

        modalBody.appendChild(modalBodyContent);

        modalFooter.appendChild(modalCancelButton);
        modalFooter.appendChild(modalConfirmButton);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);

        modalDialog.appendChild(modalContent);

        container.appendChild(modalDialog);

        return container;
    }

    createBackDrop() {
        return createElement('div', {
            class: `${this.classNames.backdrop} 
                    ${this.classNames.fade}`,
        });
    }

    createSvgIconClose() {
        const svg = createElement('svg', {
            x: "0px",
            y: "0px",
            viewBox: "0 0 60 60",
            'enable-background': "new 0 0 60 60",
            class: this.classNames.closeIcon,
        }, '', true);
        const lines = createElement('g', {}, '', true);
        const line1 = createElement('line', {
            fill: "none",
            stroke: "black",
            'stroke-width': "10",
            transform: "translate(5, 5)",
            'stroke-miterlimit': "10",
            x1: "5",
            y1: "5",
            x2: "50",
            y2: "50",
            'stroke-linecap': "round",
        }, '', true);
        const line2 = createElement('line', {
            fill: "none",
            stroke: "black",
            'stroke-width': "10",
            transform: "translate(5, 5)",
            'stroke-miterlimit': "10",
            x1: "5",
            y1: "50",
            x2: "50",
            y2: "5",
            'stroke-linecap': "round",
        }, '', true);
        const circles = createElement('g', {}, '', true);
        const circle = createElement('circle', {
            opacity: "0",
            fill: "none",
            'stroke-width': "3",
            stroke: "black",
            'stroke-miterlimit': "10",
            cx: "30",
            cy: "30",
            r: "40",
        }, '', true);

        lines.appendChild(line1);
        lines.appendChild(line2);
        circles.appendChild(circle);

        svg.appendChild(lines);
        svg.appendChild(circle);

        return svg;
    }

    attachListeners() {
        on(
            this.elements.closeButton,
            'click',
            () => {
                this.hide();
            },
        );

        on(
            this.elements.confirmButton,
            'click',
            () => {
                if (is.nullOrUndefined(this.confirmButtonLink)) {
                    this.hide();
                } else {
                    window.open(this.confirmButtonLink, '_blank');
                }
            },
        );

        if (!is.nullOrUndefined(this.elements.cancelButton)) {
            on(
                this.elements.cancelButton,
                'click',
                () => {
                    this.hide();
                },
            );
        }
    }

    inject() {
        const body = document.querySelector('body');

        if (is.nullOrUndefined(this.elements.container)) {
            const dialog = this.createDialog();
            body.appendChild(dialog);
            this.attachListeners();
        }
    }

    show() {
        const body = document.querySelector('body');
        const backdrop = this.createBackDrop();

        this.elements.backdrop = backdrop;

        body.appendChild(backdrop);

        toggleClass(body, this.classNames.open, true);
        toggleClass(this.elements.backdrop, this.classNames.show, true);
    }

    hide() {
        const body = document.querySelector('body');

        toggleClass(body, this.classNames.open, false);
        toggleClass(this.elements.backdrop, this.classNames.show, false);

        setTimeout(() => {
            removeElement(this.elements.backdrop)
        }, 250);
    }
}

export default Dialog;
