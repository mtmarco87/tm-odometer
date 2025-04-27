define(['tm-odometer'], function (TmOdometer) {
  function initializeOdometer() {
    // Initialize the odometer
    const odometerElement = document.getElementById('odometer');

    if (odometerElement) {
      const odometer = new TmOdometer({
        el: odometerElement,
        value: 0,
        format: '(,ddd).dd',
        theme: 'car',
        duration: 1500,
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
  }

  // Check if the DOM is already loaded
  if (document.readyState === 'loading') {
    // DOM is not fully loaded, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeOdometer);
  } else {
    // DOM is already loaded, initialize immediately
    initializeOdometer();
  }
});