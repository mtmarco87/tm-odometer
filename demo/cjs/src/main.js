// Pure CommonJS - no TypeScript
const TmOdometer = require('tm-odometer');

document.addEventListener('DOMContentLoaded', function () {
  // Initialize the odometer
  const odometerElement = document.getElementById('odometer');

  if (odometerElement) {
    const odometer = new TmOdometer({
      el: odometerElement,
      value: 0,
      format: '(,ddd).dd',
      theme: 'car',
      duration: 1500
    });

    // Add event listeners
    const updateButton = document.getElementById('updateButton');
    updateButton.addEventListener('click', function () {
      const newValue = Math.random() * 10000;
      odometer.update(newValue);
    });

    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function () {
      odometer.update(0);
    });
  }
});