import TmOdometer from 'tm-odometer';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the odometer
  const odometerElement = document.getElementById('odometer');

  if (odometerElement) {
    const odometer = new TmOdometer({
      el: odometerElement,
      value: 0,
      format: '(,ddd).dd', // Format with thousands separator and 2 decimal places
      theme: 'car',
      duration: 1500,
    });

    // Random value button
    const updateButton = document.getElementById('updateButton');
    updateButton?.addEventListener('click', () => {
      const newValue = Math.random() * 10000;
      odometer.update(newValue);
    });

    // Reset button
    const resetButton = document.getElementById('resetButton');
    resetButton?.addEventListener('click', () => {
      odometer.update(0);
    });
  }
});
