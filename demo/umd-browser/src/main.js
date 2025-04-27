// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get the odometer element
  const odometerElement = document.getElementById('odometer');

  // Create a new TmOdometer instance
  // Note: With the umd bundle, TmOdometer is available globally
  const odometer = new TmOdometer({
    el: odometerElement,
    value: 0,
    format: '(,ddd).dd', // Format with thousands separator and 2 decimal places
    theme: 'car',
    duration: 1500
  });

  // Add click handler for the update button
  const updateButton = document.getElementById('updateButton');
  updateButton.addEventListener('click', function () {
    // Generate a random value between 0 and 10000
    const newValue = Math.random() * 10000;
    odometer.update(newValue);
  });

  // Add click handler for the reset button
  const resetButton = document.getElementById('resetButton');
  resetButton.addEventListener('click', function () {
    odometer.update(0);
  });
});