/**
 * Compatibility Layer
 */
declare const TRANSITION_END_EVENTS = "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";
declare const TRANSITION_SUPPORT: boolean;
declare const requestAnimationFrame: ((callback: FrameRequestCallback) => number) & typeof globalThis.requestAnimationFrame;
declare const MutationObserver: {
    new (callback: MutationCallback): MutationObserver;
    prototype: MutationObserver;
};
/**
 * Attempts to wrap jQuery's `.html` and `.text` methods immediately to ensure they
 * update the odometer when called on elements with an associated `TmOdometer` instance.
 * Also schedules a retry using `setTimeout` in case jQuery is loaded after this file.
 * @returns {void}
 */
declare const tryWrapJQuery: () => void;
export { TRANSITION_END_EVENTS, TRANSITION_SUPPORT, requestAnimationFrame, MutationObserver, tryWrapJQuery, };
