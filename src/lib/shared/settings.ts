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

export {
  DIGIT_FORMAT,
  FORMAT_PARSER,
  DURATION,
  FRAMES_PER_VALUE,
  DIGIT_SPEEDBOOST,
  MS_PER_FRAME,
  COUNT_MS_PER_FRAME,
};
