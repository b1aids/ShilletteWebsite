// scripts.js (Main Entry Point)
// Description: Initializes the application, defines global state, gets DOM references,
// attaches main event listeners, and orchestrates calls to modularized functions.

// --- Global State Variables ---
let currentUser = null; // Holds user data after login check
let siteConfig = null; // Holds site configuration data
let socket = null; // Holds the Socket.IO connection object
let currentTicketId = null; // ID of the currently viewed ticket detail
let activeSectionId = null; // ID of the currently visible page section element
let currentContextMenu = null; // Reference to the currently open context menu element
let contextMenuData = { // Data associated with the context menu target
    ticketId: null, messageTimestamp: null, senderId: null, ticketStatus: null,
    productId: null, productName: null, orderId: null, deviceType: null
};
let isInitialLoginCheckComplete = false; // Flag for async control flow
let isInitialConfigLoadComplete = false; // Flag for async control flow

// --- DOM Element References (Global Scope) ---
// Note: It's crucial that the HTML elements with these IDs exist.
// Header & Navigation
const siteTitleDisplay = document.getElementById('site-title-display');
const headerSiteIcon = document.getElementById('header-site-icon');
const faviconElement = document.getElementById('favicon');
const mainNavigation = document.getElementById('main-navigation');
const mobileMenuNav = document.getElementById('mobile-menu');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button'); // In header dropdown
const userInfo = document.getElementById('user-info'); // Header user info section
const userNameDisplay = document.getElementById('user-name'); // Header username
const userAvatarDisplay = document.getElementById('user-avatar'); // Header avatar

// Popups & Overlays
const paymentMessage = document.getElementById('payment-message');
const ticketMessagePopup = document.getElementById('ticket-message');
const errorMessagePopup = document.getElementById('error-message');
const configMessagePopup = document.getElementById('config-message');
const productMessagePopup = document.getElementById('product-message');
const loadingOverlay = document.getElementById('loading-overlay');

// Modals
const userInfoModal = document.getElementById('user-info-modal');
const modalCloseButton = document.getElementById('modal-close-button'); // User info modal close
const modalUsername = document.getElementById('modal-username');
const modalUserId = document.getElementById('modal-user-id');
const modalUserRoles = document.getElementById('modal-user-roles');
const productEditModal = document.getElementById('product-edit-modal');
const productModalCloseButton = document.getElementById('product-modal-close-button');
const productModalTitle = document.getElementById('product-modal-title');
const registerProductModal = document.getElementById('register-product-modal');
const registerModalCloseButton = document.getElementById('register-modal-close-button');
const firmwareModal = document.getElementById('firmware-generate-modal');
const firmwareModalCloseButton = document.getElementById('firmware-modal-close-button');
const firmwareModalTitle = document.getElementById('firmware-modal-title');


// Context Menus
const chatContextMenu = document.getElementById('chat-context-menu');
const contextDeleteButton = document.getElementById('context-delete-message'); // Chat menu delete
const contextUserInfoButton = document.getElementById('context-user-info'); // Chat menu user info
const ticketContextMenu = document.getElementById('ticket-context-menu');
const contextCloseTicketButton = document.getElementById('context-close-ticket');
const contextReopenTicketButton = document.getElementById('context-reopen-ticket');
const contextDeleteTicketButton = document.getElementById('context-delete-ticket');
const adminProductContextMenu = document.getElementById('admin-product-context-menu');
const contextEditProductButton = document.getElementById('context-edit-product'); // Admin product menu edit
const contextDeleteAdminProductButton = document.getElementById('context-delete-admin-product'); // Admin product menu delete
const myProductContextMenu = document.getElementById('my-product-context-menu');
const contextGotoProductButton = document.getElementById('context-goto-product'); // My product menu goto
const contextViewOrderIdButton = document.getElementById('context-view-order-id'); // My product menu view order
const contextGenerateFirmwareButton = document.getElementById('context-generate-firmware'); // My product menu generate fw
const contextUnregisterMyProductButton = document.getElementById('context-unregister-my-product'); // My product menu unregister

// Products Page (#products)
const productGrid = document.getElementById('product-grid');
const productLoadingStatus = document.getElementById('product-loading-status');

// Product Detail Page (#productDetail)
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

// Tickets Page (#tickets)
const userTicketView = document.getElementById('user-ticket-view');
const moderatorManagementView = document.getElementById('moderator-management-view');
const ticketListDiv = document.getElementById('ticket-list'); // User's list
const ticketListStatus = document.getElementById('ticket-list-status');
const moderatorActiveTicketListDiv = document.getElementById('moderator-active-ticket-list');
const moderatorActiveListStatus = document.getElementById('moderator-active-list-status');
const moderatorArchivedTicketListDiv = document.getElementById('moderator-archived-ticket-list');
const moderatorArchivedListStatus = document.getElementById('moderator-archived-list-status');
const createTicketForm = document.getElementById('create-ticket-form');
const ticketSubjectInput = document.getElementById('ticket-subject');
const ticketMessageInput = document.getElementById('ticket-message-input');
const createTicketStatus = document.getElementById('create-ticket-status');

// Ticket Detail Page (#ticketDetail)
const ticketDetailSubject = document.getElementById('ticket-detail-subject');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInputForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');
const backToTicketsButton = document.getElementById('back-to-tickets-button');

// Dashboard Page (#dashboard)
const dashboardUserNameDisplay = document.getElementById('dashboard-user-name');
const dashboardUserAvatarDisplay = document.getElementById('dashboard-user-avatar');
const dashboardUserRolesContainer = document.getElementById('dashboard-user-roles');
const dashboardLogoutButton = document.getElementById('dashboard-logout-button'); // Dashboard logout
const dashboardMyProductsList = document.getElementById('dashboard-my-products-list'); // Container for registered products
const registerProductButton = document.getElementById('register-product-button'); // Button to open registration modal

// Dashboard Admin Sections
const adminDashboardSections = document.getElementById('admin-dashboard-sections'); // Container for all admin cards
const siteConfigForm = document.getElementById('site-config-form');
const configSiteTitleInput = document.getElementById('config-site-title');
const configSiteIconUrlInput = document.getElementById('config-site-icon-url');
const configHeaderLinksContainer = document.getElementById('config-header-links-container');
const addHeaderLinkButton = document.getElementById('add-header-link-button');
const saveConfigButton = document.getElementById('save-config-button');
const configSaveStatus = document.getElementById('config-save-status');
const addProductButton = document.getElementById('add-product-button'); // Admin add product
const productListTableBody = document.getElementById('product-list-tbody'); // Admin product table body
const productListStatus = document.getElementById('product-list-status'); // Admin product table status

// Product Add/Edit Modal Form Elements
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

// Product Registration Modal Form Elements
const registerProductForm = document.getElementById('register-product-form');
const registrationStatus = document.getElementById('registration-status');
const registerOrderIdInput = document.getElementById('register-order-id');
const registerEmailInput = document.getElementById('register-email');
const submitRegistrationButton = document.getElementById('submit-registration-button');

// Firmware Generation Modal Form Elements
const firmwareGenerateForm = document.getElementById('firmware-generate-form');
const generateProductIdInput = document.getElementById('generate-product-id');
const generateDnaIdInput = document.getElementById('generate-dna-id');
const generateDeviceTypeSelect = document.getElementById('generate-device-type');
const submitFirmwareButton = document.getElementById('submit-firmware-generation');
const generateStatus = document.getElementById('generate-status');
const generateFirmwareFolderInput = document.getElementById('generate-firmware-folder'); // Added

// Footer
const footerYear = document.getElementById('footer-year');

// Effects Container
const snowContainer = document.getElementById('snow-container');


// --- Event Listener Setup ---
// Functions called here (e.g., runNavigation, handleLogout) are defined in the
// other included script files and are available globally.

// Initial Load & Navigation
window.addEventListener('hashchange', runNavigation); // Handle URL hash changes for routing

// Authentication
if (loginButton) loginButton.addEventListener('click', (e) => { e.preventDefault(); window.location.href = loginButton.href; });
if (logoutButton) logoutButton.addEventListener('click', handleLogout);
if (dashboardLogoutButton) dashboardLogoutButton.addEventListener('click', handleLogout);

// Mobile Menu Toggle
if (mobileMenuButton && mobileMenuNav) {
    mobileMenuButton.addEventListener('click', () => mobileMenuNav.classList.toggle('hidden'));
}

// Ticket Creation
if (createTicketForm) {
    createTicketForm.addEventListener('submit', handleCreateTicketSubmit);
}

// Ticket Detail Chat Input
if (chatInputForm) {
    chatInputForm.addEventListener('submit', handleChatSubmit);
}

// Modal Close Buttons & Outside Clicks
if (modalCloseButton && userInfoModal) { // User Info Modal
    modalCloseButton.addEventListener('click', hideUserInfoModal);
    userInfoModal.addEventListener('click', (event) => { if (event.target === userInfoModal) hideUserInfoModal(); });
}
if (productModalCloseButton && productEditModal) { // Product Edit Modal
    productModalCloseButton.addEventListener('click', closeProductEditModal);
    productEditModal.addEventListener('click', (event) => { if (event.target === productEditModal) closeProductEditModal(); });
}
if (registerModalCloseButton && registerProductModal) { // Product Registration Modal
    registerModalCloseButton.addEventListener('click', closeRegisterProductModal);
    registerProductModal.addEventListener('click', (event) => { if (event.target === registerProductModal) closeRegisterProductModal(); });
}
if (firmwareModalCloseButton && firmwareModal) { // Firmware Generation Modal
    firmwareModalCloseButton.addEventListener('click', closeFirmwareGenerateModal);
    firmwareModal.addEventListener('click', (event) => { if (event.target === firmwareModal) closeFirmwareGenerateModal(); });
}


// Context Menu Actions (Buttons inside the menus)
// Chat Context Menu
if (contextDeleteButton) contextDeleteButton.addEventListener('click', deleteChatMessage);
if (contextUserInfoButton) contextUserInfoButton.addEventListener('click', () => {
    if (contextMenuData.senderId) {
        // Find username from the message element that was right-clicked (best effort)
        const messageElement = chatMessagesDiv?.querySelector(`.chat-message[data-timestamp="${contextMenuData.messageTimestamp}"]`);
        const usernameElement = messageElement?.querySelector('.username');
        const username = usernameElement ? usernameElement.textContent.replace(':', '') : 'Unknown User';
        showUserInfoModal(contextMenuData.senderId, username);
    }
    hideContextMenu();
});
// Ticket Context Menu
if (contextCloseTicketButton) contextCloseTicketButton.addEventListener('click', closeTicket);
if (contextReopenTicketButton) contextReopenTicketButton.addEventListener('click', reopenTicket);
if (contextDeleteTicketButton) contextDeleteTicketButton.addEventListener('click', deleteTicket);
// Admin Product Context Menu
if (contextEditProductButton) contextEditProductButton.addEventListener('click', () => {
     if(contextMenuData.productId) {
          showPopupMessage(productMessagePopup, 'Fetching product details to edit...');
          fetch(`${API_BASE_URL}/api/products/${contextMenuData.productId}`)
             .then(res => {
                 if(!res.ok) throw new Error('Product not found or error fetching.');
                 return res.json();
             })
             .then(productData => openProductEditModal(productData)) // Assumes openProductEditModal is global
             .catch(err => showPopupMessage(errorMessagePopup, `Error fetching product to edit: ${err.message}`, true));
     }
     hideContextMenu();
 });
if (contextDeleteAdminProductButton) contextDeleteAdminProductButton.addEventListener('click', () => {
    handleDeleteProduct(contextMenuData.productId, contextMenuData.productName); // Assumes global
    hideContextMenu();
});
// My Product Context Menu
if (contextGotoProductButton) contextGotoProductButton.addEventListener('click', () => {
     if(contextMenuData.productId) {
        window.location.hash = `#productDetail?id=${contextMenuData.productId}`;
     }
     hideContextMenu();
});
if (contextViewOrderIdButton) contextViewOrderIdButton.addEventListener('click', handleViewOrderId);
if (contextGenerateFirmwareButton) contextGenerateFirmwareButton.addEventListener('click', () => {
    openFirmwareGenerateModal(contextMenuData.productId, contextMenuData.productName); // Assumes global
    hideContextMenu();
});
if (contextUnregisterMyProductButton) contextUnregisterMyProductButton.addEventListener('click', handleUnregisterProduct);


// Admin Dashboard Forms & Buttons
if (siteConfigForm) siteConfigForm.addEventListener('submit', handleSaveSiteConfig);
if (addHeaderLinkButton) addHeaderLinkButton.addEventListener('click', () => addHeaderLinkInput()); // Assumes global
if (addProductButton) addProductButton.addEventListener('click', () => openProductEditModal()); // Assumes global (pass null for add)
if (productEditForm) productEditForm.addEventListener('submit', handleSaveProduct);
if (productEditTagColorSelect) productEditTagColorSelect.addEventListener('change', toggleCustomHexInput); // Assumes global

// Admin: Product Thumbnail File Input Logic
if (productEditThumbnailButton && productEditThumbnailFileInput) {
    productEditThumbnailButton.addEventListener('click', () => productEditThumbnailFileInput.click());
}
if (productEditThumbnailFileInput && productEditThumbnailFilename) {
    productEditThumbnailFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            productEditThumbnailFilename.textContent = file.name; // Show selected filename
            // Clear the URL input if a file is chosen (prioritize file)
            if(productEditThumbnailInput) productEditThumbnailInput.value = '';
        } else {
            productEditThumbnailFilename.textContent = 'No file selected';
        }
        // Don't reset event.target.value here, it prevents FormData from getting the file
    });
}

// Product Registration Modal Trigger & Form
if (registerProductButton) registerProductButton.addEventListener('click', openRegisterProductModal);
if (registerProductForm) registerProductForm.addEventListener('submit', handleRegisterProductSubmit);

// Firmware Generation Modal Form
if (firmwareGenerateForm) firmwareGenerateForm.addEventListener('submit', handleFirmwareGenerateSubmit);


// --- Initial Application Load ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing application...");
    // Initialize visual effects (if any)
    createSnowflakes(); // Assumes global (from effects.js)

    // Start the authentication check, which will then load config and navigate
    checkLoginStatus(); // Assumes global (from auth.js)

    console.log("Initialization sequence started.");
});
