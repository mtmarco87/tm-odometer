// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get the odometer element and instance
  const odometerElement = document.getElementById('odometer');
  const odometer = odometerElement.odometer;

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