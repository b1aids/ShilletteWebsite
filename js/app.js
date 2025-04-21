/**
 * Shillette Frontend Application Logic
 *
 * Handles routing (using History API), API calls, WebSocket communication,
 * dynamic content loading, and UI interactions for the MPF structure.
 * Includes fix for GitHub Pages SPA routing.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Shillette MPF with History API...");

    // --- Constants and DOM Element References (Global/Shell Elements) ---
    const pageContentContainer = document.getElementById('page-content-container');
    const siteTitleDisplay = document.getElementById('site-title-display');
    const headerSiteIcon = document.getElementById('header-site-icon');
    const faviconElement = document.getElementById('favicon');
    const mainNavigation = document.getElementById('main-navigation');
    const mobileMenuNav = document.getElementById('mobile-menu');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userInfo = document.getElementById('user-info');
    const userNameDisplay = document.getElementById('user-name');
    const userAvatarDisplay = document.getElementById('user-avatar');
    const snowContainer = document.getElementById('snow-container');
    const paymentMessage = document.getElementById('payment-message');
    const ticketMessagePopup = document.getElementById('ticket-message');
    const errorMessagePopup = document.getElementById('error-message');
    const configMessagePopup = document.getElementById('config-message');
    const productMessagePopup = document.getElementById('product-message');
    const loadingOverlay = document.getElementById('loading-overlay');
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

    const API_BASE_URL = 'https://api.shillette.com';
    const SOCKET_URL = 'https://api.shillette.com';

    // --- State Variables ---
    let currentUser = null;
    let siteConfig = null;
    let socket = null;
    let currentTicketId = null; // Track the ID for the ticket detail page
    let currentContextMenu = null;
    let contextMenuData = { ticketId: null, messageTimestamp: null, senderId: null, ticketStatus: null };
    let isInitialLoginCheckComplete = false;
    let isInitialConfigLoadComplete = false;
    let currentPageKey = null; // Track the currently loaded page key (e.g., 'home', 'products')

    // --- Page Mapping (Map path segments to content file paths) ---
    // Keys should be lowercase for case-insensitive matching based on the first path segment
    const pageRoutes = {
        'home': 'pages/home.html', // Maps to '/' or '/home'
        'products': 'pages/products.html', // Maps to '/products'
        'tickets': 'pages/tickets.html', // Maps to '/tickets'
        'dashboard': 'pages/dashboard.html', // Maps to '/dashboard'
        'ticketdetail': 'pages/ticketDetail.html', // Maps to '/ticketdetail/:id'
        'productdetail': 'pages/productDetail.html' // Maps to '/productdetail/:id'
        // NOTE: Do not add a route for 'index.html' here, the server serves it directly.
    };

    // --- Utility Functions ---
    // ... (showPopupMessage, createSnowflakes, formatTimeAgo remain the same) ...
        /**
     * Shows a popup message at the bottom center of the screen.
     * @param {HTMLElement} element - The message element (e.g., paymentMessage).
     * @param {string} message - The text to display.
     * @param {boolean} [isError=false] - If true, styles as an error message.
     * @param {number} [duration=3500] - How long the message stays visible (ms).
     */
    function showPopupMessage(element, message, isError = false, duration = 3500) {
         if (!element) {
             console.warn("Attempted to show popup message on a null element.");
             return;
         }
         element.textContent = message;
         element.classList.toggle('bg-red-600', isError);
         element.classList.toggle('bg-green-600', !isError);
         element.classList.add('show');
         // Use a timeout to remove the 'show' class after the duration
         setTimeout(() => element.classList.remove('show'), duration);
    }

    /**
     * Creates and appends snowflake elements for a falling snow effect.
     */
    function createSnowflakes() {
        const numberOfSnowflakes = 75; // Adjust density as needed
        if (!snowContainer) return;
        snowContainer.innerHTML = ''; // Clear existing snowflakes if any
        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            // Randomize size, duration, delay, starting position, and opacity
            const size = Math.random() * 3 + 2; // Size between 2px and 5px
            const duration = Math.random() * 10 + 5; // Duration between 5s and 15s
            const delay = Math.random() * 10; // Start delay up to 10s
            const startLeft = Math.random() * 100; // Start anywhere horizontally
            const opacity = Math.random() * 0.5 + 0.5; // Opacity between 0.5 and 1.0

            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${startLeft}vw`;
            snowflake.style.opacity = opacity;
            snowflake.style.animationDuration = `${duration}s`;
            // Negative delay makes some start partway through their animation
            snowflake.style.animationDelay = `-${delay}s`;

            snowContainer.appendChild(snowflake);
        }
    }

    /**
     * Formats a date string into a relative time ago string (e.g., "7 months ago").
     * @param {string} dateString - The date string to format.
     * @returns {string} - The formatted relative time string.
     */
    function formatTimeAgo(dateString) {
         try {
             const date = new Date(dateString);
             const now = new Date();
             // Calculate difference in months
             const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
             if (diffMonths < 1) return 'less than a month ago';
             if (diffMonths === 1) return '1 month ago';
             return `${diffMonths} months ago`;
         } catch (e) {
             console.warn("Error formatting time ago:", e);
             return 'a while ago'; // Fallback
         }
    }


    // --- Core Application Logic ---

    /**
     * Fetches HTML content for a given page key and injects it into the main container.
     * Also triggers page-specific initialization logic.
     * @param {string} pageKey - The lowercase key from pageRoutes (e.g., 'home', 'productdetail').
     * @param {object} [params={}] - Parameters extracted from the URL path (e.g., { id: '123' }).
     */
    async function loadPageContent(pageKey, params = {}) {
        console.log(`[loadPageContent] Attempting to load page for key: ${pageKey} with params:`, params);
        if (!pageContentContainer) {
            console.error("CRITICAL: Page content container (#page-content-container) not found!");
            return;
        }
        // Lookup file path using the lowercase pageKey
        const filePath = pageRoutes[pageKey];
        if (!filePath) {
            console.error(`No route found for page key: ${pageKey}`);
            // Display error message using the key that failed the lookup
            pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Page not found (${pageKey}). Please check the URL or server configuration.</div>`;
            currentPageKey = null; // Reset current page state
            return;
        }

        // Show loading indicator
        pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-gray-400">Loading ${pageKey}...</div>`;
        currentPageKey = pageKey; // Update current page state using the key

        try {
            // Fetch the HTML content from the corresponding file
            // Fetch path is relative to index.html location
            const response = await fetch(filePath);
            if (!response.ok) {
                // Handle common errors like 404 Not Found for the HTML snippet
                throw new Error(`Failed to fetch page content ${filePath}: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();

            // Inject the fetched HTML into the container
            pageContentContainer.innerHTML = html;
            console.log(`[loadPageContent] Successfully loaded and injected HTML for ${pageKey} from ${filePath}`);

            // --- Execute Page-Specific Initialization ---
            window.scrollTo(0, 0); // Scroll to top after loading new content

            switch (pageKey) { // Use the lowercase pageKey for the switch
                case 'home':
                    // Update header links if needed (e.g., add 'active' class)
                    updateActiveNavLink(pageKey);
                    break;
                case 'products':
                    updateActiveNavLink(pageKey);
                    await fetchProducts(); // Fetch and render product cards
                    break;
                case 'tickets':
                    updateActiveNavLink(pageKey);
                    await fetchTickets(); // Fetch user/mod tickets
                    setupTicketFormListener(); // Add listener for the create ticket form
                    break;
                case 'dashboard':
                    updateActiveNavLink(pageKey);
                    // Dashboard requires login
                    if (currentUser?.logged_in) {
                        displayDashboardUserInfo(); // Populate user info card
                        displayUserRoles(currentUser.roles || []); // Populate roles card
                        // Check moderator status and load admin sections if necessary
                        if (currentUser.is_moderator === true) {
                            await loadAdminDashboardData(); // Load config form, product table, setup listeners
                        } else {
                            // Ensure admin sections are hidden if they somehow exist in the HTML
                            document.getElementById('admin-dashboard-sections')?.classList.add('hidden');
                        }
                        setupDashboardListeners(); // Add listener for dashboard logout button
                    } else {
                         // This case should ideally be caught by the router, but as a fallback:
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Please log in to view the dashboard.</div>`;
                    }
                    break;
                case 'ticketdetail': // Use lowercase key
                    updateActiveNavLink('tickets'); // Highlight 'Tickets' in nav
                    currentTicketId = params.id; // Get ticket ID from URL parameters
                    if (currentTicketId) {
                         // Ensure the back button link is correct
                         const backBtn = document.getElementById('back-to-tickets-button');
                         if (backBtn) backBtn.href = '/tickets'; // Link back to /tickets path
                         await fetchTicketDetails(currentTicketId); // Fetch chat messages for this ticket
                         setupTicketDetailListeners(); // Add listeners for chat form
                    } else {
                         console.error("Ticket ID missing for ticketDetail page.");
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Ticket ID is missing in the URL.</div>`;
                         currentPageKey = null; // Reset page state
                    }
                    break;
                case 'productdetail': // Use lowercase key
                    updateActiveNavLink('products'); // Highlight 'Products' in nav
                    const productId = params.id; // Get product ID from URL parameters
                     if (productId) {
                         // Ensure back button link
                         const backBtn = document.getElementById('back-to-products-button-detail');
                         if (backBtn) backBtn.href = '/products'; // Link back to /products path
                         await fetchProductDetails(productId); // Fetch product data
                         setupProductDetailListeners(); // Add listeners for buy/basket/quantity buttons
                     } else {
                         console.error("Product ID missing for productDetail page.");
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Product ID is missing in the URL.</div>`;
                         currentPageKey = null; // Reset page state
                     }
                    break;
                default:
                    updateActiveNavLink(null); // No matching nav link
                    console.log(`No specific initialization logic defined for page key: ${pageKey}`);
            }

        } catch (error) {
            console.error(`Error loading or initializing page ${pageKey}:`, error);
            pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error loading page content: ${error.message}</div>`;
            currentPageKey = null; // Reset page state on error
        }
    }

    // --- Authentication and Configuration ---
    // ... (checkLoginStatus remains the same) ...
    async function checkLoginStatus() {
         isInitialLoginCheckComplete = false;
         console.log("[checkLoginStatus] Checking user login status...");
         try {
             const response = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });
             if (!response.ok && (response.status === 401 || response.status === 403)) {
                 currentUser = { logged_in: false };
                 console.log("[checkLoginStatus] User is not logged in (401/403).");
             } else if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
             } else {
                 currentUser = await response.json();
                 console.log("[checkLoginStatus] User is logged in:", currentUser);
             }
             updateHeaderUI(currentUser);
             if (currentUser?.logged_in) {
                 ensureSocketConnected();
             }
         } catch (error) {
             console.error("[checkLoginStatus] Error checking login status:", error);
             currentUser = { logged_in: false };
             updateHeaderUI(currentUser);
             showPopupMessage(errorMessagePopup, "Could not verify login status. Please try again later.", true);
         } finally {
             isInitialLoginCheckComplete = true;
             console.log("[checkLoginStatus] Initial login check complete.");
             // Config load and initial navigation now happen AFTER login check completes
             await loadSiteConfigAndNavigate();
         }
    }

    /**
     * Loads site configuration and then triggers the initial navigation.
     * Includes logic to handle redirects from 404.html for GitHub Pages SPA.
     */
    async function loadSiteConfigAndNavigate() {
        // Wait for login check if it hasn't finished (should usually be done by now)
        if (!isInitialLoginCheckComplete) {
            console.log("[loadSiteConfigAndNavigate] Waiting for login check to complete.");
            return; // Should be called again from checkLoginStatus finally block
        }

        isInitialConfigLoadComplete = false;
        console.log("[loadSiteConfig] Loading site configuration...");
        try {
            const response = await fetch(`${API_BASE_URL}/api/config`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            siteConfig = await response.json();
            console.log("[loadSiteConfig] Site config loaded:", siteConfig);
            applySiteConfig(siteConfig);
        } catch (error) {
            console.error("[loadSiteConfig] Error loading site config:", error);
            showPopupMessage(errorMessagePopup, "Failed to load site configuration. Using default settings.", true);
            // Apply default config or handle error state appropriately
            applySiteConfig(null); // Apply default/fallback config
        } finally {
            isInitialConfigLoadComplete = true;
            console.log("[loadSiteConfig] Initial config load complete.");

            // --- GitHub Pages SPA Redirect Handling --- START ---
            // This code checks if we were redirected from 404.html
            const redirectKey = 'spaRedirectPath'; // Must match the key used in 404.html
            const redirectPath = sessionStorage.getItem(redirectKey);

            if (redirectPath) {
                console.log(`[GitHub Pages SPA Fix] Found redirect path '${redirectPath}' in sessionStorage.`);
                sessionStorage.removeItem(redirectKey); // Clean up sessionStorage immediately

                // Use history.replaceState to update the URL in the browser bar
                // to the path the user originally intended to visit, without
                // triggering a page reload or adding the 404/index.html to history.
                history.replaceState(null, '', redirectPath);
                console.log(`[GitHub Pages SPA Fix] Updated history state to: ${redirectPath}`);
            } else {
                console.log("[GitHub Pages SPA Fix] No redirect path found in sessionStorage. Proceeding with normal load.");
            }
            // --- GitHub Pages SPA Redirect Handling --- END ---

            console.log("[loadSiteConfigAndNavigate] Triggering initial navigation based on current pathname (potentially updated by SPA fix).");
            // runNavigation will now use the correct path (either the original one
            // or the one restored from sessionStorage by the code above).
            runNavigation();
        }
    }

    // ... (applySiteConfig, updateHeaderUI, updateActiveNavLink remain the same) ...
    function applySiteConfig(config) {
        const title = config?.siteTitle || "Shillette";
        const iconUrl = config?.siteIconUrl || "/images/icon.png";
        // IMPORTANT: Update default links to use paths instead of hashes
        const links = config?.headerLinks || [
            {name: "Home", href: "/"}, // Use root path for home
            {name: "Products", href: "/products"},
            {name: "Tickets", href: "/tickets"},
            {name: "Discord", href: "https://discord.gg/shillette", target: "_blank"}
        ];

        document.title = title;
        if (siteTitleDisplay) siteTitleDisplay.textContent = title;
        if (headerSiteIcon) headerSiteIcon.src = iconUrl;
        if (faviconElement) faviconElement.href = iconUrl;

        if (mainNavigation) {
            mainNavigation.innerHTML = '';
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href; // Use the path directly
                a.textContent = link.name;
                // Add classes for styling and potentially identifying SPA links
                a.classList.add('text-gray-300', 'hover:text-white', 'transition', 'duration-200', 'main-nav-link');
                // Add dataset for easy identification of the target page key
                if (!link.target) { // Only add dataset for internal links
                    // Handle base path '/' correctly for 'home' key
                    const pathKey = (link.href === '/' ? 'home' : link.href.split('/').filter(Boolean)[0]?.toLowerCase()) || 'home';
                    a.dataset.pageKey = pathKey;
                }
                if (link.target) {
                    a.target = link.target;
                    if (link.target === '_blank') a.rel = 'noopener noreferrer';
                }
                mainNavigation.appendChild(a);
            });
        }

        if (mobileMenuNav) {
            mobileMenuNav.innerHTML = '';
            links.forEach(link => {
                const mob_a = document.createElement('a');
                mob_a.href = link.href;
                mob_a.textContent = link.name;
                mob_a.classList.add('mobile-menu-link');
                if (!link.target) {
                     const pathKey = (link.href === '/' ? 'home' : link.href.split('/').filter(Boolean)[0]?.toLowerCase()) || 'home';
                    mob_a.dataset.pageKey = pathKey;
                }
                if (link.target) {
                    mob_a.target = link.target;
                    if (link.target === '_blank') mob_a.rel = 'noopener noreferrer';
                }
                // Close mobile menu on link click
                mob_a.addEventListener('click', () => mobileMenuNav.classList.add('hidden'));
                mobileMenuNav.appendChild(mob_a);
            });
        }

        if (footerYear) footerYear.textContent = new Date().getFullYear();
        // After applying config, update nav link styles based on current page
        updateActiveNavLink(currentPageKey);
    }

    function updateHeaderUI(user) {
         const isLoggedIn = user?.logged_in;
         if (loginButton) loginButton.classList.toggle('hidden', isLoggedIn);
         if (userInfo) {
             userInfo.classList.toggle('hidden', !isLoggedIn);
             userInfo.classList.toggle('flex', isLoggedIn); // Use flex for alignment
             // Update user-info link href to point to /dashboard path
             userInfo.href = '/dashboard'; // Changed from /#dashboard
         }

         if (isLoggedIn) {
             if (userNameDisplay) userNameDisplay.textContent = user.username || 'User';
             if (userAvatarDisplay) {
                 // Construct Discord avatar URL
                 userAvatarDisplay.src = user.user_id && user.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32`
                    : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?'; // Placeholder
                 userAvatarDisplay.onerror = () => { // Fallback if Discord avatar fails
                     userAvatarDisplay.src = 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
                 };
             }
             // Ensure logout button inside user-info is visible
             if (logoutButton) logoutButton.classList.remove('hidden');
         } else {
             // Hide logout button if not logged in
             if (logoutButton) logoutButton.classList.add('hidden');
         }
    }

    /**
     * Updates the active state styling for navigation links.
     * @param {string | null} activePageKey - The key of the currently active page.
     */
    function updateActiveNavLink(activePageKey) {
        // Select both desktop and mobile links that have a data-page-key attribute
        const navLinks = document.querySelectorAll('#main-navigation .main-nav-link[data-page-key], #mobile-menu .mobile-menu-link[data-page-key]');
        navLinks.forEach(link => {
            // Compare the link's dataset key with the active page key
            if (link.dataset.pageKey === activePageKey) {
                link.classList.add('text-orange-400', 'font-semibold'); // Add active styles
                link.classList.remove('text-gray-300'); // Remove default style
            } else {
                link.classList.remove('text-orange-400', 'font-semibold'); // Remove active styles
                link.classList.add('text-gray-300'); // Add default style
            }
        });
    }


    // --- Navigation (Routing based on URL Pathname and History API) ---

    /**
     * Parses the URL pathname, determines the target page and parameters,
     * checks access control, and triggers loading of the page content.
     */
    function runNavigation() {
        // Get the current path from the window location
        // This will reflect the path updated by history.replaceState if a redirect occurred
        const pathname = window.location.pathname;
        console.log(`[runNavigation] Running navigation for pathname: ${pathname}`);

        // Ensure initial checks are complete before proceeding
        if (!isInitialLoginCheckComplete || !isInitialConfigLoadComplete) {
            console.log("[runNavigation] Initial checks (login/config) not complete. Deferring navigation.");
            // This function will be called again once checks are complete by loadSiteConfigAndNavigate
            return;
        }

        // Split path into segments, removing empty strings from leading/trailing slashes
        // Example: '/products' -> ['products'], '/ticketdetail/123' -> ['ticketdetail', '123'], '/' -> []
        const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'index.html'); // Also filter out index.html

        // Determine page key and parameters
        // Default to 'home' for '/' or '/index.html'
        let rawPageName = pathSegments[0] || 'home';
        const pageKey = rawPageName.toLowerCase(); // Use lowercase key for matching pageRoutes

        const routeParams = {};
        // Extract ID parameter for detail pages (assuming format /pagekey/id)
        if ((pageKey === 'productdetail' || pageKey === 'ticketdetail') && pathSegments[1]) {
            routeParams.id = pathSegments[1];
            console.log(`[runNavigation] Extracted ID: ${routeParams.id} for page ${pageKey}`);
        }
        // Add more parameter extraction logic here if needed for other routes

        console.log(`[runNavigation] Path: '${pathname}', Parsed key: '${pageKey}', Params:`, routeParams);

        // --- Access Control ---
        const protectedRoutes = ['dashboard', 'tickets', 'ticketdetail']; // Use lowercase keys
        if (protectedRoutes.includes(pageKey) && !currentUser?.logged_in) {
            console.warn(`[runNavigation] Access denied to protected route '${pageKey}'. User not logged in.`);
            showPopupMessage(errorMessagePopup, "Please log in to view this page.", true);
            // Redirect to home page using pushState to avoid full reload if possible
            if (pageKey !== 'home') {
                console.log("[runNavigation] Redirecting unauthenticated user to /");
                history.pushState({ path: '/' }, '', '/'); // Update URL
                runNavigation(); // Trigger navigation to home recursively
            } else {
                // If already trying to access home, load it (should already be handled by initial call)
                loadPageContent('home', {});
            }
            return; // Stop further processing for this navigation attempt
        }

        // --- Load Page Content ---
        console.log(`[runNavigation] Proceeding to load content for page key: '${pageKey}'`);

        // Handle WebSocket connection based on page context
        const isTicketRelated = ['tickets', 'ticketdetail'].includes(pageKey);
        if (!isTicketRelated && socket) {
             console.log(`[runNavigation] Navigating away from ticket-related page, disconnecting socket.`);
             disconnectSocket();
        }
        // Ensure socket is connected ONLY if user is logged in and going to a ticket page
        if (isTicketRelated && currentUser?.logged_in) {
             console.log(`[runNavigation] Navigating to ticket-related page, ensuring socket is connected.`);
             ensureSocketConnected();
        }

        // Load the page content using the determined lowercase key and parameters
        loadPageContent(pageKey, routeParams);
    }

    // --- Page-Specific Functions ---
    // ... (fetchProducts, renderProductCard, handlePurchaseClick) ...
    // ... (fetchTickets, createTicketListItem, setupTicketFormListener) ...
    // ... (fetchTicketDetails, appendChatMessage, setupTicketDetailListeners) ...
    // ... (Dashboard functions: displayDashboardUserInfo, displayUserRoles, loadAdminDashboardData, loadSiteConfigForm, addHeaderLinkInput, loadProductManagementTable, setupDashboardListeners, setupAdminDashboardListeners, handleAddHeaderLinkButtonClick, handleAddProductButtonClick, handleSaveSiteConfig) ...
    // ... (Product Detail functions: fetchProductDetails, renderProductDetails, setupProductDetailListeners) ...
    // ... (Socket.IO Logic: connectSocket, ensureSocketConnected, setupSocketListeners, disconnectSocket) ...
    // ... (Modal and Context Menu Logic: showUserInfoModal, hideUserInfoModal, positionContextMenu, hideContextMenu, hideContextMenuOnClickOutside, showChatContextMenu, showTicketContextMenu) ...
    // ... (Context Menu Action Handlers: deleteChatMessage, closeTicket, reopenTicket, deleteTicket) ...
    // ... (Product Edit Modal Logic: openProductEditModal, toggleCustomHexInput, closeProductEditModal, handleSaveProduct, handleDeleteProduct) ...
    // ... (Logout Logic: handleLogout) ...

    // [NOTE: All the functions listed above as "..." remain unchanged from the previous version]
    // [Paste the full, unchanged code for those functions here]
    // Products Page Logic
        async function fetchProducts() {
            // Find elements within the currently loaded page content
            const productGrid = document.getElementById('product-grid');
            const productLoadingStatus = document.getElementById('product-loading-status');
            if (!productGrid || !productLoadingStatus) {
                console.warn("[fetchProducts] Product grid or status element not found in the loaded 'products' page content.");
                return;
            }
            productGrid.innerHTML = ''; // Clear previous products
            productLoadingStatus.textContent = 'Loading products...';
            productLoadingStatus.classList.remove('hidden');

            try {
                const response = await fetch(`${API_BASE_URL}/api/products`);
                if (!response.ok) throw new Error(`HTTP error fetching products: ${response.status}`);
                const products = await response.json();
                productLoadingStatus.classList.add('hidden'); // Hide loading status

                if (!products || products.length === 0) {
                    productGrid.innerHTML = `<p class="text-center text-gray-400 md:col-span-2 lg:col-span-3">No products available at this time.</p>`;
                } else {
                    // Render each product card into the grid
                    products.forEach(product => renderProductCard(product, productGrid));
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                productLoadingStatus.textContent = `Failed to load products: ${error.message}`;
                productLoadingStatus.classList.remove('hidden'); // Ensure error message is visible
                showPopupMessage(errorMessagePopup, `Error loading products: ${error.message}`, true);
            }
        }

        function renderProductCard(product, productGridElement) {
             if (!productGridElement || !product) return;

             const card = document.createElement('div');
             // Add base classes and product ID dataset
             card.className = `product-card flex flex-col`;
             card.dataset.productId = product._id;

             // Determine border style based on tagColor and customHex
             const tagColor = product.tagColor || 'gray';
             const customHex = product.customBorderHex;
             let borderClasses = '';
             let inlineStyle = '';
             let hoverStyleVar = '';

             if (tagColor === 'custom' && customHex && /^#[0-9A-F]{6}$/i.test(customHex)) {
                 borderClasses = 'custom-border';
                 inlineStyle = `border-color: ${customHex};`;
                 hoverStyleVar = `--custom-hover-shadow: 0 0 8px 1px ${customHex}99, 0 0 16px 4px ${customHex}66, 0 0 32px 8px ${customHex}33;`;
                 card.style.cssText = inlineStyle + hoverStyleVar;
                 card.classList.add(borderClasses);
             } else if (tagColor !== 'custom' && ['gray', 'orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor)) {
                 borderClasses = `card-gradient-border ${tagColor}-border`;
                 card.classList.add(...borderClasses.split(' '));
             } else {
                  borderClasses = `card-gradient-border gray-border`;
                  card.classList.add(...borderClasses.split(' '));
             }

             const displayTagColor = (tagColor === 'custom' && !customHex) ? 'gray' : tagColor;
             const tagBgClass = `bg-${displayTagColor}-500/20`;
             const tagTextClass = `text-${displayTagColor}-300`;

             let thumbnailElement = null;
             const placeholderDiv = document.createElement('div');
             placeholderDiv.className = 'product-thumbnail-placeholder';
             placeholderDiv.style.display = 'none';
             placeholderDiv.innerHTML = '<span>Image not found</span>';

             if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') {
                 thumbnailElement = document.createElement('img');
                 thumbnailElement.src = product.thumbnailUrl;
                 thumbnailElement.alt = `${product.name || 'Product'} thumbnail`;
                 thumbnailElement.className = 'product-thumbnail';
                 thumbnailElement.onerror = () => {
                     console.warn(`Failed to load image: ${product.thumbnailUrl}`);
                     if (thumbnailElement) thumbnailElement.style.display = 'none';
                     placeholderDiv.style.display = 'flex';
                 };
             } else {
                 placeholderDiv.style.display = 'flex';
                 thumbnailElement = null;
             }

             const innerDiv = document.createElement('div');
             innerDiv.className = 'product-card-inner';
             innerDiv.innerHTML = `
                 <div class="flex justify-between items-center mb-4">
                     <span class="${tagBgClass} ${tagTextClass} text-xs font-semibold px-2.5 py-0.5 rounded">${product.tag || 'PRODUCT'}</span>
                     </div>
                 <h3 class="text-xl font-semibold text-white mb-2 truncate">${product.name || 'Unnamed Product'}</h3>
                 <p class="text-3xl font-bold text-white mb-4">$${product.price?.toFixed(2) || 'N/A'}</p>
                 <ul class="text-sm text-gray-400 space-y-2 mb-6 flex-grow">
                     ${(product.features || []).map(feature => `<li class="flex items-center"><svg class="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> <span>${feature}</span></li>`).join('')}
                     ${!(product.features?.length > 0) ? '<li class="text-gray-500 italic">No features listed.</li>' : ''}
                 </ul>
                 <div class="mt-auto space-y-3 pt-4 border-t border-slate-700/50">
                     ${product.paymentLink ? `<button class="purchase-button w-full" data-product-id="${product._id}" data-payment-link="${product.paymentLink}">Pay with PayPal</button>` : '<button class="purchase-button w-full" disabled>Purchase Unavailable</button>'}
                     <a href="/productdetail/${product._id}" class="view-details-button spa-link block w-full bg-gray-600 hover:bg-gray-500 text-white text-center text-sm font-medium py-2 px-4 rounded-md transition duration-300" data-product-id="${product._id}">View Details</a>
                 </div>
             `; // Changed button to link

             if (thumbnailElement) card.appendChild(thumbnailElement);
             card.appendChild(placeholderDiv);
             card.appendChild(innerDiv);

             // Click listener now primarily handles purchase, navigation handled by link interception
             card.addEventListener('click', (event) => {
                 const purchaseButton = event.target.closest('.purchase-button');
                 if (purchaseButton) {
                     handlePurchaseClick(event);
                 }
                 // No navigation needed here anymore, the link handles it
             });

             productGridElement.appendChild(card);
        }

        function handlePurchaseClick(event) {
             event.stopPropagation();
             const button = event.target.closest('.purchase-button');
             if (!button || button.disabled) return;

             const productId = button.dataset.productId;
             const paymentLink = button.dataset.paymentLink;
             console.log(`Purchase clicked for product ID: ${productId}, Link/ID: ${paymentLink}`);

             if (paymentLink) {
                  showPopupMessage(paymentMessage, `Initiating purchase for product ${productId}... (Integration Required)`);
                  // Potentially redirect or open PayPal link here
                  // window.open(paymentLink, '_blank'); // Example if it's a direct link
             } else {
                  showPopupMessage(errorMessagePopup, 'Payment link is missing or invalid for this product.', true);
             }
        }

        // Tickets Page Logic
        async function fetchTickets() {
            console.log("[fetchTickets] Fetching tickets...");
            const userTicketView = document.getElementById('user-ticket-view');
            const moderatorManagementView = document.getElementById('moderator-management-view');
            const ticketListDiv = document.getElementById('ticket-list');
            const ticketListStatus = document.getElementById('ticket-list-status');
            const moderatorActiveTicketListDiv = document.getElementById('moderator-active-ticket-list');
            const moderatorActiveListStatus = document.getElementById('moderator-active-list-status');
            const moderatorArchivedTicketListDiv = document.getElementById('moderator-archived-ticket-list');
            const moderatorArchivedListStatus = document.getElementById('moderator-archived-list-status');

            if (!userTicketView || !moderatorManagementView || !ticketListDiv || !ticketListStatus || !moderatorActiveTicketListDiv || !moderatorActiveListStatus || !moderatorArchivedTicketListDiv || !moderatorArchivedListStatus) {
                console.error("[fetchTickets] One or more ticket list elements not found in loaded content. Aborting fetch.");
                if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: UI elements missing for ticket display.</div>`;
                return;
            }

             if (!currentUser?.logged_in) {
                 console.log("[fetchTickets] User not logged in. Displaying login prompt.");
                 ticketListStatus.textContent = "Please log in to view tickets.";
                 moderatorActiveListStatus.textContent = "";
                 moderatorArchivedListStatus.textContent = "";
                 ticketListDiv.innerHTML = ''; moderatorActiveTicketListDiv.innerHTML = ''; moderatorArchivedTicketListDiv.innerHTML = '';
                 userTicketView.classList.remove('hidden');
                 moderatorManagementView.classList.add('hidden');
                 // Hide create ticket form if not logged in
                 document.getElementById('create-ticket-form')?.closest('.ticket-card')?.classList.add('hidden');
                 return;
             } else {
                 // Ensure create ticket form is visible if logged in
                 document.getElementById('create-ticket-form')?.closest('.ticket-card')?.classList.remove('hidden');
             }

             ticketListStatus.textContent = "Loading tickets...";
             moderatorActiveListStatus.textContent = "Loading active tickets...";
             moderatorArchivedListStatus.textContent = "Loading archived tickets...";
             ticketListDiv.innerHTML = ''; moderatorActiveTicketListDiv.innerHTML = ''; moderatorArchivedTicketListDiv.innerHTML = '';

             const isMod = currentUser.is_moderator === true;
             console.log(`[fetchTickets] User moderator status: ${isMod}`);
             userTicketView.classList.toggle('hidden', isMod);
             moderatorManagementView.classList.toggle('hidden', !isMod);

             try {
                 const response = await fetch(`${API_BASE_URL}/api/tickets`, { credentials: 'include' });
                 if (!response.ok) {
                      if (response.status === 401 || response.status === 403) throw new Error("Authentication required to view tickets.");
                      else throw new Error(`HTTP error fetching tickets: ${response.status}`);
                 }
                 const tickets = await response.json();
                 console.log(`[fetchTickets] Received ${tickets.length} tickets.`);

                 ticketListStatus.textContent = ""; moderatorActiveListStatus.textContent = ""; moderatorArchivedListStatus.textContent = "";
                 let hasUserTickets = false; let hasActiveModTickets = false; let hasArchivedModTickets = false;

                 if (tickets.length === 0) {
                     if (isMod) {
                         moderatorActiveListStatus.textContent = "No active tickets found.";
                         moderatorArchivedListStatus.textContent = "No archived tickets found.";
                     } else {
                         ticketListStatus.textContent = "You have no support tickets.";
                     }
                 } else {
                     tickets.forEach(ticket => {
                         const item = createTicketListItem(ticket); // Use updated helper
                         if (isMod) {
                             if (ticket.status === 'open') {
                                 moderatorActiveTicketListDiv.appendChild(item); hasActiveModTickets = true;
                             } else {
                                 moderatorArchivedTicketListDiv.appendChild(item); hasArchivedModTickets = true;
                             }
                         } else {
                             ticketListDiv.appendChild(item); hasUserTickets = true;
                         }
                     });

                     if (isMod) {
                         if (!hasActiveModTickets) moderatorActiveListStatus.textContent = "No active tickets found.";
                         if (!hasArchivedModTickets) moderatorArchivedListStatus.textContent = "No archived tickets found.";
                     } else {
                         if (!hasUserTickets) ticketListStatus.textContent = "You have no support tickets.";
                     }
                 }
             } catch (error) {
                 console.error("[fetchTickets] Error fetching or processing tickets:", error);
                 const errorMsg = `Failed to load tickets: ${error.message}`;
                 ticketListStatus.textContent = errorMsg; moderatorActiveListStatus.textContent = errorMsg; moderatorArchivedListStatus.textContent = errorMsg;
                 showPopupMessage(errorMessagePopup, `Error fetching tickets: ${error.message}`, true);
             }
        }

        // UPDATED to create an <a> tag for navigation
        function createTicketListItem(ticket) {
            const link = document.createElement('a'); // Use link for navigation
            link.href = `/ticketdetail/${ticket._id}`; // Path-based URL
            link.classList.add('ticket-list-item', 'spa-link'); // Add base style and SPA identifier
            link.dataset.ticketId = ticket._id;
            link.dataset.ticketStatus = ticket.status;
            link.dataset.ticketSubject = ticket.subject || 'No Subject';

            const statusClass = ticket.status === 'open' ? 'status-open' : 'status-closed';
            const statusText = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'N/A';
            const dateOpened = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Date N/A';
            const shortId = ticket._id ? ticket._id.slice(-6) : 'ID N/A';
            const subject = ticket.subject || 'No Subject';
            const username = ticket.username || 'Unknown User'; // Username of the ticket creator

            link.innerHTML = `
                <div>
                    <p class="font-medium text-white">#${shortId}: ${subject}</p>
                    <p class="text-xs text-gray-400">User: ${username} | Opened: ${dateOpened}</p>
                </div>
                <span class="${statusClass}">${statusText}</span>`;

            // Click listener is now handled globally by the link interceptor
            // Context menu listener remains, attached to the link itself
            link.addEventListener('contextmenu', showTicketContextMenu);

            return link;
        }

        function setupTicketFormListener() {
            const createTicketForm = document.getElementById('create-ticket-form');
            const ticketSubjectInput = document.getElementById('ticket-subject');
            const ticketMessageInput = document.getElementById('ticket-message-input');
            const createTicketStatus = document.getElementById('create-ticket-status');
            const createTicketButton = document.getElementById('create-ticket-button');

            if (!createTicketForm || !ticketSubjectInput || !ticketMessageInput || !createTicketStatus || !createTicketButton) {
                console.warn("[setupTicketFormListener] Create ticket form elements not found in loaded content.");
                return;
            }

            createTicketForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                // Ensure user is logged in before submitting
                if (!currentUser?.logged_in) {
                    showPopupMessage(errorMessagePopup, "Please log in to submit a ticket.", true);
                    return;
                }

                const subject = ticketSubjectInput.value.trim();
                const message = ticketMessageInput.value.trim();
                createTicketStatus.textContent = '';
                createTicketStatus.className = 'h-6 text-sm mt-4 mb-4 text-center'; // Reset classes

                if (!subject || !message) {
                    createTicketStatus.textContent = 'Please fill out both subject and message.';
                    createTicketStatus.classList.add('error', 'text-red-400'); // Add error class
                    return;
                }

                createTicketButton.disabled = true;
                createTicketButton.textContent = 'Submitting...';

                try {
                    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject, message }),
                        credentials: 'include' // Send cookies with the request
                    });
                    if (!response.ok) {
                        let errorData = { error: `HTTP error! status: ${response.status}` };
                        try { errorData = await response.json(); } catch (e) { /* Ignore parsing error */ }
                        throw new Error(errorData.error || `Failed to create ticket.`);
                    }
                    // Ticket submitted successfully
                    createTicketStatus.textContent = 'Ticket submitted successfully!';
                    createTicketStatus.classList.add('success', 'text-green-400'); // Add success class
                    createTicketForm.reset(); // Clear the form
                    // Refresh the ticket list if we are still on the tickets page
                    if (currentPageKey === 'tickets') {
                       console.log("Ticket created, refreshing ticket list.");
                       await fetchTickets(); // Reload the list to show the new ticket
                    }
                    showPopupMessage(ticketMessagePopup, 'Ticket submitted successfully!'); // Show popup confirmation
                } catch (error) {
                    console.error('Error creating ticket:', error);
                    createTicketStatus.textContent = `Error: ${error.message}`;
                    createTicketStatus.classList.add('error', 'text-red-400'); // Add error class
                    showPopupMessage(errorMessagePopup, `Error submitting ticket: ${error.message}`, true);
                } finally {
                    createTicketButton.disabled = false;
                    createTicketButton.textContent = 'Submit Ticket';
                }
            });
        }

        // Ticket Detail Page Logic
        async function fetchTicketDetails(ticketId) {
             console.log(`[fetchTicketDetails] Fetching details for ticket: ${ticketId}`);
             const chatMessagesDiv = document.getElementById('chat-messages');
             const ticketDetailSubject = document.getElementById('ticket-detail-subject');
             const chatInputForm = document.getElementById('chat-input-form'); // Get form for enabling/disabling

             if (!chatMessagesDiv || !ticketDetailSubject || !chatInputForm) {
                 console.error("[fetchTicketDetails] Required chat elements (messages div, subject, input form) not found in loaded content.");
                 if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Could not display ticket details. UI elements missing.</div>`;
                 return;
             }
             if (!currentUser?.logged_in) {
                 console.warn("[fetchTicketDetails] User not logged in, cannot fetch details.");
                 // Redirect to tickets page if not logged in
                 history.pushState({ path: '/tickets' }, '', '/tickets');
                 runNavigation();
                 return;
             }
             // Ensure socket is connected now that we know user is logged in and on the right page
             ensureSocketConnected();

             // Initial state while loading
             chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Loading messages...</p>';
             ticketDetailSubject.textContent = `Loading Ticket #${ticketId.slice(-6)}...`;
             chatInputForm.querySelector('input').disabled = true; // Disable input while loading
             chatInputForm.querySelector('button').disabled = true;

             try {
                 const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, { credentials: 'include' });
                 if (!response.ok) {
                     if (response.status === 401 || response.status === 403) throw new Error("Access Denied: You may not have permission to view this ticket.");
                     if (response.status === 404) throw new Error("Ticket not found.");
                     throw new Error(`HTTP error fetching ticket details: ${response.status}`);
                 }
                 const ticket = await response.json();
                 console.log(`[fetchTicketDetails] Received details for ticket: ${ticketId}`, ticket);

                 // Update UI with ticket details
                 ticketDetailSubject.textContent = ticket.subject || `Ticket #${ticketId.slice(-6)}`;
                 chatMessagesDiv.innerHTML = ''; // Clear loading message

                 if (ticket.messages && ticket.messages.length > 0) {
                     ticket.messages.forEach(msg => appendChatMessage(msg, chatMessagesDiv));
                 } else {
                     chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No messages in this ticket yet. Type below to start the conversation.</p>';
                 }

                 // Enable chat input based on ticket status
                 const isTicketOpen = ticket.status === 'open';
                 chatInputForm.querySelector('input').disabled = !isTicketOpen;
                 chatInputForm.querySelector('button').disabled = !isTicketOpen;
                 if (!isTicketOpen) {
                     chatInputForm.querySelector('input').placeholder = 'This ticket is closed.';
                 } else {
                     chatInputForm.querySelector('input').placeholder = 'Type your message...';
                 }


                 // Join the Socket.IO room for this ticket
                 if (socket?.connected) {
                     console.log(`[fetchTicketDetails] Emitting join_ticket_room for ticket: ${ticketId}`);
                     socket.emit('join_ticket_room', { ticket_id: ticketId });
                 } else {
                     console.warn("[fetchTicketDetails] Socket not connected when attempting to join ticket room.");
                     // Attempt to connect if not already (ensureSocketConnected should handle this)
                 }

             } catch (error) {
                 console.error("[fetchTicketDetails] Error fetching ticket details:", error);
                 chatMessagesDiv.innerHTML = `<p class="text-red-400 text-center py-4">Error loading messages: ${error.message}</p>`;
                 ticketDetailSubject.textContent = `Error Loading Ticket`;
                 chatInputForm.querySelector('input').disabled = true; // Keep disabled on error
                 chatInputForm.querySelector('button').disabled = true;
                 chatInputForm.querySelector('input').placeholder = 'Error loading ticket.';
                 showPopupMessage(errorMessagePopup, `Error loading ticket: ${error.message}`, true);
                 // Redirect back to tickets list if ticket not found or access denied
                 if (error.message.includes("not found") || error.message.includes("Access Denied")) {
                     setTimeout(() => {
                         history.pushState({ path: '/tickets' }, '', '/tickets');
                         runNavigation();
                     }, 3000);
                 }
             }
        }

        function appendChatMessage(data, chatMessagesDivElement) {
             if (!chatMessagesDivElement) {
                 console.warn("Attempted to append chat message, but container element not found.");
                 return;
             }
             // Remove any placeholder messages (like "Loading..." or "No messages...")
             const placeholderMsg = chatMessagesDivElement.querySelector('p.text-gray-500, p.text-red-400');
             if (placeholderMsg) placeholderMsg.remove();

             const messageElement = document.createElement('div');
             messageElement.classList.add('chat-message');
             // Add data attributes for context menu functionality
             messageElement.dataset.timestamp = data.timestamp; // ISO format timestamp
             messageElement.dataset.senderId = data.sender_id;

             // Format timestamp for display (e.g., HH:MM)
             const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
             const username = data.sender_username || data.username || 'System'; // Prefer sender_username if available
             // Sanitize username and text to prevent basic HTML injection
             const safeUsername = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
             const safeText = (data.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");

             // Create username span (clickable for mods)
             const usernameSpan = document.createElement('span');
             usernameSpan.classList.add('username');
             usernameSpan.textContent = `${safeUsername}:`;
             // Add click listener only if the current user is a moderator
             if (currentUser?.is_moderator) {
                 usernameSpan.style.cursor = 'pointer'; // Indicate clickability
                 usernameSpan.addEventListener('click', () => showUserInfoModal(data.sender_id, safeUsername));
             }

             messageElement.appendChild(usernameSpan);
             // Append the actual message text (needs space after username)
             messageElement.append(` ${safeText} `); // Use append to add text node

             // Create and append timestamp span
             const timestampSpan = document.createElement('span');
             timestampSpan.classList.add('timestamp');
             timestampSpan.textContent = timestamp;
             messageElement.appendChild(timestampSpan);

             // Add context menu listener only if the current user is a moderator
             if (currentUser?.is_moderator) {
                messageElement.addEventListener('contextmenu', showChatContextMenu);
             }

             chatMessagesDivElement.appendChild(messageElement);
             // Scroll to the bottom to show the latest message
             chatMessagesDivElement.scrollTop = chatMessagesDivElement.scrollHeight;
        }

        function setupTicketDetailListeners() {
            const chatInputForm = document.getElementById('chat-input-form');
            const chatInput = document.getElementById('chat-input');

            if (!chatInputForm || !chatInput) {
                console.warn("[setupTicketDetailListeners] Chat form elements not found in loaded content.");
                return;
            }

            // Remove previous listener if any to avoid duplicates
            chatInputForm.removeEventListener('submit', handleChatSubmit);
            // Add the event listener
            chatInputForm.addEventListener('submit', handleChatSubmit);
        }
        // Define the handler function separately to allow removal
        function handleChatSubmit(event) {
             event.preventDefault();
             const chatInput = document.getElementById('chat-input'); // Get input element again
             if (!chatInput) return; // Should not happen if form exists

             const messageText = chatInput.value.trim();
             if (messageText && socket?.connected && currentTicketId) {
                 console.log(`[Chat Submit] Sending message to ticket ${currentTicketId}: "${messageText}"`);
                 // Emit message to server via Socket.IO
                 socket.emit('send_message', { ticket_id: currentTicketId, text: messageText });
                 chatInput.value = ''; // Clear the input field after sending
             } else if (!socket?.connected) {
                 showPopupMessage(errorMessagePopup, 'Cannot send message: Not connected to chat server.', true);
             } else if (!currentTicketId) {
                 showPopupMessage(errorMessagePopup, 'Cannot send message: No active ticket selected.', true);
             } else if (!messageText) {
                  // Optionally show a message or just do nothing for empty input
                  // showPopupMessage(errorMessagePopup, 'Cannot send an empty message.', true);
             }
        }


        // Dashboard Page Logic
        function displayDashboardUserInfo() {
            const nameEl = document.getElementById('dashboard-user-name');
            const avatarEl = document.getElementById('dashboard-user-avatar');
            if (nameEl && avatarEl && currentUser?.logged_in) {
                 nameEl.textContent = currentUser.username || 'User';
                 avatarEl.src = currentUser.user_id && currentUser.avatar
                    ? `https://cdn.discordapp.com/avatars/${currentUser.user_id}/${currentUser.avatar}.png?size=64`
                    : 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?';
                 avatarEl.onerror = () => { avatarEl.src = 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?'; };
            } else if (!nameEl || !avatarEl) {
                 console.warn("[displayDashboardUserInfo] Name or Avatar element not found in dashboard content.");
            }
        }

        function displayUserRoles(roles) {
            const rolesContainer = document.getElementById('dashboard-user-roles');
            if (!rolesContainer) {
                console.warn('[displayUserRoles] Container #dashboard-user-roles not found in loaded dashboard content!');
                return;
            }
            rolesContainer.innerHTML = ''; // Clear previous roles

            if (roles && Array.isArray(roles) && roles.length > 0) {
                // Sort roles based on position (highest first) if position data is available
                const sortedRoles = roles.sort((a, b) => (b.position || 0) - (a.position || 0));

                sortedRoles.forEach(role => {
                    const roleElement = document.createElement('span');
                    roleElement.classList.add('role-span'); // Use the class defined in index.html CSS

                    // Determine background and text color based on role color
                    let hexColor = '#9CA3AF'; // Default gray if color is 0 or missing
                    if (role.color && role.color !== 0) {
                        // Convert decimal color to hex
                        hexColor = '#' + role.color.toString(16).padStart(6, '0');
                    }

                    // Basic luminance check to determine text color (black or white)
                    const r = parseInt(hexColor.slice(1, 3), 16);
                    const g = parseInt(hexColor.slice(3, 5), 16);
                    const b = parseInt(hexColor.slice(5, 7), 16);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    const textColorClass = luminance > 0.5 ? 'text-black' : 'text-white'; // Use black text on light backgrounds

                    roleElement.textContent = role.name || `Role ${role.id}`; // Display role name
                    roleElement.style.backgroundColor = hexColor; // Set background color
                    roleElement.classList.add(textColorClass); // Add text color class

                    rolesContainer.appendChild(roleElement);
                });
            } else {
                rolesContainer.innerHTML = '<p class="text-gray-400 text-sm w-full">No specific roles assigned.</p>';
            }
        }

        async function loadAdminDashboardData() {
            console.log("[loadAdminDashboardData] Loading admin-specific sections into dashboard...");
            const adminSectionsContainer = document.getElementById('admin-dashboard-sections');
            if (!adminSectionsContainer) {
                console.warn("[loadAdminDashboardData] Admin sections container not found in dashboard content.");
                return;
            }
            // Double-check moderator status before showing admin sections
            if (!currentUser?.is_moderator) {
                 adminSectionsContainer.classList.add('hidden'); // Ensure it's hidden
                 return;
            }
            adminSectionsContainer.classList.remove('hidden'); // Make admin sections visible

            // Load data for the admin sections
            await loadSiteConfigForm();
            await loadProductManagementTable();
            // Setup listeners specific to the admin controls
            setupAdminDashboardListeners();
        }

        async function loadSiteConfigForm() {
            const siteConfigForm = document.getElementById('site-config-form');
            const configSiteTitleInput = document.getElementById('config-site-title');
            const configSiteIconUrlInput = document.getElementById('config-site-icon-url');
            const configHeaderLinksContainer = document.getElementById('config-header-links-container');
            const configSaveStatus = document.getElementById('config-save-status');

            if (!siteConfigForm || !configSiteTitleInput || !configHeaderLinksContainer || !configSaveStatus || !configSiteIconUrlInput) {
                 console.warn("[loadSiteConfigForm] Site config form elements not found in loaded dashboard content."); return;
            }
            // Ensure global siteConfig state is loaded before populating
            if (!siteConfig) {
                console.warn("[loadSiteConfigForm] Global siteConfig state not available. Cannot populate form.");
                configSaveStatus.textContent = "Error: Config data not loaded.";
                configSaveStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
                return;
            }
            // Populate form fields with current config values
            configSiteTitleInput.value = siteConfig.siteTitle || '';
            configSiteIconUrlInput.value = siteConfig.siteIconUrl || '';
            configHeaderLinksContainer.innerHTML = ''; // Clear existing link inputs
            // Add inputs for each existing header link
            (siteConfig.headerLinks || []).forEach((link) => {
                addHeaderLinkInput(link.name, link.href, link.target);
            });
            configSaveStatus.textContent = ''; // Clear any previous status message
            configSaveStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status class
        }

        function addHeaderLinkInput(name = '', href = '', target = '') {
            const configHeaderLinksContainer = document.getElementById('config-header-links-container');
            if (!configHeaderLinksContainer) {
                 console.warn("[addHeaderLinkInput] Header links container not found."); return;
            }

            const linkGroup = document.createElement('div');
            linkGroup.className = 'link-group flex items-center space-x-2 mb-2';
            // Sanitize values before inserting into HTML attributes
            const safeName = name.replace(/"/g, '&quot;');
            const safeHref = href.replace(/"/g, '&quot;');
            const safeTarget = target.replace(/"/g, '&quot;');

            linkGroup.innerHTML = `
                 <input type="text" placeholder="Link Name" value="${safeName}" class="link-name config-link-name flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
                 <input type="text" placeholder="Link Path or URL" value="${safeHref}" class="link-href config-link-href flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
                 <input type="text" placeholder="Target (e.g., _blank)" value="${safeTarget || ''}" class="link-target config-link-target flex-none w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400">
                 <button type="button" class="remove-link-button bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex-shrink-0" title="Remove Link">X</button>
             `;
             // Add event listener to the remove button
             linkGroup.querySelector('.remove-link-button').addEventListener('click', () => linkGroup.remove());
             configHeaderLinksContainer.appendChild(linkGroup);
        }

        async function loadProductManagementTable() {
             const productListTableBody = document.getElementById('product-list-tbody');
             const productListStatus = document.getElementById('product-list-status');
             if (!productListTableBody || !productListStatus) {
                 console.warn("[loadProductManagementTable] Product list table elements not found in loaded content."); return;
             }
             productListTableBody.innerHTML = ''; // Clear previous rows
             productListStatus.textContent = 'Loading products...';
             productListStatus.classList.remove('hidden'); // Show loading status

             try {
                 // Fetch all products (same endpoint as the public products page)
                 const response = await fetch(`${API_BASE_URL}/api/products`);
                 if (!response.ok) throw new Error(`HTTP error fetching products for admin: ${response.status}`);
                 const products = await response.json();
                 productListStatus.classList.add('hidden'); // Hide loading status

                 if (!products || products.length === 0) {
                     productListStatus.textContent = 'No products found.';
                     productListStatus.classList.remove('hidden'); // Show 'No products' message
                 } else {
                     // Populate the table body with product rows
                     products.forEach(product => {
                         const row = productListTableBody.insertRow();
                         row.innerHTML = `
                             <td class="px-4 py-3">${product.name || 'N/A'}</td>
                             <td class="px-4 py-3">$${product.price?.toFixed(2) || 'N/A'}</td>
                             <td class="px-4 py-3">${product.tag || '-'}</td>
                             <td class="px-4 py-3 actions">
                                 <button class="edit-btn" data-product-id="${product._id}">Edit</button>
                                 <button class="delete-btn" data-product-id="${product._id}">Delete</button>
                             </td>
                         `;
                         // Add event listeners to the buttons in this row
                         row.querySelector('.edit-btn').addEventListener('click', () => openProductEditModal(product));
                         row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteProduct(product._id, product.name));
                     });
                 }
             } catch (error) {
                 console.error("Error loading products for admin table:", error);
                 productListStatus.textContent = `Failed to load products: ${error.message}`;
                 productListStatus.classList.remove('hidden'); // Show error message
                 showPopupMessage(errorMessagePopup, `Error loading products for admin: ${error.message}`, true);
             }
        }

        function setupDashboardListeners() {
            const dbLogoutButton = document.getElementById('dashboard-logout-button');
            if (dbLogoutButton) {
                // Remove potential previous listener before adding
                dbLogoutButton.removeEventListener('click', handleLogout);
                dbLogoutButton.addEventListener('click', handleLogout);
            } else {
                console.warn("[setupDashboardListeners] Dashboard logout button not found in loaded content.");
            }
            // Add listeners for other non-admin dashboard elements if needed
        }

        function setupAdminDashboardListeners() {
            console.log("[setupAdminDashboardListeners] Setting up listeners for admin controls...");
            const siteConfigForm = document.getElementById('site-config-form');
            if (siteConfigForm) {
                // Use named function for removal if needed, or ensure this runs only once per load
                siteConfigForm.removeEventListener('submit', handleSaveSiteConfig); // Prevent duplicates
                siteConfigForm.addEventListener('submit', handleSaveSiteConfig);
            } else { console.warn("Site config form not found for listener setup."); }

            const addLinkBtn = document.getElementById('add-header-link-button');
            if (addLinkBtn) {
                addLinkBtn.removeEventListener('click', handleAddHeaderLinkButtonClick); // Prevent duplicates
                addLinkBtn.addEventListener('click', handleAddHeaderLinkButtonClick);
            } else { console.warn("Add header link button not found for listener setup."); }

            const addProductBtn = document.getElementById('add-product-button');
            if (addProductBtn) {
                addProductBtn.removeEventListener('click', handleAddProductButtonClick); // Prevent duplicates
                addProductBtn.addEventListener('click', handleAddProductButtonClick);
            } else { console.warn("Add product button not found for listener setup."); }

            // Listeners for product table buttons are added dynamically in loadProductManagementTable
        }
        // Handler functions called by listeners
        function handleAddHeaderLinkButtonClick() { addHeaderLinkInput(); }
        function handleAddProductButtonClick() { openProductEditModal(); /* Open modal for adding */ }


        async function handleSaveSiteConfig(event) {
             event.preventDefault();
             const siteConfigForm = document.getElementById('site-config-form');
             const saveConfigButton = document.getElementById('save-config-button');
             const configSaveStatus = document.getElementById('config-save-status');
             const configSiteTitleInput = document.getElementById('config-site-title');
             const configSiteIconUrlInput = document.getElementById('config-site-icon-url');
             const configHeaderLinksContainer = document.getElementById('config-header-links-container');

             if (!siteConfigForm || !saveConfigButton || !configSaveStatus || !configSiteTitleInput || !configSiteIconUrlInput || !configHeaderLinksContainer) {
                  console.error("Cannot save site config, one or more form elements missing in the current DOM.");
                  showPopupMessage(errorMessagePopup, "Error saving config: UI elements missing.", true);
                  return;
             }

             saveConfigButton.disabled = true; saveConfigButton.textContent = 'Saving...';
             configSaveStatus.textContent = ''; configSaveStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status

             // Construct the updated config object from form inputs
             const updatedConfig = {
                  siteTitle: configSiteTitleInput.value.trim(),
                  siteIconUrl: configSiteIconUrlInput.value.trim() || null, // Allow empty URL
                  headerLinks: []
              };
             // Collect header links from the dynamically added inputs
             configHeaderLinksContainer.querySelectorAll('.link-group').forEach(group => {
                 const nameInput = group.querySelector('.link-name');
                 const hrefInput = group.querySelector('.link-href');
                 const targetInput = group.querySelector('.link-target');
                 // Only add link if both name and href are provided
                 if (nameInput?.value.trim() && hrefInput?.value.trim()) {
                     // Basic validation: Ensure internal links start with '/' if not external
                     let hrefVal = hrefInput.value.trim();
                     if (!hrefVal.startsWith('http') && !hrefVal.startsWith('/') && hrefVal !== '#') {
                         hrefVal = '/' + hrefVal; // Prepend slash for relative paths
                     }
                     updatedConfig.headerLinks.push({
                         name: nameInput.value.trim(),
                         href: hrefVal,
                         target: targetInput?.value.trim() || null // Allow empty target
                     });
                 }
             });

             console.log("Saving site config:", updatedConfig);

             try {
                 // Send PUT request to the backend API
                 const response = await fetch(`${API_BASE_URL}/api/config`, {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(updatedConfig),
                     credentials: 'include' // Important for authentication
                 });
                 const result = await response.json(); // Parse the response from the backend
                 if (!response.ok) {
                     // Throw an error if the backend returned an error status
                     throw new Error(result.error || `HTTP error! status: ${response.status}`);
                 }

                 // Update the global siteConfig state with the saved data
                 siteConfig = result;
                 // Re-apply the configuration to update the UI immediately (e.g., header links)
                 applySiteConfig(siteConfig);
                 configSaveStatus.textContent = 'Configuration saved successfully!';
                 configSaveStatus.classList.add('text-green-400'); // Success style
                 showPopupMessage(configMessagePopup, 'Site configuration saved!'); // Show confirmation popup

             } catch (error) {
                 console.error("Error saving site config:", error);
                 configSaveStatus.textContent = `Error: ${error.message}`;
                 configSaveStatus.classList.add('text-red-400'); // Error style
                 showPopupMessage(errorMessagePopup, `Failed to save config: ${error.message}`, true);
             } finally {
                 // Re-enable the save button regardless of success or failure
                 saveConfigButton.disabled = false;
                 saveConfigButton.textContent = 'Save Configuration';
             }
        }

        // Product Detail Page Logic
        async function fetchProductDetails(productId) {
            console.log(`[fetchProductDetails] Fetching details for product ID: ${productId}`);
            const productDetailLoading = document.getElementById('product-detail-loading');
            const productDetailContainer = document.getElementById('product-detail-container');

            if (!productDetailLoading || !productDetailContainer) {
                 console.error("[fetchProductDetails] Loading indicator or detail container not found in loaded content.");
                 if(pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error displaying product details: UI elements missing.</div>`;
                 return;
            }

            productDetailLoading.classList.remove('hidden'); // Show loading indicator
            productDetailContainer.classList.add('hidden'); // Hide main content

            try {
                // Fetch product details from the API
                const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error("Product not found.");
                    throw new Error(`HTTP error fetching product details: ${response.status}`);
                }
                const productData = await response.json(); // Parse the JSON response
                console.log("[fetchProductDetails] Received product data:", productData);

                // Render the fetched data onto the page
                renderProductDetails(productData);

                // Hide loading indicator and show the main content
                productDetailLoading.classList.add('hidden');
                productDetailContainer.classList.remove('hidden');

            } catch (error) {
                console.error("Error fetching product details:", error);
                productDetailLoading.textContent = `Error loading product: ${error.message}`;
                productDetailLoading.classList.remove('hidden'); // Keep showing the error message
                productDetailContainer.classList.add('hidden'); // Keep content hidden
                showPopupMessage(errorMessagePopup, `Error loading product: ${error.message}`, true);
                // Redirect back to products list if the product wasn't found
                if (error.message.includes("not found")) {
                     setTimeout(() => {
                         history.pushState({ path: '/products' }, '', '/products');
                         runNavigation();
                     }, 3000);
                }
            }
        }

        function renderProductDetails(product) {
             if (!product) {
                 console.warn("renderProductDetails called with null product data.");
                 return;
             }
             // Get references to all the elements that need updating
             const elements = {
                 image: document.getElementById('product-detail-image'),
                 name: document.getElementById('product-detail-name'),
                 price: document.getElementById('product-detail-price'),
                 rating: document.getElementById('product-detail-rating'), // Span for stars
                 stock: document.getElementById('product-detail-stock'),
                 descContainer: document.getElementById('product-detail-description-container'),
                 description: document.getElementById('product-detail-description'),
                 sellerAvatar: document.getElementById('seller-avatar'), // Placeholder for now
                 sellerName: document.getElementById('seller-name'),
                 sellerEstablished: document.getElementById('seller-established'),
                 sellerReviewScore: document.getElementById('seller-review-score'), // Text describing score
                 reviewsList: document.getElementById('product-reviews-list'),
                 openTicketLink: document.getElementById('product-detail-open-ticket') // Get ticket link
             };

             // Basic check if all elements were found
             const missingElements = Object.entries(elements).filter(([key, el]) => !el);
             if (missingElements.length > 0) {
                 console.error(`Error rendering product details: Missing elements - ${missingElements.map(([key]) => key).join(', ')}`);
                 if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error displaying product details: UI structure mismatch.</div>`;
                 return;
             }

             // --- Populate Elements ---
             elements.image.src = product.thumbnailUrl || 'https://placehold.co/600x400/374151/9ca3af?text=No+Image';
             elements.image.alt = product.name ? `${product.name} Image` : 'Product Image';
             elements.image.onerror = () => { elements.image.src = 'https://placehold.co/600x400/374151/9ca3af?text=No+Image'; }; // Fallback on error

             elements.name.textContent = product.name || 'Product Name Unavailable';
             elements.price.textContent = product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable';

             // Render star rating
             const ratingValue = Math.round(product.averageRating ?? 5); // Use averageRating from API, default 5
             elements.rating.innerHTML = `${'★'.repeat(ratingValue)}${'☆'.repeat(5 - ratingValue)}`;
             elements.rating.title = `${product.averageRating?.toFixed(1) || '5.0'} stars (${product.reviewCount || 0} reviews)`; // Tooltip

             // Display stock (using placeholder value for now)
             const stockValue = product.stock ?? 6; // Use stock from API if available, else default
             elements.stock.textContent = `${stockValue} in stock`; // Placeholder

             // Display description if available
             if (product.description) {
                elements.description.textContent = product.description;
                elements.descContainer.classList.remove('hidden'); // Show the description section
             } else {
                elements.description.textContent = 'No description provided.';
                // Optionally hide the description section if empty:
                // elements.descContainer.classList.add('hidden');
             }

             // Seller Info (using placeholders/defaults for now)
             elements.sellerName.textContent = product.sellerName || 'ShilletteFN'; // Use sellerName from API or default
             elements.sellerEstablished.textContent = product.sellerEstablishedDate
                 ? `Established ${formatTimeAgo(product.sellerEstablishedDate)}` // Format date if available
                 : 'Established several months ago'; // Default text
             elements.sellerReviewScore.textContent = `The seller has an average review score of ${product.averageRating?.toFixed(1) || '5.0'} stars out of 5`; // Use averageRating

             // Update the "Open a ticket" link href to point to the tickets page path
             elements.openTicketLink.href = '/tickets';

             // --- Render Reviews ---
             elements.reviewsList.innerHTML = ''; // Clear loading/previous reviews
             const reviews = product.reviews || []; // Use reviews array from API
             if (reviews.length > 0) {
                 reviews.forEach(review => {
                     const reviewCard = document.createElement('div');
                     reviewCard.className = 'review-card'; // Use class from index.html CSS
                     const reviewRating = review.rating ?? 5; // Default to 5 if missing
                     const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : 'recently';
                     const reviewerName = review.username || 'Verified customer'; // Use username from review data
                     // Sanitize review text
                     const safeReviewText = (review.text || 'No review text provided.').replace(/</g, "&lt;").replace(/>/g, "&gt;");

                     reviewCard.innerHTML = `
                         <div class="flex justify-between items-center mb-2">
                             <span class="text-xs text-green-400 font-medium">Verified purchase</span>
                             <span class="star-rating text-sm" title="${reviewRating} stars">${'★'.repeat(reviewRating)}${'☆'.repeat(5 - reviewRating)}</span>
                         </div>
                         <p class="text-sm text-gray-300 mb-1 italic">${safeReviewText}</p>
                         <p class="text-xs text-gray-500">Reviewed by ${reviewerName} on ${reviewDate}</p>
                     `;
                     elements.reviewsList.appendChild(reviewCard);
                 });
             } else {
                 // Display message if no reviews are available
                 elements.reviewsList.innerHTML = '<p class="text-gray-400 md:col-span-2 lg:col-span-3">No reviews available for this product yet.</p>';
             }
        }

        function setupProductDetailListeners() {
            const buyNowButton = document.getElementById('product-detail-buy-now');
            const addBasketButton = document.getElementById('product-detail-add-basket');
            const quantityDecrease = document.getElementById('quantity-decrease');
            const quantityIncrease = document.getElementById('quantity-increase');
            const quantityInput = document.getElementById('quantity-input');
            // const openTicketLink = document.getElementById('product-detail-open-ticket'); // Link navigation handled globally

            // --- Add Listeners ---
            if (buyNowButton) {
                buyNowButton.addEventListener('click', () => {
                    console.log("Buy Now clicked");
                    // TODO: Implement actual purchase flow (e.g., redirect to payment)
                    showPopupMessage(paymentMessage, "Buy Now functionality not yet implemented.");
                });
            } else { console.warn("Buy Now button not found."); }

            if (addBasketButton) {
                addBasketButton.addEventListener('click', () => {
                    console.log("Add to Basket clicked");
                    const qty = parseInt(quantityInput?.value) || 1;
                    // TODO: Implement basket functionality
                    showPopupMessage(paymentMessage, `Added ${qty} item(s) to basket (feature not fully implemented).`);
                });
            } else { console.warn("Add Basket button not found."); }

            // Quantity selector listeners
            if (quantityDecrease && quantityInput) {
                quantityDecrease.addEventListener('click', () => {
                    let currentQuantity = parseInt(quantityInput.value) || 1;
                    if (currentQuantity > 1) { // Prevent going below 1
                        quantityInput.value = currentQuantity - 1;
                    }
                });
            } else { console.warn("Quantity decrease button or input not found."); }

            if (quantityIncrease && quantityInput) {
                 quantityIncrease.addEventListener('click', () => {
                     let currentQuantity = parseInt(quantityInput.value) || 0;
                     quantityInput.value = currentQuantity + 1; // Allow increasing quantity
                 });
            } else { console.warn("Quantity increase button or input not found."); }

            // Click listener for open ticket link is handled globally by the link interceptor
        }


    // --- Socket.IO Logic ---
    function connectSocket(ticketIdToJoin = null) {
         // Check if socket exists and is already connected
         if (socket?.connected) {
             // If already connected and trying to join the *same* ticket room we are viewing, re-join
             if (ticketIdToJoin && currentPageKey === 'ticketdetail' && currentTicketId === ticketIdToJoin) {
                 console.log(`[connectSocket] Socket already connected, re-joining room: ${ticketIdToJoin}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
             } else {
                 console.log(`[connectSocket] Socket already connected. Current page: ${currentPageKey}, Ticket ID: ${currentTicketId}. Not joining room ${ticketIdToJoin || 'N/A'}.`);
             }
             return; // Don't create a new connection
         }

         console.log(`[connectSocket] Attempting to connect WebSocket to ${SOCKET_URL}... (Potential room join: ${ticketIdToJoin || 'none'})`);
         // Disconnect previous instance if it exists but isn't connected properly
         if (socket) { socket.disconnect(); socket = null; }

         // Create new Socket.IO connection instance
         // `withCredentials: true` is crucial for sending session cookies
         socket = io(SOCKET_URL, {
             reconnectionAttempts: 3, // Limit reconnection attempts
             withCredentials: true
         });

         // --- Socket Event Handlers ---
         socket.on('connect', () => {
             console.log('[Socket Connect] WebSocket connected successfully. Socket ID:', socket.id);
             // If a ticket ID was provided and we are on the detail page for it, join the room
             if (ticketIdToJoin && currentPageKey === 'ticketdetail' && currentTicketId === ticketIdToJoin) {
                 console.log(`[Socket Connect] Joining room post-connect: ${ticketIdToJoin}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
             }
             // Setup listeners for messages, errors, etc., once connected
             setupSocketListeners();
         });

         socket.on('disconnect', (reason) => {
             console.warn('[Socket Disconnect] WebSocket disconnected. Reason:', reason);
             // Nullify the socket instance so ensureSocketConnected tries to reconnect next time
             socket = null;
             // Optionally show a message to the user
             // showPopupMessage(errorMessagePopup, 'Chat connection lost. Attempting to reconnect...', true, 5000);
         });

         socket.on('connect_error', (error) => {
             console.error('[Socket Connect Error] WebSocket connection error:', error);
             showPopupMessage(errorMessagePopup, `Chat connection failed: ${error.message}. Please check your connection.`, true);
             // Nullify the socket instance on connection error
             socket = null;
         });

         // Add other necessary listeners like 'reconnect_attempt', 'reconnect_failed' if needed
    }

    function ensureSocketConnected() {
         // Only proceed if the user is logged in
         if (!currentUser?.logged_in) {
             console.log("[ensureSocketConnected] User not logged in, skipping socket connection.");
             return;
         }

         // Check if socket instance exists and is connected
         if (!socket || !socket.connected) {
             console.log("[ensureSocketConnected] Socket not connected or instance is null. Attempting connection...");
             // Attempt to connect, passing the currentTicketId if relevant
             connectSocket(currentPageKey === 'ticketdetail' ? currentTicketId : null);
         } else {
             console.log("[ensureSocketConnected] Socket is already connected.");
             // If on ticket detail page, ensure we are in the correct room (e.g., after reconnect)
             if (currentPageKey === 'ticketdetail' && currentTicketId) {
                 console.log(`[ensureSocketConnected] Re-joining room: ${currentTicketId}`);
                 socket.emit('join_ticket_room', { ticket_id: currentTicketId });
             }
         }
    }

    function setupSocketListeners() {
         if (!socket) {
             console.warn("[setupSocketListeners] Attempted to set up listeners, but socket is null.");
             return;
         }
         console.log("[setupSocketListeners] Setting up WebSocket event listeners.");

         // Remove existing listeners before adding new ones to prevent duplicates
         socket.off('new_message');
         socket.off('room_joined');
         socket.off('error_message');
         socket.off('message_deleted');
         socket.off('ticket_status_updated');
         socket.off('ticket_list_updated');
         socket.off('action_success');
         // Add listeners for specific events from the server
         socket.on('new_message', (data) => {
             console.log("[Socket Event] Received 'new_message':", data);
             // Add sender_id if missing and message seems to be from current user (basic check)
             if (!data.sender_id && data.username === currentUser?.username) {
                 data.sender_id = currentUser.user_id;
             }
             // Only append message if currently viewing the correct ticket detail page
             if (currentPageKey === 'ticketdetail' && data.ticket_id === currentTicketId) {
                 const chatMessagesDiv = document.getElementById('chat-messages');
                 if (chatMessagesDiv) {
                     appendChatMessage(data, chatMessagesDiv);
                 } else {
                     console.warn("Chat messages container not found when receiving 'new_message'.");
                 }
             } else {
                 // Optionally show a notification for messages in other tickets
                 console.log(`Received message for ticket ${data.ticket_id}, but not currently viewing it.`);
                 // Example: showPopupMessage(ticketMessagePopup, `New message in ticket #${data.ticket_id.slice(-6)}`);
             }
         });

         socket.on('room_joined', (data) => {
             console.log(`[Socket Event] Successfully joined room: ${data.room}`);
             // Optionally confirm to the user
             // showPopupMessage(ticketMessagePopup, `Joined chat for ticket #${data.room.split('_')[1].slice(-6)}`);
         });

         socket.on('error_message', (data) => {
             console.error('[Socket Event] Received server error:', data.message);
             showPopupMessage(errorMessagePopup, data.message || 'An unexpected chat error occurred.', true);
         });

         socket.on('message_deleted', (data) => {
             console.log("[Socket Event] Received 'message_deleted':", data);
             // Only remove message if viewing the correct ticket
             if (currentPageKey === 'ticketdetail' && data.ticket_id === currentTicketId) {
                 const chatMessagesDiv = document.getElementById('chat-messages');
                 // Find the message element using the timestamp data attribute
                 const messageToRemove = chatMessagesDiv?.querySelector(`.chat-message[data-timestamp="${data.timestamp}"]`);
                 if (messageToRemove) {
                     messageToRemove.remove(); // Remove the element from the DOM
                     console.log(`[Socket Event] Removed deleted message with timestamp: ${data.timestamp}`);
                 } else {
                     console.warn(`[Socket Event] Could not find message to delete with timestamp: ${data.timestamp}`);
                 }
             }
         });

         socket.on('ticket_status_updated', (data) => {
              console.log("[Socket Event] Received 'ticket_status_updated':", data);
              // If on the main tickets list page, refresh the list
              if (currentPageKey === 'tickets') {
                  console.log(`[Socket Event] Ticket ${data.ticket_id} status updated to ${data.status}. Refreshing ticket list.`);
                  fetchTickets(); // Reload the ticket list
              }
              // If viewing the specific ticket that was updated, show a message and update UI
              if (currentPageKey === 'ticketdetail' && data.ticket_id === currentTicketId) {
                  showPopupMessage(ticketMessagePopup, `Ticket status successfully updated to ${data.status}.`);
                  // Disable/enable chat input based on new status
                  const chatInputForm = document.getElementById('chat-input-form');
                  if(chatInputForm) {
                      const isTicketOpen = data.status === 'open';
                      chatInputForm.querySelector('input').disabled = !isTicketOpen;
                      chatInputForm.querySelector('button').disabled = !isTicketOpen;
                      chatInputForm.querySelector('input').placeholder = isTicketOpen ? 'Type your message...' : 'This ticket is closed.';
                  }
              }
              // Update context menu data if the context menu was for this ticket
              if (currentContextMenu && contextMenuData.ticketId === data.ticket_id) {
                  contextMenuData.ticketStatus = data.status;
                  // Potentially update the context menu display if it's visible (though usually hidden after action)
              }
         });

          socket.on('ticket_list_updated', () => {
              console.log("[Socket Event] Received 'ticket_list_updated' (likely due to deletion/creation).");
              // If on the tickets page, refresh the list
              if (currentPageKey === 'tickets') {
                  console.log("[Socket Event] Refreshing ticket list.");
                  fetchTickets();
              }
              // If viewing a ticket detail, it might have been deleted, warn the user
              if (currentPageKey === 'ticketdetail' && currentTicketId) {
                  console.warn(`[Socket Event] Ticket list updated while viewing ticket ${currentTicketId}. The ticket might have been deleted.`);
                  // Check if the current ticket still exists? Or just inform user.
                   showPopupMessage(errorMessagePopup, "The ticket list has changed. This ticket may have been deleted. Redirecting...", true, 5000);
                   // Optionally redirect after a delay
                   setTimeout(() => {
                       // Check if still on the same page before redirecting
                       if (currentPageKey === 'ticketdetail' && currentTicketId === data.ticket_id) {
                           history.pushState({ path: '/tickets' }, '', '/tickets');
                           runNavigation();
                       }
                   }, 4500);
              }
          });

         socket.on('action_success', (data) => {
             console.log("[Socket Event] Received 'action_success':", data);
             // Show a generic success message from the server
             showPopupMessage(paymentMessage, data.message || 'Action completed successfully.');
         });
    }

    function disconnectSocket() {
        if (socket?.connected) {
            console.log('[disconnectSocket] Disconnecting WebSocket...');
            socket.disconnect();
        }
        // Nullify the socket instance regardless of connection state
        socket = null;
        console.log('[disconnectSocket] Socket instance nullified.');
    }


    // --- Modal and Context Menu Logic ---
    function showUserInfoModal(senderId, username) {
         // Ensure modal elements exist
         if (!userInfoModal || !modalUsername || !modalUserId || !modalUserRoles) {
             console.warn("Cannot show user info modal: Elements missing.");
             return;
         }
         if (!senderId) {
             console.warn("Cannot show user info modal: senderId is missing.");
             return;
         }

         // Populate basic info
         modalUsername.textContent = username || 'Unknown User';
         modalUserId.textContent = senderId;
         modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Loading roles...</p>'; // Placeholder

         // Attempt to fetch roles if it's the current user or if we implement fetching for others
         // For now, only show roles if it's the currently logged-in user viewing their own info
         // or if we have the role data cached somehow (not implemented here)
         if (currentUser?.logged_in && currentUser.user_id === senderId && currentUser.roles) {
             // Use the existing displayUserRoles function (used in dashboard)
             displayUserRoles(currentUser.roles);
         } else {
             // If not the current user, or roles aren't available in currentUser object
             // TODO: Potentially fetch roles for the target user ID via API if needed/allowed
             modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Role information not available.</p>';
         }
         // Show the modal
         userInfoModal.classList.add('active');
    }

    function hideUserInfoModal() {
        if (userInfoModal) userInfoModal.classList.remove('active');
    }

    /**
     * Positions a context menu near the mouse event coordinates.
     * Adjusts position to stay within viewport boundaries.
     * @param {HTMLElement} menuElement - The context menu element.
     * @param {MouseEvent} event - The contextmenu event object.
     */
    function positionContextMenu(menuElement, event) {
         if (!menuElement || !event) return;
         // Prevent the default browser context menu
         event.preventDefault();

         // Get viewport dimensions and scroll position
         const windowHeight = window.innerHeight;
         const windowWidth = window.innerWidth;
         const scrollY = window.scrollY;
         const scrollX = window.scrollX;

         // Get menu dimensions (use offsetHeight/Width for rendered size)
         // Temporarily display it off-screen to measure if needed, but usually fine if styled
         menuElement.style.display = 'block'; // Make sure it's rendered to get dimensions
         const menuHeight = menuElement.offsetHeight;
         const menuWidth = menuElement.offsetWidth;
         menuElement.style.display = 'none'; // Hide again immediately

         // Calculate initial position based on click coordinates
         let top = event.clientY + scrollY + 5; // Add small offset
         let left = event.clientX + scrollX + 5;

         // Adjust position to keep menu within viewport
         // If menu goes below viewport, position it above the cursor
         if (top + menuHeight > windowHeight + scrollY) {
             top = event.clientY + scrollY - menuHeight - 5;
         }
         // If menu goes beyond right edge, position it left of the cursor
         if (left + menuWidth > windowWidth + scrollX) {
             left = event.clientX + scrollX - menuWidth - 5;
         }
         // Ensure menu doesn't go off the top or left edges
         if (top < scrollY) top = scrollY;
         if (left < scrollX) left = scrollX;

         // Apply calculated position and display the menu
         menuElement.style.top = `${top}px`;
         menuElement.style.left = `${left}px`;
         menuElement.style.display = 'block'; // Show the menu
     }

    /** Hides any currently visible context menu */
    function hideContextMenu() {
        if (chatContextMenu) chatContextMenu.style.display = 'none';
        if (ticketContextMenu) ticketContextMenu.style.display = 'none';
        // Remove global listeners when menu is hidden
        document.removeEventListener('click', hideContextMenuOnClickOutside);
        window.removeEventListener('scroll', hideContextMenu);
        currentContextMenu = null; // Reset the reference
    }

    /** Click listener to hide context menu when clicking outside */
    function hideContextMenuOnClickOutside(event) {
        // Hide if the click target is not the current menu or inside it
        if (currentContextMenu && !currentContextMenu.contains(event.target)) {
            hideContextMenu();
        }
    }

    /** Shows the context menu for chat messages (Moderator only) */
    function showChatContextMenu(event) {
         // Prevent default menu and hide any existing menu
         event.preventDefault();
         hideContextMenu();

         // Only show for moderators
         if (!currentUser?.is_moderator || !chatContextMenu) return;

         // Find the parent chat message element
         const messageElement = event.target.closest('.chat-message');
         if (!messageElement) return;

         // Store relevant data from the message element's dataset
         contextMenuData.ticketId = currentTicketId; // Assumes currentTicketId is correct
         contextMenuData.messageTimestamp = messageElement.dataset.timestamp;
         contextMenuData.senderId = messageElement.dataset.senderId;
         contextMenuData.ticketStatus = null; // Not relevant for chat message menu

         // Position and display the chat context menu
         positionContextMenu(chatContextMenu, event);
         currentContextMenu = chatContextMenu; // Set as the currently active menu

         // Add listeners to close the menu on outside click or scroll (defer slightly)
         setTimeout(() => {
              document.addEventListener('click', hideContextMenuOnClickOutside);
              window.addEventListener('scroll', hideContextMenu, { once: true }); // Remove after first scroll
         }, 0);
     }

    /** Shows the context menu for ticket list items */
    function showTicketContextMenu(event) {
          // Prevent default menu and hide any existing menu
          event.preventDefault();
          hideContextMenu();

          // User must be logged in to see any ticket context actions
          if (!currentUser?.logged_in || !ticketContextMenu) return;

          // Find the parent ticket list item (which is an <a> tag now)
          const ticketElement = event.target.closest('.ticket-list-item');
          if (!ticketElement) return;

          // Store relevant data from the ticket element's dataset
          contextMenuData.ticketId = ticketElement.dataset.ticketId;
          contextMenuData.ticketStatus = ticketElement.dataset.ticketStatus;
          contextMenuData.senderId = null; // Not relevant
          contextMenuData.messageTimestamp = null; // Not relevant
          console.log("[showTicketContextMenu] Context data:", contextMenuData);

          // Determine which actions are available based on user role and ticket status
          const isMod = currentUser.is_moderator === true;
          const canClose = contextMenuData.ticketStatus === 'open' && (isMod || currentUser.user_id === ticketElement.dataset.userId); // Owner or Mod can close
          const canReopen = contextMenuData.ticketStatus === 'closed' && isMod; // Only mods can reopen
          const canDelete = isMod; // Only mods can delete

          // Toggle visibility of menu items based on permissions
          contextCloseTicketButton.classList.toggle('hidden', !canClose);
          contextReopenTicketButton.classList.toggle('hidden', !canReopen);
          contextDeleteTicketButton.classList.toggle('hidden', !canDelete);

          // Only show the menu if there's at least one action available
          if (canClose || canReopen || canDelete) {
              positionContextMenu(ticketContextMenu, event);
              currentContextMenu = ticketContextMenu; // Set as active menu
              // Add listeners to close the menu
              setTimeout(() => {
                   document.addEventListener('click', hideContextMenuOnClickOutside);
                   window.addEventListener('scroll', hideContextMenu, { once: true });
              }, 0);
          }
     }

    // --- Context Menu Action Handlers ---
    /** Deletes a chat message via Socket.IO (Moderator only) */
    function deleteChatMessage() {
          // Validate necessary data and connection state
          if (!contextMenuData.ticketId || !contextMenuData.messageTimestamp || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot delete message: Invalid state or not connected.', true);
              hideContextMenu(); return;
          }
          // Double-check moderator status (should be redundant if menu only shown to mods)
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'Forbidden: Moderators only.', true);
              hideContextMenu(); return;
          }
          console.log(`[Action] Attempting to delete message: Ticket ${contextMenuData.ticketId}, Timestamp ${contextMenuData.messageTimestamp}`);
          // Emit event to server
          socket.emit('delete_message', {
              ticket_id: contextMenuData.ticketId,
              message_timestamp: contextMenuData.messageTimestamp // Send the ISO timestamp string
          });
          hideContextMenu(); // Hide menu after action
      }

    /** Closes a ticket via Socket.IO (Owner or Moderator) */
    function closeTicket() {
          // Validate necessary data and connection state
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot close ticket: Invalid state or not connected.', true);
              hideContextMenu(); return;
          }
          // Permission check already done when showing the menu item
          console.log(`[Action] Attempting to close ticket: ${contextMenuData.ticketId}`);
          // Emit event to server
          socket.emit('update_ticket_status', {
              ticket_id: contextMenuData.ticketId,
              new_status: 'closed'
          });
          hideContextMenu(); // Hide menu after action
      }

    /** Reopens a ticket via Socket.IO (Moderator only) */
    function reopenTicket() {
          // Validate necessary data and connection state
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot reopen ticket: Invalid state or not connected.', true);
              hideContextMenu(); return;
          }
          // Double-check moderator status
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'You do not have permission to reopen tickets.', true);
              hideContextMenu(); return;
          }
          console.log(`[Action] Attempting to reopen ticket: ${contextMenuData.ticketId}`);
          // Emit event to server
          socket.emit('update_ticket_status', {
              ticket_id: contextMenuData.ticketId,
              new_status: 'open'
          });
          hideContextMenu(); // Hide menu after action
      }

    /** Deletes a ticket via Socket.IO (Moderator only) */
    function deleteTicket() {
          // Validate necessary data and connection state
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot delete ticket: Invalid state or not connected.', true);
              hideContextMenu(); return;
          }
          // Double-check moderator status
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'You do not have permission to delete tickets.', true);
              hideContextMenu(); return;
          }
          // Confirm deletion with the user
          const shortId = contextMenuData.ticketId.slice(-6);
          if (confirm(`Are you sure you want to permanently delete ticket #${shortId}? This action cannot be undone.`)) {
              console.log(`[Action] Attempting to delete ticket: ${contextMenuData.ticketId}`);
              // Emit event to server
              socket.emit('delete_ticket', { ticket_id: contextMenuData.ticketId });
          }
          hideContextMenu(); // Hide menu regardless of confirmation
      }

    // --- Product Edit Modal Logic ---
    /** Opens the product edit/add modal, optionally pre-filling with product data */
    function openProductEditModal(product = null) {
         // Ensure all modal elements are available
         if (!productEditModal || !productEditForm || !customHexInputContainer || !productModalTitle || !productEditIdInput || !productEditNameInput || !productEditThumbnailInput || !productEditPriceInput || !productEditTagInput || !productEditTagColorSelect || !productEditCustomHexInput || !productEditDescriptionInput || !productEditFeaturesInput || !productEditPaymentLinkInput || !productEditStatus || !productEditThumbnailFilename || !productEditThumbnailFileInput || !productSaveButton) {
             console.error("Cannot open product modal: One or more elements not found.");
             showPopupMessage(errorMessagePopup, "Error opening product editor: UI elements missing.", true);
             return;
         }
         // Reset the form and status message
         productEditForm.reset();
         productEditStatus.textContent = '';
         productEditStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status class
         productEditThumbnailFilename.textContent = 'No file selected';
         productEditThumbnailFileInput.value = ''; // Clear file input

         // Check if editing an existing product or adding a new one
         if (product && product._id) { // Check for _id to confirm editing
             productModalTitle.textContent = 'Edit Product';
             productEditIdInput.value = product._id; // Set hidden ID field
             // Populate form fields with existing product data
             productEditNameInput.value = product.name || '';
             productEditThumbnailInput.value = product.thumbnailUrl || ''; // Populate URL input
             productEditPriceInput.value = product.price || '';
             productEditTagInput.value = product.tag || '';
             // Determine correct tag color/custom hex selection
             const hasValidCustomHex = product.customBorderHex && /^#[0-9A-F]{6}$/i.test(product.customBorderHex);
             productEditTagColorSelect.value = hasValidCustomHex ? 'custom' : (product.tagColor || 'gray');
             productEditCustomHexInput.value = hasValidCustomHex ? product.customBorderHex : '';
             productEditDescriptionInput.value = product.description || '';
             productEditFeaturesInput.value = (product.features || []).join('\n'); // Join features array with newlines
             productEditPaymentLinkInput.value = product.paymentLink || '';
         } else {
             // Adding a new product
             productModalTitle.textContent = 'Add New Product';
             productEditIdInput.value = ''; // Ensure ID is empty
             productEditTagColorSelect.value = 'gray'; // Default color
             productEditCustomHexInput.value = ''; // Clear custom hex
         }
         // Show/hide custom hex input based on initial dropdown value
         toggleCustomHexInput();
         // Make the modal visible
         productEditModal.classList.add('active');
         // Ensure save button is enabled initially
         productSaveButton.disabled = false;
         productSaveButton.textContent = 'Save Product';
    }

    /** Shows or hides the custom HEX color input based on the dropdown selection */
    function toggleCustomHexInput() {
         if (customHexInputContainer && productEditTagColorSelect) {
              const selectedColor = productEditTagColorSelect.value;
              // Show the container only if 'custom' is selected
              customHexInputContainer.classList.toggle('hidden', selectedColor !== 'custom');
         }
     }

    /** Closes the product edit/add modal */
    function closeProductEditModal() {
         if (productEditModal) productEditModal.classList.remove('active');
     }

    /** Handles saving (adding or updating) a product */
    async function handleSaveProduct(event) {
          event.preventDefault(); // Prevent default form submission
          // Ensure form and button exist
          if (!productEditForm || !productSaveButton || !productEditStatus) return;

          // Disable button and clear status
          productSaveButton.disabled = true; productSaveButton.textContent = 'Saving...';
          productEditStatus.textContent = ''; productEditStatus.className = 'text-sm text-center h-5 mt-2';

          // Determine if editing or adding based on hidden ID input
          const productId = productEditIdInput.value;
          const isEditing = !!productId; // True if productId has a value
          const url = isEditing ? `${API_BASE_URL}/api/products/${productId}` : `${API_BASE_URL}/api/products`;
          const method = isEditing ? 'PUT' : 'POST';

          // --- Validate and Prepare Data ---
          let tagColorValue = productEditTagColorSelect.value;
          let customHexValue = productEditCustomHexInput.value.trim();
          let finalTagColor = 'gray'; // Default
          let finalCustomHex = null;

          // Validate custom hex color if selected
          if (tagColorValue === 'custom') {
              if (customHexValue && /^#[0-9A-F]{6}$/i.test(customHexValue)) {
                  finalTagColor = 'custom';
                  finalCustomHex = customHexValue;
              } else {
                  // Show validation error if custom hex is invalid
                  productEditStatus.textContent = 'Invalid Custom HEX format. Use #RRGGBB (e.g., #FF5733).';
                  productEditStatus.classList.add('text-red-400');
                  productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product'; // Re-enable button
                  return; // Stop submission
              }
          } else {
              // Use the selected color from the dropdown
              finalTagColor = tagColorValue || 'gray';
              finalCustomHex = null; // Ensure custom hex is null if not selected
          }

          // Basic validation for required fields
          const productName = productEditNameInput.value.trim();
          const productPrice = parseFloat(productEditPriceInput.value);
          if (!productName || isNaN(productPrice) || productPrice < 0) {
               productEditStatus.textContent = 'Product Name and a valid non-negative Price are required.';
               productEditStatus.classList.add('text-red-400');
               productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
               return; // Stop submission
          }

          // Construct the data payload for the API request
          const productData = {
              name: productName,
              thumbnailUrl: productEditThumbnailInput.value.trim() || null, // Use URL input value
              price: productPrice,
              tag: productEditTagInput.value.trim() || null,
              tagColor: finalTagColor,
              customBorderHex: finalCustomHex,
              description: productEditDescriptionInput.value.trim() || null,
              // Split features textarea by newline, trim whitespace, filter empty lines
              features: productEditFeaturesInput.value.split('\n').map(f => f.trim()).filter(f => f),
              paymentLink: productEditPaymentLinkInput.value.trim() || null
          };

          // --- TODO: Handle File Upload if selected ---
          const thumbnailFile = productEditThumbnailFileInput.files[0];
          if (thumbnailFile) {
              // If a file is selected, prioritize it over the URL input
              console.warn("File upload selected, but upload logic is not implemented yet.");
              showPopupMessage(errorMessagePopup, "File upload is not implemented. Please use URL for now.", true);
              // You would typically use FormData here to send the file to a separate upload endpoint
              // and then put the returned URL into productData.thumbnailUrl before saving.
              // For now, we'll ignore the file and proceed with the URL if provided.
              // productData.thumbnailUrl = null; // Or clear it if file should override
          }
          // --- End File Upload Handling ---

          console.log(`[Save Product] ${isEditing ? 'Updating' : 'Adding'} product:`, productData);

          try {
              // Send the request to the backend API
              const response = await fetch(url, {
                  method: method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(productData),
                  credentials: 'include' // Send cookies
              });
              const result = await response.json(); // Parse response
              if (!response.ok) {
                  // Throw error if backend indicates failure
                  throw new Error(result.error || `HTTP error! status: ${response.status}`);
              }

              // Success! Show confirmation, close modal, refresh relevant lists
              showPopupMessage(productMessagePopup, `Product ${isEditing ? 'updated' : 'added'} successfully!`);
              closeProductEditModal();
              // Refresh product list if on dashboard or products page
              if (currentPageKey === 'dashboard') await loadProductManagementTable();
              if (currentPageKey === 'products') await fetchProducts();
              // If editing the product currently being viewed on detail page, refresh it
              if (isEditing && currentPageKey === 'productdetail' && window.location.pathname.includes(`/productdetail/${productId}`)) {
                  await fetchProductDetails(productId);
              }

          } catch (error) {
              console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
              productEditStatus.textContent = `Error: ${error.message}`;
              productEditStatus.classList.add('text-red-400'); // Show error in modal
              showPopupMessage(errorMessagePopup, `Failed to save product: ${error.message}`, true); // Show error popup
          } finally {
              // Re-enable save button
              productSaveButton.disabled = false;
              productSaveButton.textContent = 'Save Product';
          }
     }

    /** Handles deleting a product */
    async function handleDeleteProduct(productId, productName) {
         if (!productId) return; // Need an ID to delete

         // Confirm deletion with the user
         if (!confirm(`Are you sure you want to permanently delete the product "${productName || 'this product'}"? This action cannot be undone.`)) {
             return; // User cancelled
         }

         console.log(`[Delete Product] Attempting to delete product ID: ${productId}`);
         // Optionally show loading indicator
         // loadingOverlay.classList.add('active');

         try {
             // Send DELETE request to the backend API
             const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                 method: 'DELETE',
                 credentials: 'include' // Send cookies
             });
             if (!response.ok) {
                 // Try to parse error message from backend response
                 let errorData = { error: `HTTP ${response.status}` };
                 try { errorData = await response.json(); } catch(e){ /* Ignore parse error */ }
                 throw new Error(errorData.error || `Failed to delete product.`);
             }

             // Success! Show confirmation and refresh relevant lists
             showPopupMessage(productMessagePopup, 'Product deleted successfully!');
             if (currentPageKey === 'dashboard') await loadProductManagementTable(); // Refresh admin table
             if (currentPageKey === 'products') await fetchProducts(); // Refresh public product list

             // If deleting the product currently being viewed, redirect to products list
             if (currentPageKey === 'productdetail' && window.location.pathname.includes(`/productdetail/${productId}`)) {
                 console.log("Deleted product was being viewed, redirecting to products list.");
                 // Use replaceState to avoid adding the deleted product page to history
                 history.replaceState({ path: '/products' }, '', '/products');
                 runNavigation(); // Trigger navigation to /products
             }

         } catch (error) {
             console.error("Error deleting product:", error);
             showPopupMessage(errorMessagePopup, `Failed to delete product: ${error.message}`, true);
         } finally {
             // Hide loading indicator if shown
             // loadingOverlay.classList.remove('active');
         }
     }


    // --- Logout Logic ---

    /** Handles the user logout process. */
    async function handleLogout() {
         console.log('[handleLogout] Initiating logout...');
         try {
             // Call the backend logout endpoint
             const response = await fetch(`${API_BASE_URL}/logout`, {
                 method: 'POST', // Assuming POST for logout action
                 credentials: 'include' // Send cookies
             });
             if (!response.ok) {
                 // Log backend error but proceed with client-side cleanup anyway
                 let errorMsg = `Backend logout failed with status: ${response.status}`;
                 try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (parseError) {}
                 console.warn(`[handleLogout] ${errorMsg}. Proceeding with client-side cleanup.`);
             } else {
                 console.log("[handleLogout] Backend logout successful.");
             }
         } catch(error) {
             // Log network error but proceed with client-side cleanup
             console.error("[handleLogout] Network error during backend logout request:", error);
         } finally {
              // --- Client-side cleanup ---
              currentUser = null; // Clear user state
              isInitialLoginCheckComplete = false; // Reset flags if needed for re-login
              isInitialConfigLoadComplete = false;
              disconnectSocket(); // Disconnect WebSocket
              updateHeaderUI(null); // Update header to logged-out state
              console.log("[handleLogout] Client-side cleanup complete. Navigating to /");

              // Navigate to home page using History API
              history.pushState({ path: '/' }, '', '/');
              runNavigation(); // Trigger navigation to home page content
         }
     }

    // --- Global Event Listeners Setup ---

    // Listen for Browser Back/Forward navigation events
    window.addEventListener('popstate', (event) => {
        console.log("[Popstate] Browser navigation triggered (Back/Forward). New state:", event.state);
        // Re-run the navigation logic based on the new URL path after back/forward
        runNavigation();
    });

    // Global click listener to intercept internal navigation links
    document.addEventListener('click', (event) => {
        // Find the closest ancestor anchor tag (<a>) that was clicked
        const link = event.target.closest('a');

        // Check if it's a link we should handle with the SPA router:
        if (link && // Was a link clicked?
            link.target !== '_blank' && // Ignore links opening in new tabs
            link.origin === window.location.origin && // Ignore links to external domains
            !link.pathname.startsWith('/api/') && // Ignore direct API calls
            !link.hasAttribute('data-spa-ignore') && // Ignore links explicitly marked to be skipped
            link.getAttribute('href') && // Ensure link has an href attribute
            !link.getAttribute('href').startsWith('#') && // Ignore hash links (handled by browser scroll)
            link.href !== window.location.href // Ignore clicks on the link for the current page
           )
        {
            // Check if it's a path link (starts with '/' or is relative within the domain)
            // This check might need refinement depending on exact URL structures
            const href = link.getAttribute('href');
            const isPathLink = href.startsWith('/') || !href.includes(':'); // Simple check for path vs full URL

            if(isPathLink) {
                event.preventDefault(); // IMPORTANT: Prevent the browser's default link navigation
                // Get the target path from the link's href attribute
                const targetPath = link.pathname + link.search + link.hash;

                console.log(`[Link Intercept] Intercepted click on internal link. Navigating to: ${targetPath}`);
                // Use history.pushState to update the URL bar without a full page reload
                // and add the new state to the browser's history stack.
                history.pushState({ path: targetPath }, '', targetPath);
                // Manually trigger the SPA's navigation logic to load the new content
                runNavigation();
            }
        }
    });


    // --- Initial Application Setup ---

    // Create visual effects like snowflakes
    createSnowflakes();

    // Start the initialization sequence:
    // 1. Check login status (which calls loadSiteConfigAndNavigate on completion)
    checkLoginStatus();

    // Setup listeners for static elements present in the initial index.html shell
    // (header buttons, modals, context menus that are always in the DOM)

    // Login button (redirects to Discord OAuth)
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if it was an anchor, though href handles it
            window.location.href = loginButton.href; // Explicitly navigate
        });
    }
    // Logout button (located within the user-info dropdown in the header)
    if (logoutButton) {
        // Note: updateHeaderUI handles showing/hiding this button
        logoutButton.addEventListener('click', handleLogout);
    }
    // Mobile menu toggle button
    if (mobileMenuButton && mobileMenuNav) {
        mobileMenuButton.addEventListener('click', () => mobileMenuNav.classList.toggle('hidden'));
    }

    // --- Modal Close Listeners ---
    // User Info Modal
    if (modalCloseButton) modalCloseButton.addEventListener('click', hideUserInfoModal);
    if (userInfoModal) userInfoModal.addEventListener('click', (event) => {
        // Close modal if backdrop (the modal element itself) is clicked
        if (event.target === userInfoModal) hideUserInfoModal();
    });
    // Product Edit Modal
    if (productModalCloseButton) productModalCloseButton.addEventListener('click', closeProductEditModal);
    if (productEditModal) productEditModal.addEventListener('click', (event) => {
        // Close modal if backdrop is clicked
        if (event.target === productEditModal) closeProductEditModal();
    });

    // --- Context Menu Action Listeners ---
    // Attach listeners directly to the menu items defined in index.html
    if (contextDeleteButton) contextDeleteButton.addEventListener('click', deleteChatMessage);
    if (contextUserInfoButton) contextUserInfoButton.addEventListener('click', () => {
         // Get sender ID and username from stored context data
         if (contextMenuData.senderId) {
             // Attempt to find username from the message element for better accuracy
             const messageElement = document.querySelector(`.chat-message[data-timestamp="${contextMenuData.messageTimestamp}"]`);
             const usernameElement = messageElement?.querySelector('.username');
             const username = usernameElement ? usernameElement.textContent.replace(':', '') : 'User'; // Fallback username
             showUserInfoModal(contextMenuData.senderId, username);
         }
         hideContextMenu(); // Hide menu after action
     });
    if (contextCloseTicketButton) contextCloseTicketButton.addEventListener('click', closeTicket);
    if (contextReopenTicketButton) contextReopenTicketButton.addEventListener('click', reopenTicket);
    if (contextDeleteTicketButton) contextDeleteTicketButton.addEventListener('click', deleteTicket);

    // --- Product Edit Modal Form Listeners (global modal elements) ---
    // Form submission
    if (productEditForm) productEditForm.addEventListener('submit', handleSaveProduct);
    // Dropdown change for custom hex input visibility
    if (productEditTagColorSelect) productEditTagColorSelect.addEventListener('change', toggleCustomHexInput);

    // Product Edit Thumbnail File Selection Listeners
    if (productEditThumbnailButton && productEditThumbnailFileInput) {
        // Trigger file input click when the button is clicked
        productEditThumbnailButton.addEventListener('click', () => {
            productEditThumbnailFileInput.click();
        });
    }
    if (productEditThumbnailFileInput && productEditThumbnailFilename) {
        // Update displayed filename when a file is selected
        productEditThumbnailFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                productEditThumbnailFilename.textContent = file.name; // Display filename
                // Clear the URL input if a file is chosen (optional, depends on desired priority)
                if (productEditThumbnailInput) productEditThumbnailInput.value = '';
            } else {
                productEditThumbnailFilename.textContent = 'No file selected';
            }
            // Reset the file input value so the change event fires even if the same file is selected again
            // event.target.value = null; // This can cause issues, better to handle file state logic explicitly
        });
    }

    // --- End of Initialization ---
    console.log("Shillette MPF initialization sequence started. Using History API routing.");

}); // End DOMContentLoaded
