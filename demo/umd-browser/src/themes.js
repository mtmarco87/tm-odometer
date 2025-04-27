document.addEventListener('DOMContentLoaded', function () {
  // Define all theme names
  const themes = [
    'default',
    'car',
    'digital',
    'minimal',
    'plaza',
    'slot-machine',
    'train-station'
  ];

  // Store odometer instances
  const odometers = [];

  // Initialize each odometer instance
  themes.forEach(function (theme) {
    const element = document.getElementById(`odometer-${theme}`);
    if (element) {
      const odometer = new TmOdometer({
        el: element,
        value: 12345.67,
        format: '(,ddd).dd',
        theme: theme,
        duration: 1500
      });
      odometers.push(odometer);
    }
  });

  // Update all button functionality
  const updateAllButton = document.getElementById('updateAllButton');
  updateAllButton.addEventListener('click', function () {
    const newValue = Math.random() * 99999;
    odometers.forEach(function (odometer) {
      odometer.update(newValue);
    });
  });
});