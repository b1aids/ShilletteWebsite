// firmware.js
// Description: Handles the firmware generation modal, including populating
// device types, opening/closing the modal, and submitting the generation request.

/**
 * Fetches available device types from the API and populates the
 * device type select dropdown in the firmware generation modal.
 * Assumes `API_BASE_URL` and `generateDeviceTypeSelect` (DOM element)
 * are globally accessible.
 */
async function populateDeviceTypes() {
    // Assumes generateDeviceTypeSelect is a global reference
    if (!generateDeviceTypeSelect) {
        console.error("populateDeviceTypes: generateDeviceTypeSelect element not found.");
        return;
    }

    // Show loading state in the dropdown
    generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
    generateDeviceTypeSelect.disabled = true; // Disable while loading

    try {
        const response = await fetch(`${API_BASE_URL}/api/firmware/device_types`);
        if (!response.ok) {
            throw new Error(`Failed to load device types (HTTP ${response.status})`);
        }
        const deviceTypes = await response.json();

        // Clear loading state and prepare for options
        generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>Select Device Type...</option>';

        if (deviceTypes && Array.isArray(deviceTypes) && deviceTypes.length > 0) {
            // Add each fetched device type as an option
            deviceTypes.forEach(dtype => {
                const option = document.createElement('option');
                option.value = dtype;
                // Display in uppercase for better readability, but store original value
                option.textContent = dtype.toUpperCase();
                generateDeviceTypeSelect.appendChild(option);
            });
            generateDeviceTypeSelect.disabled = false; // Enable dropdown
        } else {
             // Handle case where no device types are returned
             generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>No types available</option>';
             // Keep dropdown disabled
        }
    } catch (error) {
        console.error("Error populating device types:", error);
        // Display error state in the dropdown
        generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>Error loading types</option>';
        // Keep dropdown disabled
    }
}

/**
 * Opens the firmware generation modal.
 * Resets the form, sets the title, populates device types, and displays the modal.
 * Assumes modal elements (`firmwareModal`, `firmwareGenerateForm`, etc.) and
 * `populateDeviceTypes` are globally accessible.
 * @param {string} productId - The ID of the product for which firmware is being generated.
 * @param {string} productName - The name of the product (for the modal title).
 */
function openFirmwareGenerateModal(productId, productName) {
    // Assumes firmwareModal and other form elements are global refs
    if (!firmwareModal || !firmwareGenerateForm || !firmwareModalTitle || !generateProductIdInput || !generateStatus || !submitFirmwareButton) {
        console.error("openFirmwareGenerateModal: Required modal elements not found.");
        return;
    }
    if (!productId || !productName) {
        console.error("openFirmwareGenerateModal: productId or productName missing.");
        return; // Need product info to proceed
    }

    // Reset form fields and status messages
    firmwareGenerateForm.reset();
    generateStatus.textContent = '';
    generateStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status style
    submitFirmwareButton.disabled = false; // Ensure button is enabled initially
    submitFirmwareButton.textContent = 'Start Generation'; // Reset button text

    // Set modal title and the hidden product ID input
    firmwareModalTitle.textContent = `Generate Firmware for ${productName}`;
    generateProductIdInput.value = productId;

    // Asynchronously populate the device types dropdown
    populateDeviceTypes(); // Assumes global

    // Show the modal
    firmwareModal.classList.add('active');
}

/**
 * Closes the firmware generation modal.
 * Assumes `firmwareModal` is globally accessible.
 */
function closeFirmwareGenerateModal() {
    // Assumes firmwareModal is a global ref
    if (firmwareModal) {
        firmwareModal.classList.remove('active');
    }
}

/**
 * Handles the submission of the firmware generation form.
 * Validates input (DNA ID, device type), sends the request to the backend API,
 * displays status messages, and handles success/error responses.
 * Assumes `firmwareGenerateForm`, modal elements, `API_BASE_URL`, `showPopupMessage`,
 * `productMessagePopup`, `errorMessagePopup`, `closeFirmwareGenerateModal` are globally accessible.
 * @param {Event} event - The form submission event.
 */
async function handleFirmwareGenerateSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Ensure required elements exist
    if (!firmwareGenerateForm || !submitFirmwareButton || !generateProductIdInput || !generateDnaIdInput || !generateDeviceTypeSelect || !generateStatus) {
        console.error("handleFirmwareGenerateSubmit: Required form elements missing.");
        return;
    }
    const firmwareFolderInput = document.getElementById('generate-firmware-folder'); // Get folder input

    // Get values from form
    const productId = generateProductIdInput.value;
    const dnaId = generateDnaIdInput.value.trim().toUpperCase(); // Ensure uppercase hex
    const deviceType = generateDeviceTypeSelect.value;
    const firmwareFolder = firmwareFolderInput ? firmwareFolderInput.value.trim() : null; // Get folder or null

    // --- Input Validation ---
    generateStatus.textContent = ''; // Clear previous status
    generateStatus.className = 'text-sm text-center h-5 mt-2'; // Reset style

    if (!productId || !dnaId || !deviceType) {
         generateStatus.textContent = 'Please fill out DNA ID and Device Type.';
         generateStatus.classList.add('text-red-400');
         return;
    }
    // Validate DNA ID format (16 hexadecimal characters)
    if (!/^[0-9A-F]{16}$/.test(dnaId)) {
         generateStatus.textContent = 'Invalid DNA ID format (16 hex chars, 0-9, A-F).';
         generateStatus.classList.add('text-red-400');
         return;
    }

    // --- API Call ---
    // Disable button and show submitting state
    submitFirmwareButton.disabled = true;
    submitFirmwareButton.textContent = 'Queueing...';
    generateStatus.textContent = 'Sending request...';
    generateStatus.className = 'text-sm text-center h-5 mt-2 text-yellow-400'; // Indicate processing

    console.log(`[handleFirmwareGenerateSubmit] Requesting generation for Product: ${productId}, DNA: ${dnaId}, Type: ${deviceType}, Folder: ${firmwareFolder || 'Default'}`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/generate_firmware`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                dna_id: dnaId,
                device_type: deviceType,
                firmware_folder: firmwareFolder || null // Send folder path or null
            }),
            credentials: 'include' // Send cookies if needed
        });
        const result = await response.json(); // Try to parse JSON response

        if (!response.ok) {
            // Throw error using backend message if available
            throw new Error(result.error || `Request failed with status ${response.status}`);
        }

        // --- Success ---
        console.log("[handleFirmwareGenerateSubmit] Generation queued successfully:", result);
        generateStatus.textContent = ''; // Clear modal status on success
        // Show success popup (assumes showPopupMessage and productMessagePopup are global)
        showPopupMessage(productMessagePopup, result.message || "Firmware generation queued successfully. Check DMs or status area for updates.");
        console.log("Build queued, Build ID:", result.build_id); // Log build ID if provided
        closeFirmwareGenerateModal(); // Close the modal on successful queueing

    } catch (error) {
        // --- Error ---
        console.error("[handleFirmwareGenerateSubmit] Error starting firmware generation:", error);
        // Display error message within the modal
        generateStatus.textContent = `Error: ${error.message}`;
        generateStatus.className = 'text-sm text-center h-5 mt-2 text-red-400'; // Error style
        // Show error popup (assumes showPopupMessage and errorMessagePopup are global)
        showPopupMessage(errorMessagePopup, `Generation failed: ${error.message}`, true);
        // Re-enable the button on error so the user can retry
        submitFirmwareButton.disabled = false;
        submitFirmwareButton.textContent = 'Start Generation';
    }
    // Note: 'finally' block is not needed here as the button state is handled in success/error cases.
}
