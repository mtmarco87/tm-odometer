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
declare const createFromHTML: (html: string) => HTMLElement;
/**
 * Removes one or more class names from an element.
 * If any of the class names do not exist, they are ignored.
 * @param {HTMLElement} el - The element to remove the class(es) from.
 * @param {string} name - A space-separated string of class names to remove.
 * @returns {string} The updated `className` string of the element (may contain leading/trailing spaces).
 */
declare const removeClass: (el: HTMLElement, name: string) => string;
/**
 * Adds one or more class names to an element.
 * If any of the class names already exist, they will not be duplicated.
 * @param {HTMLElement} el - The element to add the class(es) to.
 * @param {string} name - A space-separated string of class names to add.
 * @returns {string} The updated `className` string of the element (may contain leading/trailing spaces).
 */
declare const addClass: (el: HTMLElement, name: string) => string;
/**
 * Triggers a custom DOM event on the specified element.
 * Supports modern browsers and provides a fallback for older browsers (e.g., IE9+).
 * @param {HTMLElement} el - The element on which to dispatch the event.
 * @param {string} name - The name of the event to trigger.
 */
declare const trigger: (el: HTMLElement, name: string) => void;
/**
 * Returns the current timestamp in milliseconds.
 * Uses `window.performance.now()` if available for higher precision,
 * falling back to `Date.now()` if not.
 * @returns {number} The current timestamp in milliseconds.
 */
declare const now: () => number;
/**
 * Rounds a number to the specified precision.
 * If no precision is provided, the number is rounded to the nearest integer.
 * @param {number} val - The number to round.
 * @param {number} [precision=0] - The number of decimal places to round to. Defaults to 0.
 * @returns {number} The rounded number.
 */
declare const round: (val: number, precision?: number) => number;
/**
 * Truncates a number by removing its fractional part.
 * For positive numbers, it behaves like `Math.floor`.
 * For negative numbers, it behaves like `Math.ceil`.
 * @param {number} val - The number to truncate.
 * @returns {number} The truncated number.
 */
declare const truncate: (val: number) => number;
/**
 * Calculates the fractional part of a number.
 * The fractional part is the difference between the number and its rounded value.
 * @param {number} val - The number to extract the fractional part from.
 * @returns {number} The fractional part of the number.
 */
declare const fractionalPart: (val: number) => number;
/**
 * Initializes global options for the provided `TmOdometer` class with a deferred execution.
 * Sets the static `options` object of the `TmOdometer` class based on `window.odometerOptions`.
 * This allows users to configure `window.odometerOptions` after the script has been loaded.
 * The function re-checks `window.odometerOptions` after a short timeout to apply any late configurations.
 * @param {typeof TmOdometer} TmOdometerClass - The `TmOdometer` class to initialize options for.
 * @returns {void}
 */
declare const initGlobalOptionsDeferred: (TmOdometerClass: typeof TmOdometer) => void;
/**
 * Initializes all existing `TmOdometer` instances on the page when the DOM is fully loaded.
 * Supports both modern browsers and legacy browsers (e.g., IE < 9).
 * Ensures that initialization occurs after the DOM is ready, using `DOMContentLoaded` for modern browsers
 * and `onreadystatechange` for older browsers.
 * @param {typeof TmOdometer} TmOdometerClass - The `TmOdometer` class to initialize instances for.
 * @returns {void}
 */
declare const initExistingOdometers: (TmOdometerClass: typeof TmOdometer) => void;
export { createFromHTML, removeClass, addClass, trigger, now, round, truncate, fractionalPart, initGlobalOptionsDeferred, initExistingOdometers, };
