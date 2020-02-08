// ==========================================================================
// Countdown Timer with Vanilla JavaScript
// Based on https://github.com/rendro/countdown
// ==========================================================================

export const defaultOptions = {
    date: "June 7, 2087 15:03:25",
    refresh: 1000,
    offset: 0,
    onEnd() {
    },
    render(date) {
        this.el.innerHTML = `
            ${date.years} years,
            ${date.days} days,
            ${this.leadingZeros(date.hours, 2)} hours,
            ${this.leadingZeros(date.min, 2)} min and
            ${this.leadingZeros(date.sec, 2)} sec
        `;
    },
};

/**
 * Countdown constructor
 * @param {HTMLElement} el      DOM node of the countdown
 * @param {Object}      options (optional) Options for the plugin
 */
export function Countdown(el, options) {

    /**
     * Reference to the DOM element
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Options of the countdown plugin
     * @type {Object}
     */
    this.options = {};

    /**
     * Interval reference or false if counter is stopped
     * @type {Boolean || Number}
     */
    this.interval = false;

    // merge default options and options into this.options
    this.mergeOptions = (customOptions) => {
        Object.keys(defaultOptions).forEach(key => {
            this.options[key] = typeof customOptions[key] !== 'undefined' ? customOptions[key] : defaultOptions[key];

            if (key === 'date' && typeof this.options.date !== 'object') {
                this.options.date = new Date(this.options.date);
            }

            // bind context for functions
            if (typeof this.options[key] === 'function') {
                this.options[key] = this.options[key].bind(this);
            }
        });

        if (typeof this.options.date !== 'object') {
            this.options.date = new Date(this.options.date);
        }
    };

    this.mergeOptions(options);


    /**
     * Get the difference between now and the end date
     * @return {Object} Object with the diff information (years, days, hours, min, sec, millisec)
     */
    this.getDiffDate = () => {
        if (typeof this.options.date !== 'object') {
            this.options.date = new Date(this.options.date);
        }

        let diff = (this.options.date.getTime() - Date.now() + this.options.offset) / 1000;

        const dateData = {
            years: 0,
            days: 0,
            hours: 0,
            min: 0,
            sec: 0,
            millisec: 0,
        };

        if (diff <= 0) {
            if (this.interval) {
                this.stop();
                this.options.onEnd();
            }
            return dateData;
        }

        if (diff >= (365.25 * 86400)) {
            dateData.years = Math.floor(diff / (365.25 * 86400));
            diff -= dateData.years * 365.25 * 86400;
        }

        if (diff >= 86400) {
            dateData.days = Math.floor(diff / 86400);
            diff -= dateData.days * 86400;
        }

        if (diff >= 3600) {
            dateData.hours = Math.floor(diff / 3600);
            diff -= dateData.hours * 3600;
        }

        if (diff >= 60) {
            dateData.min = Math.floor(diff / 60);
            diff -= dateData.min * 60;
        }

        // Updated Apr 21, 2019
        // The library uses Math.round to get the difference for the number of seconds
        // leading to an issue of displaying the "60" instead of "00".
        //
        // For example, the timer showed "5:60" when 6 minutes remained.
        //
        // Updating to the Math.floor fixed the issue.
        //
        dateData.sec = Math.floor(diff);

        dateData.millisec = diff % 1 * 1000;

        return dateData;
    };

    /**
     * Add leading zeros to a number
     * @param  {Number} num    Input number
     * @param  {Number} length Length of the desired output
     * @return {String}        String of the desired length with leading zeros
     */
    this.leadingZeros = (num, length) => {
        const digitLength = length || 2;
        const digit = String(num);
        if (digit.length > digitLength) {
            return digit;
        }
        return (Array(digitLength + 1).join('0') + digit).substr(-digitLength);
    };

    /**
     * Update the end date of the countdown
     * @param  {Date}     newDate Date object or a String/Number that can be passed to the Date constructor
     * @return {Countdown}         Countdown instance
     */
    this.update = (newDate) => {
        if (typeof newDate !== 'object') {
            this.options.date = new Date(newDate);
        }
        this.options.date = newDate;
        this.render();
        return this;
    };

    /**
     * Stop the countdown refresh / rerender
     * @return {Countdown} Countdown instance
     */
    this.stop = () => {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = false;
        }
        return this;
    };

    /**
     * Render the countdown
     * @return {Countdown} Countdown instance
     */
    this.render = () => {
        this.options.render(this.getDiffDate());
        return this;
    };

    /**
     * Start the countdown
     * @return {Countdown} Countdown instance
     */
    this.start = () => {
        // don't start if the countdown is already started
        if (this.interval) {
            return null;
        }

        this.render();

        if (this.options.refresh) {
            this.interval = setInterval(this.render, this.options.refresh);
        }

        return this;
    };

    /**
     * Update the offset
     * @param  {Number}    offset New offset in ms
     * @return {Countdown}        Countdown instance
     */
    this.updateOffset = (offset) => {
        this.options.offset = offset;
        return this;
    };


    /**
     * Restart the countdown and update options
     */
    this.restart = (customOptions) => {
        this.mergeOptions(customOptions);
        this.interval = false;
        this.start();
        return this;
    };


    // initial start of the countdown or initial render
    this.start();
}
