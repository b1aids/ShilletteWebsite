/**
 * Shillette Frontend Application Logic
 *
 * Handles routing (using History API), API calls, WebSocket communication,
 * dynamic content loading, and UI interactions for the MPF structure.
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
            const response = await fetch(filePath); // Fetch relative to index.html
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
    // ... (checkLoginStatus, loadSiteConfigAndNavigate, applySiteConfig, updateHeaderUI remain the same) ...
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
             await loadSiteConfigAndNavigate();
         }
    }

    async function loadSiteConfigAndNavigate() {
        if (!isInitialLoginCheckComplete) {
            console.log("[loadSiteConfigAndNavigate] Waiting for login check to complete.");
            return;
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
            applySiteConfig(null);
        } finally {
            isInitialConfigLoadComplete = true;
            console.log("[loadSiteConfig] Initial config load complete.");
            console.log("[loadSiteConfigAndNavigate] Triggering initial navigation based on pathname.");
            runNavigation(); // Trigger navigation based on the initial path
        }
    }

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
                    const pathKey = (link.href === '/' ? 'home' : link.href.split('/')[1]?.toLowerCase()) || 'home';
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
                    const pathKey = (link.href === '/' ? 'home' : link.href.split('/')[1]?.toLowerCase()) || 'home';
                    mob_a.dataset.pageKey = pathKey;
                }
                if (link.target) {
                    mob_a.target = link.target;
                    if (link.target === '_blank') mob_a.rel = 'noopener noreferrer';
                }
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
             userInfo.classList.toggle('flex', isLoggedIn);
             // Update user-info link href to point to /dashboard path
             userInfo.href = '/dashboard';
         }

         if (isLoggedIn) {
             if (userNameDisplay) userNameDisplay.textContent = user.username || 'User';
             if (userAvatarDisplay) {
                userAvatarDisplay.src = user.user_id && user.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32`
                    : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
             }
         }
    }

    /**
     * Updates the active state styling for navigation links.
     * @param {string | null} activePageKey - The key of the currently active page.
     */
    function updateActiveNavLink(activePageKey) {
        const navLinks = document.querySelectorAll('#main-navigation .main-nav-link, #mobile-menu .mobile-menu-link');
        navLinks.forEach(link => {
            if (link.dataset.pageKey === activePageKey) {
                link.classList.add('text-orange-400', 'font-semibold'); // Add active styles
                link.classList.remove('text-gray-300');
            } else {
                link.classList.remove('text-orange-400', 'font-semibold'); // Remove active styles
                link.classList.add('text-gray-300');
            }
        });
    }


    // --- Navigation (Routing based on URL Pathname and History API) ---

    /**
     * Parses the URL pathname, determines the target page and parameters,
     * checks access control, and triggers loading of the page content.
     */
    function runNavigation() {
        console.log(`[runNavigation] Pathname changed to: ${window.location.pathname}`);

        // Ensure initial checks are complete
        if (!isInitialLoginCheckComplete || !isInitialConfigLoadComplete) {
            console.log("[runNavigation] Initial checks not complete. Deferring navigation.");
            return;
        }

        const pathname = window.location.pathname; // e.g., '/', '/products', '/productdetail/123'
        // Split path into segments, removing empty strings from leading/trailing slashes
        const pathSegments = pathname.split('/').filter(segment => segment);

        // Determine page key and parameters
        let rawPageName = pathSegments[0] || 'home'; // Default to 'home' for '/'
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
                console.log("[runNavigation] Redirecting to /");
                history.pushState({ path: '/' }, '', '/'); // Update URL
                runNavigation(); // Trigger navigation to home
            } else {
                // If already trying to access home, load it (should already be handled by initial call)
                loadPageContent('home', {});
            }
            return; // Stop further processing
        }

        // --- Load Page Content ---
        console.log(`[runNavigation] Proceeding to load content for page key: '${pageKey}'`);

        // Handle WebSocket connection based on page context
        const isTicketRelated = ['tickets', 'ticketdetail'].includes(pageKey);
        if (!isTicketRelated && socket) {
             console.log(`[runNavigation] Navigating away from ticket-related page, disconnecting socket.`);
             disconnectSocket();
        }
        if (isTicketRelated) {
             console.log(`[runNavigation] Navigating to ticket-related page, ensuring socket is connected.`);
             ensureSocketConnected();
        }

        // Load the page content using the determined lowercase key and parameters
        loadPageContent(pageKey, routeParams);
    }

    // --- Page-Specific Functions ---
    // ... (fetchProducts, renderProductCard, handlePurchaseClick as before) ...
    // ... (fetchTickets, setupTicketFormListener as before, BUT UPDATE createTicketListItem) ...
    // ... (fetchTicketDetails, appendChatMessage, setupTicketDetailListeners as before) ...
    // ... (Dashboard functions as before) ...
    // ... (Product Detail functions as before) ...

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
                 return;
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
            const username = ticket.username || 'Unknown User';

            link.innerHTML = `
                <div>
                    <p class="font-medium text-white">#${shortId}: ${subject}</p>
                    <p class="text-xs text-gray-400">User: ${username} | Opened: ${dateOpened}</p>
                </div>
                <span class="${statusClass}">${statusText}</span>`;

            // Click listener is now handled globally by the link interceptor
            // Context menu listener remains
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
                const subject = ticketSubjectInput.value.trim();
                const message = ticketMessageInput.value.trim();
                createTicketStatus.textContent = '';
                createTicketStatus.className = 'h-6 text-sm mt-4 mb-4 text-center';

                if (!subject || !message) {
                    createTicketStatus.textContent = 'Please fill out both subject and message.';
                    createTicketStatus.classList.add('error', 'text-red-400');
                    return;
                }

                createTicketButton.disabled = true;
                createTicketButton.textContent = 'Submitting...';

                try {
                    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject, message }),
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        let errorData = { error: `HTTP error! status: ${response.status}` };
                        try { errorData = await response.json(); } catch (e) {}
                        throw new Error(errorData.error || `Failed to create ticket.`);
                    }
                    createTicketStatus.textContent = 'Ticket submitted successfully!';
                    createTicketStatus.classList.add('success', 'text-green-400');
                    createTicketForm.reset();
                    if (currentPageKey === 'tickets') {
                       console.log("Ticket created, refreshing ticket list.");
                       await fetchTickets();
                    }
                } catch (error) {
                    console.error('Error creating ticket:', error);
                    createTicketStatus.textContent = `Error: ${error.message}`;
                    createTicketStatus.classList.add('error', 'text-red-400');
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

             if (!chatMessagesDiv || !ticketDetailSubject) {
                 console.error("[fetchTicketDetails] Chat messages div or subject header not found in loaded content.");
                 if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Could not display ticket details. UI elements missing.</div>`;
                 return;
             }
             if (!currentUser?.logged_in) {
                 console.warn("[fetchTicketDetails] User not logged in, cannot fetch details.");
                 history.pushState({ path: '/tickets' }, '', '/tickets'); runNavigation(); // Redirect
                 return;
             }
             ensureSocketConnected();

             chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Loading messages...</p>';
             ticketDetailSubject.textContent = `Loading Ticket #${ticketId.slice(-6)}...`;

             try {
                 const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, { credentials: 'include' });
                 if (!response.ok) {
                     if (response.status === 401 || response.status === 403) throw new Error("Access Denied: You may not have permission to view this ticket.");
                     if (response.status === 404) throw new Error("Ticket not found.");
                     throw new Error(`HTTP error fetching ticket details: ${response.status}`);
                 }
                 const ticket = await response.json();
                 console.log(`[fetchTicketDetails] Received details for ticket: ${ticketId}`, ticket);

                 ticketDetailSubject.textContent = ticket.subject || `Ticket #${ticketId.slice(-6)}`;
                 chatMessagesDiv.innerHTML = '';

                 if (ticket.messages && ticket.messages.length > 0) {
                     ticket.messages.forEach(msg => appendChatMessage(msg, chatMessagesDiv));
                 } else {
                     chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No messages in this ticket yet. Type below to start the conversation.</p>';
                 }

                 if (socket?.connected) {
                     console.log(`[fetchTicketDetails] Emitting join_ticket_room for ticket: ${ticketId}`);
                     socket.emit('join_ticket_room', { ticket_id: ticketId });
                 } else {
                     console.warn("[fetchTicketDetails] Socket not connected when attempting to join ticket room.");
                 }

             } catch (error) {
                 console.error("[fetchTicketDetails] Error fetching ticket details:", error);
                 chatMessagesDiv.innerHTML = `<p class="text-red-400 text-center py-4">Error loading messages: ${error.message}</p>`;
                 ticketDetailSubject.textContent = `Error Loading Ticket`;
                 showPopupMessage(errorMessagePopup, `Error loading ticket: ${error.message}`, true);
                 if (error.message.includes("not found") || error.message.includes("Access Denied")) {
                     setTimeout(() => { history.pushState({ path: '/tickets' }, '', '/tickets'); runNavigation(); }, 3000);
                 }
             }
        }

        function appendChatMessage(data, chatMessagesDivElement) {
             if (!chatMessagesDivElement) {
                 console.warn("Attempted to append chat message, but container element not found.");
                 return;
             }
             const placeholderMsg = chatMessagesDivElement.querySelector('p.text-gray-500, p.text-red-400');
             if (placeholderMsg) placeholderMsg.remove();

             const messageElement = document.createElement('div');
             messageElement.classList.add('chat-message');
             messageElement.dataset.timestamp = data.timestamp;
             messageElement.dataset.senderId = data.sender_id;

             const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
             const username = data.sender_username || data.username || 'System';
             const safeUsername = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
             const safeText = (data.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");

             const usernameSpan = document.createElement('span');
             usernameSpan.classList.add('username');
             usernameSpan.textContent = `${safeUsername}:`;
             usernameSpan.addEventListener('click', () => showUserInfoModal(data.sender_id, safeUsername));

             messageElement.appendChild(usernameSpan);
             messageElement.append(` ${safeText} `);

             const timestampSpan = document.createElement('span');
             timestampSpan.classList.add('timestamp');
             timestampSpan.textContent = timestamp;
             messageElement.appendChild(timestampSpan);

             if (currentUser?.is_moderator) {
                messageElement.addEventListener('contextmenu', showChatContextMenu);
             }

             chatMessagesDivElement.appendChild(messageElement);
             chatMessagesDivElement.scrollTop = chatMessagesDivElement.scrollHeight;
        }

        function setupTicketDetailListeners() {
            const chatInputForm = document.getElementById('chat-input-form');
            const chatInput = document.getElementById('chat-input');

            if (!chatInputForm || !chatInput) {
                console.warn("[setupTicketDetailListeners] Chat form elements not found in loaded content.");
                return;
            }

            chatInputForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const messageText = chatInput.value.trim();
                if (messageText && socket?.connected && currentTicketId) {
                    console.log(`[Chat Submit] Sending message to ticket ${currentTicketId}: "${messageText}"`);
                    socket.emit('send_message', { ticket_id: currentTicketId, text: messageText });
                    chatInput.value = '';
                } else if (!socket?.connected) {
                    showPopupMessage(errorMessagePopup, 'Cannot send message: Not connected to chat server.', true);
                } else if (!currentTicketId) {
                    showPopupMessage(errorMessagePopup, 'Cannot send message: No active ticket selected.', true);
                } else if (!messageText) {
                     showPopupMessage(errorMessagePopup, 'Cannot send an empty message.', true);
                }
            });
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
            rolesContainer.innerHTML = '';

            if (roles && Array.isArray(roles) && roles.length > 0) {
                roles.forEach(role => {
                    const roleElement = document.createElement('span');
                    roleElement.classList.add('role-span');

                    let hexColor = '#9CA3AF';
                    if (role.color && role.color !== 0) {
                        hexColor = '#' + role.color.toString(16).padStart(6, '0');
                    }
                    const r = parseInt(hexColor.slice(1, 3), 16);
                    const g = parseInt(hexColor.slice(3, 5), 16);
                    const b = parseInt(hexColor.slice(5, 7), 16);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    const textColorClass = luminance > 0.5 ? 'text-black' : 'text-white';

                    roleElement.textContent = role.name || `Role ${role.id}`;
                    roleElement.style.backgroundColor = hexColor;
                    roleElement.classList.add(textColorClass);
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
            if (!currentUser?.is_moderator) {
                 adminSectionsContainer.classList.add('hidden');
                 return;
            }
            adminSectionsContainer.classList.remove('hidden');
            await loadSiteConfigForm();
            await loadProductManagementTable();
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
            if (!siteConfig) {
                console.warn("[loadSiteConfigForm] Global siteConfig state not available. Cannot populate form.");
                configSaveStatus.textContent = "Error: Config data not loaded.";
                configSaveStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
                return;
            }
            configSiteTitleInput.value = siteConfig.siteTitle || '';
            configSiteIconUrlInput.value = siteConfig.siteIconUrl || '';
            configHeaderLinksContainer.innerHTML = '';
            (siteConfig.headerLinks || []).forEach((link) => {
                addHeaderLinkInput(link.name, link.href, link.target);
            });
            configSaveStatus.textContent = '';
            configSaveStatus.className = 'text-sm text-center h-5 mt-2';
        }

        function addHeaderLinkInput(name = '', href = '', target = '') {
            const configHeaderLinksContainer = document.getElementById('config-header-links-container');
            if (!configHeaderLinksContainer) {
                 console.warn("[addHeaderLinkInput] Header links container not found."); return;
            }

            const linkGroup = document.createElement('div');
            linkGroup.className = 'link-group flex items-center space-x-2 mb-2';
            linkGroup.innerHTML = `
                 <input type="text" placeholder="Link Name" value="${name}" class="link-name config-link-name flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
                 <input type="text" placeholder="Link Path (e.g., /products)" value="${href}" class="link-href config-link-href flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
                 <input type="text" placeholder="Target (e.g., _blank)" value="${target || ''}" class="link-target config-link-target flex-none w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400">
                 <button type="button" class="remove-link-button bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex-shrink-0" title="Remove Link">X</button>
             `;
             linkGroup.querySelector('.remove-link-button').addEventListener('click', () => linkGroup.remove());
             configHeaderLinksContainer.appendChild(linkGroup);
        }

        async function loadProductManagementTable() {
             const productListTableBody = document.getElementById('product-list-tbody');
             const productListStatus = document.getElementById('product-list-status');
             if (!productListTableBody || !productListStatus) {
                 console.warn("[loadProductManagementTable] Product list table elements not found in loaded content."); return;
             }
             productListTableBody.innerHTML = '';
             productListStatus.textContent = 'Loading products...';
             productListStatus.classList.remove('hidden');

             try {
                 const response = await fetch(`${API_BASE_URL}/api/products`);
                 if (!response.ok) throw new Error(`HTTP error fetching products for admin: ${response.status}`);
                 const products = await response.json();
                 productListStatus.classList.add('hidden');

                 if (!products || products.length === 0) {
                     productListStatus.textContent = 'No products found.';
                     productListStatus.classList.remove('hidden');
                 } else {
                     products.forEach(product => {
                         const row = productListTableBody.insertRow();
                         row.innerHTML = `
                             <td class="px-4 py-3">${product.name || 'N/A'}</td>
                             <td class="px-4 py-3">$${product.price?.toFixed(2) || 'N/A'}</td>
                             <td class="px-4 py-3">${product.tag || '-'}</td>
                             <td class="px-4 py-3 actions">
                                 <button class="edit-btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded mr-1 transition duration-200" data-product-id="${product._id}">Edit</button>
                                 <button class="delete-btn bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-2 py-1 rounded transition duration-200" data-product-id="${product._id}">Delete</button>
                             </td>
                         `;
                         row.querySelector('.edit-btn').addEventListener('click', () => openProductEditModal(product));
                         row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteProduct(product._id, product.name));
                     });
                 }
             } catch (error) {
                 console.error("Error loading products for admin table:", error);
                 productListStatus.textContent = `Failed to load products: ${error.message}`;
                 productListStatus.classList.remove('hidden');
                 showPopupMessage(errorMessagePopup, `Error loading products for admin: ${error.message}`, true);
             }
        }

        function setupDashboardListeners() {
            const dbLogoutButton = document.getElementById('dashboard-logout-button');
            if (dbLogoutButton) {
                dbLogoutButton.removeEventListener('click', handleLogout);
                dbLogoutButton.addEventListener('click', handleLogout);
            } else {
                console.warn("[setupDashboardListeners] Dashboard logout button not found in loaded content.");
            }
        }

        function setupAdminDashboardListeners() {
            console.log("[setupAdminDashboardListeners] Setting up listeners for admin controls...");
            const siteConfigForm = document.getElementById('site-config-form');
            if (siteConfigForm) {
                siteConfigForm.removeEventListener('submit', handleSaveSiteConfig);
                siteConfigForm.addEventListener('submit', handleSaveSiteConfig);
            } else { console.warn("Site config form not found for listener setup."); }

            const addLinkBtn = document.getElementById('add-header-link-button');
            if (addLinkBtn) {
                addLinkBtn.removeEventListener('click', handleAddHeaderLinkButtonClick);
                addLinkBtn.addEventListener('click', handleAddHeaderLinkButtonClick);
            } else { console.warn("Add header link button not found for listener setup."); }

            const addProductBtn = document.getElementById('add-product-button');
            if (addProductBtn) {
                addProductBtn.removeEventListener('click', handleAddProductButtonClick);
                addProductBtn.addEventListener('click', handleAddProductButtonClick);
            } else { console.warn("Add product button not found for listener setup."); }
        }
        function handleAddHeaderLinkButtonClick() { addHeaderLinkInput(); }
        function handleAddProductButtonClick() { openProductEditModal(); }


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
             configSaveStatus.textContent = ''; configSaveStatus.className = 'text-sm text-center h-5 mt-2';

             const updatedConfig = {
                  siteTitle: configSiteTitleInput.value.trim(),
                  siteIconUrl: configSiteIconUrlInput.value.trim() || null,
                  headerLinks: []
              };
             configHeaderLinksContainer.querySelectorAll('.link-group').forEach(group => {
                 const nameInput = group.querySelector('.link-name');
                 const hrefInput = group.querySelector('.link-href');
                 const targetInput = group.querySelector('.link-target');
                 if (nameInput?.value.trim() && hrefInput?.value.trim()) {
                     // Ensure internal links start with '/'
                     let hrefVal = hrefInput.value.trim();
                     if (!hrefVal.startsWith('http') && !hrefVal.startsWith('/')) {
                         hrefVal = '/' + hrefVal;
                     }
                     updatedConfig.headerLinks.push({
                         name: nameInput.value.trim(),
                         href: hrefVal,
                         target: targetInput?.value.trim() || null
                     });
                 }
             });

             console.log("Saving site config:", updatedConfig);

             try {
                 const response = await fetch(`${API_BASE_URL}/api/config`, {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(updatedConfig),
                     credentials: 'include'
                 });
                 const result = await response.json();
                 if (!response.ok) {
                     throw new Error(result.error || `HTTP error! status: ${response.status}`);
                 }

                 siteConfig = result;
                 applySiteConfig(siteConfig); // Re-apply config to update header links immediately
                 configSaveStatus.textContent = 'Configuration saved successfully!';
                 configSaveStatus.classList.add('text-green-400');
                 showPopupMessage(configMessagePopup, 'Site configuration saved!');

             } catch (error) {
                 console.error("Error saving site config:", error);
                 configSaveStatus.textContent = `Error: ${error.message}`;
                 configSaveStatus.classList.add('text-red-400');
                 showPopupMessage(errorMessagePopup, `Failed to save config: ${error.message}`, true);
             } finally {
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

            productDetailLoading.classList.remove('hidden');
            productDetailContainer.classList.add('hidden');

            try {
                const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error("Product not found.");
                    throw new Error(`HTTP error fetching product details: ${response.status}`);
                }
                const productData = await response.json();
                console.log("[fetchProductDetails] Received product data:", productData);
                renderProductDetails(productData);
                productDetailLoading.classList.add('hidden');
                productDetailContainer.classList.remove('hidden');

            } catch (error) {
                console.error("Error fetching product details:", error);
                productDetailLoading.textContent = `Error loading product: ${error.message}`;
                productDetailLoading.classList.remove('hidden');
                productDetailContainer.classList.add('hidden');
                showPopupMessage(errorMessagePopup, `Error loading product: ${error.message}`, true);
                if (error.message.includes("not found")) {
                     setTimeout(() => { history.pushState({ path: '/products' }, '', '/products'); runNavigation(); }, 3000);
                }
            }
        }

        function renderProductDetails(product) {
             if (!product) {
                 console.warn("renderProductDetails called with null product data.");
                 return;
             }
             const elements = {
                 image: document.getElementById('product-detail-image'),
                 name: document.getElementById('product-detail-name'),
                 price: document.getElementById('product-detail-price'),
                 rating: document.getElementById('product-detail-rating'),
                 stock: document.getElementById('product-detail-stock'),
                 descContainer: document.getElementById('product-detail-description-container'),
                 description: document.getElementById('product-detail-description'),
                 sellerAvatar: document.getElementById('seller-avatar'),
                 sellerName: document.getElementById('seller-name'),
                 sellerEstablished: document.getElementById('seller-established'),
                 sellerReviewScore: document.getElementById('seller-review-score'),
                 reviewsList: document.getElementById('product-reviews-list'),
                 openTicketLink: document.getElementById('product-detail-open-ticket') // Get ticket link
             };

             const missingElements = Object.entries(elements).filter(([key, el]) => !el);
             if (missingElements.length > 0) {
                 console.error(`Error rendering product details: Missing elements - ${missingElements.map(([key]) => key).join(', ')}`);
                 if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error displaying product details: UI structure mismatch.</div>`;
                 return;
             }

             elements.image.src = product.thumbnailUrl || 'https://placehold.co/600x400/374151/9ca3af?text=No+Image';
             elements.image.alt = product.name ? `${product.name} Image` : 'Product Image';
             elements.name.textContent = product.name || 'Product Name Unavailable';
             elements.price.textContent = product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable';

             const ratingValue = product.averageRating ?? 5;
             const stockValue = product.stock ?? 6;
             elements.rating.innerHTML = `${'★'.repeat(ratingValue)}${'☆'.repeat(5 - ratingValue)}`;
             elements.stock.textContent = `${stockValue} in stock`;

             if (product.description) {
                elements.description.textContent = product.description;
                elements.descContainer.classList.remove('hidden');
             } else {
                elements.description.textContent = 'No description provided.';
             }

             elements.sellerName.textContent = product.sellerName || 'ShilletteFN';
             elements.sellerEstablished.textContent = product.sellerEstablishedDate
                 ? `Established ${formatTimeAgo(product.sellerEstablishedDate)}`
                 : 'Established several months ago';
             elements.sellerReviewScore.textContent = `The seller has an average review score of ${ratingValue} stars out of 5`;

             // Update the "Open a ticket" link href
             elements.openTicketLink.href = '/tickets'; // Point to the tickets page path

             elements.reviewsList.innerHTML = '';
             const reviews = product.reviews || [];
             if (reviews.length > 0) {
                 reviews.forEach(review => {
                     const reviewCard = document.createElement('div');
                     reviewCard.className = 'review-card';
                     const reviewRating = review.rating ?? 5;
                     const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'recently';
                     const reviewerName = review.reviewerName || 'Verified customer';

                     reviewCard.innerHTML = `
                         <div class="flex justify-between items-center mb-2">
                             <span class="text-xs text-green-400 font-medium">Verified purchase</span>
                             <span class="star-rating text-sm">${'★'.repeat(reviewRating)}${'☆'.repeat(5 - reviewRating)}</span>
                         </div>
                         <p class="text-sm text-gray-300 mb-1 italic">${review.text || 'No review text provided.'}</p>
                         <p class="text-xs text-gray-500">Reviewed by ${reviewerName} on ${reviewDate}</p>
                     `;
                     elements.reviewsList.appendChild(reviewCard);
                 });
             } else {
                 elements.reviewsList.innerHTML = '<p class="text-gray-400 md:col-span-2 lg:col-span-3">No reviews available for this product yet.</p>';
             }
        }

        function setupProductDetailListeners() {
            const buyNowButton = document.getElementById('product-detail-buy-now');
            const addBasketButton = document.getElementById('product-detail-add-basket');
            const quantityDecrease = document.getElementById('quantity-decrease');
            const quantityIncrease = document.getElementById('quantity-increase');
            const quantityInput = document.getElementById('quantity-input');
            const openTicketLink = document.getElementById('product-detail-open-ticket'); // Get ticket link again

            if (buyNowButton) {
                buyNowButton.addEventListener('click', () => {
                    console.log("Buy Now clicked");
                    showPopupMessage(paymentMessage, "Buy Now functionality not yet implemented.");
                });
            } else { console.warn("Buy Now button not found."); }

            if (addBasketButton) {
                addBasketButton.addEventListener('click', () => {
                    console.log("Add to Basket clicked");
                    const qty = parseInt(quantityInput?.value) || 1;
                    showPopupMessage(paymentMessage, `Added ${qty} item(s) to basket (feature not fully implemented).`);
                });
            } else { console.warn("Add Basket button not found."); }

            if (quantityDecrease && quantityInput) {
                quantityDecrease.addEventListener('click', () => {
                    let currentQuantity = parseInt(quantityInput.value) || 1;
                    if (currentQuantity > 1) {
                        quantityInput.value = currentQuantity - 1;
                    }
                });
            } else { console.warn("Quantity decrease button or input not found."); }

            if (quantityIncrease && quantityInput) {
                 quantityIncrease.addEventListener('click', () => {
                     let currentQuantity = parseInt(quantityInput.value) || 0;
                     quantityInput.value = currentQuantity + 1;
                 });
            } else { console.warn("Quantity increase button or input not found."); }

            // Click listener for open ticket link is handled globally now
            // if (openTicketLink) {
            //     openTicketLink.addEventListener('click', (e) => {
            //         console.log("Open ticket link clicked from product detail.");
            //     });
            // }
        }


    // --- Socket.IO Logic ---
    // ... (connectSocket, ensureSocketConnected, setupSocketListeners, disconnectSocket remain the same) ...
    function connectSocket(ticketIdToJoin = null) {
         if (socket?.connected) {
             if (ticketIdToJoin && currentPageKey === 'ticketdetail' && currentTicketId === ticketIdToJoin) {
                 console.log(`[connectSocket] Socket already connected, re-joining room: ${ticketIdToJoin}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
             } else {
                 console.log(`[connectSocket] Socket already connected. Current page: ${currentPageKey}, Ticket ID: ${currentTicketId}. Not joining room ${ticketIdToJoin || 'N/A'}.`);
             }
             return;
         }

         console.log(`[connectSocket] Attempting to connect WebSocket to ${SOCKET_URL}... (Potential room join: ${ticketIdToJoin || 'none'})`);
         if (socket) { socket.disconnect(); socket = null; }

         socket = io(SOCKET_URL, {
             reconnectionAttempts: 3,
             withCredentials: true
         });

         socket.on('connect', () => {
             console.log('[Socket Connect] WebSocket connected successfully. Socket ID:', socket.id);
             if (ticketIdToJoin && currentPageKey === 'ticketdetail' && currentTicketId === ticketIdToJoin) {
                 console.log(`[Socket Connect] Joining room post-connect: ${ticketIdToJoin}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
             }
             setupSocketListeners();
         });

         socket.on('disconnect', (reason) => {
             console.warn('[Socket Disconnect] WebSocket disconnected. Reason:', reason);
             socket = null;
         });

         socket.on('connect_error', (error) => {
             console.error('[Socket Connect Error] WebSocket connection error:', error);
             showPopupMessage(errorMessagePopup, `Chat connection failed: ${error.message}. Please check your connection.`, true);
             socket = null;
         });
    }

    function ensureSocketConnected() {
         if (!socket || !socket.connected) {
             console.log("[ensureSocketConnected] Socket not connected or instance is null. Attempting connection...");
             connectSocket(currentTicketId);
         } else {
             console.log("[ensureSocketConnected] Socket is already connected.");
             if (currentPageKey === 'ticketdetail' && currentTicketId) {
                 console.log(`[ensureSocketConnected] Re-joining room: ${currentTicketId}`);
                 socket.emit('join_ticket_room', { ticket_id: currentTicketId });
             }
         }
    }

    function setupSocketListeners() {
         if (!socket) return;
         console.log("[setupSocketListeners] Setting up WebSocket event listeners.");

         socket.off('new_message');
         socket.off('room_joined');
         socket.off('error_message');
         socket.off('message_deleted');
         socket.off('ticket_status_updated');
         socket.off('ticket_list_updated');
         socket.off('action_success');

         socket.on('new_message', (data) => {
             console.log("[Socket Event] Received 'new_message':", data);
             if (!data.sender_id && data.username === currentUser?.username) {
                 data.sender_id = currentUser.user_id;
             }
             if (currentPageKey === 'ticketdetail' && data.ticket_id === currentTicketId) {
                 const chatMessagesDiv = document.getElementById('chat-messages');
                 if (chatMessagesDiv) {
                     appendChatMessage(data, chatMessagesDiv);
                 } else {
                     console.warn("Chat messages container not found when receiving 'new_message'.");
                 }
             } else {
                 console.log(`Received message for ticket ${data.ticket_id}, but not currently viewing it.`);
             }
         });

         socket.on('room_joined', (data) => {
             console.log(`[Socket Event] Successfully joined room: ${data.room}`);
         });

         socket.on('error_message', (data) => {
             console.error('[Socket Event] Received server error:', data.message);
             showPopupMessage(errorMessagePopup, data.message || 'An unexpected chat error occurred.', true);
         });

         socket.on('message_deleted', (data) => {
             console.log("[Socket Event] Received 'message_deleted':", data);
             if (currentPageKey === 'ticketdetail' && data.ticket_id === currentTicketId) {
                 const chatMessagesDiv = document.getElementById('chat-messages');
                 const messageToRemove = chatMessagesDiv?.querySelector(`.chat-message[data-timestamp="${data.timestamp}"]`);
                 if (messageToRemove) {
                     messageToRemove.remove();
                     console.log(`[Socket Event] Removed deleted message with timestamp: ${data.timestamp}`);
                 } else {
                     console.warn(`[Socket Event] Could not find message to delete with timestamp: ${data.timestamp}`);
                 }
             }
         });

         socket.on('ticket_status_updated', (data) => {
              console.log("[Socket Event] Received 'ticket_status_updated':", data);
              if (currentPageKey === 'tickets') {
                  console.log(`[Socket Event] Ticket ${data.ticket_id} status updated to ${data.status}. Refreshing ticket list.`);
                  fetchTickets();
              }
              if (currentPageKey === 'ticketdetail' && data.ticket_id === currentTicketId) {
                  showPopupMessage(ticketMessagePopup, `Ticket status successfully updated to ${data.status}.`);
              }
              if (contextMenuData.ticketId === data.ticket_id) {
                  contextMenuData.ticketStatus = data.status;
              }
         });

          socket.on('ticket_list_updated', () => {
              console.log("[Socket Event] Received 'ticket_list_updated' (likely due to deletion/creation).");
              if (currentPageKey === 'tickets') {
                  console.log("[Socket Event] Refreshing ticket list.");
                  fetchTickets();
              }
              if (currentPageKey === 'ticketdetail' && currentTicketId) {
                  console.warn(`[Socket Event] Ticket list updated while viewing ticket ${currentTicketId}. The ticket might have been deleted.`);
                  showPopupMessage(errorMessagePopup, "The ticket list has changed. You may need to navigate back.", true, 5000);
              }
          });

         socket.on('action_success', (data) => {
             console.log("[Socket Event] Received 'action_success':", data);
             showPopupMessage(paymentMessage, data.message || 'Action completed successfully.');
         });
    }

    function disconnectSocket() {
        if (socket?.connected) {
            console.log('[disconnectSocket] Disconnecting WebSocket...');
            socket.disconnect();
        }
        socket = null;
    }


    // --- Modal and Context Menu Logic ---
    // ... (showUserInfoModal, hideUserInfoModal, positionContextMenu, hideContextMenu, hideContextMenuOnClickOutside, showChatContextMenu, showTicketContextMenu remain the same) ...
    // ... (Context Menu Action Handlers: deleteChatMessage, closeTicket, reopenTicket, deleteTicket remain the same) ...
    // ... (Product Edit Modal Logic: openProductEditModal, toggleCustomHexInput, closeProductEditModal, handleSaveProduct, handleDeleteProduct remain the same, but ensure internal checks use currentPageKey) ...

        function showUserInfoModal(senderId, username) {
         if (!userInfoModal || !senderId) return;

         if (modalUsername) modalUsername.textContent = username || 'Unknown User';
         if (modalUserId) modalUserId.textContent = senderId;
         if (modalUserRoles) modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Loading roles...</p>';

         if (currentUser?.logged_in && currentUser.user_id === senderId && currentUser.roles) {
             displayUserRoles(currentUser.roles); // Use displayUserRoles defined for dashboard
         } else {
             if (modalUserRoles) modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Role information not available for this user.</p>';
         }
         userInfoModal.classList.add('active');
    }

    function hideUserInfoModal() {
        if (userInfoModal) userInfoModal.classList.remove('active');
    }

    function positionContextMenu(menuElement, event) {
         if (!menuElement || !event) return;
         const rect = event.target.getBoundingClientRect();
         let top = event.clientY + window.scrollY + 5;
         let left = event.clientX + window.scrollX + 5;
         const menuHeight = menuElement.offsetHeight || 150;
         const menuWidth = menuElement.offsetWidth || 150;
         const windowHeight = window.innerHeight + window.scrollY;
         const windowWidth = window.innerWidth + window.scrollX;
         if (top + menuHeight > windowHeight) { top = event.clientY + window.scrollY - menuHeight - 5; }
         if (left + menuWidth > windowWidth) { left = event.clientX + window.scrollX - menuWidth - 5; }
         if (top < window.scrollY) top = window.scrollY;
         if (left < window.scrollX) left = window.scrollX;
         menuElement.style.top = `${top}px`;
         menuElement.style.left = `${left}px`;
         menuElement.style.display = 'block';
     }

    function hideContextMenu() {
        if (chatContextMenu) chatContextMenu.style.display = 'none';
        if (ticketContextMenu) ticketContextMenu.style.display = 'none';
        document.removeEventListener('click', hideContextMenuOnClickOutside);
        window.removeEventListener('scroll', hideContextMenu);
        currentContextMenu = null;
    }

    function hideContextMenuOnClickOutside(event) {
        if (currentContextMenu && !currentContextMenu.contains(event.target)) {
            hideContextMenu();
        }
    }

    function showChatContextMenu(event) {
         event.preventDefault();
         hideContextMenu();
         if (!currentUser?.is_moderator || !chatContextMenu) return;
         const messageElement = event.target.closest('.chat-message');
         if (!messageElement) return;

         contextMenuData.ticketId = currentTicketId;
         contextMenuData.messageTimestamp = messageElement.dataset.timestamp;
         contextMenuData.senderId = messageElement.dataset.senderId;
         contextMenuData.ticketStatus = null;

         positionContextMenu(chatContextMenu, event);
         currentContextMenu = chatContextMenu;

         setTimeout(() => {
              document.addEventListener('click', hideContextMenuOnClickOutside);
              window.addEventListener('scroll', hideContextMenu, { once: true });
         }, 0);
     }

    function showTicketContextMenu(event) {
          event.preventDefault();
          hideContextMenu();
          if (!currentUser?.logged_in || !ticketContextMenu) return;
          const ticketElement = event.target.closest('.ticket-list-item'); // Should be <a> now
          if (!ticketElement) return;

          contextMenuData.ticketId = ticketElement.dataset.ticketId;
          contextMenuData.ticketStatus = ticketElement.dataset.ticketStatus;
          contextMenuData.senderId = null;
          contextMenuData.messageTimestamp = null;
          console.log("[showTicketContextMenu] Context data:", contextMenuData);

          const isMod = currentUser.is_moderator === true;
          const canClose = contextMenuData.ticketStatus === 'open';
          const canReopen = contextMenuData.ticketStatus === 'closed' && isMod;
          const canDelete = isMod;

          contextCloseTicketButton.classList.toggle('hidden', !canClose);
          contextReopenTicketButton.classList.toggle('hidden', !canReopen);
          contextDeleteTicketButton.classList.toggle('hidden', !canDelete);

          if (canClose || canReopen || canDelete) {
              positionContextMenu(ticketContextMenu, event);
              currentContextMenu = ticketContextMenu;
              setTimeout(() => {
                   document.addEventListener('click', hideContextMenuOnClickOutside);
                   window.addEventListener('scroll', hideContextMenu, { once: true });
              }, 0);
          }
     }

    function deleteChatMessage() {
          if (!contextMenuData.ticketId || !contextMenuData.messageTimestamp || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot delete message: Invalid state or not connected.', true); return;
          }
          console.log(`[Action] Attempting to delete message: Ticket ${contextMenuData.ticketId}, Timestamp ${contextMenuData.messageTimestamp}`);
          socket.emit('delete_message', { ticket_id: contextMenuData.ticketId, message_timestamp: contextMenuData.messageTimestamp });
          hideContextMenu();
      }

    function closeTicket() {
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot close ticket: Invalid state or not connected.', true); return;
          }
          console.log(`[Action] Attempting to close ticket: ${contextMenuData.ticketId}`);
          socket.emit('update_ticket_status', { ticket_id: contextMenuData.ticketId, new_status: 'closed' });
          hideContextMenu();
      }

    function reopenTicket() {
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot reopen ticket: Invalid state or not connected.', true); return;
          }
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'You do not have permission to reopen tickets.', true); hideContextMenu(); return;
          }
          console.log(`[Action] Attempting to reopen ticket: ${contextMenuData.ticketId}`);
          socket.emit('update_ticket_status', { ticket_id: contextMenuData.ticketId, new_status: 'open' });
          hideContextMenu();
      }

    function deleteTicket() {
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot delete ticket: Invalid state or not connected.', true); return;
          }
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'You do not have permission to delete tickets.', true); hideContextMenu(); return;
          }
          const shortId = contextMenuData.ticketId.slice(-6);
          if (confirm(`Are you sure you want to permanently delete ticket #${shortId}? This action cannot be undone.`)) {
              console.log(`[Action] Attempting to delete ticket: ${contextMenuData.ticketId}`);
              socket.emit('delete_ticket', { ticket_id: contextMenuData.ticketId });
          }
          hideContextMenu();
      }

    function openProductEditModal(product = null) {
         if (!productEditModal || !productEditForm || !customHexInputContainer || !productModalTitle || !productEditIdInput || !productEditNameInput || !productEditThumbnailInput || !productEditPriceInput || !productEditTagInput || !productEditTagColorSelect || !productEditCustomHexInput || !productEditDescriptionInput || !productEditFeaturesInput || !productEditPaymentLinkInput || !productEditStatus || !productEditThumbnailFilename) {
             console.error("Cannot open product modal: One or more elements not found.");
             showPopupMessage(errorMessagePopup, "Error opening product editor.", true);
             return;
         }
         productEditForm.reset();
         productEditStatus.textContent = '';
         productEditStatus.className = 'text-sm text-center h-5 mt-2';
         productEditThumbnailFilename.textContent = 'No file selected';

         if (product) {
             productModalTitle.textContent = 'Edit Product';
             productEditIdInput.value = product._id;
             productEditNameInput.value = product.name || '';
             productEditThumbnailInput.value = product.thumbnailUrl || '';
             productEditPriceInput.value = product.price || '';
             productEditTagInput.value = product.tag || '';
             const hasValidCustomHex = product.customBorderHex && /^#[0-9A-F]{6}$/i.test(product.customBorderHex);
             productEditTagColorSelect.value = hasValidCustomHex ? 'custom' : (product.tagColor || 'gray');
             productEditCustomHexInput.value = hasValidCustomHex ? product.customBorderHex : '';
             productEditDescriptionInput.value = product.description || '';
             productEditFeaturesInput.value = (product.features || []).join('\n');
             productEditPaymentLinkInput.value = product.paymentLink || '';
         } else {
             productModalTitle.textContent = 'Add New Product';
             productEditIdInput.value = '';
             productEditTagColorSelect.value = 'gray';
             productEditCustomHexInput.value = '';
         }
         toggleCustomHexInput();
         productEditModal.classList.add('active');
    }

    function toggleCustomHexInput() {
         if (customHexInputContainer && productEditTagColorSelect) {
              const selectedColor = productEditTagColorSelect.value;
              customHexInputContainer.classList.toggle('hidden', selectedColor !== 'custom');
         }
     }

    function closeProductEditModal() {
         if (productEditModal) productEditModal.classList.remove('active');
     }

    async function handleSaveProduct(event) {
          event.preventDefault();
          if (!productEditForm || !productSaveButton) return;

          productSaveButton.disabled = true; productSaveButton.textContent = 'Saving...';
          productEditStatus.textContent = ''; productEditStatus.className = 'text-sm text-center h-5 mt-2';

          const productId = productEditIdInput.value;
          const isEditing = !!productId;
          const url = isEditing ? `${API_BASE_URL}/api/products/${productId}` : `${API_BASE_URL}/api/products`;
          const method = isEditing ? 'PUT' : 'POST';

          let tagColorValue = productEditTagColorSelect.value;
          let customHexValue = productEditCustomHexInput.value.trim();
          let finalTagColor = 'gray';
          let finalCustomHex = null;

          if (tagColorValue === 'custom') {
              if (customHexValue && /^#[0-9A-F]{6}$/i.test(customHexValue)) {
                  finalTagColor = 'custom';
                  finalCustomHex = customHexValue;
              } else {
                  productEditStatus.textContent = 'Invalid Custom HEX format. Use #RRGGBB (e.g., #FF5733).';
                  productEditStatus.classList.add('text-red-400');
                  productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
                  return;
              }
          } else {
              finalTagColor = tagColorValue || 'gray';
              finalCustomHex = null;
          }

          const productData = {
              name: productEditNameInput.value.trim(),
              thumbnailUrl: productEditThumbnailInput.value.trim() || null,
              price: parseFloat(productEditPriceInput.value),
              tag: productEditTagInput.value.trim() || null,
              tagColor: finalTagColor,
              customBorderHex: finalCustomHex,
              description: productEditDescriptionInput.value.trim() || null,
              features: productEditFeaturesInput.value.split('\n').map(f => f.trim()).filter(f => f),
              paymentLink: productEditPaymentLinkInput.value.trim() || null
          };

          if (!productData.name || isNaN(productData.price) || productData.price < 0) {
               productEditStatus.textContent = 'Product Name and a valid non-negative Price are required.';
               productEditStatus.classList.add('text-red-400');
               productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
               return;
          }

          console.log(`[Save Product] ${isEditing ? 'Updating' : 'Adding'} product:`, productData);

          try {
              const response = await fetch(url, {
                  method: method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(productData),
                  credentials: 'include'
              });
              const result = await response.json();
              if (!response.ok) {
                  throw new Error(result.error || `HTTP error! status: ${response.status}`);
              }

              showPopupMessage(productMessagePopup, `Product ${isEditing ? 'updated' : 'added'} successfully!`);
              closeProductEditModal();
              if (currentPageKey === 'dashboard') await loadProductManagementTable();
              if (currentPageKey === 'products') await fetchProducts();

          } catch (error) {
              console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
              productEditStatus.textContent = `Error: ${error.message}`;
              productEditStatus.classList.add('text-red-400');
              showPopupMessage(errorMessagePopup, `Failed to save product: ${error.message}`, true);
          } finally {
              productSaveButton.disabled = false;
              productSaveButton.textContent = 'Save Product';
          }
     }

    async function handleDeleteProduct(productId, productName) {
         if (!productId) return;
         if (!confirm(`Are you sure you want to permanently delete the product "${productName || 'this product'}"? This action cannot be undone.`)) {
             return;
         }

         console.log(`[Delete Product] Attempting to delete product ID: ${productId}`);

         try {
             const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                 method: 'DELETE',
                 credentials: 'include'
             });
             if (!response.ok) {
                 let errorData = { error: `HTTP ${response.status}` };
                 try { errorData = await response.json(); } catch(e){}
                 throw new Error(errorData.error || `Failed to delete product.`);
             }

             showPopupMessage(productMessagePopup, 'Product deleted successfully!');
             if (currentPageKey === 'dashboard') await loadProductManagementTable();
             if (currentPageKey === 'products') await fetchProducts();
             // Use history.replaceState if deleting the currently viewed detail page
             if (currentPageKey === 'productdetail' && window.location.pathname.includes(`/productdetail/${productId}`)) {
                 console.log("Deleted product was being viewed, redirecting to products list.");
                 history.replaceState({ path: '/products' }, '', '/products'); // Use replaceState to avoid broken back button
                 runNavigation(); // Trigger navigation to /products
             }

         } catch (error) {
             console.error("Error deleting product:", error);
             showPopupMessage(errorMessagePopup, `Failed to delete product: ${error.message}`, true);
         } finally {
             // loadingOverlay.classList.remove('active');
         }
     }


    // --- Logout Logic ---

    /** Handles the user logout process. */
    async function handleLogout() {
         console.log('[handleLogout] Initiating logout...');
         try {
             const response = await fetch(`${API_BASE_URL}/logout`, {
                 method: 'POST',
                 credentials: 'include'
             });
             if (!response.ok) {
                 let errorMsg = `Backend logout failed with status: ${response.status}`;
                 try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (parseError) {}
                 console.warn(`[handleLogout] ${errorMsg}. Proceeding with client-side cleanup.`);
             } else {
                 console.log("[handleLogout] Backend logout successful.");
             }
         } catch(error) {
             console.error("[handleLogout] Network error during backend logout request:", error);
         } finally {
              currentUser = null;
              isInitialLoginCheckComplete = false;
              isInitialConfigLoadComplete = false;
              disconnectSocket();
              updateHeaderUI(null);
              console.log("[handleLogout] Client-side cleanup complete. Navigating to /");
              // Navigate to home page using History API
              history.pushState({ path: '/' }, '', '/');
              runNavigation(); // Trigger navigation to home
         }
     }

    // --- Global Event Listeners Setup ---

    // Listen for Browser Back/Forward
    window.addEventListener('popstate', (event) => {
        console.log("[Popstate] Browser navigation triggered.", event.state);
        runNavigation(); // Re-run navigation logic based on the new URL path
    });

    // Listen for clicks to intercept internal links
    document.addEventListener('click', (event) => {
        // Find the closest ancestor anchor tag
        const link = event.target.closest('a');

        // Check if it's a valid internal link we should handle
        if (link &&
            link.target !== '_blank' && // Ignore links opening in new tabs
            link.origin === window.location.origin && // Ignore external links
            !link.pathname.startsWith('/api/') && // Ignore API links
            !link.hasAttribute('data-spa-ignore') && // Ignore links explicitly marked to be ignored
            link.href !== window.location.href // Ignore clicks on the current page link
           )
        {
            // Check if it's a path link (href doesn't contain '#')
            // Or if it's just the root path '/'
            const isPathLink = link.getAttribute('href').startsWith('/') && !link.getAttribute('href').includes('#');

            if(isPathLink) {
                event.preventDefault(); // Prevent default browser navigation
                const targetPath = link.pathname + link.search + link.hash; // Preserve query/hash if any (though we primarily use path now)

                console.log(`[Link Intercept] Navigating to: ${targetPath}`);
                history.pushState({ path: targetPath }, '', targetPath); // Update URL bar without reload
                runNavigation(); // Trigger content loading for the new path
            }
        }
    });


    // Initial setup on DOM ready
    createSnowflakes(); // Start snow effect
    checkLoginStatus(); // Start the initialization sequence (auth -> config -> navigation)

    // Listeners for static elements in the shell (header, modals, context menus)
    if (loginButton) loginButton.addEventListener('click', (e) => { e.preventDefault(); window.location.href = loginButton.href; }); // Keep external link behavior
    if (logoutButton) logoutButton.addEventListener('click', handleLogout); // Header logout button
    if (mobileMenuButton && mobileMenuNav) mobileMenuButton.addEventListener('click', () => mobileMenuNav.classList.toggle('hidden'));

    // Modal close listeners
    if (modalCloseButton) modalCloseButton.addEventListener('click', hideUserInfoModal);
    if (userInfoModal) userInfoModal.addEventListener('click', (event) => { if (event.target === userInfoModal) hideUserInfoModal(); }); // Close on backdrop click
    if (productModalCloseButton) productModalCloseButton.addEventListener('click', closeProductEditModal);
    if (productEditModal) productEditModal.addEventListener('click', (event) => { if (event.target === productEditModal) closeProductEditModal(); }); // Close on backdrop click

    // Context Menu Action Listeners (attach to the menu items themselves)
    if (contextDeleteButton) contextDeleteButton.addEventListener('click', deleteChatMessage);
    if (contextUserInfoButton) contextUserInfoButton.addEventListener('click', () => {
         if (contextMenuData.senderId) {
             const messageElement = document.querySelector(`.chat-message[data-timestamp="${contextMenuData.messageTimestamp}"]`);
             const usernameElement = messageElement?.querySelector('.username');
             const username = usernameElement ? usernameElement.textContent.replace(':', '') : 'User';
             showUserInfoModal(contextMenuData.senderId, username);
         }
         hideContextMenu();
     });
    if (contextCloseTicketButton) contextCloseTicketButton.addEventListener('click', closeTicket);
    if (contextReopenTicketButton) contextReopenTicketButton.addEventListener('click', reopenTicket);
    if (contextDeleteTicketButton) contextDeleteTicketButton.addEventListener('click', deleteTicket);

    // Product Edit Modal Form Listeners (global modal elements)
    if (productEditForm) productEditForm.addEventListener('submit', handleSaveProduct);
    if (productEditTagColorSelect) productEditTagColorSelect.addEventListener('change', toggleCustomHexInput);

    // Product Edit Thumbnail File Selection Listeners (global modal elements)
    if (productEditThumbnailButton && productEditThumbnailFileInput) {
        productEditThumbnailButton.addEventListener('click', () => {
            productEditThumbnailFileInput.click(); // Open file dialog
        });
    }
    if (productEditThumbnailFileInput && productEditThumbnailFilename) {
        productEditThumbnailFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                productEditThumbnailFilename.textContent = file.name; // Display filename
                if (productEditThumbnailInput) productEditThumbnailInput.value = '';
            } else {
                productEditThumbnailFilename.textContent = 'No file selected';
            }
            event.target.value = null;
        });
    }

    // --- End of Initialization ---
    console.log("Shillette MPF initialization complete. Using History API routing.");

}); // End DOMContentLoaded
