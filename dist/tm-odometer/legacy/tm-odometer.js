(function() {
  var COUNT_FRAMERATE, COUNT_MS_PER_FRAME, DIGIT_FORMAT, DIGIT_HTML, DIGIT_SPEEDBOOST, DURATION, FORMAT_MARK_HTML, FORMAT_PARSER, FRAMERATE, FRAMES_PER_VALUE, MS_PER_FRAME, MutationObserver, RIBBON_HTML, TRANSITION_END_EVENTS, TRANSITION_SUPPORT, TmOdometer, VALUE_HTML, _jQueryWrapped, _old, addClass, createFromHTML, fractionalPart, now, ref, ref1, removeClass, requestAnimationFrame, round, transitionCheckStyles, trigger, truncate, wrapJQuery;

  VALUE_HTML = '<span class="odometer-value"></span>';

  RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>';

  DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>';

  FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

  // The bit within the parenthesis will be repeated, so (,ddd) becomes 123,456,789....

  // If your locale uses spaces to seperate digits, you could consider using a
  // Narrow No-Break Space ( ), as it's a bit more correct.

  // Numbers will be rounded to the number of digits after the radix seperator.

  // When values are set using `.update` or the `.innerHTML`-type attributes,
  // strings are assumed to already be in the locale's format.

  // This is just the default, it can also be set as options.format.
  DIGIT_FORMAT = '(,ddd).dd';

  FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;

  // What is our target framerate?
  FRAMERATE = 30;

  // How long will the animation last?
  DURATION = 2000;

  // What is the fastest we should update values when we are
  // counting up (not using the wheel animation).
  COUNT_FRAMERATE = 20;

  // What is the minimum number of frames for each value on the wheel?
  // We won't render more values than could be reasonably seen
  FRAMES_PER_VALUE = 2;

  // If more than one digit is hitting the frame limit, they would all get
  // capped at that limit and appear to be moving at the same rate.  This
  // factor adds a boost to subsequent digits to make them appear faster.
  DIGIT_SPEEDBOOST = .5;

  MS_PER_FRAME = 1000 / FRAMERATE;

  COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

  TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

  transitionCheckStyles = document.createElement('div').style;

  TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null);

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  removeClass = function(el, name) {
    return el.className = el.className.replace(new RegExp(`(^| )${name.split(' ').join('|')}( |$)`, 'gi'), ' ');
  };

  addClass = function(el, name) {
    removeClass(el, name);
    return el.className += ` ${name}`;
  };

  trigger = function(el, name) {
    var evt;
    // Custom DOM events are not supported in IE8
    if (document.createEvent != null) {
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      return el.dispatchEvent(evt);
    }
  };

  now = function() {
    var ref, ref1;
    return (ref = (ref1 = window.performance) != null ? typeof ref1.now === "function" ? ref1.now() : void 0 : void 0) != null ? ref : +new Date();
  };

  round = function(val, precision = 0) {
    if (!precision) {
      return Math.round(val);
    }
    val *= Math.pow(10, precision);
    val += 0.5;
    val = Math.floor(val);
    return val /= Math.pow(10, precision);
  };

  truncate = function(val) {
    // | 0 fails on numbers greater than 2^32
    if (val < 0) {
      return Math.ceil(val);
    } else {
      return Math.floor(val);
    }
  };

  fractionalPart = function(val) {
    return val - round(val);
  };

  _jQueryWrapped = false;

  (wrapJQuery = function() {
    var l, len, property, ref, results;
    if (_jQueryWrapped) {
      return;
    }
    if (window.jQuery != null) {
      _jQueryWrapped = true;
      ref = ['html', 'text'];
      // We need to wrap jQuery's .html and .text because they don't always
      // call .innerHTML/.innerText
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        property = ref[l];
        results.push((function(property) {
          var old;
          old = window.jQuery.fn[property];
          return window.jQuery.fn[property] = function(val) {
            var ref1;
            if ((val == null) || (((ref1 = this[0]) != null ? ref1.odometer : void 0) == null)) {
              return old.apply(this, arguments);
            }
            return this[0].odometer.update(val);
          };
        })(property));
      }
      return results;
    }
  })();

  // In case jQuery is brought in after this file
  setTimeout(wrapJQuery, 0);

  TmOdometer = class TmOdometer {
    constructor(options) {
      var base, e, k, l, len, property, ref, ref1, ref2, v;
      this.options = options;
      this.el = this.options.el;
      if (this.el.odometer != null) {
        return this.el.odometer;
      }
      this.el.odometer = this;
      ref = TmOdometer.options;
      for (k in ref) {
        v = ref[k];
        if (this.options[k] == null) {
          this.options[k] = v;
        }
      }
      if ((base = this.options).duration == null) {
        base.duration = DURATION;
      }
      this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0;
      this.resetFormat();
      this.value = this.cleanValue((ref1 = this.options.value) != null ? ref1 : '');
      this.renderInside();
      this.render();
      try {
        ref2 = ['innerHTML', 'innerText', 'textContent'];
        for (l = 0, len = ref2.length; l < len; l++) {
          property = ref2[l];
          if (this.el[property] != null) {
            ((property) => {
              return Object.defineProperty(this.el, property, {
                get: () => {
                  var ref3;
                  if (property === 'innerHTML') {
                    return this.inside.outerHTML;
                  } else {
                    // It's just a single HTML element, so innerText is the
                    // same as outerText.
                    return (ref3 = this.inside.innerText) != null ? ref3 : this.inside.textContent;
                  }
                },
                set: (val) => {
                  return this.update(val);
                }
              });
            })(property);
          }
        }
      } catch (error) {
        e = error;
        // Safari
        this.watchForMutations();
      }
      this;
    }

    renderInside() {
      this.inside = document.createElement('div');
      this.inside.className = 'odometer-inside';
      this.el.innerHTML = '';
      return this.el.appendChild(this.inside);
    }

    watchForMutations() {
      var e;
      // Safari doesn't allow us to wrap .innerHTML, so we listen for it
      // changing.
      if (MutationObserver == null) {
        return;
      }
      try {
        if (this.observer == null) {
          this.observer = new MutationObserver((mutations) => {
            var newVal;
            newVal = this.el.innerText;
            this.renderInside();
            this.render(this.value);
            return this.update(newVal);
          });
        }
        this.watchMutations = true;
        return this.startWatchingMutations();
      } catch (error) {
        e = error;
      }
    }

    startWatchingMutations() {
      if (this.watchMutations) {
        return this.observer.observe(this.el, {
          childList: true
        });
      }
    }

    stopWatchingMutations() {
      var ref;
      return (ref = this.observer) != null ? ref.disconnect() : void 0;
    }

    cleanValue(val) {
      var ref;
      if (typeof val === 'string') {
        // We need to normalize the format so we can properly turn it into
        // a float.
        val = val.replace((ref = this.format.radix) != null ? ref : '.', '<radix>');
        val = val.replace(/[.,]/g, '');
        val = val.replace('<radix>', '.');
        val = parseFloat(val, 10) || 0;
      }
      return round(val, this.format.precision);
    }

    bindTransitionEnd() {
      var event, l, len, ref, renderEnqueued, results;
      if (this.transitionEndBound) {
        return;
      }
      this.transitionEndBound = true;
      // The event will be triggered once for each ribbon, we only
      // want one render though
      renderEnqueued = false;
      ref = TRANSITION_END_EVENTS.split(' ');
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        event = ref[l];
        results.push(this.el.addEventListener(event, () => {
          if (renderEnqueued) {
            return true;
          }
          renderEnqueued = true;
          setTimeout(() => {
            this.render();
            renderEnqueued = false;
            return trigger(this.el, 'odometerdone');
          }, 0);
          return true;
        }, false));
      }
      return results;
    }

    resetFormat() {
      var format, fractional, parsed, precision, radix, ref, repeating;
      format = (ref = this.options.format) != null ? ref : DIGIT_FORMAT;
      format || (format = 'd');
      parsed = FORMAT_PARSER.exec(format);
      if (!parsed) {
        throw new Error("TmOdometer: Unparsable digit format");
      }
      [repeating, radix, fractional] = parsed.slice(1, 4);
      precision = (fractional != null ? fractional.length : void 0) || 0;
      return this.format = {repeating, radix, precision};
    }

    render(value = this.value) {
      var classes, cls, l, len, match, newClasses, theme;
      this.stopWatchingMutations();
      this.resetFormat();
      this.inside.innerHTML = '';
      theme = this.options.theme;
      classes = this.el.className.split(' ');
      newClasses = [];
      for (l = 0, len = classes.length; l < len; l++) {
        cls = classes[l];
        if (!cls.length) {
          continue;
        }
        if (match = /^odometer-theme-(.+)$/.exec(cls)) {
          theme = match[1];
          continue;
        }
        if (/^odometer(-|$)/.test(cls)) {
          continue;
        }
        newClasses.push(cls);
      }
      newClasses.push('odometer');
      if (!TRANSITION_SUPPORT) {
        newClasses.push('odometer-no-transitions');
      }
      if (theme) {
        newClasses.push(`odometer-theme-${theme}`);
      } else {
        // This class matches all themes, so it should do what you'd expect if only one
        // theme css file is brought into the page.
        newClasses.push("odometer-auto-theme");
      }
      this.el.className = newClasses.join(' ');
      this.ribbons = {};
      this.formatDigits(value);
      return this.startWatchingMutations();
    }

    formatDigits(value) {
      var digit, l, len, len1, m, ref, ref1, valueDigit, valueString, wholePart;
      this.digits = [];
      if (this.options.formatFunction) {
        valueString = this.options.formatFunction(value);
        ref = valueString.split('').reverse();
        for (l = 0, len = ref.length; l < len; l++) {
          valueDigit = ref[l];
          if (valueDigit.match(/0-9/)) {
            digit = this.renderDigit();
            digit.querySelector('.odometer-value').innerHTML = valueDigit;
            this.digits.push(digit);
            this.insertDigit(digit);
          } else {
            this.addSpacer(valueDigit);
          }
        }
      } else {
        value = this.preservePrecision(value);
        wholePart = !this.format.precision;
        ref1 = value.toString().split('').reverse();
        for (m = 0, len1 = ref1.length; m < len1; m++) {
          digit = ref1[m];
          if (digit === '.') {
            wholePart = true;
          }
          this.addDigit(digit, wholePart);
        }
      }
    }

    preservePrecision(value) {
      var fixedValue, i, l, parts, ref;
      // This function fixes the precision at the end of the animation keeping the
      // decimals even if we have 0 digits only
      fixedValue = value;
      if (this.format.precision) {
        parts = fixedValue.toString().split('.');
        if (parts.length === 1) {
          fixedValue += '.';
          parts[1] = '';
        }
        for (i = l = 0, ref = this.format.precision; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
          if (!parts[1][i]) {
            fixedValue += '0';
          }
        }
      }
      return fixedValue;
    }

    update(newValue) {
      var diff;
      newValue = this.cleanValue(newValue);
      if (!(diff = newValue - this.value)) {
        return;
      }
      removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
      if (diff > 0) {
        addClass(this.el, 'odometer-animating-up');
      } else {
        addClass(this.el, 'odometer-animating-down');
      }
      this.stopWatchingMutations();
      this.animate(newValue);
      this.startWatchingMutations();
      setTimeout(() => {
        // Force a repaint
        this.el.offsetHeight;
        return addClass(this.el, 'odometer-animating');
      }, 0);
      return this.value = newValue;
    }

    renderDigit() {
      return createFromHTML(DIGIT_HTML);
    }

    insertDigit(digit, before) {
      if (before != null) {
        return this.inside.insertBefore(digit, before);
      } else if (!this.inside.children.length) {
        return this.inside.appendChild(digit);
      } else {
        return this.inside.insertBefore(digit, this.inside.children[0]);
      }
    }

    addSpacer(chr, before, extraClasses) {
      var spacer;
      spacer = createFromHTML(FORMAT_MARK_HTML);
      spacer.innerHTML = chr;
      if (extraClasses) {
        addClass(spacer, extraClasses);
      }
      return this.insertDigit(spacer, before);
    }

    addDigit(value, repeating = true) {
      var chr, digit, ref, resetted;
      if (value === '-') {
        return this.addSpacer(value, null, 'odometer-negation-mark');
      }
      if (value === '.') {
        return this.addSpacer((ref = this.format.radix) != null ? ref : '.', null, 'odometer-radix-mark');
      }
      if (repeating) {
        resetted = false;
        while (true) {
          if (!this.format.repeating.length) {
            if (resetted) {
              throw new Error("Bad odometer format without digits");
            }
            this.resetFormat();
            resetted = true;
          }
          chr = this.format.repeating[this.format.repeating.length - 1];
          this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
          if (chr === 'd') {
            break;
          }
          this.addSpacer(chr);
        }
      }
      digit = this.renderDigit();
      digit.querySelector('.odometer-value').innerHTML = value;
      this.digits.push(digit);
      return this.insertDigit(digit);
    }

    animate(newValue) {
      if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
        return this.animateCount(newValue);
      } else {
        return this.animateSlide(newValue);
      }
    }

    animateCount(newValue) {
      var cur, diff, last, start, tick;
      if (!(diff = +newValue - this.value)) {
        return;
      }
      start = last = now();
      cur = this.value;
      return (tick = () => {
        var delta, dist, fraction;
        if ((now() - start) > this.options.duration) {
          this.value = newValue;
          this.render();
          trigger(this.el, 'odometerdone');
          return;
        }
        delta = now() - last;
        if (delta > COUNT_MS_PER_FRAME) {
          last = now();
          fraction = delta / this.options.duration;
          dist = diff * fraction;
          cur += dist;
          this.render(Math.round(cur));
        }
        if (requestAnimationFrame != null) {
          return requestAnimationFrame(tick);
        } else {
          return setTimeout(tick, COUNT_MS_PER_FRAME);
        }
      })();
    }

    getDigitCount(...values) {
      var i, l, len, max, value;
      for (i = l = 0, len = values.length; l < len; i = ++l) {
        value = values[i];
        values[i] = Math.abs(value);
      }
      max = Math.max(...values);
      return Math.ceil(Math.log(max + 1) / Math.log(10));
    }

    getFractionalDigitCount(...values) {
      var i, l, len, parser, parts, value;
      // This assumes the value has already been rounded to
      // @format.precision places

      parser = /^\-?\d*\.(\d*?)0*$/;
      for (i = l = 0, len = values.length; l < len; i = ++l) {
        value = values[i];
        values[i] = value.toString();
        parts = parser.exec(values[i]);
        if (parts == null) {
          values[i] = 0;
        } else {
          values[i] = parts[1].length;
        }
      }
      return Math.max(...values);
    }

    resetDigits() {
      this.digits = [];
      this.ribbons = [];
      this.inside.innerHTML = '';
      return this.resetFormat();
    }

    animateSlide(newValue) {
      var base, boosted, cur, diff, digitCount, digits, dist, end, fractionalCount, frame, frames, i, incr, j, l, len, len1, len2, m, mark, n, numEl, o, oldValue, ref, ref1, start;
      oldValue = this.value;
      // Fix to animate always the fixed decimal digits passed in input 
      fractionalCount = this.format.precision;
      if (fractionalCount) {
        newValue = newValue * Math.pow(10, fractionalCount);
        oldValue = oldValue * Math.pow(10, fractionalCount);
      }
      if (!(diff = newValue - oldValue)) {
        return;
      }
      this.bindTransitionEnd();
      digitCount = this.getDigitCount(oldValue, newValue);
      digits = [];
      boosted = 0;
// We create a array to represent the series of digits which should be
// animated in each column
      for (i = l = 0, ref = digitCount; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
        start = truncate(oldValue / Math.pow(10, digitCount - i - 1));
        end = truncate(newValue / Math.pow(10, digitCount - i - 1));
        dist = end - start;
        if (Math.abs(dist) > this.MAX_VALUES) {
          // We need to subsample
          frames = [];
          // Subsequent digits need to be faster than previous ones
          incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
          cur = start;
          while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
            frames.push(Math.round(cur));
            cur += incr;
          }
          if (frames[frames.length - 1] !== end) {
            frames.push(end);
          }
          boosted++;
        } else {
          frames = (function() {
            var results = [];
            for (var m = start; start <= end ? m <= end : m >= end; start <= end ? m++ : m--){ results.push(m); }
            return results;
          }).apply(this);
        }
// We only care about the last digit
        for (i = m = 0, len = frames.length; m < len; i = ++m) {
          frame = frames[i];
          frames[i] = Math.abs(frame % 10);
        }
        digits.push(frames);
      }
      this.resetDigits();
      ref1 = digits.reverse();
      for (i = n = 0, len1 = ref1.length; n < len1; i = ++n) {
        frames = ref1[i];
        if (!this.digits[i]) {
          this.addDigit(' ', i >= fractionalCount);
        }
        if ((base = this.ribbons)[i] == null) {
          base[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
        }
        this.ribbons[i].innerHTML = '';
        if (diff < 0) {
          frames = frames.reverse();
        }
        for (j = o = 0, len2 = frames.length; o < len2; j = ++o) {
          frame = frames[j];
          numEl = document.createElement('div');
          numEl.className = 'odometer-value';
          numEl.innerHTML = frame;
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
      mark = this.inside.querySelector('.odometer-radix-mark');
      if (mark != null) {
        mark.parent.removeChild(mark);
      }
      if (fractionalCount) {
        return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark');
      }
    }

  };

  TmOdometer.options = (ref = window.odometerOptions) != null ? ref : {};

  setTimeout(function() {
    var base, k, ref1, results, v;
    // We do this in a seperate pass to allow people to set
    // window.odometerOptions after bringing the file in.
    if (window.odometerOptions) {
      ref1 = window.odometerOptions;
      results = [];
      for (k in ref1) {
        v = ref1[k];
        results.push((base = TmOdometer.options)[k] != null ? base[k] : base[k] = v);
      }
      return results;
    }
  }, 0);

  TmOdometer.init = function() {
    var el, elements, l, len, ref1, results;
    if (document.querySelectorAll == null) {
      return;
    }
    // IE 7 or 8 in Quirksmode
    elements = document.querySelectorAll(TmOdometer.options.selector || '.odometer');
    results = [];
    for (l = 0, len = elements.length; l < len; l++) {
      el = elements[l];
      results.push(el.odometer = new TmOdometer({
        el,
        value: (ref1 = el.innerText) != null ? ref1 : el.textContent
      }));
    }
    return results;
  };

  if ((((ref1 = document.documentElement) != null ? ref1.doScroll : void 0) != null) && (document.createEventObject != null)) {
    // IE < 9
    _old = document.onreadystatechange;
    document.onreadystatechange = function() {
      if (document.readyState === 'complete' && TmOdometer.options.auto !== false) {
        TmOdometer.init();
      }
      return _old != null ? _old.apply(this, arguments) : void 0;
    };
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (TmOdometer.options.auto !== false) {
        return TmOdometer.init();
      }
    }, false);
  }

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return TmOdometer;
    });
  } else if (typeof exports !== "undefined" && exports !== null) {
    // CommonJS
    module.exports = TmOdometer;
    module.exports.Odometer = TmOdometer; // Alias for retrocompatibility
  } else {
    // Browser globals
    window.TmOdometer = TmOdometer;
    window.Odometer = TmOdometer; // Alias for retrocompatibility
  }

}).call(this);
