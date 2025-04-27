$(document).ready(function () {
    const odometers = [];
    const container = document.querySelector('.odometer-container');

    // Create a new odometer
    function createOdometer() {
        const el = document.createElement('div');
        el.className = 'odometer'; // Add a class for styling
        container.appendChild(el);

        const od = new Odometer({
            el: el,
            value: 0,
        });

        return od;
    }

    // Destroy an existing odometer
    function destroyOdometer(od) {
        container.removeChild(od.el);
    }

    // Update the number of odometers dynamically
    function updateOdometerCount(num) {
        // Add or remove odometers based on the slider value
        if (num > odometers.length) {
            for (let i = odometers.length; i < num; i++) {
                odometers.push(createOdometer());
            }
        } else if (num < odometers.length) {
            for (let i = num; i < odometers.length; i++) {
                destroyOdometer(odometers[i]);
            }
            odometers.splice(num, odometers.length - num);
        }

        // Dynamically resize odometers based on the count
        const size = Math.max(5, Math.min(29, Math.floor(57 / num)));
        document.querySelectorAll('.odometer').forEach((el) => {
            el.style.fontSize = `${size}px`;
        });
    }

    // Initialize the slider
    $('.slider').slider({
        value: 1,
        max: 6,
        change: function (event, ui) {
            updateOdometerCount(Math.pow(2, ui.value));
        },
    });

    // Update odometers every 3 seconds
    setInterval(function () {
        for (let i = 0; i < odometers.length; i++) {
            odometers[i].update((Math.random() * 1000000) | 0);
        }
    }, 3000);

    // Initialize with 2 odometers
    updateOdometerCount(2);
});