// productsAdmin.js
// Description: Contains functions related to the admin dashboard sections,
// specifically product management (loading table, add/edit modal, delete actions).

/**
 * Loads data specifically for the admin dashboard sections.
 * Currently focuses on loading the product management table.
 * Assumes `currentUser` and `loadProductManagementTable` are globally accessible.
 */
async function loadAdminDashboardData() {
    console.log("[loadAdminDashboardData] Loading admin-specific dashboard data...");
    // Double-check moderator status before proceeding
    if (!currentUser?.is_moderator) {
        console.warn("[loadAdminDashboardData] User is not a moderator. Aborting admin data load.");
        return;
    }

    // Load the product management table
    // Assumes loadProductManagementTable is defined globally (in this file)
    await loadProductManagementTable();

    // Load site config form data (handled in siteConfig.js)
    // await loadSiteConfigForm(); // This call might be better placed elsewhere or triggered separately
}

/**
 * Loads the product list into the admin product management table.
 * Fetches all products and populates the table body with rows,
 * including Edit and Delete buttons and context menu listeners.
 * Assumes `API_BASE_URL`, `productListTableBody`, `productListStatus`,
 * `currentUser`, `errorMessagePopup`, `showPopupMessage`, `openProductEditModal`,
 * `handleDeleteProduct`, `showAdminProductContextMenu` are globally accessible.
 */
async function loadProductManagementTable() {
     // Ensure required DOM elements exist
     if (!productListTableBody || !productListStatus) {
        console.error("loadProductManagementTable: productListTableBody or productListStatus element not found.");
        return;
     }
     // Clear previous table content and show loading state
     productListTableBody.innerHTML = '';
     productListStatus.textContent = 'Loading products...';
     productListStatus.classList.remove('hidden');

     try {
         const response = await fetch(`${API_BASE_URL}/api/products`);
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }
         const products = await response.json();

         // Hide loading state
         productListStatus.classList.add('hidden');

         if (!products || products.length === 0) {
             // Show message if no products are found
             productListStatus.textContent = 'No products found.';
             productListStatus.classList.remove('hidden');
             return;
         }

         // Populate table rows
         products.forEach(product => {
             const row = productListTableBody.insertRow();
             // Store product ID and name in data attributes for easy access
             row.dataset.productId = product._id;
             row.dataset.productName = product.name || 'Unnamed Product';

             // Populate table cells
             row.innerHTML = `
                 <td>${product.name || 'N/A'}</td>
                 <td>$${product.price?.toFixed(2) || 'N/A'}</td>
                 <td>${product.tag || '-'}</td>
                 <td class="actions">
                     <button class="edit-btn" data-product-id="${product._id}" title="Edit Product">Edit</button>
                     <button class="delete-btn" data-product-id="${product._id}" title="Delete Product">Delete</button>
                 </td>
             `;

             // Add event listeners to the buttons in this row
             const editBtn = row.querySelector('.edit-btn');
             const deleteBtn = row.querySelector('.delete-btn');

             if (editBtn) {
                // Pass the full product object to the modal function
                editBtn.addEventListener('click', () => openProductEditModal(product));
             }
             if (deleteBtn) {
                deleteBtn.addEventListener('click', () => handleDeleteProduct(product._id, product.name));
             }

             // Add context menu listener to the row for admin actions
             row.addEventListener('contextmenu', showAdminProductContextMenu);
         });

     } catch (error) {
         console.error("Error loading products for admin table:", error);
         productListStatus.textContent = 'Failed to load products.';
         productListStatus.classList.remove('hidden'); // Ensure error message is visible
         showPopupMessage(errorMessagePopup, `Error loading products: ${error.message}`, true);
     }
}

/**
 * Shows the context menu specifically for the admin product management table row.
 * Stores relevant product data in the global `contextMenuData` object.
 * Assumes `currentUser`, `adminProductContextMenu`, `contextMenuData`, `hideContextMenu`,
 * `positionContextMenu`, `hideContextMenuOnClickOutside` are globally accessible.
 * @param {MouseEvent} event - The contextmenu event object.
 */
 function showAdminProductContextMenu(event) {
    event.preventDefault(); // Prevent default browser context menu
    hideContextMenu(); // Hide any other currently visible context menus

    // Ensure the admin product context menu element exists and user is a moderator
    if (!currentUser?.is_moderator || !adminProductContextMenu) {
        return;
    }

    const row = event.target.closest('tr'); // Find the table row that was right-clicked
    // Ensure a valid row with product data was clicked
    if (!row || !row.dataset.productId) {
        return;
    }

    // Store product ID and name in the global context menu data object
    contextMenuData.productId = row.dataset.productId;
    contextMenuData.productName = row.dataset.productName;
    // Clear other potentially conflicting context data
    contextMenuData.ticketId = null; contextMenuData.ticketStatus = null; contextMenuData.senderId = null; contextMenuData.messageTimestamp = null; contextMenuData.orderId = null; contextMenuData.deviceType = null;

    console.log("[showAdminProductContextMenu] Data:", contextMenuData);

    // Position the admin product context menu near the event coordinates
    positionContextMenu(adminProductContextMenu, event); // Assumes positionContextMenu is global
    currentContextMenu = adminProductContextMenu; // Set this as the currently active menu

    // Add listeners to close the menu when clicking outside or scrolling
    // Use setTimeout to prevent the click event that opened the menu from immediately closing it
    setTimeout(() => {
         document.addEventListener('click', hideContextMenuOnClickOutside); // Assumes hideContextMenuOnClickOutside is global
         window.addEventListener('scroll', hideContextMenu, { once: true }); // Close on scroll
    }, 0);
}


/**
 * Opens the product add/edit modal.
 * Populates the form with existing product data if provided (for editing),
 * otherwise prepares the form for adding a new product.
 * Assumes DOM elements for the modal and form (`productEditModal`, etc.)
 * and `toggleCustomHexInput` are globally accessible.
 * @param {object | null} [product=null] - The product data object to edit, or null to add new.
 */
function openProductEditModal(product = null) {
    // Ensure required modal and form elements exist
    if (!productEditModal || !productEditForm || !customHexInputContainer || !productModalTitle ||
        !productEditIdInput || !productEditNameInput || !productEditThumbnailInput ||
        !productEditThumbnailFileInput || !productEditThumbnailFilename || !productEditPriceInput ||
        !productEditTagInput || !productEditTagColorSelect || !productEditCustomHexInput ||
        !productEditDescriptionInput || !productEditFeaturesInput || !productEditPaymentLinkInput ||
        !productEditStatus) {
        console.error("openProductEditModal: One or more required modal/form elements not found.");
        return;
    }

    // Reset the form to clear previous values
    productEditForm.reset();
    // Clear status message and reset styling
    productEditStatus.textContent = '';
    productEditStatus.className = 'text-sm text-center h-5 mt-2';
    // Reset file input display and value
    productEditThumbnailFilename.textContent = 'No file selected';
    productEditThumbnailFileInput.value = null; // Clear the actual file input

    if (product && typeof product === 'object') {
        // --- Editing Existing Product ---
        productModalTitle.textContent = 'Edit Product';
        productEditIdInput.value = product._id || ''; // Store ID (hidden input)
        productEditNameInput.value = product.name || '';
        productEditThumbnailInput.value = product.thumbnailUrl || ''; // URL input
        productEditPriceInput.value = product.price ?? ''; // Use nullish coalescing for price
        productEditTagInput.value = product.tag || '';

        // Handle tag color selection and custom hex input
        const hasValidCustomHex = product.tagColor === 'custom' && product.customBorderHex && /^#[0-9A-F]{6}$/i.test(product.customBorderHex);
        productEditTagColorSelect.value = hasValidCustomHex ? 'custom' : (product.tagColor || 'gray');
        productEditCustomHexInput.value = hasValidCustomHex ? product.customBorderHex : '';

        productEditDescriptionInput.value = product.description || '';
        // Join features array with newline characters for the textarea
        productEditFeaturesInput.value = (product.features || []).join('\n');
        productEditPaymentLinkInput.value = product.paymentLink || '';

    } else {
        // --- Adding New Product ---
        productModalTitle.textContent = 'Add Product';
        productEditIdInput.value = ''; // Ensure hidden ID field is empty
        productEditTagColorSelect.value = 'gray'; // Default tag color
        productEditCustomHexInput.value = ''; // Ensure custom hex is empty
        // Other fields are cleared by form.reset()
    }

    // Show/hide the custom hex input based on the dropdown selection
    toggleCustomHexInput(); // Assumes toggleCustomHexInput is global

    // Display the modal
    productEditModal.classList.add('active');
}

/**
 * Closes the product add/edit modal.
 * Assumes `productEditModal` is globally accessible.
 */
function closeProductEditModal() {
    if (productEditModal) {
        productEditModal.classList.remove('active');
    }
}

/**
 * Handles the submission of the product add/edit form.
 * Gathers data using FormData (to support file uploads), validates input,
 * sends data to the appropriate API endpoint (POST for add, PUT for edit),
 * handles the response, and updates the UI.
 * Assumes `API_BASE_URL`, modal/form elements, state variables (`activeSectionId`),
 * and helper functions (`showPopupMessage`, `closeProductEditModal`,
 * `loadProductManagementTable`, `fetchProducts`) are globally accessible.
 * @param {Event} event - The form submission event.
 */
async function handleSaveProduct(event) {
     event.preventDefault(); // Prevent default form submission

     // Ensure required elements exist
     if (!productEditForm || !productSaveButton || !productEditStatus || !productEditIdInput ||
         !productEditNameInput || !productEditPriceInput || !productEditTagColorSelect ||
         !productEditCustomHexInput || !productEditThumbnailFileInput || !productEditThumbnailInput) {
         console.error("handleSaveProduct: Required form elements missing.");
         return;
     }

     // Disable button and show saving state
     productSaveButton.disabled = true;
     productSaveButton.textContent = 'Saving...';
     productEditStatus.textContent = ''; // Clear previous status
     productEditStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status style

     // Determine if editing or adding
     const productId = productEditIdInput.value;
     const isEditing = !!productId;
     const url = isEditing ? `${API_BASE_URL}/api/products/${productId}` : `${API_BASE_URL}/api/products`;
     const method = isEditing ? 'PUT' : 'POST';

     // --- Validate and Prepare Tag Color/Hex ---
     let tagColorValue = productEditTagColorSelect.value;
     let customHexValue = productEditCustomHexInput.value.trim();
     let finalTagColor = 'gray'; // Default
     let finalCustomHex = null;

     if (tagColorValue === 'custom') {
         if (customHexValue && /^#[0-9A-F]{6}$/i.test(customHexValue)) {
             finalTagColor = 'custom';
             finalCustomHex = customHexValue;
         } else {
             // Invalid custom hex format - show error and stop
             productEditStatus.textContent = 'Invalid Custom HEX format. Please use #RRGGBB.';
             productEditStatus.classList.add('text-red-400');
             productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
             return;
         }
     } else {
         // Use selected predefined color name
         finalTagColor = tagColorValue || 'gray'; // Fallback to gray if somehow empty
         finalCustomHex = null; // Ensure custom hex is null when not selected
     }

     // --- Gather Data using FormData ---
     const formData = new FormData();
     formData.append('name', productEditNameInput.value.trim());
     const price = parseFloat(productEditPriceInput.value);
     if (isNaN(price)) {
         productEditStatus.textContent = 'Please enter a valid Price.';
         productEditStatus.classList.add('text-red-400');
         productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
         return;
     }
     formData.append('price', price);
     formData.append('tag', productEditTagInput.value.trim() || ''); // Send empty string if blank
     formData.append('tagColor', finalTagColor);
     formData.append('customBorderHex', finalCustomHex || ''); // Send empty string if null
     formData.append('description', productEditDescriptionInput.value.trim() || '');

     // Append features as an array (adjust based on backend expectation)
     const features = productEditFeaturesInput.value.split('\n')
         .map(f => f.trim())
         .filter(f => f); // Split, trim, remove empty lines
     // Backend might expect 'features[]' or a JSON string
     features.forEach((feature) => formData.append('features', feature)); // Simple key for each feature
     // formData.append('features', JSON.stringify(features)); // Alternative: send as JSON

     formData.append('paymentLink', productEditPaymentLinkInput.value.trim() || '');

     // Handle thumbnail: Prioritize file upload over URL input
     const thumbnailFile = productEditThumbnailFileInput.files[0];
     const thumbnailUrl = productEditThumbnailInput.value.trim();

     if (thumbnailFile) {
         console.log("Appending thumbnail file:", thumbnailFile.name);
         formData.append('thumbnailFile', thumbnailFile); // Append the file object
         formData.append('thumbnailUrl', ''); // Clear URL if file is provided
     } else {
         formData.append('thumbnailUrl', thumbnailUrl || ''); // Use URL if no file selected
     }

     // Basic Name validation (already did Price)
     if (!formData.get('name')) {
          productEditStatus.textContent = 'Product Name is required.';
          productEditStatus.classList.add('text-red-400');
          productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
          return;
     }

     console.log(`[handleSaveProduct] Sending ${method} request to ${url}`);
     // Log FormData entries (for debugging, remove in production)
     // for (let [key, value] of formData.entries()) { console.log(`${key}:`, value); }

     // --- Send Data to API ---
     try {
         const response = await fetch(url, {
             method: method,
             // DO NOT set 'Content-Type' header when using FormData;
             // the browser sets it correctly with the boundary.
             body: formData,
             credentials: 'include' // Send cookies for authentication
         });
         const result = await response.json(); // Attempt to parse JSON response
         if (!response.ok) {
             // Throw error using backend message if available
             throw new Error(result.error || `HTTP error! status: ${response.status}`);
         }

         // --- Success ---
         console.log(`[handleSaveProduct] Product ${isEditing ? 'updated' : 'added'} successfully:`, result);
         showPopupMessage(productMessagePopup, `Product ${isEditing ? 'updated' : 'added'} successfully!`);
         closeProductEditModal(); // Close the modal

         // Refresh relevant product lists
         await loadProductManagementTable(); // Refresh admin table (assumes global)
         // Refresh public product list only if the user is currently viewing it
         if (activeSectionId === pageSections['#products']) {
             await fetchProducts(); // Assumes global
         }

     } catch (error) {
         // --- Error ---
         console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
         productEditStatus.textContent = `Error: ${error.message}`;
         productEditStatus.classList.add('text-red-400');
         showPopupMessage(errorMessagePopup, `Failed to save product: ${error.message}`, true);
     } finally {
         // --- Finally ---
         // Re-enable the save button
         productSaveButton.disabled = false;
         productSaveButton.textContent = 'Save Product';
     }
}

/**
 * Handles the deletion of a product via the admin interface (button or context menu).
 * Prompts for confirmation before sending a DELETE request to the API.
 * Refreshes product lists on success.
 * Assumes `API_BASE_URL`, `showPopupMessage`, `productMessagePopup`,
 * `errorMessagePopup`, `loadProductManagementTable`, `fetchProducts`,
 * `activeSectionId`, `pageSections` are globally accessible.
 * @param {string} productId - The ID of the product to delete.
 * @param {string} productName - The name of the product (for confirmation dialog).
 */
async function handleDeleteProduct(productId, productName) {
    if (!productId) {
        console.error("handleDeleteProduct: No productId provided.");
        return;
    }

    // Confirm deletion with the user
    const confirmationMessage = `Are you sure you want to permanently delete the product "${productName || 'this product'}"? This action cannot be undone.`;
    if (!confirm(confirmationMessage)) {
        console.log("[handleDeleteProduct] Deletion cancelled by user.");
        return; // User cancelled
    }

    console.log(`[handleDeleteProduct] Attempting to delete product: ${productId}`);
    showPopupMessage(productMessagePopup, 'Deleting product...'); // Provide immediate feedback

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include' // Send cookies for authentication
        });

        // Try to parse JSON response even on error, as it might contain details
        let result = {};
        try {
            result = await response.json();
        } catch (e) {
             // Ignore JSON parsing errors if response is empty or not JSON
             console.warn("Could not parse JSON response on delete, status:", response.status);
        }

        if (!response.ok) {
            // Throw error using backend message if available
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        // --- Success ---
        console.log(`[handleDeleteProduct] Product deleted successfully: ${productId}`);
        showPopupMessage(productMessagePopup, 'Product deleted successfully!');

        // Refresh relevant product lists
        await loadProductManagementTable(); // Refresh admin table (assumes global)
        // Refresh public product list only if the user is currently viewing it
        if (activeSectionId === pageSections['#products']) {
            await fetchProducts(); // Assumes global
        }

    } catch (error) {
        // --- Error ---
        console.error("Error deleting product:", error);
        showPopupMessage(errorMessagePopup, `Failed to delete product: ${error.message}`, true);
    }
}
