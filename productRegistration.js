// productRegistration.js
// Description: Handles user-facing product registration functionality,
// including the registration modal, form submission, displaying registered
// products on the dashboard, and context menu actions for registered products.

/**
 * Displays the user's registered products in the dashboard list.
 * Creates list items with product details and context menu listeners.
 * Assumes `dashboardMyProductsList` (the container element), `currentUser`,
 * `showMyProductContextMenu`, `openFirmwareGenerateModal` are globally accessible.
 * @param {Array<object>} registeredProductDetails - Array of product details including registration info (order_id, etc.) fetched from the user object.
 */
function displayRegisteredProducts(registeredProductDetails) {
    // Assumes dashboardMyProductsList is a global reference to the container div
    if (!dashboardMyProductsList) {
        console.error("displayRegisteredProducts: dashboardMyProductsList element not found.");
        return;
    }

    dashboardMyProductsList.innerHTML = ''; // Clear previous content

    if (registeredProductDetails === null) {
        // Handle error case passed from navigateTo
        dashboardMyProductsList.innerHTML = '<p class="text-gray-400 text-sm">Could not load your product details.</p>';
        return;
    }

    if (!registeredProductDetails || registeredProductDetails.length === 0) {
        dashboardMyProductsList.innerHTML = '<p class="text-gray-400 text-sm">You have no registered products.</p>';
        return;
    }

    console.log("[displayRegisteredProducts] Displaying registered products:", registeredProductDetails);

    // Render list items for each registered product
    registeredProductDetails.forEach(product => {
        const item = document.createElement('div');
        item.className = 'my-product-item'; // Class for styling
        // Store necessary data attributes for context menu and actions
        item.dataset.productId = product.product_id || product._id; // Use product_id from registration info or _id from product details
        item.dataset.productName = product.product_name || product.name || 'Unnamed Product'; // Use name from registration or product details
        item.dataset.orderId = product.order_id || 'N/A';
        item.dataset.deviceType = product.deviceType || ''; // Store device type if available (might come from merged product data)
        item.dataset.tag = product.tag || ''; // Store tag if available (might come from merged product data)

        // Thumbnail source (needs full product details, passed in `registeredProductDetails`)
        const thumbSrc = product.thumbnailUrl || `https://placehold.co/40x40/7f8c8d/ecf0f1?text=${(product.product_name || product.name || 'P').charAt(0)}`;
        const thumbAlt = `${product.product_name || product.name || 'Product'} thumbnail`;

        // Check if firmware generation is possible (tag is FIRMWARE and deviceType is known)
        const isFirmware = (product.tag || '').trim().toUpperCase() === 'FIRMWARE';
        const canGenerate = isFirmware && item.dataset.deviceType;

        // Build inner HTML for the list item
        item.innerHTML = `
            <img src="${thumbSrc}" alt="${thumbAlt}" class="w-10 h-10 rounded object-cover flex-shrink-0" onerror="this.src='https://placehold.co/40x40/7f8c8d/ecf0f1?text=?'; this.onerror=null;">
            <div class="details flex-grow">
                <p class="product-name">${item.dataset.productName}</p>
                <p class="registration-info">Order ID: ${item.dataset.orderId}</p>
                ${product.deviceType ? `<p class="registration-info">Device: ${product.deviceType}</p>` : ''}
            </div>
            ${canGenerate ? `
            <button class="action-button generate-btn" title="Generate Firmware">
                <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Generate
            </button>` : ''}
        `;

        // Add event listener for the generate button if it exists
        const genButton = item.querySelector('.generate-btn');
        if (genButton) {
            genButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent context menu trigger
                // Call the function (assumed global) to open the firmware modal
                openFirmwareGenerateModal(item.dataset.productId, item.dataset.productName);
            });
        }

        // Add right-click listener for the context menu
        item.addEventListener('contextmenu', showMyProductContextMenu); // Assumes global

        dashboardMyProductsList.appendChild(item);
    });
}


/**
 * Opens the product registration modal.
 * Clears any previous status messages and form fields.
 * Assumes `registerProductModal`, `registrationStatus`, `registerProductForm`
 * are globally accessible DOM references.
 */
function openRegisterProductModal() {
    // Assumes registerProductModal, registrationStatus, registerProductForm are global refs
    if (registerProductModal && registrationStatus && registerProductForm) {
        registrationStatus.textContent = ''; // Clear previous status messages
        registrationStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status style
        registerProductForm.reset();      // Clear form fields
        registerProductModal.classList.add('active'); // Show the modal
    } else {
        console.error("openRegisterProductModal: Required modal elements not found.");
    }
}

/**
 * Closes the product registration modal.
 * Assumes `registerProductModal` is globally accessible.
 */
function closeRegisterProductModal() {
    if (registerProductModal) {
        registerProductModal.classList.remove('active');
    }
}

/**
 * Handles the submission of the product registration form.
 * Validates input, sends data (order ID, email) to the backend API,
 * handles the response, updates UI, and potentially refreshes user data.
 * Assumes `API_BASE_URL`, modal/form elements, `registrationStatus`,
 * `submitRegistrationButton`, `showPopupMessage`, `productMessagePopup`,
 * `errorMessagePopup`, `checkLoginStatus`, `activeSectionId`, `pageSections`,
 * `currentUser`, `displayRegisteredProducts` are globally accessible.
 * @param {Event} event - The form submission event.
 */
async function handleRegisterProductSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Ensure required elements exist
    if (!registerOrderIdInput || !registerEmailInput || !registrationStatus || !submitRegistrationButton) {
         console.error("handleRegisterProductSubmit: Registration form elements missing!");
         return;
    }

    const orderId = registerOrderIdInput.value.trim();
    const email = registerEmailInput.value.trim();

    // --- Input Validation ---
    registrationStatus.textContent = ''; // Clear previous status
    registrationStatus.className = 'text-sm text-center h-5 mt-2'; // Reset class

    if (!orderId) {
        registrationStatus.textContent = 'Please enter your Order ID.';
        registrationStatus.classList.add('text-red-400'); return;
    }
    if (!email) {
         registrationStatus.textContent = 'Please enter your Email Address.';
         registrationStatus.classList.add('text-red-400'); return;
     }
    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
         registrationStatus.textContent = 'Please enter a valid Email Address.';
         registrationStatus.classList.add('text-red-400'); return;
     }

    // --- API Call ---
    // Disable button and show submitting state
    submitRegistrationButton.disabled = true;
    submitRegistrationButton.textContent = 'Submitting...';
    console.log(`[handleRegisterProductSubmit] Registering Order ID: ${orderId}, Email: ${email}`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/register_product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, email: email }),
            credentials: 'include' // Send cookies if required for authentication
        });
        const result = await response.json(); // Always try to parse JSON

        if (!response.ok) {
            // Throw error using message from backend if available
            throw new Error(result.error || `Request failed with status ${response.status}`);
        }

        // --- Success ---
        console.log("[handleRegisterProductSubmit] Registration successful:", result);
        registrationStatus.textContent = result.message || 'Registration successful!';
        registrationStatus.classList.add('text-green-400');
        showPopupMessage(productMessagePopup, result.message || 'Product registered successfully!');

        // Refresh user data to get updated registered_product_details
        await checkLoginStatus(); // Assumes global

        // If the user is currently viewing the dashboard, re-render the product list
         if (activeSectionId === pageSections['#dashboard'] && currentUser) {
             const myRegisteredDetails = currentUser.registered_product_details || [];
             displayRegisteredProducts(myRegisteredDetails); // Assumes global
         }

        // Close the modal after a short delay
        setTimeout(closeRegisterProductModal, 1500); // Assumes global

    } catch (error) {
        // --- Error ---
        console.error('[handleRegisterProductSubmit] Registration failed:', error);
        registrationStatus.textContent = `Error: ${error.message}`;
        registrationStatus.classList.add('text-red-400');
        showPopupMessage(errorMessagePopup, `Registration failed: ${error.message}`, true);
    } finally {
        // --- Finally ---
        // Re-enable the submit button
        if(submitRegistrationButton){
             submitRegistrationButton.disabled = false;
             submitRegistrationButton.textContent = 'Submit Registration';
        }
    }
}


/**
 * Shows the context menu for the user's "My Products" list items.
 * Toggles visibility of the "Generate Firmware" option based on product tag and device type.
 * Stores relevant product data in the global `contextMenuData`.
 * Assumes `currentUser`, `myProductContextMenu`, `contextMenuData`, `hideContextMenu`,
 * `positionContextMenu`, `hideContextMenuOnClickOutside` are globally accessible.
 * @param {MouseEvent} event - The contextmenu event object.
 */
function showMyProductContextMenu(event) {
    event.preventDefault(); // Prevent default browser menu
    hideContextMenu(); // Hide any other menus

    // Ensure the menu element exists and user is logged in
    if (!currentUser?.logged_in || !myProductContextMenu) {
        return;
    }

    const productElement = event.target.closest('[data-product-id]');
    // Ensure a valid product item was clicked
    if (!productElement || !productElement.dataset.productId) {
        return;
    }

    // Store data from the clicked element into the global contextMenuData
    contextMenuData.productId = productElement.dataset.productId;
    contextMenuData.productName = productElement.dataset.productName;
    contextMenuData.orderId = productElement.dataset.orderId;
    contextMenuData.deviceType = productElement.dataset.deviceType;
    // Clear other potentially conflicting context data
    contextMenuData.ticketId = null; contextMenuData.ticketStatus = null; contextMenuData.senderId = null; contextMenuData.messageTimestamp = null;

    console.log("[showMyProductContextMenu] Data:", contextMenuData);

    // --- Toggle Generate Firmware menu item visibility ---
    const generateFwButton = document.getElementById('context-generate-firmware'); // Assumes ID exists
    if (generateFwButton) {
        const tagString = productElement.dataset.tag || '';
        const isFirmware = tagString.trim().toUpperCase() === 'FIRMWARE';
        // Show button only if tag is FIRMWARE AND deviceType is known
        generateFwButton.classList.toggle('hidden', !isFirmware || !contextMenuData.deviceType);
    } else {
        console.warn("showMyProductContextMenu: 'context-generate-firmware' button not found.");
    }
    // --- End Toggle ---

    // Position and show the menu
    positionContextMenu(myProductContextMenu, event); // Assumes global
    currentContextMenu = myProductContextMenu; // Set as active menu

    // Add listeners to close the menu
    setTimeout(() => {
        document.addEventListener('click', hideContextMenuOnClickOutside); // Assumes global
        window.addEventListener('scroll', hideContextMenu, { once: true }); // Assumes global
    }, 0);
}

/**
 * Handles the "Unregister Product" action from the context menu.
 * Confirms with the user, sends a DELETE request to the API,
 * and refreshes user data/UI on success.
 * Assumes `contextMenuData`, `showPopupMessage`, `errorMessagePopup`,
 * `productMessagePopup`, `API_BASE_URL`, `checkLoginStatus`, `activeSectionId`,
 * `pageSections`, `currentUser`, `displayRegisteredProducts`, `hideContextMenu`
 * are globally accessible.
 */
async function handleUnregisterProduct() {
    const { productId, productName } = contextMenuData; // Get data from context

    if (!productId) {
        showPopupMessage(errorMessagePopup, 'Could not identify product to unregister.', true);
        hideContextMenu();
        return;
    }

    // Confirmation dialog
    const confirmation = confirm(`Are you sure you want to unregister the product "${productName || 'this product'}" from your account?`);
    if (!confirmation) {
        hideContextMenu();
        return;
    }

    console.log(`[handleUnregisterProduct] Attempting to unregister product: ${productId}`);
    showPopupMessage(productMessagePopup, 'Unregistering product...'); // Show feedback

    try {
        const response = await fetch(`${API_BASE_URL}/api/unregister_product/${productId}`, {
            method: 'DELETE',
            credentials: 'include' // Send cookies for authentication
        });
        const result = await response.json(); // Try to parse JSON response
        if (!response.ok) {
            // Throw error using backend message if available
            throw new Error(result.error || `HTTP ${response.status}`);
        }

        // --- Success ---
        console.log("[handleUnregisterProduct] Unregistration successful:", result);
        showPopupMessage(productMessagePopup, result.message || 'Product unregistered successfully!');

        // Refresh user data to get updated registered_product_details
        await checkLoginStatus(); // Assumes global

        // If the user is currently viewing the dashboard, re-render the product list
        if (activeSectionId === pageSections['#dashboard'] && currentUser) {
             const myRegisteredDetails = currentUser.registered_product_details || [];
             displayRegisteredProducts(myRegisteredDetails); // Assumes global
         }

    } catch (error) {
        // --- Error ---
        console.error("[handleUnregisterProduct] Error unregistering product:", error);
        showPopupMessage(errorMessagePopup, `Failed to unregister: ${error.message}`, true);
    } finally {
         hideContextMenu(); // Always close the menu afterwards
    }
}

/**
 * Handles the "View Order ID" action from the context menu.
 * Displays the order ID stored in `contextMenuData` using an alert.
 * Assumes `contextMenuData` and `hideContextMenu` are globally accessible.
 */
function handleViewOrderId() {
    const { orderId, productName } = contextMenuData; // Get data from context

    if (orderId && orderId !== 'N/A') {
        alert(`Order ID for "${productName || 'this product'}":\n\n${orderId}`);
    } else {
        // Handle cases where orderId might be missing or explicitly 'N/A'
        alert(`Order ID not found or not applicable for "${productName || 'this product'}".`);
        console.warn("[handleViewOrderId] contextMenuData.orderId was missing or 'N/A'.");
    }
    hideContextMenu(); // Close the menu after showing the alert
}
