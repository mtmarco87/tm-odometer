/**
 * Interfaces and Global Declarations
 */

import { type TmOdometer } from '../core/tm-odometer';

/**
 * TmOdometer global options interface
 * @interface OdometerOptions
 * @property {string} [selector] - The selector for the odometer elements.
 * @property {boolean} [auto] - Whether to automatically initialize odometers.
 * @property {any} [key] - Additional options.
 */
export interface OdometerOptions {
  selector?: string;
  auto?: boolean;
  [key: string]: any;
}

/**
 * TmOdometer options interface
 * Extends the base configuration options (`TmOdometerConfig`) with additional required properties.
 * @interface TmOdometerOptions
 * @extends TmOdometerConfig
 * @property {HTMLElement} el - The HTML element to attach the odometer to.
 */
export interface TmOdometerOptions extends TmOdometerConfig {
  el: HTMLElement;
}

/**
 * TmOdometer config interface
 * @interface TmOdometerConfig
 * @property {string | number | null} [value] - The initial value of the odometer.
 * @property {string} [format] - The format string for the odometer.
 * @property {string} [theme] - The theme for the odometer.
 * @property {number} [duration] - The duration of the animation in milliseconds.
 * @property {'count' | 'slide'} [animation] - The animation type ('count' or 'slide').
 * @property {(value: number) => string} [formatFunction] - A custom format function.
 * @property {any} [key] - Additional options.
 */
export interface TmOdometerConfig {
  value?: string | number | null;
  format?: string;
  theme?: string;
  duration?: number;
  animation?: 'count' | 'slide';
  formatFunction?: (value: number) => string;
  [key: string]: any;
}

/**
 * FormatObject interface
 * @interface FormatObject
 * @property {string} repeating - The repeating part of the format. (i.e. '(,ddd)')
 * @property {string} [radix] - The radix separator. (i.e. '.')
 * @property {number} precision - The number of decimal places. (i.e. 'dd')
 */
export interface FormatObject {
  repeating: string;
  radix?: string;
  precision: number;
}

declare global {
  interface Window extends WindowOrWorkerGlobalScope {
    odometerOptions?: OdometerOptions;
    jQuery?: any;
    mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
    webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
    msRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
    WebKitMutationObserver?: any;
    MozMutationObserver?: any;
  }

  interface HTMLElement {
    odometer?: TmOdometer;
    doScroll?: any;
  }

  interface CSSStyleDeclaration {
    webkitTransition: string;
    mozTransition?: any;
    oTransition?: any;
  }

  interface Document {
    createEventObject?: any;
  }
}
