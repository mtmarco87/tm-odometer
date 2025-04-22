# TmOdometer [![npm version](https://img.shields.io/npm/v/tm-odometer.svg?style=flat)](https://www.npmjs.com/package/tm-odometer) [![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

**TmOdometer** is a lightweight JavaScript library for creating animated numeric counters with smooth transitions and precise decimal handling. It serves as the foundation for the Angular version, [TmNgOdometer](https://github.com/mtmarco87/tm-ng-odometer), and is perfect for projects requiring dynamic number animations.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Usage](#usage)
   - [Direct Inclusion](#direct-inclusion)
   - [Programmatic Usage](#programmatic-usage)
   - [Configuration](#configuration)
   - [Original Library Documentation](#original-library-documentation)
4. [Development](#development)
   - [Setup for Development](#setup-for-development)
   - [Testing](#testing)
5. [Acknowledgments](#acknowledgments)
6. [Extras](#extras)
7. [Support](#support)
8. [License](#license)

## Project Overview

**TmOdometer** is inspired by and built on top of **HubSpot's Odometer** library. This library enhances its functionality by introducing precise decimal handling, ensuring that numbers with decimal places retain their precision during and after animations (e.g., `1200` with a precision of 2 will display as `1200.00`). It is designed for seamless integration into any JavaScript project.

## Features

- **Lightweight**: Minimal dependencies and optimized for performance.
- **Decimal Precision**: Preserves decimal precision during animations.
- **Customizable Themes**: Supports various themes and animation styles.
- **Flexible Integration**: Works with vanilla JavaScript, CommonJS, and ES Modules.
- **Dynamic Updates**: Easily update values programmatically to trigger animations.

## Usage

**TmOdometer** can be used in two ways:

1. **Direct Inclusion**: For projects that include the library directly in HTML via `<script>` and `<link>` tags.
2. **Programmatic Usage**: For projects that install the library via npm and import it using CommonJS, ES Modules, or TypeScript.

Choose the method that best suits your project setup.

### Direct Inclusion

This method is for projects that include the library via `<script>` and `<link>` tags.

#### 1. Include the Library

Add the JavaScript and CSS files to your project:

```html
<link rel="stylesheet" href="odometer-theme-default.css" />
<script src="odometer.min.js"></script>
```

#### 2. Add Odometer to an Element

Add the `odometer` class to any element in your HTML:

```html
<div class="odometer">123</div>
```

Update the value programmatically:

```javascript
document.querySelector('.odometer').innerHTML = 456;
```

#### 3. Global Configuration (Optional)

You can configure all odometer instances globally by defining the `window.odometerOptions` object **before** including the `odometer.min.js` script:

```html
<script>
  window.odometerOptions = {
    format: '(,ddd).dd', // Number format
    duration: 3000, // Animation duration in milliseconds
    theme: 'car', // Theme for all instances
    animation: 'count', // Animation type ('slide' or 'count')
  };
</script>
<script src="odometer.min.js"></script>
```

#### 4. Per-Instance Configuration (Optional)

If you need to configure a single odometer instance differently from the global configuration, you can initialize it programmatically using the `Odometer` constructor:

```html
<div id="custom-odometer"></div>

<script>
  const customOdometer = new Odometer({
    el: document.getElementById('custom-odometer'),
    value: 123,
    animation: 'count', // Animation type ('slide' or 'count')
    duration: 3000, // Animation duration in milliseconds
    format: '(,ddd).dd', // Number format
    theme: 'minimal', // Theme for this instance
  });

  // Update the value programmatically
  setTimeout(() => {
    customOdometer.update(4567.89);
  }, 1000);
</script>
```

### Programmatic Usage

This method is for projects that use npm to install the library and include it programmatically.

#### 1. Install the Library

Install the library via npm:

```bash
npm install tm-odometer --save
```

#### 2. Import the Library

You can import the library into your project using one of the following methods:

- **CommonJS**:

  ```javascript
  const TmOdometer = require('tm-odometer');
  ```

- **ES Modules (with synthetic default export)**:

  ```javascript
  import * as TmOdometer from 'tm-odometer';
  ```

- **TypeScript Declaration**:
  If using TypeScript, you can declare the module manually:

  ```typescript
  declare module 'tm-odometer' {
    class TmOdometer {
      MAX_VALUES: number;
      digits: Array<HTMLElement>;
      el: HTMLElement;
      format: {
        precision: number;
        radix: any;
        repeating: string;
      };
      inside: HTMLElement;
      options: {
        el: HTMLElement;
        animation: string;
        duration: number;
        format: string;
        theme: string;
      };
      ribbons: any;
      transitionEndBound: boolean;
      value: 0;

      constructor(options: {
        el: HTMLElement;
        animation?: string;
        value?: number;
        duration?: number;
        format?: string;
        theme?: string;
      });

      update(value: number): void;
    }

    export default TmOdometer;
  }
  ```

#### 3. Use the Library Programmatically

Once the library is imported, you can use it as follows:

```javascript
const odometer = new TmOdometer({
  el: document.getElementById('odometer-element'),
  animation: 'count',
  value: 1000,
  duration: 2000,
  format: '(,ddd).dd',
  theme: 'default',
});

// Update the value programmatically
odometer.update(2000);
```

### Configuration

The library supports the following configuration options:

| **Option**  | **Type**      | **Default**   | **Description**                                                                                         |
| ----------- | ------------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| `el`        | `HTMLElement` | `null`        | The DOM element where the odometer will be rendered.                                                    |
| `value`     | `number`      | `0`           | The initial value of the odometer.                                                                      |
| `animation` | `string`      | `'slide'`     | Animation effect type. Options: `'slide'`, `'count'`.                                                   |
| `duration`  | `number`      | `2000` (ms)   | Duration of the animation in milliseconds.                                                              |
| `format`    | `string`      | `'(,ddd).dd'` | Number format. Examples: `'(,ddd)'` → `12,345`, `'(,ddd).dd'` → `12,345.67`, `(.ddd),dd` → `12.345,67`. |
| `theme`     | `string`      | `'default'`   | Theme for the odometer. Options: `'default'`, `'car'`, `'digital'`, `'minimal'`, `'train-station'`.     |

### Original Library Documentation

#### [Overview](http://github.hubspot.com/odometer/docs/welcome)

#### [Docs and Demo](http://github.hubspot.com/odometer)

## Development

### Setup for Development

1. **Prerequisites**:

   - [Node.js](https://nodejs.org/)
   - [Ruby](https://www.ruby-lang.org/) (for Compass, if required)
   - [Grunt](https://gruntjs.com/) (for task automation)

2. **Clone the Repository**:

   ```bash
   git clone https://github.com/mtmarco87/tm-odometer.git
   cd tm-odometer
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   gem install compass
   ```

4. **Build the Library**:

   ```bash
   npx grunt
   ```

5. **Watch for Changes**:
   ```bash
   npx grunt watch
   ```

## Acknowledgments

- **HubSpot's Odometer**: Original library by Adam Schwartz and Zack Bloom ([GitHub](http://github.hubspot.com/odometer/docs/welcome)).
- Special thanks to contributors and the open-source community for their invaluable support and inspiration.

## Extras

### Angular Version

If you're looking for an Angular version of this library, check out **[TmNgOdometer](https://github.com/mtmarco87/tm-ng-odometer)**, which builds on this project and provides seamless integration with Angular applications.

## Support

If you find this library useful, consider supporting its development:

- ⭐ Star the repository on GitHub.
- 💬 Share feedback or suggestions by opening an issue.
- ☕ [Buy me a coffee](https://buymeacoffee.com/mtmarco87) to support future updates.
- 🔵 BTC Address: `bc1qzy6e99pkeq00rsx8jptx93jv56s9ak2lz32e2d`
- 🟣 ETH Address: `0x38cf74ED056fF994342941372F8ffC5C45E6cF21`

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for more details.
