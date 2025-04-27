/**
 * Utility Functions
 */

import { type TmOdometer } from '../core/tm-odometer';

/**
 * Creates an HTML element from the given HTML string.
 * Assumes the HTML string contains a single root element.
 * @param {string} html - The HTML string to convert to an element.
 * @returns {HTMLElement} The first child element created from the HTML string.
 * @throws {Error} If the HTML string is empty or does not contain a valid element.
 */
const createFromHTML = (html: string): HTMLElement => {
  const el = document.createElement('div');
  el.innerHTML = html;
  if (!el.children[0]) {
    throw new Error('Invalid HTML: No valid root element found.');
  }
  return el.children[0] as HTMLElement;
};

/**
 * Removes one or more class names from an element.
 * If any of the class names do not exist, they are ignored.
 * @param {HTMLElement} el - The element to remove the class(es) from.
 * @param {string} name - A space-separated string of class names to remove.
 * @returns {string} The updated `className` string of the element (may contain leading/trailing spaces).
 */
const removeClass = (el: HTMLElement, name: string): string =>
  (el.className = el.className.replace(
    new RegExp(`(^| )${name.split(' ').join('|')}( |$)`, 'gi'),
    ' '
  ));

/**
 * Adds one or more class names to an element.
 * If any of the class names already exist, they will not be duplicated.
 * @param {HTMLElement} el - The element to add the class(es) to.
 * @param {string} name - A space-separated string of class names to add.
 * @returns {string} The updated `className` string of the element (may contain leading/trailing spaces).
 */
const addClass = (el: HTMLElement, name: string): string => {
  removeClass(el, name);
  return (el.className += ` ${name}`);
};

/**
 * Triggers a custom DOM event on the specified element.
 * Supports modern browsers and provides a fallback for older browsers (e.g., IE9+).
 * @param {HTMLElement} el - The element on which to dispatch the event.
 * @param {string} name - The name of the event to trigger.
 */
const trigger = (el: HTMLElement, name: string): void => {
  // Custom DOM events are not supported in IE8
  if (typeof CustomEvent === 'function') {
    const evt = new CustomEvent(name, { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
  } else if (document.createEvent) {
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
const now = (): number => {
  const left = window.performance?.now?.();
  return left ?? +new Date();
};

/**
 * Rounds a number to the specified precision.
 * If no precision is provided, the number is rounded to the nearest integer.
 * @param {number} val - The number to round.
 * @param {number} [precision=0] - The number of decimal places to round to. Defaults to 0.
 * @returns {number} The rounded number.
 */
const round = (val: number, precision?: number): number => {
  precision ??= 0;
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
const truncate = (val: number): number => {
  // | 0 fails on numbers greater than 2^32
  if (val < 0) {
    return Math.ceil(val);
  } else {
    return Math.floor(val);
  }
};

/**
 * Calculates the fractional part of a number.
 * The fractional part is the difference between the number and its rounded value.
 * @param {number} val - The number to extract the fractional part from.
 * @returns {number} The fractional part of the number.
 */
const fractionalPart = (val: number): number => val - round(val);

/**
 * Initializes global options for the provided `TmOdometer` class with a deferred execution.
 * Sets the static `options` object of the `TmOdometer` class based on `window.odometerOptions`.
 * This allows users to configure `window.odometerOptions` after the script has been loaded.
 * The function re-checks `window.odometerOptions` after a short timeout to apply any late configurations.
 * @param {typeof TmOdometer} TmOdometerClass - The `TmOdometer` class to initialize options for.
 * @returns {void}
 */
const initGlobalOptionsDeferred = (
  TmOdometerClass: typeof TmOdometer
): void => {
  setTimeout(() => {
    // We do this in a separate pass to allow people to set
    // window.odometerOptions after bringing the file in.
    if (window.odometerOptions) {
      for (const key in window.odometerOptions) {
        TmOdometerClass.options[key] ??= window.odometerOptions[key];
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
const initExistingOdometers = (TmOdometerClass: typeof TmOdometer): void => {
  // Check for legacy IE < 9
  if (document.documentElement?.doScroll && document.createEventObject) {
    // Use `onreadystatechange` for legacy browsers
    const _old = document.onreadystatechange;
    document.onreadystatechange = function () {
      if (
        document.readyState === 'complete' &&
        TmOdometerClass.options.auto !== false
      ) {
        TmOdometerClass.init();
      }

      // Call the previous handler if it exists
      if (_old) {
        _old?.apply(this, arguments as any);
      }
    };
  } else {
    // Use `DOMContentLoaded` for modern browsers
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        if (TmOdometerClass.options.auto !== false) {
          TmOdometerClass.init();
        }
      },
      false
    );
  }
};

export {
  createFromHTML,
  removeClass,
  addClass,
  trigger,
  now,
  round,
  truncate,
  fractionalPart,
  initGlobalOptionsDeferred,
  initExistingOdometers,
};
