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

  // Get each odometer instance
  themes.forEach(function (theme) {
    const element = document.getElementById(`odometer-${theme}`);
    if (element) {
      const odometer = element.odometer;
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