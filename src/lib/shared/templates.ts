/**
 * Templates for odometer elements
 */

const VALUE_HTML = '<span class="odometer-value"></span>';
const RIBBON_HTML =
  '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' +
  VALUE_HTML +
  '</span></span>';
const DIGIT_HTML =
  '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' +
  RIBBON_HTML +
  '</span></span>';
const FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

export { DIGIT_HTML, FORMAT_MARK_HTML };
