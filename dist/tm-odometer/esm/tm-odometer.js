/**
 * Templates for odometer elements
 */
const VALUE_HTML = '<span class="odometer-value"></span>';
const RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' +
    VALUE_HTML +
    '</span></span>';
const DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' +
    RIBBON_HTML +
    '</span></span>';
const FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

/**
 * Settings
 */
// Default odometer configuration
// The bit within the parenthesis will be repeated, so (,ddd) becomes 123,456,789....
//
// If your locale uses spaces to separate digits, you could consider using a
// Narrow No-Break Space ( ), as it's a bit more correct.
//
// Numbers will be rounded to the number of digits after the radix separator.
//
// When values are set using `.update` or the `.innerHTML`-type attributes,
// strings are assumed to already be in the locale's format.
//
// This is just the default, it can also be set as options.format.
const DIGIT_FORMAT = '(,ddd).dd';
const FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;
// What is our target framerate?
const FRAMERATE = 30;
// How long will the animation last?
const DURATION = 2000;
// What is the fastest we should update values when we are
// counting up (not using the wheel animation).
const COUNT_FRAMERATE = 20;
// What is the minimum number of frames for each value on the wheel?
// We won't render more values than could be reasonably seen
const FRAMES_PER_VALUE = 2;
// If more than one digit is hitting the frame limit, they would all get
// capped at that limit and appear to be moving at the same rate.  This
// factor adds a boost to subsequent digits to make them appear faster.
const DIGIT_SPEEDBOOST = 0.5;
const MS_PER_FRAME = 1000 / FRAMERATE;
const COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

/**
 * Compatibility Layer
 */
const TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';
const transitionCheckStyles = document.createElement('div').style;
const TRANSITION_SUPPORT = transitionCheckStyles.transition != null ||
    transitionCheckStyles.webkitTransition != null ||
    transitionCheckStyles.mozTransition != null ||
    transitionCheckStyles.oTransition != null;
const requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
const MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;
let _jQueryWrapped = false;
/**
 * Wraps jQuery's `.html` and `.text` methods to ensure they update the odometer
 * when called on elements with an associated `TmOdometer` instance.
 * This function is idempotent and will only execute once.
 * @returns {void}
 */
const wrapJQuery = () => {
    if (_jQueryWrapped) {
        return;
    }
    if (window.jQuery) {
        _jQueryWrapped = true;
        // We need to wrap jQuery's .html and .text because they don't always
        // call .innerHTML/.innerText
        for (const property of ['html', 'text']) {
            const old = window.jQuery.fn[property];
            window.jQuery.fn[property] = function (val) {
                var _a;
                if (val == null || ((_a = this[0]) === null || _a === void 0 ? void 0 : _a.odometer) == null) {
                    return old.apply(this, arguments);
                }
                return this[0].odometer.update(val);
            };
        }
    }
};
/**
 * Attempts to wrap jQuery's `.html` and `.text` methods immediately to ensure they
 * update the odometer when called on elements with an associated `TmOdometer` instance.
 * Also schedules a retry using `setTimeout` in case jQuery is loaded after this file.
 * @returns {void}
 */
const tryWrapJQuery = () => {
    wrapJQuery();
    // In case jQuery is brought in after this file
    setTimeout(wrapJQuery, 0);
};

/**
 * Utility Functions
 */
/**
 * Creates an HTML element from the given HTML string.
 * Assumes the HTML string contains a single root element.
 * @param {string} html - The HTML string to convert to an element.
 * @returns {HTMLElement} The first child element created from the HTML string.
 * @throws {Error} If the HTML string is empty or does not contain a valid element.
 */
const createFromHTML = (html) => {
    const el = document.createElement('div');
    el.innerHTML = html;
    if (!el.children[0]) {
        throw new Error('Invalid HTML: No valid root element found.');
    }
    return el.children[0];
};
/**
 * Removes one or more class names from an element.
 * If any of the class names do not exist, they are ignored.
 * @param {HTMLElement} el - The element to remove the class(es) from.
 * @param {string} name - A space-separated string of class names to remove.
 * @returns {string} The updated `className` string of the element (may contain leading/trailing spaces).
 */
const removeClass = (el, name) => (el.className = el.className.replace(new RegExp(`(^| )${name.split(' ').join('|')}( |$)`, 'gi'), ' '));
/**
 * Adds one or more class names to an element.
 * If any of the class names already exist, they will not be duplicated.
 * @param {HTMLElement} el - The element to add the class(es) to.
 * @param {string} name - A space-separated string of class names to add.
 * @returns {string} The updated `className` string of the element (may contain leading/trailing spaces).
 */
const addClass = (el, name) => {
    removeClass(el, name);
    return (el.className += ` ${name}`);
};
/**
 * Triggers a custom DOM event on the specified element.
 * Supports modern browsers and provides a fallback for older browsers (e.g., IE9+).
 * @param {HTMLElement} el - The element on which to dispatch the event.
 * @param {string} name - The name of the event to trigger.
 */
const trigger = (el, name) => {
    // Custom DOM events are not supported in IE8
    if (typeof CustomEvent === 'function') {
        const evt = new CustomEvent(name, { bubbles: true, cancelable: true });
        el.dispatchEvent(evt);
    }
    else if (document.createEvent) {
        // Legacy fallback
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent(name, true, true);
        el.dispatchEvent(evt);
    }
};
/**
 * Returns the current timestamp in milliseconds.
 * Uses `window.performance.now()` if available for higher precision,
 * falling back to `Date.now()` if not.
 * @returns {number} The current timestamp in milliseconds.
 */
const now = () => {
    var _a, _b;
    const left = (_b = (_a = window.performance) === null || _a === void 0 ? void 0 : _a.now) === null || _b === void 0 ? void 0 : _b.call(_a);
    return left !== null && left !== void 0 ? left : +new Date();
};
/**
 * Rounds a number to the specified precision.
 * If no precision is provided, the number is rounded to the nearest integer.
 * @param {number} val - The number to round.
 * @param {number} [precision=0] - The number of decimal places to round to. Defaults to 0.
 * @returns {number} The rounded number.
 */
const round = (val, precision) => {
    precision !== null && precision !== void 0 ? precision : (precision = 0);
    if (!precision) {
        return Math.round(val);
    }
    val *= Math.pow(10, precision);
    val += 0.5;
    val = Math.floor(val);
    return (val /= Math.pow(10, precision));
};
/**
 * Truncates a number by removing its fractional part.
 * For positive numbers, it behaves like `Math.floor`.
 * For negative numbers, it behaves like `Math.ceil`.
 * @param {number} val - The number to truncate.
 * @returns {number} The truncated number.
 */
const truncate = (val) => {
    // | 0 fails on numbers greater than 2^32
    if (val < 0) {
        return Math.ceil(val);
    }
    else {
        return Math.floor(val);
    }
};
/**
 * Initializes global options for the provided `TmOdometer` class with a deferred execution.
 * Sets the static `options` object of the `TmOdometer` class based on `window.odometerOptions`.
 * This allows users to configure `window.odometerOptions` after the script has been loaded.
 * The function re-checks `window.odometerOptions` after a short timeout to apply any late configurations.
 * @param {typeof TmOdometer} TmOdometerClass - The `TmOdometer` class to initialize options for.
 * @returns {void}
 */
const initGlobalOptionsDeferred = (TmOdometerClass) => {
    setTimeout(() => {
        var _a;
        var _b;
        // We do this in a separate pass to allow people to set
        // window.odometerOptions after bringing the file in.
        if (window.odometerOptions) {
            for (const key in window.odometerOptions) {
                (_a = (_b = TmOdometerClass.options)[key]) !== null && _a !== void 0 ? _a : (_b[key] = window.odometerOptions[key]);
            }
        }
    }, 0);
};
/**
 * Initializes all existing `TmOdometer` instances on the page when the DOM is fully loaded.
 * Supports both modern browsers and legacy browsers (e.g., IE < 9).
 * Ensures that initialization occurs after the DOM is ready, using `DOMContentLoaded` for modern browsers
 * and `onreadystatechange` for older browsers.
 * @param {typeof TmOdometer} TmOdometerClass - The `TmOdometer` class to initialize instances for.
 * @returns {void}
 */
const initExistingOdometers = (TmOdometerClass) => {
    var _a;
    // Check for legacy IE < 9
    if (((_a = document.documentElement) === null || _a === void 0 ? void 0 : _a.doScroll) && document.createEventObject) {
        // Use `onreadystatechange` for legacy browsers
        const _old = document.onreadystatechange;
        document.onreadystatechange = function () {
            if (document.readyState === 'complete' &&
                TmOdometerClass.options.auto !== false) {
                TmOdometerClass.init();
            }
            // Call the previous handler if it exists
            if (_old) {
                _old === null || _old === void 0 ? void 0 : _old.apply(this, arguments);
            }
        };
    }
    else {
        // Use `DOMContentLoaded` for modern browsers
        document.addEventListener('DOMContentLoaded', function () {
            if (TmOdometerClass.options.auto !== false) {
                TmOdometerClass.init();
            }
        }, false);
    }
};

/**
 * TmOdometer Core Class
 */
var _a;
class TmOdometer {
    /**
     * Initializes a new instance of the TmOdometer class.
     * Sets up the odometer's options, formats, and DOM structure.
     * If an odometer instance already exists on the element, it returns the existing instance.
     * @param {TmOdometerOptions} options - Configuration options for the odometer.
     */
    constructor(options) {
        var _a, _b, _c;
        var _d, _e;
        this.value = 0;
        this.watchMutations = false;
        this.transitionEndBound = false;
        this.format = { repeating: '', precision: 0 };
        this.digits = [];
        this.ribbons = {};
        this.options = options;
        this.el = this.options.el;
        if (this.el.odometer) {
            return this.el.odometer;
        }
        this.el.odometer = this;
        for (const key in TmOdometer.options) {
            const value = TmOdometer.options[key];
            (_a = (_d = this.options)[key]) !== null && _a !== void 0 ? _a : (_d[key] = value);
        }
        (_b = (_e = this.options).duration) !== null && _b !== void 0 ? _b : (_e.duration = DURATION);
        this.MAX_VALUES =
            (this.options.duration / MS_PER_FRAME / FRAMES_PER_VALUE) | 0;
        this.resetFormat();
        this.value = this.cleanValue((_c = this.options.value) !== null && _c !== void 0 ? _c : '');
        this.renderInside();
        this.render();
        try {
            for (const property of ['innerHTML', 'innerText', 'textContent']) {
                if (this.el[property]) {
                    Object.defineProperty(this.el, property, {
                        get: () => {
                            var _a, _b;
                            if (property === 'innerHTML') {
                                return this.inside.outerHTML;
                            }
                            else {
                                // It's just a single HTML element, so innerText is the
                                // same as outerText.
                                return (_b = (_a = this.inside.innerText) !== null && _a !== void 0 ? _a : this.inside.textContent) !== null && _b !== void 0 ? _b : '';
                            }
                        },
                        set: (val) => {
                            return this.update(val);
                        },
                    });
                }
            }
        }
        catch (e) {
            // Safari
            this.watchForMutations();
        }
    }
    /**
     * Renders the inner container of the odometer.
     * Clears the root element (`this.el`) and appends a new child element
     * with the class `odometer-inside`.
     * @returns {void}
     */
    renderInside() {
        this.inside = document.createElement('div');
        this.inside.className = 'odometer-inside';
        this.el.innerHTML = '';
        this.el.appendChild(this.inside);
    }
    /**
     * Observes changes to the root element's content and updates the odometer accordingly.
     * This is a fallback for environments like Safari where `.innerHTML` cannot be wrapped.
     * @returns {void}
     */
    watchForMutations() {
        var _a;
        if (!MutationObserver) {
            return;
        }
        try {
            (_a = this.observer) !== null && _a !== void 0 ? _a : (this.observer = new MutationObserver((mutations) => {
                const newVal = this.el.innerText || '';
                this.renderInside();
                this.render(this.value);
                this.update(newVal);
            }));
            this.watchMutations = true;
            this.startWatchingMutations();
        }
        catch (e) { }
    }
    /**
     * Starts observing mutations on the root element (`this.el`).
     * Listens for changes to the element's child nodes (e.g., additions or removals).
     * Requires `this.watchMutations` to be `true` and a `MutationObserver` to be initialized.
     * @returns {void}
     */
    startWatchingMutations() {
        var _a;
        if (this.watchMutations) {
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.observe(this.el, { childList: true });
        }
    }
    /**
     * Stops observing mutations on the root element (`this.el`).
     * Disconnects the `MutationObserver` if it is initialized.
     * @returns {void}
     */
    stopWatchingMutations() {
        var _a;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
    /**
     * Cleans and normalizes a value to ensure it can be processed as a number.
     * Converts formatted strings into numeric values by handling radix symbols
     * and removing unnecessary characters.
     * @param {string | number} val - The value to clean and normalize.
     * @returns {number} The cleaned and rounded numeric value.
     */
    cleanValue(val) {
        var _a;
        if (typeof val === 'string') {
            // We need to normalize the format so we can properly turn it into
            // a float.
            val = val.replace((_a = this.format.radix) !== null && _a !== void 0 ? _a : '.', '<radix>');
            val = val.replace(/[.,]/g, '');
            val = val.replace('<radix>', '.');
            val = parseFloat(val) || 0;
        }
        return round(val, this.format.precision);
    }
    /**
     * Binds transition end events to the root element (`this.el`).
     * Ensures that the odometer re-renders only once per transition, even if multiple
     * transition end events are triggered. After rendering, it dispatches the
     * `odometerdone` custom event.
     * @returns {void}
     */
    bindTransitionEnd() {
        if (this.transitionEndBound) {
            return;
        }
        this.transitionEndBound = true;
        // The event will be triggered once for each ribbon, we only
        // want one render though
        let renderEnqueued = false;
        const events = TRANSITION_END_EVENTS.split(' ');
        for (const event of events) {
            this.el.addEventListener(event, () => {
                if (renderEnqueued) {
                    return true;
                }
                renderEnqueued = true;
                setTimeout(() => {
                    this.render();
                    renderEnqueued = false;
                    trigger(this.el, 'odometerdone');
                }, 0);
                return true;
            }, false);
        }
    }
    /**
     * Resets and parses the odometer's format configuration.
     * Extracts the repeating pattern, radix symbol, and precision from the format string.
     * Throws an error if the format string is invalid or unparsable.
     * @returns {void}
     */
    resetFormat() {
        var _a;
        let format = (_a = this.options.format) !== null && _a !== void 0 ? _a : DIGIT_FORMAT;
        format = format || 'd';
        const parsed = FORMAT_PARSER.exec(format);
        if (!parsed) {
            throw new Error('TmOdometer: Unparsable digit format');
        }
        const [_, repeating, radix, fractional] = parsed;
        const precision = (fractional === null || fractional === void 0 ? void 0 : fractional.length) || 0;
        this.format = { repeating, radix, precision };
    }
    /**
     * Renders the odometer with the specified value.
     * Updates the DOM structure, applies the appropriate theme and classes,
     * and formats the digits for display.
     * @param {number} [value] - The value to render. Defaults to the current value (`this.value`).
     * @returns {void}
     */
    render(value) {
        value !== null && value !== void 0 ? value : (value = this.value);
        this.stopWatchingMutations();
        this.resetFormat();
        this.inside.innerHTML = '';
        let { theme } = this.options;
        const classes = this.el.className.split(' ');
        const newClasses = [];
        for (const cls of classes) {
            if (cls.length) {
                const match = /^odometer-theme-(.+)$/.exec(cls);
                if (match) {
                    theme = match[1];
                    continue;
                }
                if (/^odometer(-|$)/.test(cls)) {
                    continue;
                }
                newClasses.push(cls);
            }
        }
        newClasses.push('odometer');
        if (!TRANSITION_SUPPORT) {
            newClasses.push('odometer-no-transitions');
        }
        if (theme) {
            newClasses.push(`odometer-theme-${theme}`);
        }
        else {
            // This class matches all themes, so it should do what you'd expect if only one
            // theme css file is brought into the page.
            newClasses.push('odometer-auto-theme');
        }
        this.el.className = newClasses.join(' ');
        this.ribbons = {};
        this.formatDigits(value);
        this.startWatchingMutations();
    }
    /**
     * Formats the given value into individual digits and renders them.
     * If a custom format function is provided, it uses that to format the value.
     * Otherwise, it preserves the precision and formats the value based on the odometer's configuration.
     * @param {number} value - The value to format and render as digits.
     * @returns {void}
     */
    formatDigits(value) {
        this.digits = [];
        if (this.options.formatFunction) {
            const valueString = this.options.formatFunction(value);
            for (const valueDigit of valueString.split('').reverse()) {
                if (valueDigit.match(/0-9/)) {
                    const digit = this.renderDigit();
                    digit.querySelector('.odometer-value').innerHTML = valueDigit;
                    this.digits.push(digit);
                    this.insertDigit(digit);
                }
                else {
                    this.addSpacer(valueDigit);
                }
            }
        }
        else {
            const valueString = this.preservePrecision(value);
            let wholePart = !this.format.precision;
            for (const digit of valueString.split('').reverse()) {
                if (digit === '.') {
                    wholePart = true;
                }
                this.addDigit(digit, wholePart);
            }
        }
    }
    /**
     * Ensures the value maintains the specified precision by adding trailing zeros if necessary.
     * This is used to keep the decimal places consistent at the end of the animation.
     * @param {number} value - The numeric value to format with preserved precision.
     * @returns {string} The value as a string with the required precision.
     */
    preservePrecision(value) {
        // This function fixes the precision at the end of the animation keeping the
        // decimal places even if we have 0 digits only
        let fixedValue = value.toString();
        if (this.format.precision) {
            const parts = fixedValue.split('.');
            if (parts.length === 1) {
                fixedValue += '.';
                parts[1] = '';
            }
            for (let i = 0; i < this.format.precision; i++) {
                if (!parts[1][i]) {
                    fixedValue += '0';
                }
            }
        }
        return fixedValue;
    }
    /**
     * Updates the odometer to display a new value.
     * Cleans and normalizes the input value, determines the difference from the current value,
     * and triggers the appropriate animations and DOM updates.
     * @param {string | number} newValue - The new value to update the odometer to.
     * @returns {number} The updated value of the odometer.
     */
    update(newValue) {
        newValue = this.cleanValue(newValue);
        // If the value is the same, we don't need to do anything
        const diff = newValue - this.value;
        if (!diff) {
            return this.value;
        }
        removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
        if (diff > 0) {
            addClass(this.el, 'odometer-animating-up');
        }
        else {
            addClass(this.el, 'odometer-animating-down');
        }
        this.stopWatchingMutations();
        this.animate(newValue);
        this.startWatchingMutations();
        setTimeout(() => {
            // Force a repaint
            this.el.offsetHeight;
            addClass(this.el, 'odometer-animating');
        }, 0);
        this.value = newValue;
        return this.value;
    }
    /**
     * Creates and returns a new digit element for the odometer.
     * The digit element is generated from the predefined `DIGIT_HTML` template.
     * @returns {HTMLElement} The newly created digit element.
     */
    renderDigit() {
        return createFromHTML(DIGIT_HTML);
    }
    /**
     * Inserts a digit element into the odometer's inner container.
     * If a reference element (`before`) is provided, the digit is inserted before it.
     * Otherwise, the digit is appended to the container or inserted at the beginning if other children exist.
     * @param {HTMLElement} digit - The digit element to insert.
     * @param {HTMLElement | null} [before] - The reference element to insert the digit before. Defaults to `null`.
     * @returns {HTMLElement} The inserted digit element.
     */
    insertDigit(digit, before) {
        if (before) {
            return this.inside.insertBefore(digit, before);
        }
        else if (!this.inside.children.length) {
            return this.inside.appendChild(digit);
        }
        else {
            return this.inside.insertBefore(digit, this.inside.children[0]);
        }
    }
    /**
     * Creates and inserts a spacer element into the odometer's inner container.
     * A spacer is a non-digit element (e.g., a comma or decimal point) used for formatting.
     * @param {string} chr - The character to display in the spacer.
     * @param {HTMLElement | null} [before] - The reference element to insert the spacer before. Defaults to `null`.
     * @param {string} [extraClasses] - Additional CSS classes to apply to the spacer element.
     * @returns {HTMLElement} The inserted spacer element.
     */
    addSpacer(chr, before, extraClasses) {
        const spacer = createFromHTML(FORMAT_MARK_HTML);
        spacer.innerHTML = chr;
        if (extraClasses) {
            addClass(spacer, extraClasses);
        }
        return this.insertDigit(spacer, before);
    }
    /**
     * Adds a digit or spacer element to the odometer's inner container.
     * Handles special cases for negation (`-`) and radix (`.`) characters,
     * and ensures the format's repeating pattern is respected.
     * @param {string} value - The digit or character to add.
     * @param {boolean} [repeating=true] - Whether to use the repeating format pattern. Defaults to `true`.
     * @returns {HTMLElement} The inserted digit or spacer element.
     * @throws {Error} If the format string is invalid or lacks digits.
     */
    addDigit(value, repeating) {
        var _a;
        repeating !== null && repeating !== void 0 ? repeating : (repeating = true);
        if (value === '-') {
            return this.addSpacer(value, null, 'odometer-negation-mark');
        }
        if (value === '.') {
            return this.addSpacer((_a = this.format.radix) !== null && _a !== void 0 ? _a : '.', null, 'odometer-radix-mark');
        }
        if (repeating) {
            let resetted = false;
            while (true) {
                if (!this.format.repeating.length) {
                    if (resetted) {
                        throw new Error('Bad odometer format without digits');
                    }
                    this.resetFormat();
                    resetted = true;
                }
                const chr = this.format.repeating[this.format.repeating.length - 1];
                this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
                if (chr === 'd') {
                    break;
                }
                this.addSpacer(chr);
            }
        }
        const digit = this.renderDigit();
        digit.querySelector('.odometer-value').innerHTML = value;
        this.digits.push(digit);
        return this.insertDigit(digit);
    }
    /**
     * Animates the odometer to transition to a new value.
     * Chooses the appropriate animation method (`count` or `slide`) based on the configuration and browser support.
     * @param {number} newValue - The new value to animate the odometer to.
     * @returns {void}
     */
    animate(newValue) {
        if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
            this.animateCount(newValue);
        }
        else {
            this.animateSlide(newValue);
        }
    }
    /**
     * Animates the odometer by incrementing or decrementing the value over time.
     * Uses a "counting" animation to transition smoothly to the new value.
     * @param {number} newValue - The new value to animate the odometer to.
     * @returns {void}
     */
    animateCount(newValue) {
        // If the value is the same, we don't need to do anything
        const diff = newValue - this.value;
        if (!diff) {
            return;
        }
        const start = now();
        let last = start;
        let cur = this.value;
        let tick = () => {
            if (now() - start > (this.options.duration || 0)) {
                this.value = newValue;
                this.render();
                trigger(this.el, 'odometerdone');
                return;
            }
            const delta = now() - last;
            if (delta > COUNT_MS_PER_FRAME) {
                last = now();
                const fraction = delta / (this.options.duration || 0);
                const dist = diff * fraction;
                cur += dist;
                this.render(Math.round(cur));
            }
            if (requestAnimationFrame) {
                requestAnimationFrame(tick);
            }
            else {
                setTimeout(tick, COUNT_MS_PER_FRAME);
            }
        };
        tick();
    }
    /**
     * Calculates the number of digits in the largest absolute value from the provided numbers.
     * @param {...number} values - A list of numbers to evaluate.
     * @returns {number} The number of digits in the largest absolute value.
     */
    getDigitCount(...values) {
        for (let i = 0; i < values.length; i++) {
            values[i] = Math.abs(values[i]);
        }
        const max = Math.max(...values);
        return Math.ceil(Math.log(max + 1) / Math.log(10));
    }
    /**
     * Calculates the maximum number of fractional digits (decimal places) among the provided numbers.
     * Assumes the values have already been rounded to the specified precision.
     * @param {...number} values - A list of numbers to evaluate.
     * @returns {number} The maximum number of fractional digits.
     */
    getFractionalDigitCount(...values) {
        // This assumes the value has already been rounded to
        // @format.precision places
        //
        const parser = /^\-?\d*\.(\d*?)0*$/;
        for (let i = 0; i < values.length; i++) {
            const valueStr = values[i].toString();
            const parts = parser.exec(valueStr);
            values[i] = parts ? parts[1].length : 0;
        }
        return Math.max(...values);
    }
    /**
     * Resets the odometer's digits and ribbons.
     * Clears the inner container, resets the format configuration,
     * and prepares the odometer for re-rendering.
     * @returns {void}
     */
    resetDigits() {
        this.digits = [];
        this.ribbons = {};
        this.inside.innerHTML = '';
        this.resetFormat();
    }
    /**
     * Creates an array of numbers between two values
     * @param start The starting value of the range
     * @param end The ending value of the range
     * @param inclusive Whether to include the end value in the range
     * @returns An array containing the range of numbers
     */
    createRange(start, end, inclusive) {
        const isAscending = start < end;
        const length = Math.abs(end - start) + (inclusive ? 1 : 0);
        return Array.from({ length }, (_, i) => isAscending ? start + i : start - i);
    }
    /**
     * Animates the odometer to transition to a new value using a sliding animation.
     * Breaks the value into individual digits, calculates the frames for each digit's animation,
     * and updates the DOM to reflect the sliding effect.
     * @param {number} newValue - The new value to animate the odometer to.
     * @returns {void}
     */
    animateSlide(newValue) {
        var _a;
        let oldValue = this.value;
        // Fix to animate always the fixed decimal digits passed in input
        const fractionalCount = this.format.precision;
        if (fractionalCount) {
            newValue = newValue * Math.pow(10, fractionalCount);
            oldValue = oldValue * Math.pow(10, fractionalCount);
        }
        // If the value is the same, we don't need to do anything
        const diff = newValue - oldValue;
        if (!diff) {
            return;
        }
        this.bindTransitionEnd();
        const digits = [];
        const digitCount = this.getDigitCount(oldValue, newValue);
        let boosted = 0;
        let start = oldValue;
        // We create an array to represent the series of digits which should be
        // animated in each column
        for (let i = 0; i < digitCount; i++) {
            // We need to get the digit at the current position
            start = truncate(oldValue / Math.pow(10, digitCount - i - 1));
            const end = truncate(newValue / Math.pow(10, digitCount - i - 1));
            const dist = end - start;
            let frames;
            if (Math.abs(dist) > this.MAX_VALUES) {
                // We need to subsample
                frames = [];
                // Subsequent digits need to be faster than previous ones
                const incr = dist /
                    (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
                let cur = start;
                while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
                    frames.push(Math.round(cur));
                    cur += incr;
                }
                if (frames[frames.length - 1] !== end) {
                    frames.push(end);
                }
                boosted++;
            }
            else {
                frames = this.createRange(start, end, true);
            }
            // We only care about the last digit
            for (let j = 0; j < frames.length; j++) {
                frames[j] = Math.abs(frames[j] % 10);
            }
            digits.push(frames);
        }
        this.resetDigits();
        const reversedDigits = digits.reverse();
        for (let i = 0; i < reversedDigits.length; i++) {
            let frames = reversedDigits[i];
            if (!this.digits[i]) {
                this.addDigit(' ', i >= fractionalCount);
            }
            if (this.ribbons[i] === undefined) {
                this.ribbons[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
            }
            this.ribbons[i].innerHTML = '';
            if (diff < 0) {
                frames = frames.reverse();
            }
            for (let j = 0; j < frames.length; j++) {
                const frame = frames[j];
                const numEl = document.createElement('div');
                numEl.className = 'odometer-value';
                numEl.innerHTML = frame.toString();
                this.ribbons[i].appendChild(numEl);
                if (j === frames.length - 1) {
                    addClass(numEl, 'odometer-last-value');
                }
                if (j === 0) {
                    addClass(numEl, 'odometer-first-value');
                }
            }
        }
        if (start < 0) {
            this.addDigit('-');
        }
        const mark = this.inside.querySelector('.odometer-radix-mark');
        if (mark) {
            mark.parentNode.removeChild(mark);
        }
        if (fractionalCount) {
            this.addSpacer((_a = this.format.radix) !== null && _a !== void 0 ? _a : '.', this.digits[fractionalCount - 1], 'odometer-radix-mark');
        }
    }
    /**
     * Initializes all odometer elements on the page.
     * Selects elements matching the configured selector or the default `.odometer` class,
     * and creates a `TmOdometer` instance for each element.
     * @returns {TmOdometer[]} An array of initialized `TmOdometer` instances.
     */
    static init() {
        if (!document.querySelectorAll) {
            // IE 7 or 8 in Quirksmode
            return [];
        }
        const elements = document.querySelectorAll(TmOdometer.options.selector || '.odometer');
        return Array.from(elements, (el) => {
            var _a;
            return (el.odometer = new TmOdometer({
                el,
                value: (_a = el.innerText) !== null && _a !== void 0 ? _a : el.textContent,
            }));
        });
    }
}
TmOdometer.options = (_a = window.odometerOptions) !== null && _a !== void 0 ? _a : {};
// Initialize TmOdometer global options with a deferred execution
initGlobalOptionsDeferred(TmOdometer);
// Initialize all existing TmOdometer instances on the page when the DOM is fully loaded
initExistingOdometers(TmOdometer);
// Add TmOdometer jQuery support
tryWrapJQuery();

export { TmOdometer as default };
//# sourceMappingURL=tm-odometer.js.map
