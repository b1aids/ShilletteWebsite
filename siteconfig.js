// siteConfig.js
// Description: Handles loading, applying, and saving site configuration settings
// like site title, icon, and header navigation links.

/**
 * Loads site configuration from the API, applies it, and then triggers navigation.
 * This function acts as a bridge after the initial login check.
 * Assumes `API_BASE_URL`, `siteConfig`, `isInitialConfigLoadComplete`,
 * `errorMessagePopup`, `applySiteConfig`, `runNavigation` are globally accessible.
 */
async function loadSiteConfigAndNavigate() {
    // Mark initial config load as incomplete until fetch completes
    isInitialConfigLoadComplete = false;
    try {
        const response = await fetch(`${API_BASE_URL}/api/config`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Store the fetched config globally
        siteConfig = await response.json();
        console.log("[loadSiteConfig] Site config loaded:", siteConfig);
        // Apply the loaded config to the UI
        applySiteConfig(siteConfig);
    } catch (error) {
        console.error("[loadSiteConfig] Error loading site config:", error);
        showPopupMessage(errorMessagePopup, "Failed to load site configuration. Using defaults.", true);
        // Apply default configuration if fetching failed
        applySiteConfig(null); // Pass null to indicate using defaults
    } finally {
        // Mark the initial config load as complete
        isInitialConfigLoadComplete = true;
        console.log("[loadSiteConfig] Initial config load complete.");
        // Now that both login check and config load are done, run navigation
        // Assumes runNavigation is defined globally (in navigation.js)
        runNavigation();
    }
}

/**
 * Applies the site configuration to the UI elements.
 * Updates site title, favicon, header icon, and navigation links.
 * Uses default values if the provided config is null or incomplete.
 * Assumes DOM element references (`document.title`, `siteTitleDisplay`, etc.)
 * and `DEFAULT_ICON_URL` (if defined in config.js) are globally accessible.
 */
function applySiteConfig(config) {
    // Determine title, icon URL, and links using provided config or defaults
    const title = config?.siteTitle || "Shillette"; // Default title
    const iconUrl = config?.siteIconUrl || (typeof DEFAULT_ICON_URL !== 'undefined' ? DEFAULT_ICON_URL : "/images/icon.png"); // Default icon
    // Default header links if none provided in config
    const links = config?.headerLinks && config.headerLinks.length > 0 ? config.headerLinks : [
        { name: "Home", href: "/#home" },
        { name: "Products", href: "/#products" },
        { name: "Tickets", href: "/#tickets" },
        { name: "Discord", href: "https://discord.gg/shillette", target: "_blank" }
    ];

    // Apply Site Title
    document.title = title;
    if (siteTitleDisplay) {
        siteTitleDisplay.textContent = title;
    } else {
        console.warn("applySiteConfig: siteTitleDisplay element not found.");
    }

    // Apply Header Icon and Favicon
    if (headerSiteIcon) {
        headerSiteIcon.src = iconUrl;
        // Add error handling for the header icon image itself
        headerSiteIcon.onerror = () => {
            console.warn(`Failed to load header icon: ${iconUrl}. Using default.`);
            headerSiteIcon.src = (typeof DEFAULT_ICON_URL !== 'undefined' ? DEFAULT_ICON_URL : "/images/icon.png"); // Fallback to default
            headerSiteIcon.onerror = null; // Prevent infinite loop if default also fails
        };
    } else {
         console.warn("applySiteConfig: headerSiteIcon element not found.");
    }
    if (faviconElement) {
         faviconElement.href = iconUrl;
    } else {
         console.warn("applySiteConfig: faviconElement element not found.");
    }

    // Populate Header Navigation Links
    if (mainNavigation && mobileMenuNav) {
        // Clear existing navigation links
        mainNavigation.innerHTML = '';
        mobileMenuNav.innerHTML = '';

        // Create and append links to both desktop and mobile menus
        links.forEach(link => {
            if (!link.name || !link.href) {
                console.warn("Skipping invalid link in config:", link);
                return; // Skip links missing name or href
            }
            // --- Desktop Navigation Link ---
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.name;
            a.classList.add('text-gray-300', 'hover:text-white', 'transition', 'duration-200');
            // Set target and rel for external links
            if (link.target === '_blank' || link.href.startsWith('http')) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer'; // Security for _blank targets
            } else if (link.target) {
                 a.target = link.target; // Apply other targets if specified
            }
            mainNavigation.appendChild(a);

            // --- Mobile Navigation Link (clone and modify) ---
            const mob_a = a.cloneNode(true);
            mob_a.classList.remove('text-gray-300', 'hover:text-white'); // Remove desktop-specific styles
            mob_a.classList.add('mobile-menu-link'); // Add mobile-specific style class
            // Add event listener to close mobile menu on click
            mob_a.addEventListener('click', () => mobileMenuNav.classList.add('hidden'));
            mobileMenuNav.appendChild(mob_a);
        });
    } else {
        console.warn("applySiteConfig: mainNavigation or mobileMenuNav element not found.");
    }

    // Update Footer Year
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    } else {
         console.warn("applySiteConfig: footerYear element not found.");
    }
}


/**
 * Populates the site configuration form in the admin dashboard
 * with the currently loaded site configuration values.
 * Assumes `siteConfig` is loaded and DOM elements for the form are globally accessible.
 */
async function loadSiteConfigForm() {
    // Assumes form elements like siteConfigForm, configSiteTitleInput, etc., are global
    if (!siteConfigForm || !configSiteTitleInput || !configSiteIconUrlInput || !configHeaderLinksContainer || !configSaveStatus) {
        console.error("loadSiteConfigForm: One or more required form elements not found.");
        return;
    }

    // Ensure the global siteConfig is loaded before populating the form
    if (!siteConfig) {
        console.warn("loadSiteConfigForm: Site config not loaded yet. Cannot populate form.");
        // Optionally attempt to load it again, but be cautious of loops
        // await loadSiteConfigAndNavigate();
        configSaveStatus.textContent = "Error: Site configuration not loaded.";
        configSaveStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
        return;
    }

    console.log("[loadSiteConfigForm] Populating form with config:", siteConfig);

    // Populate form fields with values from the global siteConfig object
    configSiteTitleInput.value = siteConfig.siteTitle || '';
    configSiteIconUrlInput.value = siteConfig.siteIconUrl || '';

    // Clear and repopulate header link input fields
    configHeaderLinksContainer.innerHTML = ''; // Clear existing link inputs first
    (siteConfig.headerLinks || []).forEach((link) => {
        addHeaderLinkInput(link.name, link.href, link.target); // Use helper function
    });

    // Clear any previous status messages
    configSaveStatus.textContent = '';
    configSaveStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status style
}

/**
 * Adds a set of input fields (name, href, target) for a header link
 * to the site configuration form's link container.
 * Includes a button to remove the added link group.
 * Assumes `configHeaderLinksContainer` is globally accessible.
 * @param {string} [name=''] - Initial value for the link name input.
 * @param {string} [href=''] - Initial value for the link href input.
 * @param {string} [target=''] - Initial value for the link target input.
 */
function addHeaderLinkInput(name = '', href = '', target = '') {
    // Assumes configHeaderLinksContainer is a global reference
    if (!configHeaderLinksContainer) {
        console.error("addHeaderLinkInput: configHeaderLinksContainer element not found.");
        return;
    }

    const linkGroup = document.createElement('div');
    linkGroup.className = 'link-group'; // Use class for styling the group

    // Use textContent for placeholder safety, value for pre-filling
    linkGroup.innerHTML = `
        <input type="text" placeholder="Link Name" value="${name}" class="link-name flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
        <input type="text" placeholder="Link Href (e.g., /#home, https://...)" value="${href}" class="link-href flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
        <input type="text" placeholder="Target (e.g., _blank)" value="${target || ''}" class="link-target flex-none w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400">
        <button type="button" class="remove-link-button" title="Remove Link">X</button>
    `; // Removed explicit button styling, assuming .link-group button is styled in CSS

    // Add event listener to the remove button for this specific link group
    const removeButton = linkGroup.querySelector('.remove-link-button');
    if (removeButton) {
        removeButton.addEventListener('click', () => linkGroup.remove());
    }

    // Append the new link input group to the container
    configHeaderLinksContainer.appendChild(linkGroup);
}

/**
 * Handles the submission of the site configuration form.
 * Gathers data, sends it to the API via PUT request, updates local state,
 * and refreshes the UI.
 * Assumes `API_BASE_URL`, `siteConfig`, `siteConfigForm`, `saveConfigButton`,
 * `configSaveStatus`, `configSiteTitleInput`, `configSiteIconUrlInput`,
 * `configHeaderLinksContainer`, `applySiteConfig`, `showPopupMessage`,
 * `configMessagePopup`, `errorMessagePopup` are globally accessible.
 * @param {Event} event - The form submission event.
 */
async function handleSaveSiteConfig(event) {
    event.preventDefault(); // Prevent default form submission behavior
    // Assumes necessary form elements are global refs
    if (!siteConfigForm || !saveConfigButton || !configSaveStatus || !configSiteTitleInput || !configSiteIconUrlInput || !configHeaderLinksContainer) {
        console.error("handleSaveSiteConfig: One or more required form elements not found.");
        return;
    }

    // Disable button and show saving state
    saveConfigButton.disabled = true;
    saveConfigButton.textContent = 'Saving...';
    configSaveStatus.textContent = ''; // Clear previous status
    configSaveStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status style

    // Gather updated configuration data from the form fields
    const updatedConfig = {
         siteTitle: configSiteTitleInput.value.trim(),
         siteIconUrl: configSiteIconUrlInput.value.trim() || null, // Use null if empty string
         headerLinks: []
     };

    // Collect header links from the dynamically added input groups
    configHeaderLinksContainer.querySelectorAll('.link-group').forEach(group => {
        const nameInput = group.querySelector('.link-name');
        const hrefInput = group.querySelector('.link-href');
        const targetInput = group.querySelector('.link-target');
        // Only add the link if both name and href are provided
        if (nameInput && hrefInput && nameInput.value.trim() && hrefInput.value.trim()) {
            updatedConfig.headerLinks.push({
                name: nameInput.value.trim(),
                href: hrefInput.value.trim(),
                // Use null for target if the input is empty or whitespace
                target: targetInput && targetInput.value.trim() ? targetInput.value.trim() : null
            });
        }
    });

    console.log("[handleSaveSiteConfig] Sending updated config:", updatedConfig);

    // Send the updated configuration to the backend API
    try {
        const response = await fetch(`${API_BASE_URL}/api/config`, {
            method: 'PUT', // Use PUT to update the entire configuration
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedConfig),
            credentials: 'include' // Important for sending session cookies
        });
        const result = await response.json(); // Try to parse JSON response
        if (!response.ok) {
            // Throw an error with the message from the backend if available
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        // --- Success ---
        console.log("[handleSaveSiteConfig] Config saved successfully:", result);
        // Update the global siteConfig variable with the saved data (returned from API)
        siteConfig = result;
        // Re-apply the updated configuration to the UI immediately
        applySiteConfig(siteConfig);
        // Show success message in the form status area
        configSaveStatus.textContent = 'Configuration saved successfully!';
        configSaveStatus.classList.add('text-green-400');
        // Show a general success popup message
        showPopupMessage(configMessagePopup, 'Configuration saved!');

    } catch (error) {
        // --- Error ---
        console.error("[handleSaveSiteConfig] Error saving site config:", error);
        // Display error message in the form status area
        configSaveStatus.textContent = `Error: ${error.message}`;
        configSaveStatus.classList.add('text-red-400');
        // Show a general error popup message
        showPopupMessage(errorMessagePopup, `Failed to save config: ${error.message}`, true);
    } finally {
        // --- Finally ---
        // Re-enable the save button regardless of success or failure
        saveConfigButton.disabled = false;
        saveConfigButton.textContent = 'Save Configuration';
    }
}
