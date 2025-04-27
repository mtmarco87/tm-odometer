/**
 * Compatibility Layer
 */

const TRANSITION_END_EVENTS =
  'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

const transitionCheckStyles = document.createElement('div').style;
const TRANSITION_SUPPORT =
  transitionCheckStyles.transition != null ||
  transitionCheckStyles.webkitTransition != null ||
  transitionCheckStyles.mozTransition != null ||
  transitionCheckStyles.oTransition != null;

const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const MutationObserver =
  window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver;

let _jQueryWrapped = false;

/**
 * Wraps jQuery's `.html` and `.text` methods to ensure they update the odometer
 * when called on elements with an associated `TmOdometer` instance.
 * This function is idempotent and will only execute once.
 * @returns {void}
 */
const wrapJQuery = (): void => {
  if (_jQueryWrapped) {
    return;
  }

  if (window.jQuery) {
    _jQueryWrapped = true;
    // We need to wrap jQuery's .html and .text because they don't always
    // call .innerHTML/.innerText
    for (const property of ['html', 'text']) {
      const old = window.jQuery!.fn[property];
      window.jQuery!.fn[property] = function (val?: any) {
        if (val == null || this[0]?.odometer == null) {
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
const tryWrapJQuery = (): void => {
  wrapJQuery();
  // In case jQuery is brought in after this file
  setTimeout(wrapJQuery, 0);
};

export {
  TRANSITION_END_EVENTS,
  TRANSITION_SUPPORT,
  requestAnimationFrame,
  MutationObserver,
  tryWrapJQuery,
};
