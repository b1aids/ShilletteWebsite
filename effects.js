// effects.js
// Description: Contains functions for visual effects, like the snowflake animation.

/**
 * Creates and appends snowflake elements to the designated container
 * for a background falling snow animation effect.
 * Assumes `snowContainer` (DOM element) is globally accessible.
 */
function createSnowflakes() {
    // Number of snowflakes to generate
    const numberOfSnowflakes = 75;

    // Ensure the container element exists
    if (!snowContainer) {
        console.warn("createSnowflakes: snowContainer element not found. Skipping effect.");
        return;
    }

    // Clear any existing snowflakes before creating new ones
    snowContainer.innerHTML = '';

    // Create the specified number of snowflake elements
    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake'); // Style defined in CSS

        // Randomize properties for variation
        const size = Math.random() * 3 + 2; // Size between 2px and 5px
        const duration = Math.random() * 10 + 5; // Fall duration between 5s and 15s
        const delay = Math.random() * 10; // Animation start delay up to 10s
        const startLeft = Math.random() * 100; // Horizontal start position (vw)
        const opacity = Math.random() * 0.5 + 0.5; // Opacity between 0.5 and 1.0

        // Apply randomized styles
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startLeft}vw`;
        snowflake.style.opacity = opacity;
        snowflake.style.animationDuration = `${duration}s`;
        // Use a negative delay to start animations partway through their cycle,
        // making the effect appear immediately populated rather than starting empty.
        snowflake.style.animationDelay = `-${delay}s`;

        // Append the snowflake to the container
        snowContainer.appendChild(snowflake);
    }
    console.log(`[createSnowflakes] Generated ${numberOfSnowflakes} snowflakes.`);
}
