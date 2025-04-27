import TmOdometer from 'tm-odometer';

document.addEventListener('DOMContentLoaded', () => {
  // Create odometer instances for each theme
  const themes = [
    'default',
    'car',
    'digital',
    'minimal',
    'plaza',
    'slot-machine',
    'train-station',
  ];

  // Store odometer instances
  const odometers: TmOdometer[] = [];

  // Initialize all odometers
  themes.forEach((theme) => {
    const element = document.getElementById(`odometer-${theme}`);
    if (element) {
      const odometer = new TmOdometer({
        el: element,
        value: 12345.67,
        format: '(,ddd).dd',
        theme: theme,
        duration: 1500,
      });
      odometers.push(odometer);
    }
  });

  // Update all button
  const updateAllButton = document.getElementById('updateAllButton');
  updateAllButton?.addEventListener('click', () => {
    const newValue = Math.random() * 99999;
    odometers.forEach((odometer) => {
      odometer.update(newValue);
    });
  });
});
