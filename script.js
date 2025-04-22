// Page Section Mapping
const pageSections = {
    '#home': 'main-content',
    '#products': 'products-page-content',
    '#tickets': 'tickets-page-content',
    '#dashboard': 'dashboard-content',
    '#ticketDetail': 'ticket-detail-content',
    '#productDetail': 'product-detail-page-content'
};

// DOM Element References
const siteTitleDisplay = document.getElementById('site-title-display');
const headerSiteIcon = document.getElementById('header-site-icon');
const faviconElement = document.getElementById('favicon');
const mainNavigation = document.getElementById('main-navigation');
const mobileMenuNav = document.getElementById('mobile-menu');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const dashboardLogoutButton = document.getElementById('dashboard-logout-button');
const userInfo = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name');
const userAvatarDisplay = document.getElementById('user-avatar');
const dashboardUserNameDisplay = document.getElementById('dashboard-user-name');
const dashboardUserAvatarDisplay = document.getElementById('dashboard-user-avatar');
const dashboardUserRolesContainer = document.getElementById('dashboard-user-roles');
const snowContainer = document.getElementById('snow-container');
const paymentMessage = document.getElementById('payment-message');
const ticketMessagePopup = document.getElementById('ticket-message');
const errorMessagePopup = document.getElementById('error-message');
const configMessagePopup = document.getElementById('config-message');
const productMessagePopup = document.getElementById('product-message');
const loadingOverlay = document.getElementById('loading-overlay');
const createTicketForm = document.getElementById('create-ticket-form');
const ticketSubjectInput = document.getElementById('ticket-subject');
const ticketMessageInput = document.getElementById('ticket-message-input');
const createTicketStatus = document.getElementById('create-ticket-status');
const userTicketView = document.getElementById('user-ticket-view');
const moderatorManagementView = document.getElementById('moderator-management-view');
const ticketListDiv = document.getElementById('ticket-list');
const ticketListStatus = document.getElementById('ticket-list-status');
const moderatorActiveTicketListDiv = document.getElementById('moderator-active-ticket-list');
const moderatorActiveListStatus = document.getElementById('moderator-active-list-status');
const moderatorArchivedTicketListDiv = document.getElementById('moderator-archived-ticket-list');
const moderatorArchivedListStatus = document.getElementById('moderator-archived-list-status');
const ticketDetailSubject = document.getElementById('ticket-detail-subject');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInputForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');
const backToTicketsButton = document.getElementById('back-to-tickets-button');
const userInfoModal = document.getElementById('user-info-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalUsername = document.getElementById('modal-username');
const modalUserId = document.getElementById('modal-user-id');
const modalUserRoles = document.getElementById('modal-user-roles');
const chatContextMenu = document.getElementById('chat-context-menu');
const contextDeleteButton = document.getElementById('context-delete-message');
const contextUserInfoButton = document.getElementById('context-user-info');
const ticketContextMenu = document.getElementById('ticket-context-menu');
const contextCloseTicketButton = document.getElementById('context-close-ticket');
const contextReopenTicketButton = document.getElementById('context-reopen-ticket');
const contextDeleteTicketButton = document.getElementById('context-delete-ticket');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const productGrid = document.getElementById('product-grid');
const productLoadingStatus = document.getElementById('product-loading-status');
const adminDashboardSections = document.getElementById('admin-dashboard-sections');
const siteConfigForm = document.getElementById('site-config-form');
const configSiteTitleInput = document.getElementById('config-site-title');
const configSiteIconUrlInput = document.getElementById('config-site-icon-url');
const configHeaderLinksContainer = document.getElementById('config-header-links-container');
const addHeaderLinkButton = document.getElementById('add-header-link-button');
const saveConfigButton = document.getElementById('save-config-button');
const configSaveStatus = document.getElementById('config-save-status');
const addProductButton = document.getElementById('add-product-button');
const productListTableBody = document.getElementById('product-list-tbody');
const productListStatus = document.getElementById('product-list-status');
const productEditModal = document.getElementById('product-edit-modal');
const productModalCloseButton = document.getElementById('product-modal-close-button');
const productModalTitle = document.getElementById('product-modal-title');
const productEditForm = document.getElementById('product-edit-form');
const productEditIdInput = document.getElementById('product-edit-id');
const productEditNameInput = document.getElementById('product-edit-name');
const productEditThumbnailInput = document.getElementById('product-edit-thumbnail');
const productEditThumbnailFileInput = document.getElementById('product-edit-thumbnail-file');
const productEditThumbnailButton = document.getElementById('product-edit-thumbnail-button');
const productEditThumbnailFilename = document.getElementById('product-edit-thumbnail-filename');
const productEditPriceInput = document.getElementById('product-edit-price');
const productEditTagInput = document.getElementById('product-edit-tag');
const productEditTagColorSelect = document.getElementById('product-edit-tagColor');
const productEditCustomHexInput = document.getElementById('product-edit-customHex');
const customHexInputContainer = document.getElementById('custom-hex-input-container');
const productEditDescriptionInput = document.getElementById('product-edit-description');
const productEditFeaturesInput = document.getElementById('product-edit-features');
const productEditPaymentLinkInput = document.getElementById('product-edit-paymentLink');
const productSaveButton = document.getElementById('product-save-button');
const productEditStatus = document.getElementById('product-edit-status');
const footerYear = document.getElementById('footer-year');
const productDetailPage = document.getElementById('product-detail-page-content');
const productDetailLoading = document.getElementById('product-detail-loading');
const productDetailContainer = document.getElementById('product-detail-container');
const productDetailImage = document.getElementById('product-detail-image');
const productDetailName = document.getElementById('product-detail-name');
const productDetailPrice = document.getElementById('product-detail-price');
const productDetailRating = document.getElementById('product-detail-rating');
const productDetailStock = document.getElementById('product-detail-stock');
const productDetailBuyNow = document.getElementById('product-detail-buy-now');
const productDetailAddBasket = document.getElementById('product-detail-add-basket');
const quantityDecrease = document.getElementById('quantity-decrease');
const quantityIncrease = document.getElementById('quantity-increase');
const quantityInput = document.getElementById('quantity-input');
const productDetailDescriptionContainer = document.getElementById('product-detail-description-container');
const productDetailDescription = document.getElementById('product-detail-description');
const sellerAvatar = document.getElementById('seller-avatar');
const sellerName = document.getElementById('seller-name');
const sellerEstablished = document.getElementById('seller-established');
const sellerReviewScore = document.getElementById('seller-review-score');
const productReviewsList = document.getElementById('product-reviews-list');

// NEW: Product Registration Elements
const registerProductButton = document.getElementById('register-product-button');
const registerProductModal = document.getElementById('register-product-modal');
const registerModalCloseButton = document.getElementById('register-modal-close-button');
const registerProductForm = document.getElementById('register-product-form');
const registrationStatus = document.getElementById('registration-status');
const registerOrderIdInput = document.getElementById('register-order-id');
const registerEmailInput = document.getElementById('register-email');
const submitRegistrationButton = document.getElementById('submit-registration-button');
// --- Context Menu Button Listeners ---
const adminDeleteProductButton = document.getElementById('context-delete-admin-product');
const adminEditProductButton = document.getElementById('context-edit-product'); // Optional Edit
const myProductUnregisterButton = document.getElementById('context-unregister-my-product');
const myProductGotoButton = document.getElementById('context-goto-product');
// --- Context Menu Button Listeners ---
// (Keep existing listeners for adminDeleteProductButton, adminEditProductButton, etc.)
const myProductViewOrderIdButton = document.getElementById('context-view-order-id'); // Get the new button
        // --- Firmware Generation Modal Functions ---

        const firmwareModal = document.getElementById('firmware-generate-modal');
const firmwareModalTitle = document.getElementById('firmware-modal-title');
const firmwareModalCloseButton = document.getElementById('firmware-modal-close-button');
const firmwareGenerateForm = document.getElementById('firmware-generate-form');
const generateProductIdInput = document.getElementById('generate-product-id');
const generateDnaIdInput = document.getElementById('generate-dna-id');
const generateDeviceTypeSelect = document.getElementById('generate-device-type');
const submitFirmwareButton = document.getElementById('submit-firmware-generation');
const generateStatus = document.getElementById('generate-status');

/** Fetches available device types and populates the select dropdown. */
async function populateDeviceTypes() {
    if (!generateDeviceTypeSelect) return;
    generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>Loading...</option>'; // Show loading
    try {
        const response = await fetch(`${API_BASE_URL}/api/firmware/device_types`);
        if (!response.ok) throw new Error('Failed to load device types');
        const deviceTypes = await response.json();

        generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>Select Device Type...</option>'; // Reset placeholder
        if (deviceTypes && deviceTypes.length > 0) {
            deviceTypes.forEach(dtype => {
                const option = document.createElement('option');
                option.value = dtype;
                option.textContent = dtype.toUpperCase(); // Display uppercase for readability
                generateDeviceTypeSelect.appendChild(option);
            });
        } else {
             generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>No types available</option>';
        }
    } catch (error) {
        console.error("Error populating device types:", error);
        generateDeviceTypeSelect.innerHTML = '<option value="" disabled selected>Error loading types</option>';
    }
}


/** Opens the firmware generation modal. */
function openFirmwareGenerateModal(productId, productName) {
    if (!firmwareModal || !productId || !productName) return;

    // Reset form and status
    firmwareGenerateForm.reset();
    generateStatus.textContent = '';
    generateStatus.className = 'text-sm text-center h-5 mt-2';
    submitFirmwareButton.disabled = false;
    submitFirmwareButton.textContent = 'Start Generation';


    // Set modal title and product ID
    firmwareModalTitle.textContent = `Generate Firmware for ${productName}`;
    generateProductIdInput.value = productId;

    // Populate device types
    populateDeviceTypes();

    // Show modal
    firmwareModal.classList.add('active');
}

/** Closes the firmware generation modal. */
function closeFirmwareGenerateModal() {
    if (firmwareModal) firmwareModal.classList.remove('active');
}

/** Handles the submission of the firmware generation modal form. */
async function handleFirmwareGenerateSubmit(event) {
    event.preventDefault();
    if (!firmwareGenerateForm || !submitFirmwareButton) return;

    const productId = generateProductIdInput.value;
    const dnaId = generateDnaIdInput.value.trim().toUpperCase();
    const deviceType = generateDeviceTypeSelect.value;
    const firmwareFolder = document.getElementById('generate-firmware-folder').value.trim(); // Get firmware folder

    // Basic validation
    if (!productId || !dnaId || !deviceType) { // Removed firmwareFolder from required check
         generateStatus.textContent = 'Please fill out DNA ID and Device Type.';
         generateStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
         return;
    }
     if (!/^[0-9A-F]{16}$/.test(dnaId)) {
         generateStatus.textContent = 'Invalid DNA ID format (16 hex chars).';
         generateStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
         return;
    }

    // Disable button, show status
    submitFirmwareButton.disabled = true;
    submitFirmwareButton.textContent = 'Queueing...';
    generateStatus.textContent = 'Sending request...';
    generateStatus.className = 'text-sm text-center h-5 mt-2 text-yellow-400';

    try {
        const response = await fetch(`${API_BASE_URL}/api/generate_firmware`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                dna_id: dnaId,
                device_type: deviceType,
                firmware_folder: firmwareFolder || null // Send folder or null if empty
            }),
            credentials: 'include'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

        // Success - backend queued the job
        generateStatus.textContent = ''; // Clear modal status
        showPopupMessage(productMessagePopup, result.message || "Generation queued. Check status area or DMs for updates.");
        console.log("Build queued, Build ID:", result.build_id);
        closeFirmwareGenerateModal(); // Close modal on successful queueing

    } catch (error) {
        console.error("Error starting firmware generation:", error);
        generateStatus.textContent = `Error: ${error.message}`;
        generateStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
        // Re-enable button on error
        submitFirmwareButton.disabled = false;
        submitFirmwareButton.textContent = 'Start Generation';
    }
}

// --- Add Modal Event Listeners ---
if (firmwareModalCloseButton) {
    firmwareModalCloseButton.addEventListener('click', closeFirmwareGenerateModal);
}
if (firmwareModal) {
    firmwareModal.addEventListener('click', (event) => {
        if (event.target === firmwareModal) closeFirmwareGenerateModal();
    });
}
if (firmwareGenerateForm) {
    firmwareGenerateForm.addEventListener('submit', handleFirmwareGenerateSubmit);
}

// ... (existing listeners) ...

if (myProductViewOrderIdButton) {
    myProductViewOrderIdButton.addEventListener('click', handleViewOrderId);
}

if (adminDeleteProductButton) {
    adminDeleteProductButton.addEventListener('click', () => {
        // Reuse existing delete function if it confirms and uses contextMenuData
        handleDeleteProduct(contextMenuData.productId, contextMenuData.productName);
        hideContextMenu();
    });
}
// Optional: Wire up Edit button
if (adminEditProductButton) {
     adminEditProductButton.addEventListener('click', () => {
         if(contextMenuData.productId) {
              // Need to fetch full product details before opening modal
              showPopupMessage(productMessagePopup, 'Fetching product details to edit...');
              fetch(`${API_BASE_URL}/api/products/${contextMenuData.productId}`)
                 .then(res => {
                     if(!res.ok) throw new Error('Product not found or error fetching.');
                     return res.json();
                 })
                 .then(productData => openProductEditModal(productData))
                 .catch(err => showPopupMessage(errorMessagePopup, `Error fetching product to edit: ${err.message}`, true));
         }
         hideContextMenu();
     });
}

if (myProductUnregisterButton) {
    myProductUnregisterButton.addEventListener('click', handleUnregisterProduct);
    // handleUnregisterProduct already hides the context menu
}
if (myProductGotoButton) {
    myProductGotoButton.addEventListener('click', () => {
         if(contextMenuData.productId) {
            window.location.hash = `#productDetail?id=${contextMenuData.productId}`;
         }
         hideContextMenu();
    });
}

// Constants and State Variables
const API_BASE_URL = 'https://api.shillette.com';
const SOCKET_URL = 'https://api.shillette.com';
let currentUser = null;
let siteConfig = null;
let socket = null;
let currentTicketId = null;
let activeSectionId = null;
let currentContextMenu = null;
// Add orderId field
let contextMenuData = {
    ticketId: null, messageTimestamp: null, senderId: null, ticketStatus: null,
    productId: null, productName: null, orderId: null, deviceType: null // Add orderId and deviceType
};
let isInitialLoginCheckComplete = false;
let isInitialConfigLoadComplete = false;

// --- Utility Functions ---

/**
 * Shows a temporary popup message at the bottom center of the screen.
 * @param {HTMLElement} element - The message container element.
 * @param {string} message - The message text to display.
 * @param {boolean} [isError=false] - If true, styles the message as an error (red).
 * @param {number} [duration=3500] - How long the message stays visible (in milliseconds).
 */
function showPopupMessage(element, message, isError = false, duration = 3500) {
     if (!element) return;
     element.textContent = message;
     element.classList.toggle('bg-red-600', isError);
     element.classList.toggle('bg-green-600', !isError);
     element.classList.add('show');
     setTimeout(() => element.classList.remove('show'), duration);
}

/**
 * Updates the header UI based on login status (login button vs user info).
 * @param {object | null} user - The current user object or null if logged out.
 */
function updateHeaderUI(user) {
     const isLoggedIn = user && user.logged_in;
     loginButton.classList.toggle('hidden', isLoggedIn);
     userInfo.classList.toggle('hidden', !isLoggedIn);
     userInfo.classList.toggle('flex', isLoggedIn);

     if (isLoggedIn) {
         userNameDisplay.textContent = user.username || 'User';
         userAvatarDisplay.src = user.user_id && user.avatar ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32` : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
         dashboardUserNameDisplay.textContent = user.username || 'User';
         dashboardUserAvatarDisplay.src = user.user_id && user.avatar ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=64` : 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?';

         const isMod = user.is_moderator === true;
         console.log(`[updateHeaderUI] Toggling admin sections. Moderator status: ${isMod} (Raw value: ${user.is_moderator})`);
         adminDashboardSections?.classList.toggle('hidden', !isMod);

     } else {
         dashboardUserNameDisplay.textContent = 'User';
         dashboardUserAvatarDisplay.src = 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?';
         adminDashboardSections?.classList.add('hidden');
     }
}

/**
 * Fetches all products from the API. Used for filtering registered products.
 * @returns {Promise<Array|null>} A promise that resolves to the array of products or null on error.
 */
 async function fetchAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const products = await response.json();
        return products;
    } catch (error) {
        console.error("Error fetching all products:", error);
        showPopupMessage(errorMessagePopup, `Error loading product list: ${error.message}`, true);
        return null; // Return null indicates failure
    }
}

/** Prompts for DNA ID and triggers the backend generation API call. */
async function promptAndStartFirmwareGeneration(productId, productName, deviceType) {
    if (!productId || !productName) {
         showPopupMessage(errorMessagePopup, "Missing product information.", true); return;
    }
    // --- Check if deviceType is known ---
    if (!deviceType) {
         showPopupMessage(errorMessagePopup, `Device type for '${productName}' is unknown. Cannot generate firmware.`, true); return;
    }

    const dnaId = prompt(`Enter the 16-character hexadecimal DNA ID for firmware generation for "${productName}":`);

    if (!dnaId) { // User cancelled
        showPopupMessage(productMessagePopup, "Firmware generation cancelled."); return;
    }

    const validatedDna = dnaId.trim().toUpperCase();
    if (!/^[0-9A-F]{16}$/.test(validatedDna)) {
        showPopupMessage(errorMessagePopup, "Invalid DNA ID format. Must be 16 hex characters (0-9, A-F).", true); return;
    }

    // Show immediate feedback
    showPopupMessage(productMessagePopup, `Queueing firmware generation for ${productName}...`);
    // Optionally add a dedicated status area for build progress

    // Call the backend API
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate_firmware`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                dna_id: validatedDna,
                device_type: deviceType // Send the device type
            }),
            credentials: 'include'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

        // Backend confirms queuing
        showPopupMessage(productMessagePopup, result.message || "Generation queued. Check status area or DMs for updates.");
         // You'll need to listen to SocketIO events for actual progress/completion
         console.log("Build queued, Build ID:", result.build_id);
         // Store build_id if you want to track specific builds client-side
    } catch (error) {
        console.error("Error starting firmware generation:", error);
        showPopupMessage(errorMessagePopup, `Error: ${error.message}`, true);
    }
}


        /**
 * Displays registered products in the user's dashboard.
 * Expects an array of product objects, where each object includes `_id`, `name`, `thumbnailUrl`, `order_id`, and potentially `deviceType` and `tag`.
 * @param {Array<object> | null} productsToDisplay - Array of product objects with registration info, or null if loading failed.
 */
function displayRegisteredProducts(productsToDisplay) {
    const container = document.getElementById('dashboard-my-products-list');
    if (!container) {
        console.error("Dashboard 'My Products' container not found.");
        return;
    }

    container.innerHTML = ''; // Clear previous content

    if (productsToDisplay === null) {
        // Error case from navigateTo
        container.innerHTML = '<p class="text-gray-400 text-sm">Could not load your product details.</p>';
        return;
    }

    if (!productsToDisplay || productsToDisplay.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">You have no registered products.</p>';
        return;
    }

    console.log("Displaying registered products:", productsToDisplay);

    // Render banners for valid products
    productsToDisplay.forEach(product => {
        const item = document.createElement('div');
        item.className = 'my-product-item'; // Use new class for specific styling
        // Store necessary data attributes for context menu
        item.dataset.productId = product._id;
        item.dataset.productName = product.name || 'Unnamed Product';
        item.dataset.orderId = product.order_id || 'N/A';
        item.dataset.deviceType = product.deviceType || ''; // Store device type if available
        item.dataset.tag = product.tag || ''; // Store tag if available

        // Basic thumbnail or placeholder
        const thumbSrc = product.thumbnailUrl || `https://placehold.co/40x40/7f8c8d/ecf0f1?text=${product.name?.charAt(0) || 'P'}`;
        const thumbAlt = `${product.name || 'Product'} thumbnail`;

        // Check if the product tag is 'FIRMWARE' (case-insensitive)
        const isFirmware = (product.tag || '').trim().toUpperCase() === 'FIRMWARE';
        const canGenerate = isFirmware && product.deviceType; // Check if firmware AND device type is known

        // Build inner HTML
        item.innerHTML = `
            <img src="${thumbSrc}" alt="${thumbAlt}" onerror="this.src='https://placehold.co/40x40/7f8c8d/ecf0f1?text=?'; this.onerror=null;">
            <div class="details">
                <p class="product-name">${product.name || 'Unnamed Product'}</p>
                <p class="registration-info">Order ID: ${product.order_id || 'N/A'}</p>
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
                openFirmwareGenerateModal(product._id, product.name);
            });
        }

        // Add right-click listener for context menu
        item.addEventListener('contextmenu', showMyProductContextMenu);

        container.appendChild(item);
    });
}




/**
 * Shows the context menu for the user's "My Products" list.
 * Reads productElement.dataset.tag (singular string).
 * @param {MouseEvent} event - The contextmenu event object.
 */
function showMyProductContextMenu(event) {
    event.preventDefault(); hideContextMenu();
    const menuElement = document.getElementById('my-product-context-menu');
    if (!currentUser?.logged_in || !menuElement) return;

    const productElement = event.target.closest('[data-product-id]');
    if (!productElement || !productElement.dataset.productId) return;

    contextMenuData.productId = productElement.dataset.productId;
    contextMenuData.productName = productElement.dataset.productName;
    contextMenuData.orderId = productElement.dataset.orderId;
    contextMenuData.deviceType = productElement.dataset.deviceType;

    // --- Check singular tag from dataset ---
    const tagString = productElement.dataset.tag || '';
    const isFirmware = tagString.trim().toUpperCase() === 'FIRMWARE';
    // --- End Check singular tag ---

    const generateFwButton = document.getElementById('context-generate-firmware');
    if (generateFwButton) {
        // Hide if not firmware OR if deviceType is missing
        generateFwButton.classList.toggle('hidden', !isFirmware || !contextMenuData.deviceType);
    }

    positionContextMenu(menuElement, event);
    currentContextMenu = menuElement;
    setTimeout(() => {
         document.addEventListener('click', hideContextMenuOnClickOutside);
         window.addEventListener('scroll', hideContextMenu, { once: true });
    }, 0);
}

// --- Context Menu Button Listeners ---
const generateFirmwareButton = document.getElementById('context-generate-firmware');

if (generateFirmwareButton) { // Assuming generateFirmwareButton = document.getElementById('context-generate-firmware');
    generateFirmwareButton.addEventListener('click', () => {
         // --- CALL NEW FUNCTION ---
         openFirmwareGenerateModal(contextMenuData.productId, contextMenuData.productName);
         // --- END CALL ---
         hideContextMenu(); // Hide menu after opening modal
    });
}


/** Handles the user request to unregister a product from their account. */
async function handleUnregisterProduct() {
    const { productId, productName } = contextMenuData; // Get data from context
    if (!productId) {
        showPopupMessage(errorMessagePopup, 'Could not identify product to unregister.', true);
        return;
    }

    // Confirmation
    if (!confirm(`Are you sure you want to unregister the product "${productName || 'this product'}" from your account?`)) {
        return;
    }

    console.log(`Attempting to unregister product: ${productId}`);
    showPopupMessage(productMessagePopup, 'Unregistering product...'); // Show feedback

    try {
        const response = await fetch(`${API_BASE_URL}/api/unregister_product/${productId}`, {
            method: 'DELETE',
            credentials: 'include' // Send cookies for authentication
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

        // Success: Show message, refresh user data (which re-renders dashboard products)
        showPopupMessage(productMessagePopup, result.message || 'Product unregistered successfully!');
        // Fetch updated user data to refresh the dashboard list automatically
        await checkLoginStatus(); // This should trigger a re-render via navigateTo if on dashboard
         // Force dashboard refresh if already on it
         if (activeSectionId === pageSections['#dashboard']) {
             // Fetch the updated user details which includes registered_product_details
             const myRegisteredDetails = currentUser?.registered_product_details || [];
             displayRegisteredProducts(myRegisteredDetails); // Directly display using the updated details
         }


    } catch (error) {
        // Error: Show error message
        console.error("Error unregistering product:", error);
        showPopupMessage(errorMessagePopup, `Failed to unregister: ${error.message}`, true);
    } finally {
         hideContextMenu(); // Always close the menu
    }
}



/**
 * Hides all page sections and shows the one with the specified element ID.
 * @param {string} sectionElementId - The ID of the page section element to show.
 */
function showSection(sectionElementId) {
    console.log(`[showSection] Attempting to show element ID: ${sectionElementId}`);
    hideContextMenu(); // Close any open context menus

    let foundSection = false;
    // Hide all sections
    Object.values(pageSections).forEach(id => {
        const sectionElement = document.getElementById(id);
        if (sectionElement) {
            sectionElement.classList.remove('active');
            sectionElement.classList.add('hidden');
        } else {
            console.warn(`[showSection] Element not found for ID: ${id}`);
        }
    });

    // Show the target section
    const targetElement = document.getElementById(sectionElementId);
    if (targetElement) {
        targetElement.classList.remove('hidden');
        targetElement.classList.add('active');
        activeSectionId = sectionElementId;
        foundSection = true;
        console.log(`[showSection] Successfully shown: ${sectionElementId}`);
        window.scrollTo(0, 0); // Scroll to top
    }

    // Fallback to home if target not found
    if (!foundSection) {
        console.warn(`[showSection] Target element ID not found: ${sectionElementId}. Defaulting to home.`);
        const homeElement = document.getElementById(pageSections['#home']);
        if (homeElement) {
            homeElement.classList.remove('hidden');
            homeElement.classList.add('active');
            activeSectionId = pageSections['#home'];
            console.log(`[showSection] Defaulted to ${activeSectionId}.`);
            window.scrollTo(0, 0);
        } else {
             activeSectionId = null;
             console.error("[showSection] Could not find home element either!");
        }
    }

    // Disconnect socket if navigating away from ticket-related pages
    const isTicketRelated = sectionElementId === pageSections['#ticketDetail'] || sectionElementId === pageSections['#tickets'];
    if (!isTicketRelated) {
         console.log(`[showSection] Navigating away from tickets/detail, disconnecting socket.`);
         disconnectSocket();
     }
    // Reset current ticket ID if not on detail page
    if (sectionElementId !== pageSections['#ticketDetail']) {
         currentTicketId = null;
    }
}
/** Displays the Order ID stored in contextMenuData using an alert. */
function handleViewOrderId() {
    const { orderId, productName } = contextMenuData; // Get data from context

    if (orderId && orderId !== 'N/A') {
        alert(`Order ID for "${productName || 'this product'}":\n\n${orderId}`);
    } else {
        alert(`Order ID not found or not applicable for "${productName || 'this product'}".`);
        console.warn("handleViewOrderId called but contextMenuData.orderId was empty or missing.");
    }
    hideContextMenu(); // Close the menu after showing the alert
}

/**
 * Handles navigation based on the URL hash.
 * @param {string} hash - The URL hash (e.g., '#dashboard', '#ticketDetail?id=123').
 */
function navigateTo(hash) {
    console.log(`[navigateTo] Received hash: ${hash}`);
    const hashParts = hash.split('?');
    const baseHash = hashParts[0] || '#home';
    const targetElementId = pageSections[baseHash] || pageSections['#home'];

    console.log(`[navigateTo] Base hash: ${baseHash}, Target element ID: ${targetElementId}`);

    // Check if initial checks are complete for protected routes
    const isProtected = ['#dashboard', '#tickets', '#ticketDetail', '#productDetail'].includes(baseHash);
    if (isProtected && (!isInitialLoginCheckComplete || !isInitialConfigLoadComplete)) {
        console.log(`[navigateTo] Initial checks not complete for protected route ${baseHash}. Deferring action.`);
        return; // Wait for checks to complete
    }

    // Check authentication for protected routes
    if (['#dashboard', '#tickets', '#ticketDetail'].includes(baseHash) && (!currentUser || !currentUser.logged_in)) {
        console.log(`[navigateTo] Access denied to protected route: ${baseHash}`);
        showPopupMessage(errorMessagePopup, "Please log in to view this page.", true);
        // Redirect to home if not already there
        if (window.location.hash !== '#home' && window.location.hash !== '/#home') {
            console.log(`[navigateTo] Redirecting to /#home`);
            window.location.hash = '/#home';
        } else {
            // If already on home, ensure the home section is visible
            console.log(`[navigateTo] Already on home, ensuring #home section is shown.`);
            if(activeSectionId !== pageSections['#home']) showSection(pageSections['#home']);
        }
        return;
    }

    // Ensure socket connection for ticket pages
    if (['#tickets', '#ticketDetail'].includes(baseHash)) {
        console.log(`[navigateTo] Ensuring socket is connected for route: ${baseHash}`);
        ensureSocketConnected();
    }

    // Handle routes with parameters (ticketDetail, productDetail)
    let idParam = null;
    if (baseHash === '#ticketDetail' || baseHash === '#productDetail') {
         const params = new URLSearchParams(hashParts[1] || '');
         idParam = params.get('id');
         console.log(`[navigateTo] ID from URL: ${idParam}`);
    }

    // Load data specific to the route
    if (baseHash === '#ticketDetail') {
        if (idParam) {
            // Only fetch if it's a new ticket ID
            if (currentTicketId !== idParam) {
                currentTicketId = idParam;
                ticketDetailSubject.textContent = `Ticket #${idParam.slice(-6)}`; // Update title immediately
                chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Connecting to chat...</p>'; // Show loading
                fetchTicketDetails(idParam); // Fetch full details
            } else {
                 console.log(`[navigateTo] Already viewing ticket ${idParam}, not re-fetching details.`);
                 // Ensure we are joined to the room even if not re-fetching
                 if (socket && socket.connected) socket.emit('join_ticket_room', { ticket_id: currentTicketId });
            }
        } else {
            // No ID provided for detail view
            console.warn("[navigateTo] Ticket ID missing for detail view. Redirecting to tickets list.");
            showPopupMessage(errorMessagePopup, "Invalid ticket link.", true);
            window.location.hash = '/#tickets';
            return;
        }
    } else if (baseHash === '#productDetail') {
         if (idParam) {
              console.log(`[navigateTo] Fetching product details for ID: ${idParam}`);
              fetchProductDetails(idParam);
         } else {
              // No ID provided for detail view
              console.warn("[navigateTo] Product ID missing for detail view. Redirecting to products list.");
              showPopupMessage(errorMessagePopup, "Invalid product link.", true);
              window.location.hash = '/#products';
              return;
         }
    }

    // Show the correct page section
    showSection(targetElementId);

    // Fetch list data if navigating to a list page
    if (baseHash === '#tickets') {
        console.log(`[navigateTo] Fetching tickets for #tickets view.`);
        fetchTickets();
    } else if (baseHash === '#products') {
         console.log(`[navigateTo] Fetching products for #products view.`);
         fetchProducts();
    // Inside navigateTo function...
    } else if (baseHash === '#dashboard' && currentUser?.logged_in) {
         console.log(`[navigateTo] Loading dashboard data. User:`, currentUser);
         displayUserRoles(currentUser.roles); // Display roles

         // --- Display Registered Products ---
         // Get detailed registration info from user object
         const myRegisteredDetails = currentUser.registered_product_details || [];
         displayRegisteredProducts(myRegisteredDetails); // Directly display products using details from user object
         // --- End Display ---

         if (currentUser.is_moderator === true) {
             console.log(`[navigateTo] User is moderator, loading admin data.`);
             loadAdminDashboardData();
         } else {
             console.log(`[navigateTo] User is NOT moderator, skipping admin data load.`);
         }
    }

    // Ensure header UI is up-to-date
    updateHeaderUI(currentUser);
}

/**
 * Parses the current URL hash and calls navigateTo.
 */
function runNavigation() {
    console.log(`[runNavigation] Processing raw hash: ${window.location.hash}`);
    const rawHash = window.location.hash;
    let pathPart = '';
    let queryPart = '';
    const queryIndex = rawHash.indexOf('?');
    const firstHashIndex = rawHash.indexOf('#');

    // Extract path and query parts correctly
    if (firstHashIndex !== -1) {
        const hashContent = queryIndex !== -1 ? rawHash.substring(firstHashIndex + 1, queryIndex) : rawHash.substring(firstHashIndex + 1);
        pathPart = hashContent;
        // Remove leading slashes or hashes
        while (pathPart.startsWith('/') || pathPart.startsWith('#')) {
            pathPart = pathPart.substring(1);
        }
        if(queryIndex !== -1) {
            queryPart = rawHash.substring(queryIndex);
        }
    }
    // Construct the clean hash, defaulting to 'home' if empty
    const hashToNavigate = `#${pathPart || 'home'}${queryPart}`;
    console.log(`[runNavigation] Cleaned hash to navigate: ${hashToNavigate}`);

    // Navigate only if initial checks are done OR if it's the home page
    if ((isInitialLoginCheckComplete && isInitialConfigLoadComplete) || pathPart === '' || pathPart === 'home') {
        navigateTo(hashToNavigate);
    } else {
        console.log(`[runNavigation] Initial checks not complete for target ${hashToNavigate}. Deferring.`);
    }
}

/**
 * Creates snowflake elements for the background animation.
 */
function createSnowflakes() {
    const numberOfSnowflakes = 75;
    if (!snowContainer) return;
    snowContainer.innerHTML = ''; // Clear existing snowflakes
    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = Math.random() * 3 + 2; // Size between 2px and 5px
        const duration = Math.random() * 10 + 5; // Duration between 5s and 15s
        const delay = Math.random() * 10; // Delay up to 10s
        const startLeft = Math.random() * 100; // Start anywhere horizontally
        const opacity = Math.random() * 0.5 + 0.5; // Opacity between 0.5 and 1.0

        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startLeft}vw`;
        snowflake.style.opacity = opacity;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `-${delay}s`; // Negative delay starts animation partway through

        snowContainer.appendChild(snowflake);
    }
}

// --- API Interaction Functions ---

/**
 * Checks the user's login status via the API.
 */
async function checkLoginStatus() {
     isInitialLoginCheckComplete = false; // Mark as not complete initially
     try {
         const response = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });
         if (!response.ok && (response.status === 401 || response.status === 403)) {
             // Not logged in or forbidden
             currentUser = { logged_in: false };
         } else if (!response.ok) {
             // Other server error
             throw new Error(`HTTP error! status: ${response.status}`);
         } else {
             // Logged in, store user data
             currentUser = await response.json();
         }
         console.log("[checkLoginStatus] User status checked:", currentUser);
         // Connect socket if logged in
         if (currentUser && currentUser.logged_in) {
             ensureSocketConnected();
         }
     } catch (error) {
         console.error("[checkLoginStatus] Error checking login status:", error);
         currentUser = { logged_in: false }; // Assume logged out on error
         showPopupMessage(errorMessagePopup, "Could not verify login status.", true);
     } finally {
         isInitialLoginCheckComplete = true; // Mark as complete
         console.log("[checkLoginStatus] Initial login check complete.");
         // Proceed to load config and navigate AFTER login check is done
         loadSiteConfigAndNavigate();
     }
}

/**
 * Loads site configuration (title, links) from the API.
 */
async function loadSiteConfigAndNavigate() {
    isInitialConfigLoadComplete = false; // Mark as not complete initially
    try {
        const response = await fetch(`${API_BASE_URL}/api/config`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        siteConfig = await response.json();
        console.log("[loadSiteConfig] Site config loaded:", siteConfig);
        applySiteConfig(siteConfig); // Apply the loaded config
    } catch (error) {
        console.error("[loadSiteConfig] Error loading site config:", error);
        showPopupMessage(errorMessagePopup, "Failed to load site configuration. Using defaults.", true);
        applySiteConfig(null); // Apply default config on error
    } finally {
        isInitialConfigLoadComplete = true; // Mark as complete
        console.log("[loadSiteConfig] Initial config load complete.");
        // Run navigation AFTER config load is done (and login check is also done)
        runNavigation();
    }
}

/**
 * Applies the site configuration to the UI (title, icon, header links).
 * @param {object | null} config - The site configuration object or null for defaults.
 */
function applySiteConfig(config) {
    // Determine title, icon, and links (use defaults if config is null/missing)
    const title = config?.siteTitle || "Shillette";
    const iconUrl = config?.siteIconUrl || "/images/icon.png";
    const links = config?.headerLinks || [
        {name: "Home", href: "/#home"},
        {name: "Products", href: "/#products"},
        {name: "Tickets", href: "/#tickets"},
        {name: "Discord", href: "https://discord.gg/shillette", target: "_blank"}
    ];

    // Apply title
    document.title = title;
    siteTitleDisplay.textContent = title;

    // Apply header icon and favicon
    if (headerSiteIcon) {
        headerSiteIcon.src = iconUrl;
        // Add error handling for the icon image itself
        headerSiteIcon.onerror = () => {
            console.warn(`Failed to load header icon: ${iconUrl}. Using default.`);
            headerSiteIcon.src = '/images/icon.png'; // Fallback to default
            headerSiteIcon.onerror = null; // Prevent infinite loop if default also fails
        };
    }
    if (faviconElement) {
         faviconElement.href = iconUrl;
    }

    // Clear existing navigation links
    mainNavigation.innerHTML = '';
    mobileMenuNav.innerHTML = '';

    // Populate header and mobile navigation links
    links.forEach(link => {
        // Create main navigation link
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.name;
        a.classList.add('text-gray-300', 'hover:text-white', 'transition', 'duration-200');
        if (link.target) a.target = link.target;
        if (link.target === '_blank') a.rel = 'noopener noreferrer'; // Security for _blank targets
        mainNavigation.appendChild(a);

        // Create mobile navigation link (clone and modify)
        const mob_a = a.cloneNode(true);
        mob_a.classList.remove('text-gray-300', 'hover:text-white'); // Remove desktop styles
        mob_a.classList.add('mobile-menu-link'); // Add mobile style
        // Add event listener to close mobile menu on click
        mob_a.addEventListener('click', () => mobileMenuNav.classList.add('hidden'));
        mobileMenuNav.appendChild(mob_a);
    });

    // Update footer year
    footerYear.textContent = new Date().getFullYear();
}

/**
 * Fetches the list of products from the API and renders them.
 */
async function fetchProducts() {
     if (!productGrid || !productLoadingStatus) return; // Ensure elements exist
     productGrid.innerHTML = ''; // Clear previous products
     productLoadingStatus.textContent = 'Loading products...'; // Show loading state
     productLoadingStatus.classList.remove('hidden');

     try {
         const response = await fetch(`${API_BASE_URL}/api/products`);
         if (!response.ok) throw new Error(`HTTP ${response.status}`);
         const products = await response.json();

         productLoadingStatus.classList.add('hidden'); // Hide loading state

         if (!products || products.length === 0) {
             // Display message if no products found
             productGrid.innerHTML = `<p class="text-center text-gray-400 md:col-span-2 lg:col-span-3">No products available at this time.</p>`;
             return;
         }

         // Render each product card
         products.forEach(renderProductCard);

     } catch (error) {
         console.error("Error fetching products:", error);
         productLoadingStatus.textContent = 'Failed to load products.'; // Show error state
         showPopupMessage(errorMessagePopup, `Error loading products: ${error.message}`, true);
     }
}

/**
 * Renders a single product card HTML element.
 * @param {object} product - The product data object.
 */
function renderProductCard(product) {
     if (!productGrid || !product) return; // Ensure grid and product data exist

     const card = document.createElement('div');
     card.className = `product-card flex flex-col`; // Base classes
     card.dataset.productId = product._id; // Store product ID for later use

     // Determine border style based on tagColor and customBorderHex
     const tagColor = product.tagColor || 'gray';
     const customHex = product.customBorderHex;
     let borderClasses = '';
     let inlineStyle = '';
     let hoverStyleVar = '';

     // Check for valid custom hex color
     if (tagColor === 'custom' && customHex && /^#[0-9A-F]{6}$/i.test(customHex)) {
         borderClasses = 'custom-border'; // Use custom border class
         inlineStyle = `border-color: ${customHex};`; // Set border color directly
         // Define CSS variable for custom hover effect shadow
         hoverStyleVar = `--custom-hover-shadow: 0 0 8px 1px ${customHex}99, 0 0 16px 4px ${customHex}66, 0 0 32px 8px ${customHex}33;`;
         card.style.cssText = inlineStyle + hoverStyleVar; // Apply inline styles
         card.classList.add(borderClasses);
     } else {
         // Use predefined gradient border class (fallback to gray if 'custom' w/ invalid hex)
         const validPredefinedColor = ['orange', 'gray', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor) ? tagColor : 'gray';
         borderClasses = `card-gradient-border ${validPredefinedColor}-border`;
         card.classList.add(...borderClasses.split(' '));
     }

     // Determine tag background and text color (fallback to gray if custom hex is invalid or predefined color is bad)
     const displayTagColor = (tagColor === 'custom' && customHex && /^#[0-9A-F]{6}$/i.test(customHex))
                             ? tagColor // Use 'custom' if valid hex exists
                             : (['orange', 'gray', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor) ? tagColor : 'gray');

     let tagBgClass = `bg-gray-500/20`; // Default Tailwind class for background
     let tagTextClass = `text-gray-300`; // Default Tailwind class for text
     let tagStyle = '';

     if (displayTagColor === 'custom' && customHex) {
         // Use custom hex for background/text (might need adjustments for contrast)
         tagBgClass = ''; // Clear Tailwind class
         tagTextClass = ''; // Clear Tailwind class
         // Simple contrast check (adjust threshold as needed)
         const r = parseInt(customHex.slice(1, 3), 16);
         const g = parseInt(customHex.slice(3, 5), 16);
         const b = parseInt(customHex.slice(5, 7), 16);
         const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
         const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF'; // Black text on light, white on dark
         tagStyle = `background-color: ${customHex}33; color: ${textColor};`; // Use 20% opacity (33 in hex)

     } else {
         // Use Tailwind classes for predefined colors
         tagBgClass = `bg-${displayTagColor}-500/20`;
         tagTextClass = `text-${displayTagColor}-300`;
     }


     // Create thumbnail image or placeholder
     let thumbnailElement = null;
     const placeholderDiv = document.createElement('div');
     placeholderDiv.className = 'product-thumbnail-placeholder';
     placeholderDiv.style.display = 'none'; // Hide initially
     placeholderDiv.innerHTML = '<span>Image not found</span>';

     if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') {
         thumbnailElement = document.createElement('img');
         thumbnailElement.src = product.thumbnailUrl;
         thumbnailElement.alt = `${product.name || 'Product'} thumbnail`;
         thumbnailElement.className = 'product-thumbnail';
         // Add error handler to show placeholder if image fails to load
         thumbnailElement.onerror = () => {
             if (thumbnailElement) thumbnailElement.style.display = 'none'; // Hide broken image
             placeholderDiv.style.display = 'flex'; // Show placeholder
         };
     } else {
         // No thumbnail URL provided, show placeholder immediately
         placeholderDiv.style.display = 'flex';
         thumbnailElement = null;
     }

     // Create the inner content div
     const innerDiv = document.createElement('div');
     innerDiv.className = 'product-card-inner'; // Inner padding and flex layout
     innerDiv.innerHTML = `
         <div class="flex justify-between items-center mb-4">
             <span class="${tagBgClass} ${tagTextClass} text-xs font-semibold px-2.5 py-0.5 rounded" style="${tagStyle}">${product.tag || 'PRODUCT'}</span>
         </div>
         <h3 class="text-xl font-semibold text-white mb-2">${product.name || 'Unnamed Product'}</h3>
         <p class="text-3xl font-bold text-white mb-4">$${product.price?.toFixed(2) || 'N/A'}</p>
         <ul class="text-sm text-gray-400 space-y-2 mb-6 flex-grow">
             ${(product.features || []).map(feature => `<li class="flex items-center"><svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> ${feature}</li>`).join('')}
             ${!(product.features && product.features.length > 0) ? '<li class="text-gray-500">No features listed.</li>' : ''}
         </ul>
         <div class="mt-auto space-y-3 pt-4 border-t border-slate-700/50">
             ${product.paymentLink ? `<button class="purchase-button" data-product-id="${product._id}" data-payment-link="${product.paymentLink}">Pay with PayPal</button>` : '<button class="purchase-button" disabled>Purchase Unavailable</button>'}
         </div>
     `;

     // Append thumbnail/placeholder and inner content to the card
     if (thumbnailElement) {
         card.appendChild(thumbnailElement);
     }
     card.appendChild(placeholderDiv);
     card.appendChild(innerDiv);

     // Add click listener to the card (navigate to detail page)
     // Ignore clicks on the purchase button itself
     card.addEventListener('click', (event) => {
         if (event.target.closest('.purchase-button')) {
             handlePurchaseClick(event); // Handle purchase separately
             return;
         }
         const productId = card.dataset.productId;
         if (productId) {
             window.location.hash = `/#productDetail?id=${productId}`; // Navigate
         }
     });

     // Append the completed card to the product grid
     productGrid.appendChild(card);
}


/**
 * Handles clicks on the purchase button within a product card.
 * @param {Event} event - The click event object.
 */
function handlePurchaseClick(event) {
    event.stopPropagation(); // Prevent card click listener from firing
    const button = event.target.closest('.purchase-button');
    if (!button) return; // Should always find the button, but safety check
    const productId = button.dataset.productId;
    const paymentLink = button.dataset.paymentLink;
    console.log(`Purchase clicked for product ID: ${productId}, Link/ID: ${paymentLink}`);
    if (paymentLink) {
         // Placeholder: In a real app, you'd integrate with PayPal SDK or redirect
         showPopupMessage(paymentMessage, `Initiating purchase for product ${productId}... (Integration needed)`);
         // Example: window.location.href = paymentLink; // If it's a direct link
         // Example: Initialize PayPal SDK payment flow here
    } else {
         showPopupMessage(errorMessagePopup, 'Payment link is missing for this product.', true);
    }
}

/**
 * Fetches details for a specific product ID and renders the detail page.
 * @param {string} productId - The ID of the product to fetch.
 */
async function fetchProductDetails(productId) {
    if (!productDetailPage || !productDetailLoading || !productDetailContainer) return;

    // Show loading state, hide content
    productDetailLoading.classList.remove('hidden');
    productDetailContainer.classList.add('hidden');
    productDetailPage.classList.remove('hidden'); // Make sure the page section is visible

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error("Product not found.");
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productData = await response.json();
        renderProductDetails(productData); // Render the fetched data

        // Hide loading, show content
        productDetailLoading.classList.add('hidden');
        productDetailContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Error fetching product details:", error);
        productDetailLoading.textContent = `Error loading product: ${error.message}`; // Show error in loading area
        showPopupMessage(errorMessagePopup, `Error loading product: ${error.message}`, true);
    }
}

/**
 * Renders the product details onto the product detail page elements.
 * @param {object} product - The detailed product data object.
 */
function renderProductDetails(product) {
    if (!product) return; // Exit if no product data

    // Basic Info
    productDetailImage.src = product.thumbnailUrl || 'https://placehold.co/600x400/374151/9ca3af?text=No+Image';
    productDetailImage.alt = product.name || 'Product Image';
    productDetailImage.onerror = () => { productDetailImage.src = 'https://placehold.co/600x400/374151/9ca3af?text=Image+Error'; productDetailImage.onerror=null; }; // Handle image load error
    productDetailName.textContent = product.name || 'Product Name';
    productDetailPrice.textContent = product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable';

    // Rating and Stock (provide defaults if missing)
    const rating = Math.max(0, Math.min(5, product.averageRating || 5)); // Clamp rating 0-5, default 5
    const stock = product.stock !== undefined && product.stock !== null ? product.stock : 6; // Default to 6 stock if missing/null
    productDetailRating.innerHTML = `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}`; // Display rounded stars
    productDetailStock.textContent = stock > 0 ? `${stock} in stock` : 'Out of stock';

    // Description (hide container if no description)
     if (product.description) {
        productDetailDescription.textContent = product.description;
        productDetailDescriptionContainer.classList.remove('hidden');
     } else {
        productDetailDescription.textContent = 'No description provided.'; // Indicate missing description
        // Optionally hide the entire section if no description
        // productDetailDescriptionContainer.classList.add('hidden');
     }

    // Seller Info (provide defaults if missing)
    sellerName.textContent = product.sellerName || 'ShilletteFN'; // Default seller name
    sellerEstablished.textContent = product.sellerEstablishedDate ? `Established ${formatTimeAgo(product.sellerEstablishedDate)}` : 'Established recently'; // Default established date
    sellerReviewScore.textContent = `The seller has an average review score of ${rating.toFixed(1)} stars out of 5`; // Show precise rating

    // Reviews List
    productReviewsList.innerHTML = ''; // Clear previous reviews
    const reviews = product.reviews || []; // Use empty array if no reviews

    if (reviews.length > 0) {
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            const reviewRating = Math.max(0, Math.min(5, review.rating || 5)); // Clamp rating 0-5, default 5
            const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'recently';
            const reviewerName = review.reviewerName || 'Verified customer'; // Default reviewer name

            reviewCard.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-green-400 font-medium">Verified purchase</span>
                    <span class="star-rating text-sm">${'★'.repeat(reviewRating)}${'☆'.repeat(5 - reviewRating)}</span>
                </div>
                <p class="text-sm text-gray-300 mb-1">${review.text || 'No comment left.'}</p>
                <p class="text-xs text-gray-500">Reviewed by ${reviewerName} on ${reviewDate}</p>
            `;
            productReviewsList.appendChild(reviewCard);
        });
    } else {
        // Display message if no reviews
        productReviewsList.innerHTML = '<p class="text-gray-400 md:col-span-2 lg:col-span-3">No reviews yet.</p>';
    }

    // TODO: Add event listeners for Buy Now, Add Basket, Quantity buttons if needed
    // Example:
    // productDetailBuyNow.onclick = () => { /* handle purchase */ };
    // quantityIncrease.onclick = () => { /* increase quantity */ };
    // quantityDecrease.onclick = () => { /* decrease quantity */ };
}

/**
 * Formats a date string into a relative time ago string (e.g., "3 months ago").
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted relative time string.
 */
function formatTimeAgo(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date; // Difference in milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

        if (diffDays < 1) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffMonths === 1) return '1 month ago';
        if (diffMonths < 12) return `${diffMonths} months ago`;
        const diffYears = Math.floor(diffMonths / 12);
        return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;

    } catch (e) {
        // Fallback if date string is invalid
        return 'a while ago';
    }
}

// --- Ticket and Chat Functions ---

/**
 * Fetches the user's tickets (or all tickets for moderators) and renders the list.
 */
async function fetchTickets() {
    console.log("[fetchTickets] Starting...");
    // Ensure all necessary elements exist
    if (!userTicketView || !moderatorManagementView || !ticketListDiv || !ticketListStatus || !moderatorActiveTicketListDiv || !moderatorActiveListStatus || !moderatorArchivedTicketListDiv || !moderatorArchivedListStatus) {
        console.error("[fetchTickets] One or more ticket list elements not found."); return;
    }
    // Check if user is logged in
    if (!currentUser || !currentUser.logged_in) {
        console.log("[fetchTickets] User not logged in.");
        // Display login prompts
        ticketListStatus.textContent = "Please log in to view tickets.";
        moderatorActiveListStatus.textContent = "Please log in to view tickets.";
        moderatorArchivedListStatus.textContent = "Please log in to view tickets.";
        // Clear lists
        ticketListDiv.innerHTML = ''; moderatorActiveTicketListDiv.innerHTML = ''; moderatorArchivedTicketListDiv.innerHTML = '';
        // Show user view (which will display the login prompt)
        userTicketView.classList.remove('hidden'); moderatorManagementView.classList.add('hidden'); return;
    }

    // Set loading states
    ticketListStatus.textContent = "Loading tickets...";
    moderatorActiveListStatus.textContent = "Loading active tickets...";
    moderatorArchivedListStatus.textContent = "Loading archived tickets...";
    // Clear previous lists
    ticketListDiv.innerHTML = ''; moderatorActiveTicketListDiv.innerHTML = ''; moderatorArchivedTicketListDiv.innerHTML = '';

    // Determine if user is a moderator and toggle views accordingly
    const isMod = currentUser.is_moderator === true;
    console.log(`[fetchTickets] Is moderator: ${isMod}`);
    userTicketView.classList.toggle('hidden', isMod);
    moderatorManagementView.classList.toggle('hidden', !isMod);

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`, { credentials: 'include' });
        if (!response.ok) {
             if (response.status === 401 || response.status === 403) throw new Error("Authentication required.");
             else throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tickets = await response.json();
        console.log(`[fetchTickets] Received ${tickets.length} tickets.`);

        // Clear loading states
        ticketListStatus.textContent = ""; moderatorActiveListStatus.textContent = ""; moderatorArchivedListStatus.textContent = "";
        let hasActive = false; let hasArchived = false; // Flags for moderator view

        if (tickets.length === 0) {
            // Display "no tickets" messages
            if (isMod) {
                moderatorActiveListStatus.textContent = "No active tickets found.";
                moderatorArchivedListStatus.textContent = "No archived tickets found.";
            } else {
                ticketListStatus.textContent = "You have no support tickets.";
            }
        } else {
            // Render each ticket
            tickets.forEach(ticket => {
                const item = document.createElement('div');
                item.classList.add('ticket-list-item');
                item.dataset.ticketId = ticket._id;
                item.dataset.ticketStatus = ticket.status;
                item.dataset.ticketSubject = ticket.subject || 'No Subject'; // Store subject for potential use

                // Determine status style and text
                const statusClass = ticket.status === 'open' ? 'status-open' : 'status-closed';
                const statusText = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'N/A';
                const dateOpened = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A';
                const shortId = ticket._id ? ticket._id.slice(-6) : 'N/A'; // Display short ID
                const subject = ticket.subject || 'No Subject';
                const username = ticket.username || 'Unknown User'; // Display username

                // Populate item HTML
                item.innerHTML = `
                    <div>
                        <p class="font-medium text-white">#${shortId}: ${subject}</p>
                        <p class="text-xs text-gray-400">User: ${username} | Opened: ${dateOpened}</p>
                    </div>
                    <span class="${statusClass}">${statusText}</span>`;

                // Add click listener to navigate to ticket detail
                item.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent default link behavior if wrapped in <a> later
                    const targetHash = `/#ticketDetail?id=${ticket._id}`;
                    console.log(`[fetchTickets] Ticket item clicked: ID=${ticket._id}. Setting hash to: ${targetHash}`);
                    window.location.hash = targetHash; // Navigate via hash change
                });
                // Add context menu listener (for right-click actions)
                item.addEventListener('contextmenu', showTicketContextMenu);

                // Append to the correct list (user or moderator active/archived)
                if (isMod) {
                    if (ticket.status === 'open') { moderatorActiveTicketListDiv.appendChild(item); hasActive = true; }
                    else { moderatorArchivedTicketListDiv.appendChild(item); hasArchived = true; }
                } else {
                    ticketListDiv.appendChild(item);
                }
            });
            // Update status text for moderator view if lists are empty after filtering
            if (isMod) {
                if (!hasActive) moderatorActiveListStatus.textContent = "No active tickets found.";
                if (!hasArchived) moderatorArchivedListStatus.textContent = "No archived tickets found.";
            }
        }
    } catch (error) {
        console.error("[fetchTickets] Error fetching tickets:", error);
        const errorMsg = `Failed to load tickets: ${error.message}`;
        // Display error in all relevant status areas
        ticketListStatus.textContent = errorMsg; moderatorActiveListStatus.textContent = errorMsg; moderatorArchivedListStatus.textContent = errorMsg;
        showPopupMessage(errorMessagePopup, `Error fetching tickets: ${error.message}`, true);
    }
}

/**
 * Fetches details (including messages) for a specific ticket ID.
 * @param {string} ticketId - The ID of the ticket to fetch.
 */
async function fetchTicketDetails(ticketId) {
    console.log(`[fetchTicketDetails] Fetching details for ticket: ${ticketId}`);
    if (!currentUser || !currentUser.logged_in) return; // Must be logged in
    ensureSocketConnected(); // Make sure socket is ready
    chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Loading messages...</p>'; // Show loading state
    if (backToTicketsButton) backToTicketsButton.href = '/#tickets'; // Ensure back button works

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, { credentials: 'include' });
        if (!response.ok) {
            // Handle specific errors
            if (response.status === 401 || response.status === 403) throw new Error("Forbidden or Not Authenticated.");
            if (response.status === 404) throw new Error("Ticket not found.");
            // Generic error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const ticket = await response.json();
        console.log(`[fetchTicketDetails] Received details for ticket: ${ticketId}`);

        // Update ticket subject title
        ticketDetailSubject.textContent = ticket.subject || `Ticket #${ticketId.slice(-6)}`;
        chatMessagesDiv.innerHTML = ''; // Clear loading message

        // Render messages
        if (ticket.messages && ticket.messages.length > 0) {
            ticket.messages.forEach(appendChatMessage);
        } else {
            // Show message if no messages exist
            chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No messages in this ticket yet.</p>';
        }

        // Join the socket room for this ticket to receive real-time updates
        if (socket && socket.connected) {
            console.log(`[fetchTicketDetails] Emitting join_ticket_room for: ${ticketId}`);
            socket.emit('join_ticket_room', { ticket_id: ticketId });
        } else {
            console.warn("[fetchTicketDetails] Socket not connected when trying to join room.");
        }

    } catch (error) {
        console.error("[fetchTicketDetails] Error fetching ticket details:", error);
        // Display error in chat area
        chatMessagesDiv.innerHTML = `<p class="text-red-400 text-center py-4">Error loading messages: ${error.message}</p>`;
        showPopupMessage(errorMessagePopup, `Error loading ticket: ${error.message}`, true);
        // Redirect back to list if ticket not found or forbidden
        if (error.message.includes("not found") || error.message.includes("Forbidden")) {
            window.location.hash = '/#tickets';
        }
    }
}

/**
 * Appends a chat message element to the chat messages container.
 * @param {object} data - The message data object.
 */
function appendChatMessage(data) {
    if (!chatMessagesDiv) return; // Ensure container exists
    // Remove placeholder message if present
    const placeholderMsg = chatMessagesDiv.querySelector('p.text-gray-500, p.text-red-400');
    if (placeholderMsg) placeholderMsg.remove();

    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    // Store data attributes for context menu actions
    messageElement.dataset.timestamp = data.timestamp;
    messageElement.dataset.senderId = data.sender_id;

    // Format timestamp and sanitize user/text input
    const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const username = data.sender_username || data.username || 'System'; // Use sender_username if available
    const safeUsername = username.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic sanitization
    const safeText = (data.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic sanitization

    // Create username span (clickable for user info)
    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('username');
    usernameSpan.textContent = `${safeUsername}:`;
    usernameSpan.addEventListener('click', () => showUserInfoModal(data.sender_id, safeUsername));

    messageElement.appendChild(usernameSpan); // Add username
    messageElement.append(` ${safeText} `); // Add message text

    // Create timestamp span
    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp');
    timestampSpan.textContent = timestamp;
    messageElement.appendChild(timestampSpan); // Add timestamp

    // Add context menu listener for moderators
    if (currentUser && currentUser.is_moderator) {
       messageElement.addEventListener('contextmenu', showChatContextMenu);
    }

    chatMessagesDiv.appendChild(messageElement); // Add message to container
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll to bottom
}

// --- WebSocket (Socket.IO) Functions ---

/**
 * Establishes a Socket.IO connection.
 * @param {string | null} [ticketIdToJoin=null] - Optional ticket ID to join immediately after connecting.
 */
function connectSocket(ticketIdToJoin = null) {
    // If already connected, potentially rejoin room if needed
    if (socket && socket.connected) {
        if (ticketIdToJoin && currentTicketId === ticketIdToJoin) {
            console.log(`[connectSocket] Socket already connected, re-joining room: ${ticketIdToJoin}`);
            socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
        } else {
            console.log(`[connectSocket] Socket already connected, not joining room ${ticketIdToJoin || 'N/A'}.`);
        }
        return;
    }

    console.log(`[connectSocket] Attempting to connect WebSocket... (Potential room join: ${ticketIdToJoin || 'none'})`);
    // Disconnect previous socket if exists
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    // Create new connection
    socket = io(SOCKET_URL, { reconnectionAttempts: 3, withCredentials: true });

    // --- Socket Event Listeners ---
    socket.on('connect', () => {
        console.log('[connectSocket] WebSocket connected:', socket.id);
        // Join room if specified and still relevant
        if (ticketIdToJoin && currentTicketId === ticketIdToJoin) {
            console.log(`[connectSocket] Joining room post-connect: ${ticketIdToJoin}`);
            socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
        }
        // Setup standard listeners after connection
        setupSocketListeners();
    });

    socket.on('disconnect', (reason) => { console.log('[connectSocket] WebSocket disconnected:', reason); socket = null; }); // Clear socket variable on disconnect
    socket.on('connect_error', (error) => { console.error('[connectSocket] WebSocket connection error:', error); showPopupMessage(errorMessagePopup, "Chat connection failed.", true); socket = null; }); // Clear on error
}

/**
 * Ensures the socket is connected, attempting connection if not.
 */
function ensureSocketConnected() {
     if (!socket || !socket.connected) {
         console.log("[ensureSocketConnected] Socket not connected, attempting connection...");
         connectSocket(currentTicketId); // Pass current ticket ID if relevant
     } else {
         console.log("[ensureSocketConnected] Socket already connected.");
         // Ensure joined to the correct room if already connected and on detail page
         if (currentTicketId && activeSectionId === pageSections['#ticketDetail']) {
             socket.emit('join_ticket_room', { ticket_id: currentTicketId });
         }
     }
}

/**
 * Sets up the main Socket.IO event listeners. Should be called after connection.
 */
function setupSocketListeners() {
     if (!socket) return;
     console.log("[setupSocketListeners] Setting up listeners.");
     // Remove previous listeners to prevent duplicates
     socket.off('new_message'); socket.off('room_joined'); socket.off('error_message');
     socket.off('message_deleted'); socket.off('ticket_status_updated');
     socket.off('ticket_list_updated'); socket.off('action_success');
     socket.off('firmware_progress'); // Ensure firmware listener is also cleared

     // Handle new messages
     socket.on('new_message', (data) => {
         console.log("[Socket Listener] Received new_message:", data);
         // Add sender ID if missing and message is from current user (for context menu)
         if (!data.sender_id && data.username === currentUser?.username) data.sender_id = currentUser.user_id;
         // Only append if viewing the correct ticket
         if (data.ticket_id === currentTicketId) appendChatMessage(data);
     });
     // Log room joins (optional)
     socket.on('room_joined', (data) => { console.log('[Socket Listener] Joined room:', data.room); });
     // Handle server-side errors
     socket.on('error_message', (data) => { console.error('[Socket Listener] WebSocket server error:', data.message); showPopupMessage(errorMessagePopup, data.message || 'Chat error.', true); });
     // Handle message deletions
     socket.on('message_deleted', (data) => {
         console.log("[Socket Listener] Received message_deleted:", data);
         if (data.ticket_id === currentTicketId) {
             // Find and remove the message element by timestamp
             const messageToRemove = chatMessagesDiv.querySelector(`.chat-message[data-timestamp="${data.timestamp}"]`);
             if (messageToRemove) { messageToRemove.remove(); console.log(`[Socket Listener] Removed message with timestamp: ${data.timestamp}`); }
             else { console.warn(`[Socket Listener] Could not find message to delete with timestamp: ${data.timestamp}`); }
         }
     });
     // Handle ticket status updates
     socket.on('ticket_status_updated', (data) => {
          console.log("[Socket Listener] Received ticket_status_updated:", data);
          // If on the tickets list page, refresh the list
          if (activeSectionId === pageSections['#tickets']) { console.log(`[Socket Listener] Ticket ${data.ticket_id} status updated to ${data.status}. Refreshing list.`); fetchTickets(); }
          // If viewing the updated ticket, show a popup
          if (data.ticket_id === currentTicketId) { showPopupMessage(ticketMessagePopup, `Ticket status updated to ${data.status}.`); }
          // Update status in data attribute if the item exists in the DOM (for context menu logic)
          const ticketItem = document.querySelector(`.ticket-list-item[data-ticket-id="${data.ticket_id}"]`);
          if(ticketItem) ticketItem.dataset.ticketStatus = data.status;
     });
     // Handle ticket list updates (e.g., after deletion/creation)
      socket.on('ticket_list_updated', () => {
          console.log("[Socket Listener] Received ticket_list_updated (likely due to deletion/creation).");
          // If on the tickets list page, refresh it
          if (activeSectionId === pageSections['#tickets']) { console.log("[Socket Listener] Refreshing ticket list."); fetchTickets(); }
          // If viewing a ticket that might have been deleted, redirect to the list
          if (currentTicketId && activeSectionId === pageSections['#ticketDetail']) {
              console.log(`[Socket Listener] Ticket list updated while viewing ticket ${currentTicketId}. Redirecting to list.`);
              showPopupMessage(errorMessagePopup, "The ticket list was updated. Returning to list.", true);
              window.location.hash = '/#tickets';
          }
      });
     // Handle generic success messages from the server
     socket.on('action_success', (data) => { console.log("[Socket Listener] Received action_success:", data); showPopupMessage(paymentMessage, data.message || 'Action successful.'); });
     // --- ADD Listener for Firmware Progress ---
     socket.on('firmware_progress', (data) => {
         console.log("Firmware Progress Update:", data);
         // Display the update (e.g., in a dedicated status div or using popups)
         const message = data.message || 'Processing...';
         const step = data.step || 'unknown';

         // Simple example using the product message popup
         let messageType = 'info'; // Use 'info' for general progress
         let isError = false;
          if (step === 'complete') {
              messageType = 'success';
          } else if (step === 'failed' || step === 'cancelled') {
              messageType = 'error';
              isError = true;
          }

          // Use a specific popup or update a status div
          // Using existing popup for simplicity:
          showPopupMessage(
              isError ? errorMessagePopup : productMessagePopup,
              `[${step.toUpperCase()}] ${message}`,
              isError,
              step === 'complete' || step === 'failed' ? 6000 : 4000 // Longer duration for final status
          );

         // More advanced: update a specific div for the build log
         // const buildLogArea = document.getElementById('build-log-area');
         // if (buildLogArea && data.log) {
         //    buildLogArea.textContent = data.log.join('\n');
         // }
     });
     // --- END ADD ---
}

/**
 * Disconnects the Socket.IO connection.
 */
function disconnectSocket() { if (socket) { console.log('[disconnectSocket] Disconnecting WebSocket...'); socket.disconnect(); socket = null; } }

// --- User Interface Functions (Modals, Context Menus, Roles) ---

/**
 * Displays user roles in the specified container (e.g., dashboard, modal).
 * @param {Array} roles - An array of role objects (expecting {id, name, color}).
 * @param {HTMLElement} container - The container element to append roles to.
 */
function displayUserRolesInContainer(roles, container) {
    if (!container) {
        console.error('[displayUserRolesInContainer] Container not provided!');
        return;
    }
    container.innerHTML = ''; // Clear previous roles

    if (roles && Array.isArray(roles) && roles.length > 0) {
        roles.forEach(role => {
            const roleElement = document.createElement('span');
            roleElement.classList.add('role-span'); // Base styling class

            // Determine color and text contrast
            let hexColor = '#9CA3AF'; // Default gray
            if (role.color && role.color !== 0) {
                // Convert decimal color to hex
                hexColor = '#' + role.color.toString(16).padStart(6, '0');
            }
            // Calculate luminance to decide text color (black or white)
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const textColorClass = luminance > 0.5 ? 'text-black' : 'text-white'; // Use black text on light backgrounds

            roleElement.textContent = role.name || `Role ${role.id}`; // Display role name or ID
            roleElement.style.backgroundColor = hexColor; // Set background color
            roleElement.classList.add(textColorClass); // Add text color class
            container.appendChild(roleElement); // Append to container
        });
    } else {
        // Display message if no roles found
        console.log('[displayUserRolesInContainer] No roles found or roles data is invalid.');
        container.innerHTML = '<p class="text-gray-500 text-xs w-full">No roles found.</p>';
    }
}

/**
 * Displays user roles specifically in the dashboard container.
 * @param {Array} roles - Array of role objects.
 */
function displayUserRoles(roles) {
    console.log('[displayUserRoles] Received roles for dashboard:', roles);
    displayUserRolesInContainer(roles, dashboardUserRolesContainer);
}


/**
 * Shows the user info modal with details for a given user ID.
 * @param {string} senderId - The Discord User ID.
 * @param {string} username - The Discord Username.
 */
function showUserInfoModal(senderId, username) {
     if (!userInfoModal || !senderId) return; // Ensure modal and ID exist
     // Populate basic info
     modalUsername.textContent = username || 'Unknown User';
     modalUserId.textContent = senderId;
     modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Loading roles...</p>'; // Show loading state for roles

     // If the modal is for the currently logged-in user, display their roles directly
     if (currentUser && currentUser.user_id === senderId && currentUser.roles) {
         displayUserRolesInContainer(currentUser.roles, modalUserRoles);
     } else {
         // TODO: Optionally fetch roles for other users via API if needed/allowed
         // For now, assume roles only available for current user
         modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Role information only shown for current user.</p>';
     }
     // Show the modal
     userInfoModal.classList.add('active');
}
/** Hides the user info modal. */
function hideUserInfoModal() { if (userInfoModal) userInfoModal.classList.remove('active'); }

/**
 * Positions a context menu element near the event target.
 * @param {HTMLElement} menuElement - The context menu element.
 * @param {MouseEvent} event - The contextmenu event object.
 */
function positionContextMenu(menuElement, event) {
     const rect = event.target.getBoundingClientRect(); // Get target element position
     // Initial position below and to the right of the cursor
     let top = event.clientY + window.scrollY + 5;
     let left = event.clientX + window.scrollX + 5;

     // Get menu dimensions (use offsetHeight/Width for actual rendered size)
     const menuHeight = menuElement.offsetHeight || 150; // Default height if not rendered yet
     const menuWidth = menuElement.offsetWidth || 150; // Default width

     // Get window dimensions
     const windowHeight = window.innerHeight + window.scrollY;
     const windowWidth = window.innerWidth + window.scrollX;

     // Adjust position if menu goes off-screen
     if (top + menuHeight > windowHeight) { // Off bottom
         top = event.clientY + window.scrollY - menuHeight - 5; // Move above cursor
     }
     if (left + menuWidth > windowWidth) { // Off right
         left = event.clientX + window.scrollX - menuWidth - 5; // Move left of cursor
     }
     // Ensure menu doesn't go off the top or left edge
     if (top < window.scrollY) top = window.scrollY;
     if (left < window.scrollX) left = window.scrollX;

     // Apply calculated position and make visible
     menuElement.style.top = `${top}px`;
     menuElement.style.left = `${left}px`;
     menuElement.style.display = 'block';
}

/** Hides any active context menu. */
function hideContextMenu() {
    if (chatContextMenu) chatContextMenu.style.display = 'none';
    if (ticketContextMenu) ticketContextMenu.style.display = 'none';
    const adminProdMenu = document.getElementById('admin-product-context-menu');
    const myProdMenu = document.getElementById('my-product-context-menu');
    if (adminProdMenu) adminProdMenu.style.display = 'none';
    if (myProdMenu) myProdMenu.style.display = 'none';

    document.removeEventListener('click', hideContextMenuOnClickOutside);
    window.removeEventListener('scroll', hideContextMenu);
    currentContextMenu = null;
}

/** Closes the context menu if a click occurs outside of it. */
function hideContextMenuOnClickOutside(event) {
    if (currentContextMenu && !currentContextMenu.contains(event.target)) {
        hideContextMenu();
    }
}

/**
 * Shows the chat context menu (Delete Message, User Info).
 * @param {MouseEvent} event - The contextmenu event object.
 */
function showChatContextMenu(event) {
    event.preventDefault(); hideContextMenu(); // Prevent default browser menu, hide previous
    // Only show for moderators
    if (!currentUser || !currentUser.is_moderator || !chatContextMenu) return;
    const messageElement = event.target.closest('.chat-message'); if (!messageElement) return; // Ensure clicked on a message

    // Store relevant data from the message element
    contextMenuData.ticketId = currentTicketId;
    contextMenuData.messageTimestamp = messageElement.dataset.timestamp;
    contextMenuData.senderId = messageElement.dataset.senderId;
    contextMenuData.ticketStatus = null; // Not relevant for chat menu
    contextMenuData.productId = null; contextMenuData.productName = null; contextMenuData.orderId = null; contextMenuData.deviceType = null; // Clear product data

    // Position and show the menu
    positionContextMenu(chatContextMenu, event);
    currentContextMenu = chatContextMenu; // Set as active menu

    // Add listeners to close the menu on next click or scroll (use timeout to avoid immediate closing)
    setTimeout(() => {
         document.addEventListener('click', hideContextMenuOnClickOutside);
         window.addEventListener('scroll', hideContextMenu, { once: true }); // Remove scroll listener after first scroll
    }, 0);
}

/**
 * Shows the ticket context menu (Close, Reopen, Delete).
 * @param {MouseEvent} event - The contextmenu event object.
 */
function showTicketContextMenu(event) {
     event.preventDefault(); hideContextMenu(); // Prevent default, hide previous
     if (!currentUser || !ticketContextMenu) return; // Must be logged in
     const ticketElement = event.target.closest('.ticket-list-item'); if (!ticketElement) return; // Ensure clicked on a ticket item

     // Store relevant data from the ticket element
     contextMenuData.ticketId = ticketElement.dataset.ticketId;
     contextMenuData.ticketStatus = ticketElement.dataset.ticketStatus;
     contextMenuData.senderId = null; // Not relevant
     contextMenuData.messageTimestamp = null; // Not relevant
     contextMenuData.productId = null; contextMenuData.productName = null; contextMenuData.orderId = null; contextMenuData.deviceType = null; // Clear product data
     console.log("[showTicketContextMenu] Data:", contextMenuData);

     // Determine which actions are available based on status and user role
     const isMod = currentUser.is_moderator === true;
     const canClose = contextMenuData.ticketStatus === 'open'; // Anyone can close (if it's their ticket, handled server-side)
     const canReopen = contextMenuData.ticketStatus === 'closed' && isMod; // Only mods can reopen
     const canDelete = isMod; // Only mods can delete

     // Show/hide menu items based on availability
     contextCloseTicketButton.classList.toggle('hidden', !canClose);
     contextReopenTicketButton.classList.toggle('hidden', !canReopen);
     contextDeleteTicketButton.classList.toggle('hidden', !canDelete);

     // Only show the menu if at least one action is available
     if (canClose || canReopen || canDelete) {
         positionContextMenu(ticketContextMenu, event);
         currentContextMenu = ticketContextMenu; // Set as active
         // Add listeners to close
         setTimeout(() => {
              document.addEventListener('click', hideContextMenuOnClickOutside);
              window.addEventListener('scroll', hideContextMenu, { once: true });
         }, 0);
     }
}

// --- Context Menu Action Functions ---

/** Emits a socket event to delete a chat message. */
function deleteChatMessage() {
     if (!contextMenuData.ticketId || !contextMenuData.messageTimestamp || !socket || !socket.connected) {
         showPopupMessage(errorMessagePopup, 'Cannot delete message: Invalid state or not connected.', true); return;
     }
     console.log(`[deleteChatMessage] Attempting to delete message: T:${contextMenuData.ticketId} TS:${contextMenuData.messageTimestamp}`);
     socket.emit('delete_message', { ticket_id: contextMenuData.ticketId, message_timestamp: contextMenuData.messageTimestamp });
     hideContextMenu(); // Close menu after action
 }

 /** Emits a socket event to close a ticket. */
 function closeTicket() {
     if (!contextMenuData.ticketId || !socket || !socket.connected) {
         showPopupMessage(errorMessagePopup, 'Cannot close ticket: Invalid state or not connected.', true); return;
     }
     console.log(`[closeTicket] Attempting to close ticket: ${contextMenuData.ticketId}`);
     socket.emit('update_ticket_status', { ticket_id: contextMenuData.ticketId, new_status: 'closed' });
     hideContextMenu();
 }

 /** Emits a socket event to reopen a ticket (moderator only). */
 function reopenTicket() {
     if (!contextMenuData.ticketId || !socket || !socket.connected) {
         showPopupMessage(errorMessagePopup, 'Cannot reopen ticket: Invalid state or not connected.', true); return;
     }
     // Permission check (client-side for immediate feedback, server enforces)
     if (!currentUser?.is_moderator) {
         showPopupMessage(errorMessagePopup, 'You do not have permission to reopen tickets.', true); hideContextMenu(); return;
     }
     console.log(`[reopenTicket] Attempting to reopen ticket: ${contextMenuData.ticketId}`);
     socket.emit('update_ticket_status', { ticket_id: contextMenuData.ticketId, new_status: 'open' });
     hideContextMenu();
 }

 /** Emits a socket event to delete a ticket (moderator only). */
 function deleteTicket() {
     if (!contextMenuData.ticketId || !socket || !socket.connected) {
         showPopupMessage(errorMessagePopup, 'Cannot delete ticket: Invalid state or not connected.', true); return;
     }
     // Permission check
     if (!currentUser?.is_moderator) {
         showPopupMessage(errorMessagePopup, 'You do not have permission to delete tickets.', true); hideContextMenu(); return;
     }
     // Confirmation dialog
     if (confirm(`Are you sure you want to permanently delete ticket #${contextMenuData.ticketId.slice(-6)}? This action cannot be undone.`)) {
         console.log(`[deleteTicket] Attempting to delete ticket: ${contextMenuData.ticketId}`);
         socket.emit('delete_ticket', { ticket_id: contextMenuData.ticketId });
     }
     hideContextMenu();
 }

// --- Admin Dashboard Functions ---

/** Loads data for the admin sections (config form, product table). */
async function loadAdminDashboardData() {
    console.log("Loading admin dashboard data...");
    if (!currentUser?.is_moderator) return; // Only proceed if moderator
    await loadSiteConfigForm(); // Load config into form
    await loadProductManagementTable(); // Load products into table
}

/** Populates the site configuration form with current values. */
async function loadSiteConfigForm() {
    if (!siteConfigForm || !configSiteTitleInput || !configHeaderLinksContainer || !configSaveStatus || !configSiteIconUrlInput) return;
    // Ensure config is loaded before populating
    if (!siteConfig) {
        console.warn("Site config not loaded yet for admin form. Attempting fetch.");
        configSaveStatus.textContent = "Error: Config not loaded.";
        configSaveStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
        // Optionally try loading it again here if needed
        // await loadSiteConfigAndNavigate(); // Be careful of infinite loops
        return;
    }
    // Populate form fields
    configSiteTitleInput.value = siteConfig.siteTitle || '';
    configSiteIconUrlInput.value = siteConfig.siteIconUrl || '';
    configHeaderLinksContainer.innerHTML = ''; // Clear existing link inputs
    // Add inputs for each existing header link
    (siteConfig.headerLinks || []).forEach((link) => {
        addHeaderLinkInput(link.name, link.href, link.target);
    });
    // Clear status message
    configSaveStatus.textContent = '';
    configSaveStatus.className = 'text-sm text-center h-5 mt-2';
}

/**
 * Adds a set of input fields for a header link to the config form.
 * @param {string} [name=''] - Initial value for the link name.
 * @param {string} [href=''] - Initial value for the link href.
 * @param {string} [target=''] - Initial value for the link target (_blank, etc.).
 */
function addHeaderLinkInput(name = '', href = '', target = '') {
     const linkGroup = document.createElement('div');
     linkGroup.className = 'link-group'; // Class for styling the group
     linkGroup.innerHTML = `
         <input type="text" placeholder="Link Name" value="${name}" class="link-name flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
         <input type="text" placeholder="Link Href" value="${href}" class="link-href flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
         <input type="text" placeholder="Target (e.g., _blank)" value="${target || ''}" class="link-target flex-none w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400">
         <button type="button" class="remove-link-button bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex-shrink-0" title="Remove Link">X</button>
     `;
     // Add event listener to the remove button for this specific group
     linkGroup.querySelector('.remove-link-button').addEventListener('click', () => linkGroup.remove());
     configHeaderLinksContainer.appendChild(linkGroup); // Add the group to the container
}

/** Handles the submission of the site configuration form. */
async function handleSaveSiteConfig(event) {
    event.preventDefault(); // Prevent default form submission
    if (!siteConfigForm || !saveConfigButton) return;
    // Disable button, show saving state
    saveConfigButton.disabled = true; saveConfigButton.textContent = 'Saving...';
    configSaveStatus.textContent = ''; configSaveStatus.className = 'text-sm text-center h-5 mt-2'; // Clear status

    // Gather updated config data from the form
    const updatedConfig = {
         siteTitle: configSiteTitleInput.value.trim(),
         siteIconUrl: configSiteIconUrlInput.value.trim() || null, // Get icon URL, null if empty
         headerLinks: []
     };
    // Collect header links from the input groups
    configHeaderLinksContainer.querySelectorAll('.link-group').forEach(group => {
        const nameInput = group.querySelector('.link-name');
        const hrefInput = group.querySelector('.link-href');
        const targetInput = group.querySelector('.link-target');
        // Only add link if name and href are provided
        if (nameInput.value.trim() && hrefInput.value.trim()) {
            updatedConfig.headerLinks.push({
                name: nameInput.value.trim(),
                href: hrefInput.value.trim(),
                target: targetInput.value.trim() || null // null if empty
            });
        }
    });

    // Send updated config to the API
    try {
        const response = await fetch(`${API_BASE_URL}/api/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedConfig),
            credentials: 'include' // Send cookies for authentication
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`); // Throw error if request failed

        // Success: Update local config, re-apply to UI, show success message
        siteConfig = result; // Update local cache
        applySiteConfig(siteConfig); // Update UI immediately
        configSaveStatus.textContent = 'Configuration saved successfully!';
        configSaveStatus.classList.add('text-green-400');
        showPopupMessage(configMessagePopup, 'Configuration saved!');
    } catch (error) {
        // Error: Show error message
        console.error("Error saving site config:", error);
        configSaveStatus.textContent = `Error: ${error.message}`;
        configSaveStatus.classList.add('text-red-400');
        showPopupMessage(errorMessagePopup, `Failed to save config: ${error.message}`, true);
    } finally {
        // Re-enable button regardless of success/failure
        saveConfigButton.disabled = false; saveConfigButton.textContent = 'Save Configuration';
    }
}

/** Loads the product list into the admin management table. */
async function loadProductManagementTable() {
     if (!productListTableBody || !productListStatus) return;
     productListTableBody.innerHTML = ''; productListStatus.textContent = 'Loading products...';
     productListStatus.classList.remove('hidden');

     try {
         const response = await fetch(`${API_BASE_URL}/api/products`);
         if (!response.ok) throw new Error(`HTTP ${response.status}`);
         const products = await response.json();
         productListStatus.classList.add('hidden');

         if (!products || products.length === 0) {
             productListStatus.textContent = 'No products found.';
             productListStatus.classList.remove('hidden');
             return;
         }

         products.forEach(product => {
             const row = productListTableBody.insertRow();
             // --- ADD data attributes ---
             row.dataset.productId = product._id;
             row.dataset.productName = product.name || 'Unnamed Product';
             // --- END ADD ---
             row.innerHTML = `
                 <td>${product.name || 'N/A'}</td>
                 <td>$${product.price?.toFixed(2) || 'N/A'}</td>
                 <td>${product.tag || '-'}</td>
                 <td class="actions">
                     <button class="edit-btn" data-product-id="${product._id}">Edit</button>
                     <button class="delete-btn" data-product-id="${product._id}">Delete</button>
                 </td>
             `;
             row.querySelector('.edit-btn').addEventListener('click', () => openProductEditModal(product));
             row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteProduct(product._id, product.name));

             // --- ADD Context Menu Listener ---
             row.addEventListener('contextmenu', showAdminProductContextMenu);
             // --- END ADD ---
         });
     } catch (error) {
         console.error("Error loading products for admin table:", error);
         productListStatus.textContent = 'Failed to load products.';
         productListStatus.classList.remove('hidden');
         showPopupMessage(errorMessagePopup, `Error loading products: ${error.message}`, true);
     }
}

/**
 * Shows the context menu for the admin product management table.
 * @param {MouseEvent} event - The contextmenu event object.
 */
 function showAdminProductContextMenu(event) {
    event.preventDefault(); hideContextMenu();
    const menuElement = document.getElementById('admin-product-context-menu');
    if (!currentUser?.is_moderator || !menuElement) return; // Only mods can use this

    const row = event.target.closest('tr'); // Find the table row
    if (!row || !row.dataset.productId) return; // Ensure we clicked a valid row

    // Store product data
    contextMenuData.productId = row.dataset.productId;
    contextMenuData.productName = row.dataset.productName;
    contextMenuData.ticketId = null; contextMenuData.ticketStatus = null; contextMenuData.senderId = null; contextMenuData.messageTimestamp = null; contextMenuData.orderId = null; contextMenuData.deviceType = null; // Clear other data

    // Position and show
    positionContextMenu(menuElement, event);
    currentContextMenu = menuElement;

    // Add listeners to close
    setTimeout(() => {
         document.addEventListener('click', hideContextMenuOnClickOutside);
         window.addEventListener('scroll', hideContextMenu, { once: true });
    }, 0);
}

/**
 * Opens the product edit/add modal.
 * @param {object | null} [product=null] - Product data to edit, or null to add a new product.
 */
function openProductEditModal(product = null) {
     if (!productEditModal || !productEditForm || !customHexInputContainer) return;
     productEditForm.reset(); // Clear form fields
     productEditStatus.textContent = ''; // Clear status message
     productEditStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status style
     productEditThumbnailFilename.textContent = 'No file selected'; // Reset file input display
     productEditThumbnailFileInput.value = null; // Clear the file input value

     if (product) {
         // Editing existing product: Populate form
         productModalTitle.textContent = 'Edit Product';
         productEditIdInput.value = product._id; // Store ID (hidden)
         productEditNameInput.value = product.name || '';
         productEditThumbnailInput.value = product.thumbnailUrl || '';
         productEditPriceInput.value = product.price || '';
         productEditTagInput.value = product.tag || '';
         // Handle tag color and custom hex
         const hasValidCustomHex = product.tagColor === 'custom' && product.customBorderHex && /^#[0-9A-F]{6}$/i.test(product.customBorderHex);
         productEditTagColorSelect.value = hasValidCustomHex ? 'custom' : (product.tagColor || 'gray');
         productEditCustomHexInput.value = hasValidCustomHex ? product.customBorderHex : '';
         productEditDescriptionInput.value = product.description || '';
         productEditFeaturesInput.value = (product.features || []).join('\n'); // Join features array with newlines
         productEditPaymentLinkInput.value = product.paymentLink || '';
     } else {
         // Adding new product: Set title, clear ID
         productModalTitle.textContent = 'Add Product';
         productEditIdInput.value = ''; // Ensure ID is empty
         productEditTagColorSelect.value = 'gray'; // Default color
         productEditCustomHexInput.value = '';
     }
     toggleCustomHexInput(); // Show/hide custom hex input based on dropdown
     productEditModal.classList.add('active'); // Show the modal
}

/** Shows or hides the custom hex color input based on the tag color dropdown selection. */
function toggleCustomHexInput() {
    if (customHexInputContainer && productEditTagColorSelect) {
         const selectedColor = productEditTagColorSelect.value;
         customHexInputContainer.classList.toggle('hidden', selectedColor !== 'custom'); // Hide if not 'custom'
    }
}

/** Closes the product edit/add modal. */
function closeProductEditModal() { if (productEditModal) productEditModal.classList.remove('active'); }

/** Handles the submission of the product add/edit form. */
async function handleSaveProduct(event) {
     event.preventDefault(); if (!productEditForm || !productSaveButton) return;
     // Disable button, show saving state
     productSaveButton.disabled = true; productSaveButton.textContent = 'Saving...';
     productEditStatus.textContent = ''; productEditStatus.className = 'text-sm text-center h-5 mt-2'; // Clear status

     const productId = productEditIdInput.value; const isEditing = !!productId; // Check if editing or adding
     const url = isEditing ? `${API_BASE_URL}/api/products/${productId}` : `${API_BASE_URL}/api/products`; // Determine API endpoint
     const method = isEditing ? 'PUT' : 'POST'; // Determine HTTP method

     // Validate and determine tag color / custom hex
     let tagColorValue = productEditTagColorSelect.value;
     let customHexValue = productEditCustomHexInput.value.trim();
     let finalTagColor = 'gray';
     let finalCustomHex = null;

     if (tagColorValue === 'custom') {
         if (customHexValue && /^#[0-9A-F]{6}$/i.test(customHexValue)) {
             finalTagColor = 'custom';
             finalCustomHex = customHexValue;
         } else {
             // Invalid custom hex format
             productEditStatus.textContent = 'Invalid Custom HEX format. Please use #RRGGBB.';
             productEditStatus.classList.add('text-red-400');
             productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product'; return; // Stop submission
         }
     } else {
         // Use selected color name
         finalTagColor = tagColorValue || 'gray';
         finalCustomHex = null; // Ensure custom hex is null if not selected
     }

     // Gather product data into FormData for potential file upload
     const formData = new FormData();
     formData.append('name', productEditNameInput.value.trim());
     formData.append('price', parseFloat(productEditPriceInput.value)); // Convert price to float
     formData.append('tag', productEditTagInput.value.trim() || '');
     formData.append('tagColor', finalTagColor);
     formData.append('customBorderHex', finalCustomHex || ''); // Send empty string if null
     formData.append('description', productEditDescriptionInput.value.trim() || '');
     // Append features as an array (or JSON string, depending on backend)
     const features = productEditFeaturesInput.value.split('\n').map(f => f.trim()).filter(f => f);
     features.forEach((feature, index) => formData.append(`features[${index}]`, feature)); // Append as array items
     // Alternatively, as JSON: formData.append('features', JSON.stringify(features));
     formData.append('paymentLink', productEditPaymentLinkInput.value.trim() || '');

     // Handle thumbnail: URL or File upload
     const thumbnailUrl = productEditThumbnailInput.value.trim();
     const thumbnailFile = productEditThumbnailFileInput.files[0];

     if (thumbnailFile) {
         console.log("Appending thumbnail file:", thumbnailFile.name);
         formData.append('thumbnailFile', thumbnailFile); // Append the file if selected
         // Clear URL input if file is chosen (optional, prioritize file)
         formData.append('thumbnailUrl', '');
     } else {
         formData.append('thumbnailUrl', thumbnailUrl || ''); // Use URL if no file
     }

     // Basic validation
     if (!formData.get('name') || isNaN(formData.get('price'))) {
          productEditStatus.textContent = 'Name and valid Price are required.';
          productEditStatus.classList.add('text-red-400');
          productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product'; return;
     }

     // Send data to API (using FormData)
     try {
         const response = await fetch(url, {
             method: method,
             // headers: { 'Content-Type': 'application/json' }, // REMOVE Content-Type for FormData
             body: formData, // Send FormData object
             credentials: 'include' // Send cookies
         });
         const result = await response.json();
         if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

         // Success: Show message, close modal, refresh lists
         showPopupMessage(productMessagePopup, `Product ${isEditing ? 'updated' : 'added'} successfully!`);
         closeProductEditModal();
         await loadProductManagementTable(); // Refresh admin table
         if (activeSectionId === pageSections['#products']) await fetchProducts(); // Refresh public product list if visible
     } catch (error) {
         // Error: Show error message
         console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
         productEditStatus.textContent = `Error: ${error.message}`;
         productEditStatus.classList.add('text-red-400');
         showPopupMessage(errorMessagePopup, `Failed to save product: ${error.message}`, true);
     } finally {
         // Re-enable button
         productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
     }
}

/** Handles the deletion of a product via the admin table. */
async function handleDeleteProduct(productId, productName) {
    if (!productId) return;
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the product "${productName || 'this product'}"? This cannot be undone.`)) return;

    console.log(`Attempting to delete product: ${productId}`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include' // Send cookies
        });
        const result = await response.json(); // Try to parse JSON even on error for messages
        if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

        // Success: Show message, refresh lists
        showPopupMessage(productMessagePopup, 'Product deleted successfully!');
        await loadProductManagementTable(); // Refresh admin table
        if (activeSectionId === pageSections['#products']) await fetchProducts(); // Refresh public list
    } catch (error) {
        // Error: Show error message
        console.error("Error deleting product:", error);
        showPopupMessage(errorMessagePopup, `Failed to delete product: ${error.message}`, true);
    }
}


// --- Event Listeners Setup ---

// Login/Logout
loginButton.addEventListener('click', (e) => { e.preventDefault(); window.location.href = loginButton.href; }); // Redirect to Discord login
async function handleLogout() {
    console.log('Logging out...');
    try {
        // Attempt to hit the backend logout endpoint
        const response = await fetch(`${API_BASE_URL}/logout`, { credentials: 'include' });
        if (!response.ok) {
            let errorMsg = 'Logout request failed';
            try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (parseError) {}
            console.warn(`Backend logout failed: ${errorMsg}. Proceeding with client-side cleanup.`);
        }
    } catch(error) {
        console.error("Network error during logout fetch:", error);
    } finally {
         // Client-side cleanup regardless of backend response
         currentUser = { logged_in: false }; // Clear user state
         isInitialLoginCheckComplete = false; // Reset flags to force re-check on next load/nav
         isInitialConfigLoadComplete = false;
         localStorage.removeItem('currentPage'); // Clear any stored page state (if used)
         disconnectSocket(); // Disconnect WebSocket
         updateHeaderUI(currentUser); // Update header to show login button
         adminDashboardSections?.classList.add('hidden'); // Hide admin sections
         console.log("Redirecting to /#home after logout cleanup.");
         window.location.hash = '/#home'; // Navigate to home page
         // Note: runNavigation() will be triggered by the hash change
    }
}
logoutButton.addEventListener('click', handleLogout);
dashboardLogoutButton.addEventListener('click', handleLogout);

// Navigation
window.addEventListener('hashchange', runNavigation); // Handle URL hash changes

// Ticket Creation Form
if(createTicketForm) createTicketForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default submission
    const subject = ticketSubjectInput.value.trim(); const message = ticketMessageInput.value.trim();
    createTicketStatus.textContent = ''; createTicketStatus.className = 'h-6 text-sm mt-4 mb-4 text-center'; // Clear status
    // Basic validation
    if (!subject || !message) { createTicketStatus.textContent = 'Please fill out both subject and message.'; createTicketStatus.classList.add('error'); return; }

    const submitButton = document.getElementById('create-ticket-button');
    submitButton.disabled = true; submitButton.textContent = 'Submitting...'; // Disable button

    try {
        // Send data to API
        const response = await fetch(`${API_BASE_URL}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message }),
            credentials: 'include'
        });
        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch (e) {} // Try to get error message from response
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json(); // Get success response (might contain ticket ID)
        // Success: Show message, reset form, refresh list if on tickets page
        createTicketStatus.textContent = 'Ticket submitted successfully!';
        createTicketStatus.classList.add('success');
        createTicketForm.reset(); // Clear form
        if (activeSectionId === pageSections['#tickets']) fetchTickets(); // Refresh list
    } catch (error) {
        // Error: Show error message
        console.error('Error creating ticket:', error);
        createTicketStatus.textContent = `Error: ${error.message}`;
        createTicketStatus.classList.add('error');
    } finally {
        // Re-enable button
        submitButton.disabled = false; submitButton.textContent = 'Submit Ticket';
    }
});

// Chat Input Form
if(chatInputForm) chatInputForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default submission
    const messageText = chatInput.value.trim();
    // Send message if text exists, socket connected, and a ticket is active
    if (messageText && socket && socket.connected && currentTicketId) {
        socket.emit('send_message', { ticket_id: currentTicketId, text: messageText });
        chatInput.value = ''; // Clear input field
    }
    // Show errors if conditions not met
    else if (!socket || !socket.connected) { showPopupMessage(errorMessagePopup, 'Not connected to chat.', true); }
    else if (!currentTicketId) { showPopupMessage(errorMessagePopup, 'No active ticket selected.', true); }
});

// Modals
if (modalCloseButton) modalCloseButton.addEventListener('click', hideUserInfoModal); // User info modal close button
if (userInfoModal) userInfoModal.addEventListener('click', (event) => { if (event.target === userInfoModal) hideUserInfoModal(); }); // Click outside user info modal

// Context Menus Actions
if (contextDeleteButton) contextDeleteButton.addEventListener('click', deleteChatMessage); // Chat context: Delete
if (contextUserInfoButton) contextUserInfoButton.addEventListener('click', () => { // Chat context: User Info
    if (contextMenuData.senderId) {
        // Find username from the message element that was right-clicked
        const messageElement = chatMessagesDiv?.querySelector(`.chat-message[data-timestamp="${contextMenuData.messageTimestamp}"]`);
        const usernameElement = messageElement?.querySelector('.username');
        const username = usernameElement ? usernameElement.textContent.replace(':', '') : 'Unknown User'; // Extract username
        showUserInfoModal(contextMenuData.senderId, username); // Show modal
    }
    hideContextMenu(); // Close context menu
});
if (contextCloseTicketButton) contextCloseTicketButton.addEventListener('click', closeTicket); // Ticket context: Close
if (contextReopenTicketButton) contextReopenTicketButton.addEventListener('click', reopenTicket); // Ticket context: Reopen
if (contextDeleteTicketButton) contextDeleteTicketButton.addEventListener('click', deleteTicket); // Ticket context: Delete

// Mobile Menu
if (mobileMenuButton && mobileMenuNav) mobileMenuButton.addEventListener('click', () => mobileMenuNav.classList.toggle('hidden')); // Toggle mobile menu visibility

// Admin: Site Config Form
if (siteConfigForm) siteConfigForm.addEventListener('submit', handleSaveSiteConfig); // Save config on submit
if (addHeaderLinkButton) addHeaderLinkButton.addEventListener('click', () => addHeaderLinkInput()); // Add new link input group

// Admin: Product Management
if (addProductButton) addProductButton.addEventListener('click', () => openProductEditModal()); // Open modal to add product
if (productEditModal && productModalCloseButton) productModalCloseButton.addEventListener('click', closeProductEditModal); // Product modal close button
if (productEditModal) productEditModal.addEventListener('click', (event) => { if (event.target === productEditModal) closeProductEditModal(); }); // Click outside product modal
if (productEditForm) productEditForm.addEventListener('submit', handleSaveProduct); // Save product on submit
if (productEditTagColorSelect) productEditTagColorSelect.addEventListener('change', toggleCustomHexInput); // Toggle hex input on color change

// Admin: Product Thumbnail File Input
if(productEditThumbnailButton && productEditThumbnailFileInput) {
    productEditThumbnailButton.addEventListener('click', () => {
        productEditThumbnailFileInput.click(); // Trigger hidden file input
    });
}
if(productEditThumbnailFileInput && productEditThumbnailFilename) {
    productEditThumbnailFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            productEditThumbnailFilename.textContent = file.name; // Show selected filename
            // Clear the URL input when a file is selected (optional, prioritizes file)
             if(productEditThumbnailInput) productEditThumbnailInput.value = '';
        } else {
            productEditThumbnailFilename.textContent = 'No file selected';
        }
        // Reset file input value so the change event fires again if the same file is selected
        // event.target.value = null; // Don't reset value here, messes with FormData
    });
}

// --- Product Registration Modal Listeners ---

// Open Modal Listener
if (registerProductButton) {
    registerProductButton.addEventListener('click', () => {
        if (registerProductModal) {
            registrationStatus.textContent = ''; // Clear previous status
            registerProductForm.reset();      // Clear form
            registerProductModal.classList.add('active'); // Show modal
        }
    });
}

// Close button listener
if (registerModalCloseButton) {
    registerModalCloseButton.addEventListener('click', () => {
        if (registerProductModal) {
            registerProductModal.classList.remove('active'); // Hide modal
        }
    });
}

// Close modal clicking outside
if (registerProductModal) {
    registerProductModal.addEventListener('click', (event) => {
        if (event.target === registerProductModal) {
            registerProductModal.classList.remove('active'); // Hide modal
        }
    });
}

// Handle registration form submission
if (registerProductForm) {
    registerProductForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        // Ensure required elements exist
        if (!registerOrderIdInput || !registerEmailInput || !registrationStatus || !submitRegistrationButton) {
             console.error("Registration form elements missing!"); return;
        }

        const orderId = registerOrderIdInput.value.trim();
        const email = registerEmailInput.value.trim();
        registrationStatus.textContent = ''; // Clear status
        registrationStatus.className = 'text-sm text-center h-5 mt-2'; // Reset class

        // Basic validation
         if (!orderId) {
            registrationStatus.textContent = 'Please enter your Order ID.';
            registrationStatus.classList.add('text-red-400'); return;
        }
        if (!email) {
             registrationStatus.textContent = 'Please enter your Email Address.';
             registrationStatus.classList.add('text-red-400'); return;
         }
        // Email format validation (simple)
        if (!/\S+@\S+\.\S+/.test(email)) {
             registrationStatus.textContent = 'Please enter a valid Email Address.';
             registrationStatus.classList.add('text-red-400'); return;
         }

        // Disable button, show submitting state
        submitRegistrationButton.disabled = true;
        submitRegistrationButton.textContent = 'Submitting...';

        console.log(`Registering Order ID: ${orderId}, Email: ${email}`); // Simplified log

        // --- ACTUAL API CALL ---
        try {
            const response = await fetch(`${API_BASE_URL}/api/register_product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ONLY send order_id and email
                body: JSON.stringify({ order_id: orderId, email: email }), // <<< MODIFIED
                credentials: 'include' // Send cookies if needed for auth
            });
            const result = await response.json(); // Always try to parse JSON

            if (!response.ok) {
                // Throw error using message from backend if available
                throw new Error(result.error || `Request failed with status ${response.status}`);
            }

            // Success
            registrationStatus.textContent = result.message || 'Registration successful!';
            registrationStatus.classList.add('text-green-400');
            showPopupMessage(productMessagePopup, result.message || 'Product registered successfully!');
            // Refresh user data to update dashboard immediately
            await checkLoginStatus(); // Fetches latest user data including registered products
            // If the user is currently viewing the dashboard, re-render the product list
             if (activeSectionId === pageSections['#dashboard']) {
                 const myRegisteredDetails = currentUser?.registered_product_details || [];
                 displayRegisteredProducts(myRegisteredDetails);
             }
            // Optionally close the modal after success
            setTimeout(() => {
                if(registerProductModal) registerProductModal.classList.remove('active');
            }, 1500);

        } catch (error) {
            // Handle fetch errors or errors thrown from !response.ok
            console.error('Registration failed:', error);
            registrationStatus.textContent = `Error: ${error.message}`;
            registrationStatus.classList.add('text-red-400');
            showPopupMessage(errorMessagePopup, `Registration failed: ${error.message}`, true);
        } finally {
            // --- IMPORTANT: Re-enable button in finally block ---
            if(submitRegistrationButton){
                 submitRegistrationButton.disabled = false;
                 submitRegistrationButton.textContent = 'Submit Registration';
            }
        }
        // --- END ACTUAL API CALL ---
    });
}
// --- End of Product Registration Listeners ---


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded.");
    createSnowflakes(); // Initialize background effect
    checkLoginStatus(); // Start the process: Check login -> Load Config -> Navigate
    // Note: runNavigation() is called inside loadSiteConfigAndNavigate after both checks are complete
});