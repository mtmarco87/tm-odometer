/**
 * TmOdometer Core Class
 */
import { FormatObject, OdometerOptions, TmOdometerOptions } from '../shared/interfaces';
declare class TmOdometer {
    static options: OdometerOptions;
    options: TmOdometerOptions;
    el: HTMLElement;
    value: number;
    inside: HTMLElement;
    observer?: MutationObserver;
    watchMutations: boolean;
    transitionEndBound: boolean;
    format: FormatObject;
    MAX_VALUES: number;
    digits: HTMLElement[];
    ribbons: Record<number, HTMLElement>;
    /**
     * Initializes a new instance of the TmOdometer class.
     * Sets up the odometer's options, formats, and DOM structure.
     * If an odometer instance already exists on the element, it returns the existing instance.
     * @param {TmOdometerOptions} options - Configuration options for the odometer.
     */
    constructor(options: TmOdometerOptions);
    /**
     * Renders the inner container of the odometer.
     * Clears the root element (`this.el`) and appends a new child element
     * with the class `odometer-inside`.
     * @returns {void}
     */
    renderInside(): void;
    /**
     * Observes changes to the root element's content and updates the odometer accordingly.
     * This is a fallback for environments like Safari where `.innerHTML` cannot be wrapped.
     * @returns {void}
     */
    watchForMutations(): void;
    /**
     * Starts observing mutations on the root element (`this.el`).
     * Listens for changes to the element's child nodes (e.g., additions or removals).
     * Requires `this.watchMutations` to be `true` and a `MutationObserver` to be initialized.
     * @returns {void}
     */
    startWatchingMutations(): void;
    /**
     * Stops observing mutations on the root element (`this.el`).
     * Disconnects the `MutationObserver` if it is initialized.
     * @returns {void}
     */
    stopWatchingMutations(): void;
    /**
     * Cleans and normalizes a value to ensure it can be processed as a number.
     * Converts formatted strings into numeric values by handling radix symbols
     * and removing unnecessary characters.
     * @param {string | number} val - The value to clean and normalize.
     * @returns {number} The cleaned and rounded numeric value.
     */
    cleanValue(val: string | number): number;
    /**
     * Binds transition end events to the root element (`this.el`).
     * Ensures that the odometer re-renders only once per transition, even if multiple
     * transition end events are triggered. After rendering, it dispatches the
     * `odometerdone` custom event.
     * @returns {void}
     */
    bindTransitionEnd(): void;
    /**
     * Resets and parses the odometer's format configuration.
     * Extracts the repeating pattern, radix symbol, and precision from the format string.
     * Throws an error if the format string is invalid or unparsable.
     * @returns {void}
     */
    resetFormat(): void;
    /**
     * Renders the odometer with the specified value.
     * Updates the DOM structure, applies the appropriate theme and classes,
     * and formats the digits for display.
     * @param {number} [value] - The value to render. Defaults to the current value (`this.value`).
     * @returns {void}
     */
    render(value?: number): void;
    /**
     * Formats the given value into individual digits and renders them.
     * If a custom format function is provided, it uses that to format the value.
     * Otherwise, it preserves the precision and formats the value based on the odometer's configuration.
     * @param {number} value - The value to format and render as digits.
     * @returns {void}
     */
    formatDigits(value: number): void;
    /**
     * Ensures the value maintains the specified precision by adding trailing zeros if necessary.
     * This is used to keep the decimal places consistent at the end of the animation.
     * @param {number} value - The numeric value to format with preserved precision.
     * @returns {string} The value as a string with the required precision.
     */
    preservePrecision(value: number): string;
    /**
     * Updates the odometer to display a new value.
     * Cleans and normalizes the input value, determines the difference from the current value,
     * and triggers the appropriate animations and DOM updates.
     * @param {string | number} newValue - The new value to update the odometer to.
     * @returns {number} The updated value of the odometer.
     */
    update(newValue: string | number): number;
    /**
     * Creates and returns a new digit element for the odometer.
     * The digit element is generated from the predefined `DIGIT_HTML` template.
     * @returns {HTMLElement} The newly created digit element.
     */
    renderDigit(): HTMLElement;
    /**
     * Inserts a digit element into the odometer's inner container.
     * If a reference element (`before`) is provided, the digit is inserted before it.
     * Otherwise, the digit is appended to the container or inserted at the beginning if other children exist.
     * @param {HTMLElement} digit - The digit element to insert.
     * @param {HTMLElement | null} [before] - The reference element to insert the digit before. Defaults to `null`.
     * @returns {HTMLElement} The inserted digit element.
     */
    insertDigit(digit: HTMLElement, before?: HTMLElement | null): HTMLElement;
    /**
     * Creates and inserts a spacer element into the odometer's inner container.
     * A spacer is a non-digit element (e.g., a comma or decimal point) used for formatting.
     * @param {string} chr - The character to display in the spacer.
     * @param {HTMLElement | null} [before] - The reference element to insert the spacer before. Defaults to `null`.
     * @param {string} [extraClasses] - Additional CSS classes to apply to the spacer element.
     * @returns {HTMLElement} The inserted spacer element.
     */
    addSpacer(chr: string, before?: HTMLElement | null, extraClasses?: string): HTMLElement;
    /**
     * Adds a digit or spacer element to the odometer's inner container.
     * Handles special cases for negation (`-`) and radix (`.`) characters,
     * and ensures the format's repeating pattern is respected.
     * @param {string} value - The digit or character to add.
     * @param {boolean} [repeating=true] - Whether to use the repeating format pattern. Defaults to `true`.
     * @returns {HTMLElement} The inserted digit or spacer element.
     * @throws {Error} If the format string is invalid or lacks digits.
     */
    addDigit(value: string, repeating?: boolean): HTMLElement;
    /**
     * Animates the odometer to transition to a new value.
     * Chooses the appropriate animation method (`count` or `slide`) based on the configuration and browser support.
     * @param {number} newValue - The new value to animate the odometer to.
     * @returns {void}
     */
    animate(newValue: number): void;
    /**
     * Animates the odometer by incrementing or decrementing the value over time.
     * Uses a "counting" animation to transition smoothly to the new value.
     * @param {number} newValue - The new value to animate the odometer to.
     * @returns {void}
     */
    animateCount(newValue: number): void;
    /**
     * Calculates the number of digits in the largest absolute value from the provided numbers.
     * @param {...number} values - A list of numbers to evaluate.
     * @returns {number} The number of digits in the largest absolute value.
     */
    getDigitCount(...values: number[]): number;
    /**
     * Calculates the maximum number of fractional digits (decimal places) among the provided numbers.
     * Assumes the values have already been rounded to the specified precision.
     * @param {...number} values - A list of numbers to evaluate.
     * @returns {number} The maximum number of fractional digits.
     */
    getFractionalDigitCount(...values: number[]): number;
    /**
     * Resets the odometer's digits and ribbons.
     * Clears the inner container, resets the format configuration,
     * and prepares the odometer for re-rendering.
     * @returns {void}
     */
    resetDigits(): void;
    /**
     * Creates an array of numbers between two values
     * @param start The starting value of the range
     * @param end The ending value of the range
     * @param inclusive Whether to include the end value in the range
     * @returns An array containing the range of numbers
     */
    createRange(start: number, end: number, inclusive: boolean): number[];
    /**
     * Animates the odometer to transition to a new value using a sliding animation.
     * Breaks the value into individual digits, calculates the frames for each digit's animation,
     * and updates the DOM to reflect the sliding effect.
     * @param {number} newValue - The new value to animate the odometer to.
     * @returns {void}
     */
    animateSlide(newValue: number): void;
    /**
     * Initializes all odometer elements on the page.
     * Selects elements matching the configured selector or the default `.odometer` class,
     * and creates a `TmOdometer` instance for each element.
     * @returns {TmOdometer[]} An array of initialized `TmOdometer` instances.
     */
    static init(): TmOdometer[];
}
export { TmOdometer };
