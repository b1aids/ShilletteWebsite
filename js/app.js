/**
 * Shillette Frontend Application Logic
 *
 * Handles routing, API calls, WebSocket communication,
 * dynamic content loading, and UI interactions for the MPF structure.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Shillette MPF...");

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
    let currentPage = null; // Track the currently loaded page name (e.g., 'home', 'products')

    // --- Page Mapping (Map hash names to content file paths) ---
    const pageRoutes = {
        'home': 'pages/home.html',
        'products': 'pages/products.html',
        'tickets': 'pages/tickets.html',
        'dashboard': 'pages/dashboard.html',
        'ticketDetail': 'pages/ticketDetail.html', // Needs ID param from hash
        'productDetail': 'pages/productDetail.html' // Needs ID param from hash
    };

    // --- Utility Functions ---

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
     * Fetches HTML content for a given page name and injects it into the main container.
     * Also triggers page-specific initialization logic.
     * @param {string} pageName - The key from pageRoutes (e.g., 'home', 'products').
     * @param {object} [params={}] - Parameters extracted from the URL hash query string.
     */
    async function loadPageContent(pageName, params = {}) {
        console.log(`[loadPageContent] Attempting to load page: ${pageName} with params:`, params);
        if (!pageContentContainer) {
            console.error("CRITICAL: Page content container (#page-content-container) not found!");
            return;
        }
        const filePath = pageRoutes[pageName];
        if (!filePath) {
            console.error(`No route found for page name: ${pageName}`);
            pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Page not found (${pageName}). Please check the URL.</div>`;
            currentPage = null; // Reset current page state
            return;
        }

        // Show loading indicator
        pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-gray-400">Loading ${pageName}...</div>`;
        currentPage = pageName; // Update current page state

        try {
            // Fetch the HTML content from the corresponding file
            const response = await fetch(filePath);
            if (!response.ok) {
                // Handle common errors like 404 Not Found
                throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();

            // Inject the fetched HTML into the container
            pageContentContainer.innerHTML = html;
            console.log(`[loadPageContent] Successfully loaded and injected HTML for ${pageName} from ${filePath}`);

            // --- Execute Page-Specific Initialization ---
            window.scrollTo(0, 0); // Scroll to top after loading new content

            switch (pageName) {
                case 'home':
                    // No specific JS needed for static home page elements currently
                    break;
                case 'products':
                    await fetchProducts(); // Fetch and render product cards
                    break;
                case 'tickets':
                    await fetchTickets(); // Fetch user/mod tickets
                    setupTicketFormListener(); // Add listener for the create ticket form
                    break;
                case 'dashboard':
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
                case 'ticketDetail':
                    currentTicketId = params.id; // Get ticket ID from URL parameters
                    if (currentTicketId) {
                         // Ensure the back button link is correct (might be redundant if static in HTML)
                         const backBtn = document.getElementById('back-to-tickets-button');
                         if (backBtn) backBtn.href = '/#tickets';
                         await fetchTicketDetails(currentTicketId); // Fetch chat messages for this ticket
                         setupTicketDetailListeners(); // Add listeners for chat form
                    } else {
                         console.error("Ticket ID missing for ticketDetail page.");
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Ticket ID is missing in the URL.</div>`;
                         currentPage = null; // Reset page state
                    }
                    break;
                case 'productDetail':
                    const productId = params.id; // Get product ID from URL parameters
                     if (productId) {
                         // Ensure back button link
                         const backBtn = document.getElementById('back-to-products-button-detail');
                         if (backBtn) backBtn.href = '/#products';
                         await fetchProductDetails(productId); // Fetch product data
                         setupProductDetailListeners(); // Add listeners for buy/basket/quantity buttons
                     } else {
                         console.error("Product ID missing for productDetail page.");
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Product ID is missing in the URL.</div>`;
                         currentPage = null; // Reset page state
                     }
                    break;
                default:
                    console.log(`No specific initialization logic defined for page: ${pageName}`);
            }

        } catch (error) {
            console.error(`Error loading or initializing page ${pageName}:`, error);
            pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error loading page content: ${error.message}</div>`;
            currentPage = null; // Reset page state on error
        }
    }

    // --- Authentication and Configuration ---

    /**
     * Checks the user's login status via the API. Updates `currentUser` state.
     */
    async function checkLoginStatus() {
         isInitialLoginCheckComplete = false;
         console.log("[checkLoginStatus] Checking user login status...");
         try {
             const response = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });
             // Handle logged out (401/403) or other errors
             if (!response.ok && (response.status === 401 || response.status === 403)) {
                 currentUser = { logged_in: false }; // Explicitly set logged_in to false
                 console.log("[checkLoginStatus] User is not logged in (401/403).");
             } else if (!response.ok) {
                 // Handle other potential network or server errors
                 throw new Error(`HTTP error! status: ${response.status}`);
             } else {
                 // User is likely logged in, parse the user data
                 currentUser = await response.json();
                 console.log("[checkLoginStatus] User is logged in:", currentUser);
             }
             updateHeaderUI(currentUser); // Update header based on login status
             // If logged in, ensure the WebSocket connection is established
             if (currentUser?.logged_in) {
                 ensureSocketConnected();
             }
         } catch (error) {
             console.error("[checkLoginStatus] Error checking login status:", error);
             currentUser = { logged_in: false }; // Assume logged out on error
             updateHeaderUI(currentUser); // Update header to reflect logged-out state
             showPopupMessage(errorMessagePopup, "Could not verify login status. Please try again later.", true);
         } finally {
             isInitialLoginCheckComplete = true;
             console.log("[checkLoginStatus] Initial login check complete.");
             // Trigger the next step in the initialization sequence
             await loadSiteConfigAndNavigate();
         }
    }

    /**
     * Loads the site configuration (title, icon, links) from the API.
     * Then, triggers the initial navigation based on the current URL hash.
     */
    async function loadSiteConfigAndNavigate() {
        // Only proceed if login check is done (avoids race conditions)
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
            applySiteConfig(siteConfig); // Apply title, icon, header links
        } catch (error) {
            console.error("[loadSiteConfig] Error loading site config:", error);
            showPopupMessage(errorMessagePopup, "Failed to load site configuration. Using default settings.", true);
            applySiteConfig(null); // Apply default config on error
        } finally {
            isInitialConfigLoadComplete = true;
            console.log("[loadSiteConfig] Initial config load complete.");
            // Now that both login status and config are known (or errored), run the initial navigation
            console.log("[loadSiteConfigAndNavigate] Triggering initial navigation.");
            runNavigation();
        }
    }

    /**
     * Applies site configuration to the UI (title, icon, header links, footer).
     * @param {object | null} config - The site configuration object, or null for defaults.
     */
    function applySiteConfig(config) {
        // Use config values or provide defaults
        const title = config?.siteTitle || "Shillette";
        const iconUrl = config?.siteIconUrl || "/images/icon.png"; // Default icon path
        const links = config?.headerLinks || [ // Default header links
            {name: "Home", href: "/#home"},
            {name: "Products", href: "/#products"},
            {name: "Tickets", href: "/#tickets"},
            {name: "Discord", href: "https://discord.gg/shillette", target: "_blank"}
        ];

        // Update document title
        document.title = title;
        // Update visible title in header
        if (siteTitleDisplay) siteTitleDisplay.textContent = title;
        // Update header icon
        if (headerSiteIcon) headerSiteIcon.src = iconUrl;
        // Update favicon
        if (faviconElement) faviconElement.href = iconUrl;

        // Populate main navigation (desktop)
        if (mainNavigation) {
            mainNavigation.innerHTML = ''; // Clear existing links
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.textContent = link.name;
                a.classList.add('text-gray-300', 'hover:text-white', 'transition', 'duration-200');
                if (link.target) {
                    a.target = link.target;
                    // Add rel="noopener noreferrer" for security and performance with target="_blank"
                    if (link.target === '_blank') a.rel = 'noopener noreferrer';
                }
                mainNavigation.appendChild(a);
            });
        }

        // Populate mobile navigation
        if (mobileMenuNav) {
            mobileMenuNav.innerHTML = ''; // Clear existing links
            links.forEach(link => {
                const mob_a = document.createElement('a');
                mob_a.href = link.href;
                mob_a.textContent = link.name;
                mob_a.classList.add('mobile-menu-link'); // Use mobile-specific class
                if (link.target) {
                    mob_a.target = link.target;
                    if (link.target === '_blank') mob_a.rel = 'noopener noreferrer';
                }
                // Add event listener to close the mobile menu when a link is clicked
                mob_a.addEventListener('click', () => mobileMenuNav.classList.add('hidden'));
                mobileMenuNav.appendChild(mob_a);
            });
        }

        // Update footer year
        if (footerYear) footerYear.textContent = new Date().getFullYear();
    }

    /**
     * Updates the header UI elements (login button vs. user info) based on login state.
     * @param {object | null} user - The current user object or null if logged out.
     */
    function updateHeaderUI(user) {
         const isLoggedIn = user?.logged_in;
         // Toggle visibility of login button and user info section
         if (loginButton) loginButton.classList.toggle('hidden', isLoggedIn);
         if (userInfo) {
             userInfo.classList.toggle('hidden', !isLoggedIn);
             userInfo.classList.toggle('flex', isLoggedIn); // Use flex to display items correctly
         }

         // If logged in, update username and avatar
         if (isLoggedIn) {
             if (userNameDisplay) userNameDisplay.textContent = user.username || 'User';
             if (userAvatarDisplay) {
                // Construct Discord avatar URL or use placeholder
                userAvatarDisplay.src = user.user_id && user.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32`
                    : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?'; // Placeholder
             }
         }
         // Note: Admin-specific UI elements (like admin dashboard links) are handled
         // when the respective page content (e.g., dashboard) is loaded.
    }

    // --- Navigation (Routing based on URL Hash) ---

    /**
     * Parses the URL hash, determines the target page and parameters,
     * checks access control, and triggers loading of the page content.
     */
    function runNavigation() {
        console.log(`[runNavigation] Processing hash: ${window.location.hash}`);

        // Ensure initial checks (login, config) are complete before navigating
        if (!isInitialLoginCheckComplete || !isInitialConfigLoadComplete) {
            console.log("[runNavigation] Initial checks not complete. Deferring navigation until ready.");
            return;
        }

        const hash = window.location.hash || '#home'; // Default to #home if hash is empty
        const hashParts = hash.split('?'); // Separate path from query string

        // Extract page name from the hash path part (remove # and potential leading /)
        let pageName = hashParts[0].substring(1); // Remove '#'
        if (pageName.startsWith('/')) pageName = pageName.substring(1);
        if (!pageName) pageName = 'home'; // Default to 'home' if path is empty

        // Parse query parameters
        const params = new URLSearchParams(hashParts[1] || '');
        const routeParams = {};
        params.forEach((value, key) => { routeParams[key] = value; });

        console.log(`[runNavigation] Parsed page name: '${pageName}', Params:`, routeParams);

        // --- Access Control ---
        const protectedRoutes = ['dashboard', 'tickets', 'ticketDetail'];
        if (protectedRoutes.includes(pageName) && !currentUser?.logged_in) {
            console.warn(`[runNavigation] Access denied to protected route '${pageName}'. User not logged in.`);
            showPopupMessage(errorMessagePopup, "Please log in to view this page.", true);
            // Redirect to home page, but avoid infinite loops if already trying to access home
            if (pageName !== 'home') {
                console.log("[runNavigation] Redirecting to /#home.");
                window.location.hash = '/#home';
            } else {
                // If they were already trying to access #home, load it directly
                console.log("[runNavigation] Already on #home, loading content.");
                loadPageContent('home', {}); // Load home page content
            }
            return; // Stop further processing for this navigation attempt
        }

        // --- Load Page Content ---
        console.log(`[runNavigation] Proceeding to load content for page: '${pageName}'`);

        // Handle WebSocket connection based on page context
        const isTicketRelated = ['tickets', 'ticketDetail'].includes(pageName);
        if (!isTicketRelated && socket) {
             console.log(`[runNavigation] Navigating away from ticket-related page, disconnecting socket.`);
             disconnectSocket();
        }
        if (isTicketRelated) {
             console.log(`[runNavigation] Navigating to ticket-related page, ensuring socket is connected.`);
             ensureSocketConnected(); // Connect or ensure connection for ticket pages
        }

        // Load the actual page content and run its specific logic
        loadPageContent(pageName, routeParams);
    }

    // --- Page-Specific Functions (Fetching data, Rendering UI, Setting up Listeners) ---

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
             // Valid custom hex color
             borderClasses = 'custom-border';
             inlineStyle = `border-color: ${customHex};`;
             // Generate hover shadow CSS variable based on hex
             hoverStyleVar = `--custom-hover-shadow: 0 0 8px 1px ${customHex}99, 0 0 16px 4px ${customHex}66, 0 0 32px 8px ${customHex}33;`;
             card.style.cssText = inlineStyle + hoverStyleVar;
             card.classList.add(borderClasses);
         } else if (tagColor !== 'custom' && ['gray', 'orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor)) {
             // Standard predefined color
             borderClasses = `card-gradient-border ${tagColor}-border`;
             card.classList.add(...borderClasses.split(' '));
         } else {
             // Fallback to gray border if color is invalid or 'custom' without valid hex
              borderClasses = `card-gradient-border gray-border`;
              card.classList.add(...borderClasses.split(' '));
         }

         // Determine tag background/text color (use gray if custom hex is invalid)
         const displayTagColor = (tagColor === 'custom' && !customHex) ? 'gray' : tagColor;
         const tagBgClass = `bg-${displayTagColor}-500/20`; // Use Tailwind opacity format
         const tagTextClass = `text-${displayTagColor}-300`; // Adjust text color shade if needed

         // Thumbnail Image Handling
         let thumbnailElement = null;
         const placeholderDiv = document.createElement('div');
         placeholderDiv.className = 'product-thumbnail-placeholder';
         placeholderDiv.style.display = 'none'; // Hide placeholder initially
         placeholderDiv.innerHTML = '<span>Image not found</span>';

         if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') {
             thumbnailElement = document.createElement('img');
             thumbnailElement.src = product.thumbnailUrl;
             thumbnailElement.alt = `${product.name || 'Product'} thumbnail`;
             thumbnailElement.className = 'product-thumbnail';
             // Fallback to placeholder if image fails to load
             thumbnailElement.onerror = () => {
                 console.warn(`Failed to load image: ${product.thumbnailUrl}`);
                 if (thumbnailElement) thumbnailElement.style.display = 'none'; // Hide broken image
                 placeholderDiv.style.display = 'flex'; // Show placeholder
             };
         } else {
             // No thumbnail URL provided, show placeholder immediately
             placeholderDiv.style.display = 'flex';
             thumbnailElement = null;
         }

         // Card Inner Content
         const innerDiv = document.createElement('div');
         innerDiv.className = 'product-card-inner'; // Includes padding and flex grow
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
                 <button class="view-details-button w-full bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300" data-product-id="${product._id}">View Details</button>
             </div>
         `;

         // Append thumbnail/placeholder and inner content
         if (thumbnailElement) card.appendChild(thumbnailElement);
         card.appendChild(placeholderDiv); // Always append placeholder in case image fails
         card.appendChild(innerDiv);

         // Add event listener to the card itself (delegation could also work)
         card.addEventListener('click', (event) => {
             const purchaseButton = event.target.closest('.purchase-button');
             const detailsButton = event.target.closest('.view-details-button');

             if (purchaseButton) {
                 handlePurchaseClick(event); // Handle purchase action
             } else if (detailsButton) {
                 // Navigate to product detail page
                 const productId = detailsButton.dataset.productId;
                 if (productId) {
                     window.location.hash = `productDetail?id=${productId}`;
                 }
             } else {
                 // Click on card area *not* buttons - could also navigate to detail
                 // const productId = card.dataset.productId;
                 // if (productId) {
                 //     window.location.hash = `/#productDetail?id=${productId}`;
                 // }
                 console.log("Card area clicked (not a button)");
             }
         });

         productGridElement.appendChild(card);
    }

    function handlePurchaseClick(event) {
         event.stopPropagation(); // Prevent card click listener if button is clicked
         const button = event.target.closest('.purchase-button');
         if (!button || button.disabled) return; // Ignore if not button or disabled

         const productId = button.dataset.productId;
         const paymentLink = button.dataset.paymentLink; // Could be a PayPal ID or a full URL
         console.log(`Purchase clicked for product ID: ${productId}, Link/ID: ${paymentLink}`);

         if (paymentLink) {
              // Basic placeholder - Replace with actual payment integration
              showPopupMessage(paymentMessage, `Initiating purchase for product ${productId}... (Integration Required)`);
              // Example: If paymentLink is a PayPal Button ID, you'd use the PayPal SDK here.
              // Example: If paymentLink is a URL, you might redirect: window.location.href = paymentLink;
         } else {
              showPopupMessage(errorMessagePopup, 'Payment link is missing or invalid for this product.', true);
         }
    }

    // Tickets Page Logic
    async function fetchTickets() {
        console.log("[fetchTickets] Fetching tickets...");
        // Get references to elements within the currently loaded 'tickets' page content
        const userTicketView = document.getElementById('user-ticket-view');
        const moderatorManagementView = document.getElementById('moderator-management-view');
        const ticketListDiv = document.getElementById('ticket-list');
        const ticketListStatus = document.getElementById('ticket-list-status');
        const moderatorActiveTicketListDiv = document.getElementById('moderator-active-ticket-list');
        const moderatorActiveListStatus = document.getElementById('moderator-active-list-status');
        const moderatorArchivedTicketListDiv = document.getElementById('moderator-archived-ticket-list');
        const moderatorArchivedListStatus = document.getElementById('moderator-archived-list-status');

        // Check if all required elements exist in the loaded HTML
        if (!userTicketView || !moderatorManagementView || !ticketListDiv || !ticketListStatus || !moderatorActiveTicketListDiv || !moderatorActiveListStatus || !moderatorArchivedTicketListDiv || !moderatorArchivedListStatus) {
            console.error("[fetchTickets] One or more ticket list elements not found in loaded content. Aborting fetch.");
            // Optionally display an error in the main container
            if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: UI elements missing for ticket display.</div>`;
            return;
        }

        // Check login status (should be redundant due to router, but good practice)
         if (!currentUser?.logged_in) {
             console.log("[fetchTickets] User not logged in. Displaying login prompt.");
             ticketListStatus.textContent = "Please log in to view tickets.";
             moderatorActiveListStatus.textContent = ""; // Clear mod statuses
             moderatorArchivedListStatus.textContent = "";
             ticketListDiv.innerHTML = ''; moderatorActiveTicketListDiv.innerHTML = ''; moderatorArchivedTicketListDiv.innerHTML = '';
             userTicketView.classList.remove('hidden'); // Show user view (which will contain the message)
             moderatorManagementView.classList.add('hidden'); // Hide mod view
             return;
         }

         // Set loading states
         ticketListStatus.textContent = "Loading tickets...";
         moderatorActiveListStatus.textContent = "Loading active tickets...";
         moderatorArchivedListStatus.textContent = "Loading archived tickets...";
         ticketListDiv.innerHTML = ''; moderatorActiveTicketListDiv.innerHTML = ''; moderatorArchivedTicketListDiv.innerHTML = ''; // Clear previous lists

         // Toggle visibility based on moderator status
         const isMod = currentUser.is_moderator === true;
         console.log(`[fetchTickets] User moderator status: ${isMod}`);
         userTicketView.classList.toggle('hidden', isMod);
         moderatorManagementView.classList.toggle('hidden', !isMod);

         try {
             // Fetch tickets from the API
             const response = await fetch(`${API_BASE_URL}/api/tickets`, { credentials: 'include' });
             if (!response.ok) {
                  if (response.status === 401 || response.status === 403) throw new Error("Authentication required to view tickets.");
                  else throw new Error(`HTTP error fetching tickets: ${response.status}`);
             }
             const tickets = await response.json();
             console.log(`[fetchTickets] Received ${tickets.length} tickets.`);

             // Clear loading messages
             ticketListStatus.textContent = ""; moderatorActiveListStatus.textContent = ""; moderatorArchivedListStatus.textContent = "";
             let hasUserTickets = false; let hasActiveModTickets = false; let hasArchivedModTickets = false;

             if (tickets.length === 0) {
                 // Display 'no tickets' messages
                 if (isMod) {
                     moderatorActiveListStatus.textContent = "No active tickets found.";
                     moderatorArchivedListStatus.textContent = "No archived tickets found.";
                 } else {
                     ticketListStatus.textContent = "You have no support tickets.";
                 }
             } else {
                 // Populate ticket lists
                 tickets.forEach(ticket => {
                     const item = createTicketListItem(ticket); // Use helper function to create element
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

                 // Update status messages if lists ended up empty after filtering
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
             // Display error in all relevant status areas
             ticketListStatus.textContent = errorMsg; moderatorActiveListStatus.textContent = errorMsg; moderatorArchivedListStatus.textContent = errorMsg;
             showPopupMessage(errorMessagePopup, `Error fetching tickets: ${error.message}`, true);
         }
    }

    function createTicketListItem(ticket) {
        const item = document.createElement('div');
        item.classList.add('ticket-list-item'); // Use global style
        // Store essential data on the element for event handlers and context menus
        item.dataset.ticketId = ticket._id;
        item.dataset.ticketStatus = ticket.status;
        item.dataset.ticketSubject = ticket.subject || 'No Subject';

        // Determine status style and text
        const statusClass = ticket.status === 'open' ? 'status-open' : 'status-closed';
        const statusText = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'N/A';
        // Format date or use fallback
        const dateOpened = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Date N/A';
        // Use last 6 chars for a shorter ID display
        const shortId = ticket._id ? ticket._id.slice(-6) : 'ID N/A';
        const subject = ticket.subject || 'No Subject';
        const username = ticket.username || 'Unknown User'; // Display username if available

        item.innerHTML = `
            <div>
                <p class="font-medium text-white">#${shortId}: ${subject}</p>
                <p class="text-xs text-gray-400">User: ${username} | Opened: ${dateOpened}</p>
            </div>
            <span class="${statusClass}">${statusText}</span>`;

        // Add click listener to navigate to the ticket detail page
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior if wrapped in <a>
            const targetHash = `/#ticketDetail?id=${ticket._id}`;
            console.log(`[Ticket Item Click] Navigating to: ${targetHash}`);
            window.location.hash = targetHash;
        });

        // Add context menu listener (handler function defined globally)
        item.addEventListener('contextmenu', showTicketContextMenu);

        return item;
    }

    function setupTicketFormListener() {
        // Find form elements within the loaded 'tickets' page content
        const createTicketForm = document.getElementById('create-ticket-form');
        const ticketSubjectInput = document.getElementById('ticket-subject');
        const ticketMessageInput = document.getElementById('ticket-message-input');
        const createTicketStatus = document.getElementById('create-ticket-status');
        const createTicketButton = document.getElementById('create-ticket-button');

        if (!createTicketForm || !ticketSubjectInput || !ticketMessageInput || !createTicketStatus || !createTicketButton) {
            console.warn("[setupTicketFormListener] Create ticket form elements not found in loaded content.");
            return;
        }

        // Add the submit event listener
        createTicketForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            const subject = ticketSubjectInput.value.trim();
            const message = ticketMessageInput.value.trim();

            // Clear previous status and reset style
            createTicketStatus.textContent = '';
            createTicketStatus.className = 'h-6 text-sm mt-4 mb-4 text-center';

            // Basic validation
            if (!subject || !message) {
                createTicketStatus.textContent = 'Please fill out both subject and message.';
                createTicketStatus.classList.add('error', 'text-red-400');
                return;
            }

            // Disable button and show loading state
            createTicketButton.disabled = true;
            createTicketButton.textContent = 'Submitting...';

            try {
                // Send POST request to create ticket API endpoint
                const response = await fetch(`${API_BASE_URL}/api/tickets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, message }),
                    credentials: 'include' // Send cookies for authentication
                });

                // Check for errors
                if (!response.ok) {
                    let errorData = { error: `HTTP error! status: ${response.status}` };
                    try { errorData = await response.json(); } catch (e) {} // Try to parse error response
                    throw new Error(errorData.error || `Failed to create ticket.`);
                }

                // const result = await response.json(); // Process result if needed
                createTicketStatus.textContent = 'Ticket submitted successfully!';
                createTicketStatus.classList.add('success', 'text-green-400');
                createTicketForm.reset(); // Clear the form fields

                // Refresh the ticket list immediately if still on the tickets page
                if (currentPage === 'tickets') {
                   console.log("Ticket created, refreshing ticket list.");
                   await fetchTickets();
                }

            } catch (error) {
                console.error('Error creating ticket:', error);
                createTicketStatus.textContent = `Error: ${error.message}`;
                createTicketStatus.classList.add('error', 'text-red-400');
            } finally {
                // Re-enable button and restore text
                createTicketButton.disabled = false;
                createTicketButton.textContent = 'Submit Ticket';
            }
        });
    }

    // Ticket Detail Page Logic
    async function fetchTicketDetails(ticketId) {
         console.log(`[fetchTicketDetails] Fetching details for ticket: ${ticketId}`);
         // Find elements within the currently loaded 'ticketDetail' page content
         const chatMessagesDiv = document.getElementById('chat-messages');
         const ticketDetailSubject = document.getElementById('ticket-detail-subject');

         if (!chatMessagesDiv || !ticketDetailSubject) {
             console.error("[fetchTicketDetails] Chat messages div or subject header not found in loaded content.");
             if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Could not display ticket details. UI elements missing.</div>`;
             return;
         }
         // Ensure user is logged in (redundant check)
         if (!currentUser?.logged_in) {
             console.warn("[fetchTicketDetails] User not logged in, cannot fetch details.");
             window.location.hash = '/#tickets'; // Redirect if somehow accessed while logged out
             return;
         }
         ensureSocketConnected(); // Make sure socket is ready for chat

         // Set loading state
         chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Loading messages...</p>';
         ticketDetailSubject.textContent = `Loading Ticket #${ticketId.slice(-6)}...`; // Show partial ID while loading

         try {
             // Fetch ticket details and messages from API
             const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, { credentials: 'include' });
             if (!response.ok) {
                 if (response.status === 401 || response.status === 403) throw new Error("Access Denied: You may not have permission to view this ticket.");
                 if (response.status === 404) throw new Error("Ticket not found.");
                 throw new Error(`HTTP error fetching ticket details: ${response.status}`);
             }
             const ticket = await response.json();
             console.log(`[fetchTicketDetails] Received details for ticket: ${ticketId}`, ticket);

             // Update ticket subject header
             ticketDetailSubject.textContent = ticket.subject || `Ticket #${ticketId.slice(-6)}`;
             chatMessagesDiv.innerHTML = ''; // Clear loading message

             // Render existing messages
             if (ticket.messages && ticket.messages.length > 0) {
                 ticket.messages.forEach(msg => appendChatMessage(msg, chatMessagesDiv));
             } else {
                 chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No messages in this ticket yet. Type below to start the conversation.</p>';
             }

             // Join the corresponding socket room *after* successfully fetching details
             if (socket?.connected) {
                 console.log(`[fetchTicketDetails] Emitting join_ticket_room for ticket: ${ticketId}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketId });
             } else {
                 console.warn("[fetchTicketDetails] Socket not connected when attempting to join ticket room.");
                 // Consider attempting connection again here if needed
             }

         } catch (error) {
             console.error("[fetchTicketDetails] Error fetching ticket details:", error);
             // Display error message in the chat area
             chatMessagesDiv.innerHTML = `<p class="text-red-400 text-center py-4">Error loading messages: ${error.message}</p>`;
             ticketDetailSubject.textContent = `Error Loading Ticket`; // Update header on error
             showPopupMessage(errorMessagePopup, `Error loading ticket: ${error.message}`, true);
             // Redirect back to tickets list if ticket not found or forbidden
             if (error.message.includes("not found") || error.message.includes("Access Denied")) {
                 setTimeout(() => { window.location.hash = '/#tickets'; }, 3000); // Redirect after a short delay
             }
         }
    }

    function appendChatMessage(data, chatMessagesDivElement) {
         if (!chatMessagesDivElement) {
             console.warn("Attempted to append chat message, but container element not found.");
             return;
         }
         // Remove placeholder messages if they exist
         const placeholderMsg = chatMessagesDivElement.querySelector('p.text-gray-500, p.text-red-400');
         if (placeholderMsg) placeholderMsg.remove();

         const messageElement = document.createElement('div');
         messageElement.classList.add('chat-message');
         // Store data attributes for context menu actions
         messageElement.dataset.timestamp = data.timestamp;
         messageElement.dataset.senderId = data.sender_id; // Crucial for user info/delete checks

         // Format timestamp
         const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
         // Sanitize username and text to prevent XSS
         const username = data.sender_username || data.username || 'System';
         const safeUsername = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
         const safeText = (data.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");

         // Create username span (clickable for user info modal)
         const usernameSpan = document.createElement('span');
         usernameSpan.classList.add('username');
         usernameSpan.textContent = `${safeUsername}:`;
         usernameSpan.addEventListener('click', () => showUserInfoModal(data.sender_id, safeUsername)); // showUserInfoModal is global

         // Assemble the message element
         messageElement.appendChild(usernameSpan);
         messageElement.append(` ${safeText} `); // Use text node for message content

         // Create and append timestamp span
         const timestampSpan = document.createElement('span');
         timestampSpan.classList.add('timestamp');
         timestampSpan.textContent = timestamp;
         messageElement.appendChild(timestampSpan);

         // Add context menu listener ONLY if the current user is a moderator
         if (currentUser?.is_moderator) {
            messageElement.addEventListener('contextmenu', showChatContextMenu); // showChatContextMenu is global
         }

         // Append the new message and scroll to bottom
         chatMessagesDivElement.appendChild(messageElement);
         chatMessagesDivElement.scrollTop = chatMessagesDivElement.scrollHeight;
    }

    function setupTicketDetailListeners() {
        // Find chat form elements within the loaded 'ticketDetail' content
        const chatInputForm = document.getElementById('chat-input-form');
        const chatInput = document.getElementById('chat-input');

        if (!chatInputForm || !chatInput) {
            console.warn("[setupTicketDetailListeners] Chat form elements not found in loaded content.");
            return;
        }

        // Add submit listener for sending chat messages
        chatInputForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent page reload
            const messageText = chatInput.value.trim();

            // Check if message is not empty, socket is connected, and we have a ticket ID
            if (messageText && socket?.connected && currentTicketId) {
                console.log(`[Chat Submit] Sending message to ticket ${currentTicketId}: "${messageText}"`);
                // Emit the message via WebSocket
                socket.emit('send_message', { ticket_id: currentTicketId, text: messageText });
                chatInput.value = ''; // Clear the input field
            } else if (!socket?.connected) {
                showPopupMessage(errorMessagePopup, 'Cannot send message: Not connected to chat server.', true);
            } else if (!currentTicketId) {
                showPopupMessage(errorMessagePopup, 'Cannot send message: No active ticket selected.', true);
            } else if (!messageText) {
                 showPopupMessage(errorMessagePopup, 'Cannot send an empty message.', true);
            }
        });

        // Note: Context menu listeners for individual messages are added in `appendChatMessage`
    }

    // Dashboard Page Logic
    function displayDashboardUserInfo() {
        // Find elements within the loaded 'dashboard' content
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
        // Find the roles container within the loaded 'dashboard' content
        const rolesContainer = document.getElementById('dashboard-user-roles');
        if (!rolesContainer) {
            console.warn('[displayUserRoles] Container #dashboard-user-roles not found in loaded dashboard content!');
            return;
        }
        rolesContainer.innerHTML = ''; // Clear previous roles/loading message

        if (roles && Array.isArray(roles) && roles.length > 0) {
            roles.forEach(role => {
                const roleElement = document.createElement('span');
                roleElement.classList.add('role-span'); // Use global style

                // Determine background color from role data or default
                let hexColor = '#9CA3AF'; // Default gray
                if (role.color && role.color !== 0) {
                    hexColor = '#' + role.color.toString(16).padStart(6, '0');
                }

                // Calculate luminance to set contrasting text color (black/white)
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const textColorClass = luminance > 0.5 ? 'text-black' : 'text-white';

                roleElement.textContent = role.name || `Role ${role.id}`; // Display role name or ID
                roleElement.style.backgroundColor = hexColor;
                roleElement.classList.add(textColorClass); // Apply text color class
                rolesContainer.appendChild(roleElement);
            });
        } else {
            // Display message if no roles found
            rolesContainer.innerHTML = '<p class="text-gray-400 text-sm w-full">No specific roles assigned.</p>';
        }
    }

    async function loadAdminDashboardData() {
        console.log("[loadAdminDashboardData] Loading admin-specific sections into dashboard...");
        // Find the container for admin sections within the loaded 'dashboard' content
        const adminSectionsContainer = document.getElementById('admin-dashboard-sections');
        if (!adminSectionsContainer) {
            console.warn("[loadAdminDashboardData] Admin sections container not found in dashboard content.");
            return;
        }
        // Double-check moderator status (should be redundant)
        if (!currentUser?.is_moderator) {
             adminSectionsContainer.classList.add('hidden');
             return;
        }
        // Ensure the container is visible
        adminSectionsContainer.classList.remove('hidden');

        // Load data into the forms/tables within the admin container
        await loadSiteConfigForm(); // Populate site config form
        await loadProductManagementTable(); // Populate product management table

        // Attach event listeners specific to the admin controls AFTER loading their data
        setupAdminDashboardListeners();
    }

    async function loadSiteConfigForm() {
        // Find form elements within the loaded 'dashboard' admin section
        const siteConfigForm = document.getElementById('site-config-form');
        const configSiteTitleInput = document.getElementById('config-site-title');
        const configSiteIconUrlInput = document.getElementById('config-site-icon-url');
        const configHeaderLinksContainer = document.getElementById('config-header-links-container');
        const configSaveStatus = document.getElementById('config-save-status');

        if (!siteConfigForm || !configSiteTitleInput || !configHeaderLinksContainer || !configSaveStatus || !configSiteIconUrlInput) {
             console.warn("[loadSiteConfigForm] Site config form elements not found in loaded dashboard content."); return;
        }
        // Ensure siteConfig state is loaded
        if (!siteConfig) {
            console.warn("[loadSiteConfigForm] Global siteConfig state not available. Cannot populate form.");
            configSaveStatus.textContent = "Error: Config data not loaded.";
            configSaveStatus.className = 'text-sm text-center h-5 mt-2 text-red-400';
            return; // Cannot proceed without config data
        }
        // Populate the form fields with current config values
        configSiteTitleInput.value = siteConfig.siteTitle || '';
        configSiteIconUrlInput.value = siteConfig.siteIconUrl || '';
        configHeaderLinksContainer.innerHTML = ''; // Clear any existing link inputs
        // Add input fields for each existing header link
        (siteConfig.headerLinks || []).forEach((link) => {
            addHeaderLinkInput(link.name, link.href, link.target); // addHeaderLinkInput adds to the container
        });
        // Reset status message
        configSaveStatus.textContent = '';
        configSaveStatus.className = 'text-sm text-center h-5 mt-2';
    }

    function addHeaderLinkInput(name = '', href = '', target = '') {
        // Find the container within the loaded 'dashboard' admin section
        const configHeaderLinksContainer = document.getElementById('config-header-links-container');
        if (!configHeaderLinksContainer) {
             console.warn("[addHeaderLinkInput] Header links container not found."); return;
        }

        const linkGroup = document.createElement('div');
        linkGroup.className = 'link-group flex items-center space-x-2 mb-2'; // Use classes for layout
        // Use specific classes for easier selection if needed later
        linkGroup.innerHTML = `
             <input type="text" placeholder="Link Name" value="${name}" class="link-name config-link-name flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
             <input type="text" placeholder="Link Href (e.g., /#page)" value="${href}" class="link-href config-link-href flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
             <input type="text" placeholder="Target (e.g., _blank)" value="${target || ''}" class="link-target config-link-target flex-none w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400">
             <button type="button" class="remove-link-button bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex-shrink-0" title="Remove Link">X</button>
         `;
         // Add event listener to the remove button for this specific link group
         linkGroup.querySelector('.remove-link-button').addEventListener('click', () => linkGroup.remove());
         configHeaderLinksContainer.appendChild(linkGroup);
    }

    async function loadProductManagementTable() {
         // Find table elements within the loaded 'dashboard' admin section
         const productListTableBody = document.getElementById('product-list-tbody');
         const productListStatus = document.getElementById('product-list-status');
         if (!productListTableBody || !productListStatus) {
             console.warn("[loadProductManagementTable] Product list table elements not found in loaded content."); return;
         }
         // Set loading state
         productListTableBody.innerHTML = ''; // Clear previous rows
         productListStatus.textContent = 'Loading products...';
         productListStatus.classList.remove('hidden');

         try {
             // Fetch all products (admin view needs all)
             const response = await fetch(`${API_BASE_URL}/api/products`);
             if (!response.ok) throw new Error(`HTTP error fetching products for admin: ${response.status}`);
             const products = await response.json();
             productListStatus.classList.add('hidden'); // Hide loading status

             if (!products || products.length === 0) {
                 productListStatus.textContent = 'No products found.';
                 productListStatus.classList.remove('hidden');
             } else {
                 // Populate the table body with product rows
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
                     // Add event listeners to the Edit/Delete buttons in this row
                     row.querySelector('.edit-btn').addEventListener('click', () => openProductEditModal(product)); // openProductEditModal is global
                     row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteProduct(product._id, product.name)); // handleDeleteProduct is global
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
        // Add listener for the dashboard-specific logout button (if it exists)
        const dbLogoutButton = document.getElementById('dashboard-logout-button');
        if (dbLogoutButton) {
            // Ensure listener isn't added multiple times if dashboard is reloaded
            dbLogoutButton.removeEventListener('click', handleLogout); // Remove previous if any
            dbLogoutButton.addEventListener('click', handleLogout); // Add fresh listener
        } else {
            console.warn("[setupDashboardListeners] Dashboard logout button not found in loaded content.");
        }
        // Add listeners for other dashboard-specific controls here if needed
    }

    function setupAdminDashboardListeners() {
        console.log("[setupAdminDashboardListeners] Setting up listeners for admin controls...");
        // Site Config Form Listener
        const siteConfigForm = document.getElementById('site-config-form');
        if (siteConfigForm) {
            siteConfigForm.removeEventListener('submit', handleSaveSiteConfig); // Prevent duplicates
            siteConfigForm.addEventListener('submit', handleSaveSiteConfig);
        } else { console.warn("Site config form not found for listener setup."); }

        // Add Header Link Button Listener
        const addLinkBtn = document.getElementById('add-header-link-button');
        if (addLinkBtn) {
            addLinkBtn.removeEventListener('click', handleAddHeaderLinkButtonClick); // Prevent duplicates
            addLinkBtn.addEventListener('click', handleAddHeaderLinkButtonClick);
        } else { console.warn("Add header link button not found for listener setup."); }

        // Add New Product Button Listener
        const addProductBtn = document.getElementById('add-product-button');
        if (addProductBtn) {
            addProductBtn.removeEventListener('click', handleAddProductButtonClick); // Prevent duplicates
            addProductBtn.addEventListener('click', handleAddProductButtonClick);
        } else { console.warn("Add product button not found for listener setup."); }

        // Note: Edit/Delete listeners for product table rows are added dynamically
        // in `loadProductManagementTable` when the rows are created.
    }
    // Named handlers for button clicks to allow removal
    function handleAddHeaderLinkButtonClick() { addHeaderLinkInput(); }
    function handleAddProductButtonClick() { openProductEditModal(); }


    async function handleSaveSiteConfig(event) {
         event.preventDefault(); // Prevent default form submission
         // Find form elements again within the current context
         const siteConfigForm = document.getElementById('site-config-form');
         const saveConfigButton = document.getElementById('save-config-button');
         const configSaveStatus = document.getElementById('config-save-status');
         const configSiteTitleInput = document.getElementById('config-site-title');
         const configSiteIconUrlInput = document.getElementById('config-site-icon-url');
         const configHeaderLinksContainer = document.getElementById('config-header-links-container');

         // Validate that all elements were found
         if (!siteConfigForm || !saveConfigButton || !configSaveStatus || !configSiteTitleInput || !configSiteIconUrlInput || !configHeaderLinksContainer) {
              console.error("Cannot save site config, one or more form elements missing in the current DOM.");
              showPopupMessage(errorMessagePopup, "Error saving config: UI elements missing.", true);
              return;
         }

         // Disable button and set loading state
         saveConfigButton.disabled = true; saveConfigButton.textContent = 'Saving...';
         configSaveStatus.textContent = ''; configSaveStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status

         // Construct the updated configuration object from form values
         const updatedConfig = {
              siteTitle: configSiteTitleInput.value.trim(),
              siteIconUrl: configSiteIconUrlInput.value.trim() || null, // Use null if empty
              headerLinks: []
          };
         // Iterate over link groups to build the headerLinks array
         configHeaderLinksContainer.querySelectorAll('.link-group').forEach(group => {
             const nameInput = group.querySelector('.link-name');
             const hrefInput = group.querySelector('.link-href');
             const targetInput = group.querySelector('.link-target');
             // Ensure inputs exist and have values before adding
             if (nameInput?.value.trim() && hrefInput?.value.trim()) {
                 updatedConfig.headerLinks.push({
                     name: nameInput.value.trim(),
                     href: hrefInput.value.trim(),
                     target: targetInput?.value.trim() || null // Use null if target is empty
                 });
             }
         });

         console.log("Saving site config:", updatedConfig);

         try {
             // Send PUT request to the API
             const response = await fetch(`${API_BASE_URL}/api/config`, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(updatedConfig),
                 credentials: 'include' // Important for authentication cookies
             });
             const result = await response.json(); // Attempt to parse JSON response
             if (!response.ok) {
                 // Throw error with message from API response or default HTTP status
                 throw new Error(result.error || `HTTP error! status: ${response.status}`);
             }

             // --- Success ---
             siteConfig = result; // Update the global config state with the saved data
             applySiteConfig(siteConfig); // Re-apply the config to update header, title, etc.
             configSaveStatus.textContent = 'Configuration saved successfully!';
             configSaveStatus.classList.add('text-green-400');
             showPopupMessage(configMessagePopup, 'Site configuration saved!'); // Show global success popup

         } catch (error) {
             // --- Error Handling ---
             console.error("Error saving site config:", error);
             configSaveStatus.textContent = `Error: ${error.message}`;
             configSaveStatus.classList.add('text-red-400');
             showPopupMessage(errorMessagePopup, `Failed to save config: ${error.message}`, true); // Show global error popup
         } finally {
             // --- Cleanup ---
             // Re-enable the save button regardless of success or failure
             saveConfigButton.disabled = false;
             saveConfigButton.textContent = 'Save Configuration';
         }
    }

    // Product Detail Page Logic
    async function fetchProductDetails(productId) {
        console.log(`[fetchProductDetails] Fetching details for product ID: ${productId}`);
        // Find elements within the loaded 'productDetail' content
        const productDetailLoading = document.getElementById('product-detail-loading');
        const productDetailContainer = document.getElementById('product-detail-container');

        if (!productDetailLoading || !productDetailContainer) {
             console.error("[fetchProductDetails] Loading indicator or detail container not found in loaded content.");
             if(pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error displaying product details: UI elements missing.</div>`;
             return;
        }

        // Show loading state
        productDetailLoading.classList.remove('hidden');
        productDetailContainer.classList.add('hidden'); // Hide main content area

        try {
            // Fetch specific product data from API
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error("Product not found.");
                throw new Error(`HTTP error fetching product details: ${response.status}`);
            }
            const productData = await response.json();
            console.log("[fetchProductDetails] Received product data:", productData);

            // Render the fetched data into the UI elements
            renderProductDetails(productData);

            // Hide loading, show content
            productDetailLoading.classList.add('hidden');
            productDetailContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Error fetching product details:", error);
            // Display error message in the loading area
            productDetailLoading.textContent = `Error loading product: ${error.message}`;
            productDetailLoading.classList.remove('hidden'); // Ensure error is visible
            productDetailContainer.classList.add('hidden'); // Keep content hidden
            showPopupMessage(errorMessagePopup, `Error loading product: ${error.message}`, true);
            // Optionally redirect if product not found
            if (error.message.includes("not found")) {
                 setTimeout(() => { window.location.hash = '/#products'; }, 3000);
            }
        }
    }

    function renderProductDetails(product) {
         if (!product) {
             console.warn("renderProductDetails called with null product data.");
             return;
         }
         // Find all necessary elements within the loaded 'productDetail' content
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
             reviewsList: document.getElementById('product-reviews-list')
         };

         // Check if all elements were found
         const missingElements = Object.entries(elements).filter(([key, el]) => !el);
         if (missingElements.length > 0) {
             console.error(`Error rendering product details: Missing elements - ${missingElements.map(([key]) => key).join(', ')}`);
             if (pageContentContainer) pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error displaying product details: UI structure mismatch.</div>`;
             return;
         }

         // Populate elements with product data (provide defaults)
         elements.image.src = product.thumbnailUrl || 'https://placehold.co/600x400/374151/9ca3af?text=No+Image';
         elements.image.alt = product.name ? `${product.name} Image` : 'Product Image';
         elements.name.textContent = product.name || 'Product Name Unavailable';
         elements.price.textContent = product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable';

         // Rating and Stock (with defaults)
         const ratingValue = product.averageRating ?? 5; // Default to 5 stars if null/undefined
         const stockValue = product.stock ?? 6; // Default to 6 if null/undefined
         elements.rating.innerHTML = `${'★'.repeat(ratingValue)}${'☆'.repeat(5 - ratingValue)}`;
         elements.stock.textContent = `${stockValue} in stock`;

         // Description
         if (product.description) {
            elements.description.textContent = product.description;
            elements.descContainer.classList.remove('hidden');
         } else {
            elements.description.textContent = 'No description provided.';
            // Optionally hide the container if you prefer: elements.descContainer.classList.add('hidden');
         }

         // Seller Info (with defaults)
         elements.sellerName.textContent = product.sellerName || 'ShilletteFN'; // Default seller name
         elements.sellerEstablished.textContent = product.sellerEstablishedDate
             ? `Established ${formatTimeAgo(product.sellerEstablishedDate)}`
             : 'Established several months ago'; // Default established text
         elements.sellerReviewScore.textContent = `The seller has an average review score of ${ratingValue} stars out of 5`;
         // elements.sellerAvatar.src = product.sellerAvatarUrl || 'https://placehold.co/40x40/7f8c8d/ecf0f1?text=S'; // Default avatar

         // Reviews (with defaults)
         elements.reviewsList.innerHTML = ''; // Clear loading/previous reviews
         const reviews = product.reviews || [];
         if (reviews.length > 0) {
             reviews.forEach(review => {
                 const reviewCard = document.createElement('div');
                 reviewCard.className = 'review-card'; // Use global style
                 const reviewRating = review.rating ?? 5; // Default review rating
                 const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'recently';
                 const reviewerName = review.reviewerName || 'Verified customer'; // Default reviewer name

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
        // Find buttons within the loaded 'productDetail' content
        const buyNowButton = document.getElementById('product-detail-buy-now');
        const addBasketButton = document.getElementById('product-detail-add-basket');
        const quantityDecrease = document.getElementById('quantity-decrease');
        const quantityIncrease = document.getElementById('quantity-increase');
        const quantityInput = document.getElementById('quantity-input');

        // Add listeners if elements exist
        if (buyNowButton) {
            buyNowButton.addEventListener('click', () => {
                console.log("Buy Now clicked");
                showPopupMessage(paymentMessage, "Buy Now functionality not yet implemented.");
                // TODO: Implement Buy Now logic (e.g., redirect to checkout, PayPal SDK)
            });
        } else { console.warn("Buy Now button not found."); }

        if (addBasketButton) {
            addBasketButton.addEventListener('click', () => {
                console.log("Add to Basket clicked");
                const qty = parseInt(quantityInput?.value) || 1;
                showPopupMessage(paymentMessage, `Added ${qty} item(s) to basket (feature not fully implemented).`);
                // TODO: Implement Add to Basket logic (e.g., update cart state, API call)
            });
        } else { console.warn("Add Basket button not found."); }

        if (quantityDecrease && quantityInput) {
            quantityDecrease.addEventListener('click', () => {
                let currentQuantity = parseInt(quantityInput.value) || 1;
                if (currentQuantity > 1) { // Prevent quantity from going below 1
                    quantityInput.value = currentQuantity - 1;
                }
            });
        } else { console.warn("Quantity decrease button or input not found."); }

        if (quantityIncrease && quantityInput) {
             quantityIncrease.addEventListener('click', () => {
                 let currentQuantity = parseInt(quantityInput.value) || 0;
                 // TODO: Add check against available stock if needed
                 // const maxStock = parseInt(document.getElementById('product-detail-stock')?.textContent) || Infinity;
                 // if (currentQuantity < maxStock) {
                     quantityInput.value = currentQuantity + 1;
                 // }
             });
        } else { console.warn("Quantity increase button or input not found."); }

        // Add listener for the "Open a ticket" link if needed
        const openTicketLink = document.getElementById('product-detail-open-ticket');
        if (openTicketLink) {
            openTicketLink.addEventListener('click', (e) => {
                // Could pre-fill ticket subject based on product
                console.log("Open ticket link clicked from product detail.");
                // Navigation will be handled by the href="/#tickets"
            });
        }
    }

    // --- Socket.IO Logic ---

    /**
     * Establishes or ensures a WebSocket connection.
     * Optionally joins a specific ticket room upon connection.
     * @param {string | null} [ticketIdToJoin=null] - The ticket ID to join after connecting.
     */
    function connectSocket(ticketIdToJoin = null) {
         // If already connected, potentially just rejoin the room if needed
         if (socket?.connected) {
             if (ticketIdToJoin && currentPage === 'ticketDetail' && currentTicketId === ticketIdToJoin) {
                 console.log(`[connectSocket] Socket already connected, re-joining room: ${ticketIdToJoin}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
             } else {
                 console.log(`[connectSocket] Socket already connected. Current page: ${currentPage}, Ticket ID: ${currentTicketId}. Not joining room ${ticketIdToJoin || 'N/A'}.`);
             }
             return;
         }

         console.log(`[connectSocket] Attempting to connect WebSocket to ${SOCKET_URL}... (Potential room join: ${ticketIdToJoin || 'none'})`);
         // Clean up any existing disconnected socket instance
         if (socket) { socket.disconnect(); socket = null; }

         // Establish new connection
         socket = io(SOCKET_URL, {
             reconnectionAttempts: 3, // Limit reconnection attempts
             withCredentials: true // Send cookies for authentication
         });

         // --- Socket Event Handlers ---
         socket.on('connect', () => {
             console.log('[Socket Connect] WebSocket connected successfully. Socket ID:', socket.id);
             // Join the ticket room *only* if connection is successful AND we are on the detail page for that ticket
             if (ticketIdToJoin && currentPage === 'ticketDetail' && currentTicketId === ticketIdToJoin) {
                 console.log(`[Socket Connect] Joining room post-connect: ${ticketIdToJoin}`);
                 socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
             }
             // Setup listeners for messages, errors, etc. *after* connection
             setupSocketListeners();
         });

         socket.on('disconnect', (reason) => {
             console.warn('[Socket Disconnect] WebSocket disconnected. Reason:', reason);
             // Optionally show a message to the user
             // showPopupMessage(errorMessagePopup, "Chat connection lost. Attempting to reconnect...", true, 5000);
             socket = null; // Clear the socket variable
         });

         socket.on('connect_error', (error) => {
             console.error('[Socket Connect Error] WebSocket connection error:', error);
             showPopupMessage(errorMessagePopup, `Chat connection failed: ${error.message}. Please check your connection.`, true);
             socket = null; // Clear the socket variable on error
         });
    }

    /**
     * Checks if the socket is connected, and attempts to connect if not.
     */
    function ensureSocketConnected() {
         if (!socket || !socket.connected) {
             console.log("[ensureSocketConnected] Socket not connected or instance is null. Attempting connection...");
             connectSocket(currentTicketId); // Attempt connection, passing current ticket ID if relevant
         } else {
             console.log("[ensureSocketConnected] Socket is already connected.");
             // If already connected, ensure we are in the correct room if on ticket detail page
             if (currentPage === 'ticketDetail' && currentTicketId) {
                 console.log(`[ensureSocketConnected] Re-joining room: ${currentTicketId}`);
                 socket.emit('join_ticket_room', { ticket_id: currentTicketId });
             }
         }
    }

    /**
     * Sets up listeners for various WebSocket events from the server.
     * Should be called after a successful connection.
     */
    function setupSocketListeners() {
         if (!socket) return; // Should not happen if called correctly, but safety check
         console.log("[setupSocketListeners] Setting up WebSocket event listeners.");

         // --- Clear existing listeners to prevent duplicates on reconnect ---
         socket.off('new_message');
         socket.off('room_joined');
         socket.off('error_message');
         socket.off('message_deleted');
         socket.off('ticket_status_updated');
         socket.off('ticket_list_updated');
         socket.off('action_success');
         // --- End Clear Listeners ---

         // Listener for new chat messages
         socket.on('new_message', (data) => {
             console.log("[Socket Event] Received 'new_message':", data);
             // Ensure sender_id is present (useful for context menu)
             if (!data.sender_id && data.username === currentUser?.username) {
                 data.sender_id = currentUser.user_id;
             }
             // Only append the message if the user is currently viewing the correct ticket detail page
             if (currentPage === 'ticketDetail' && data.ticket_id === currentTicketId) {
                 const chatMessagesDiv = document.getElementById('chat-messages'); // Find div in current content
                 if (chatMessagesDiv) {
                     appendChatMessage(data, chatMessagesDiv); // Append the message UI
                 } else {
                     console.warn("Chat messages container not found when receiving 'new_message'.");
                 }
             } else {
                 // Optionally show a notification for messages in other tickets
                 console.log(`Received message for ticket ${data.ticket_id}, but not currently viewing it.`);
                 // showPopupMessage(ticketMessagePopup, `New message in ticket #${data.ticket_id.slice(-6)}`);
             }
         });

         // Confirmation that the user joined a room
         socket.on('room_joined', (data) => {
             console.log(`[Socket Event] Successfully joined room: ${data.room}`);
         });

         // Handle generic error messages from the socket server
         socket.on('error_message', (data) => {
             console.error('[Socket Event] Received server error:', data.message);
             showPopupMessage(errorMessagePopup, data.message || 'An unexpected chat error occurred.', true);
         });

         // Handle message deletion events
         socket.on('message_deleted', (data) => {
             console.log("[Socket Event] Received 'message_deleted':", data);
             // If viewing the correct ticket, remove the message element
             if (currentPage === 'ticketDetail' && data.ticket_id === currentTicketId) {
                 const chatMessagesDiv = document.getElementById('chat-messages');
                 // Find the specific message element using its timestamp data attribute
                 const messageToRemove = chatMessagesDiv?.querySelector(`.chat-message[data-timestamp="${data.timestamp}"]`);
                 if (messageToRemove) {
                     messageToRemove.remove();
                     console.log(`[Socket Event] Removed deleted message with timestamp: ${data.timestamp}`);
                 } else {
                     console.warn(`[Socket Event] Could not find message to delete with timestamp: ${data.timestamp}`);
                 }
             }
         });

         // Handle ticket status updates (open/closed)
         socket.on('ticket_status_updated', (data) => {
              console.log("[Socket Event] Received 'ticket_status_updated':", data);
              // If on the main tickets list page, refresh the entire list to reflect the change
              if (currentPage === 'tickets') {
                  console.log(`[Socket Event] Ticket ${data.ticket_id} status updated to ${data.status}. Refreshing ticket list.`);
                  fetchTickets(); // Re-fetch the list
              }
              // If viewing the specific ticket that was updated, show a notification
              if (currentPage === 'ticketDetail' && data.ticket_id === currentTicketId) {
                  showPopupMessage(ticketMessagePopup, `Ticket status successfully updated to ${data.status}.`);
                  // Optionally, update any status indicator directly on the detail page UI
                  // const statusIndicator = document.getElementById('ticket-detail-status');
                  // if (statusIndicator) statusIndicator.textContent = `Status: ${data.status}`;
              }
              // Update the status stored in the context menu data if it matches the updated ticket
              if (contextMenuData.ticketId === data.ticket_id) {
                  contextMenuData.ticketStatus = data.status;
              }
         });

          // Handle events indicating the overall ticket list needs refreshing (e.g., a ticket was deleted)
          socket.on('ticket_list_updated', () => {
              console.log("[Socket Event] Received 'ticket_list_updated' (likely due to deletion/creation).");
              // If currently on the tickets page, refresh the list
              if (currentPage === 'tickets') {
                  console.log("[Socket Event] Refreshing ticket list.");
                  fetchTickets();
              }
              // If viewing a ticket detail that might have just been deleted, consider redirecting
              if (currentPage === 'ticketDetail' && currentTicketId) {
                  // A simple approach is to just redirect, as the current ticket might be gone.
                  // A more robust approach would be to try fetching the current ticket again
                  // and redirecting only if it fails with a 404.
                  console.warn(`[Socket Event] Ticket list updated while viewing ticket ${currentTicketId}. The ticket might have been deleted.`);
                  showPopupMessage(errorMessagePopup, "The ticket list has changed. You may need to navigate back.", true, 5000);
                  // Optional: Force redirect after a delay
                  // setTimeout(() => { window.location.hash = '/#tickets'; }, 4000);
              }
          });

         // Handle generic success messages (e.g., after an action via context menu)
         socket.on('action_success', (data) => {
             console.log("[Socket Event] Received 'action_success':", data);
             showPopupMessage(paymentMessage, data.message || 'Action completed successfully.'); // Use green popup
         });
    }

    /**
     * Disconnects the WebSocket if it's currently connected.
     */
    function disconnectSocket() {
        if (socket?.connected) { // Check if socket exists and is connected
            console.log('[disconnectSocket] Disconnecting WebSocket...');
            socket.disconnect();
        }
        socket = null; // Clear the socket variable
    }

    // --- Modal and Context Menu Logic ---

    /**
     * Shows the user info modal, populating it with data for the given user ID.
     * Attempts to use locally available role data first, could be extended to fetch if needed.
     * @param {string} senderId - The Discord User ID of the user.
     * @param {string} username - The username to display.
     */
    function showUserInfoModal(senderId, username) {
         if (!userInfoModal || !senderId) return; // Ensure modal exists and ID is provided

         // Populate basic info
         if (modalUsername) modalUsername.textContent = username || 'Unknown User';
         if (modalUserId) modalUserId.textContent = senderId;
         // Reset roles display to loading state
         if (modalUserRoles) modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Loading roles...</p>';

         // Attempt to populate roles if viewing the currently logged-in user
         if (currentUser?.logged_in && currentUser.user_id === senderId && currentUser.roles) {
             displayUserRoles(currentUser.roles); // Use the existing function to render roles
         } else {
             // If viewing another user, or roles aren't in currentUser state
             // For now, show unavailable. Could implement an API call here.
             if (modalUserRoles) modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Role information not available for this user.</p>';
             // TODO: Optional - Fetch roles via API if needed:
             // fetch(`${API_BASE_URL}/api/user/${senderId}/roles`)
             //   .then(response => response.json())
             //   .then(roles => displayUserRoles(roles)) // Assuming API returns roles in same format
             //   .catch(error => {
             //     console.error("Failed to fetch roles for user modal:", error);
             //     if (modalUserRoles) modalUserRoles.innerHTML = '<p class="text-red-400 text-xs">Could not load roles.</p>';
             //   });
         }
         // Show the modal
         userInfoModal.classList.add('active');
    }

    /** Hides the user info modal. */
    function hideUserInfoModal() {
        if (userInfoModal) userInfoModal.classList.remove('active');
    }

    /**
     * Positions a context menu element near the event target.
     * Adjusts position to stay within viewport boundaries.
     * @param {HTMLElement} menuElement - The context menu DOM element.
     * @param {MouseEvent} event - The contextmenu event object.
     */
    function positionContextMenu(menuElement, event) {
         if (!menuElement || !event) return;

         const rect = event.target.getBoundingClientRect(); // Get position of the clicked element
         // Calculate initial desired position (slightly offset from cursor)
         let top = event.clientY + window.scrollY + 5;
         let left = event.clientX + window.scrollX + 5;

         // Get menu dimensions (use estimates if not yet rendered)
         const menuHeight = menuElement.offsetHeight || 150;
         const menuWidth = menuElement.offsetWidth || 150;

         // Get viewport dimensions
         const windowHeight = window.innerHeight + window.scrollY;
         const windowWidth = window.innerWidth + window.scrollX;

         // Adjust position if menu would go off-screen
         if (top + menuHeight > windowHeight) { // Off bottom edge
             top = event.clientY + window.scrollY - menuHeight - 5; // Place above cursor
         }
         if (left + menuWidth > windowWidth) { // Off right edge
             left = event.clientX + window.scrollX - menuWidth - 5; // Place left of cursor
         }
         // Ensure menu doesn't go off the top or left edge
         if (top < window.scrollY) top = window.scrollY;
         if (left < window.scrollX) left = window.scrollX;

         // Apply calculated position and make visible
         menuElement.style.top = `${top}px`;
         menuElement.style.left = `${left}px`;
         menuElement.style.display = 'block';
     }

    /** Hides any currently visible context menu. */
    function hideContextMenu() {
        if (chatContextMenu) chatContextMenu.style.display = 'none';
        if (ticketContextMenu) ticketContextMenu.style.display = 'none';
        // Remove the click/scroll listeners used to close the menu
        document.removeEventListener('click', hideContextMenuOnClickOutside);
        window.removeEventListener('scroll', hideContextMenu);
        currentContextMenu = null; // Reset the tracked menu
    }

    /** Event listener callback to hide context menu when clicking outside it. */
    function hideContextMenuOnClickOutside(event) {
        // If a menu is open and the click was outside of it
        if (currentContextMenu && !currentContextMenu.contains(event.target)) {
            hideContextMenu();
        }
    }

    /** Shows the chat context menu (delete message, user info). Requires moderator role. */
    function showChatContextMenu(event) {
         event.preventDefault(); // Prevent default browser context menu
         hideContextMenu(); // Hide any other menus first
         // Check permissions and element validity
         if (!currentUser?.is_moderator || !chatContextMenu) return;
         const messageElement = event.target.closest('.chat-message');
         if (!messageElement) return; // Ensure the click was on a message

         // Store relevant data from the clicked message element
         contextMenuData.ticketId = currentTicketId; // Assumes this is set correctly for the page
         contextMenuData.messageTimestamp = messageElement.dataset.timestamp;
         contextMenuData.senderId = messageElement.dataset.senderId;
         contextMenuData.ticketStatus = null; // Not needed for chat context

         // Position and display the chat context menu
         positionContextMenu(chatContextMenu, event);
         currentContextMenu = chatContextMenu; // Track this as the active menu

         // Add listeners to close the menu on next click or scroll (use timeout to avoid immediate self-closing)
         setTimeout(() => {
              document.addEventListener('click', hideContextMenuOnClickOutside);
              window.addEventListener('scroll', hideContextMenu, { once: true }); // Auto-remove scroll listener after firing once
         }, 0);
     }

    /** Shows the ticket context menu (close, reopen, delete). Permissions vary by action. */
    function showTicketContextMenu(event) {
          event.preventDefault(); // Prevent default browser menu
          hideContextMenu(); // Hide other menus
          // Check user login and element validity
          if (!currentUser?.logged_in || !ticketContextMenu) return;
          const ticketElement = event.target.closest('.ticket-list-item');
          if (!ticketElement) return; // Ensure click was on a ticket item

          // Store relevant data from the clicked ticket element
          contextMenuData.ticketId = ticketElement.dataset.ticketId;
          contextMenuData.ticketStatus = ticketElement.dataset.ticketStatus;
          contextMenuData.senderId = null; // Not needed
          contextMenuData.messageTimestamp = null; // Not needed
          console.log("[showTicketContextMenu] Context data:", contextMenuData);

          // Determine which actions are available based on role and status
          const isMod = currentUser.is_moderator === true;
          const canClose = contextMenuData.ticketStatus === 'open'; // Anyone can close open tickets
          const canReopen = contextMenuData.ticketStatus === 'closed' && isMod; // Only mods can reopen closed tickets
          const canDelete = isMod; // Only mods can delete tickets

          // Show/hide the corresponding menu items
          contextCloseTicketButton.classList.toggle('hidden', !canClose);
          contextReopenTicketButton.classList.toggle('hidden', !canReopen);
          contextDeleteTicketButton.classList.toggle('hidden', !canDelete);

          // Only display the menu if at least one action is available
          if (canClose || canReopen || canDelete) {
              positionContextMenu(ticketContextMenu, event);
              currentContextMenu = ticketContextMenu; // Track active menu
              // Add listeners to close the menu
              setTimeout(() => {
                   document.addEventListener('click', hideContextMenuOnClickOutside);
                   window.addEventListener('scroll', hideContextMenu, { once: true });
              }, 0);
          }
     }

    // --- Context Menu Action Handlers (Emit Socket Events) ---

    function deleteChatMessage() {
          // Validate necessary data and connection state
          if (!contextMenuData.ticketId || !contextMenuData.messageTimestamp || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot delete message: Invalid state or not connected.', true);
              return;
          }
          console.log(`[Action] Attempting to delete message: Ticket ${contextMenuData.ticketId}, Timestamp ${contextMenuData.messageTimestamp}`);
          // Emit event to server
          socket.emit('delete_message', {
              ticket_id: contextMenuData.ticketId,
              message_timestamp: contextMenuData.messageTimestamp
          });
          hideContextMenu(); // Close menu after action
      }

    function closeTicket() {
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot close ticket: Invalid state or not connected.', true);
              return;
          }
          console.log(`[Action] Attempting to close ticket: ${contextMenuData.ticketId}`);
          socket.emit('update_ticket_status', {
              ticket_id: contextMenuData.ticketId,
              new_status: 'closed'
          });
          hideContextMenu();
      }

    function reopenTicket() {
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot reopen ticket: Invalid state or not connected.', true);
              return;
          }
          // Permission check (should be redundant as menu item is hidden, but good practice)
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'You do not have permission to reopen tickets.', true);
              hideContextMenu();
              return;
          }
          console.log(`[Action] Attempting to reopen ticket: ${contextMenuData.ticketId}`);
          socket.emit('update_ticket_status', {
              ticket_id: contextMenuData.ticketId,
              new_status: 'open'
          });
          hideContextMenu();
      }

    function deleteTicket() {
          if (!contextMenuData.ticketId || !socket?.connected) {
              showPopupMessage(errorMessagePopup, 'Cannot delete ticket: Invalid state or not connected.', true);
              return;
          }
          // Permission check
          if (!currentUser?.is_moderator) {
              showPopupMessage(errorMessagePopup, 'You do not have permission to delete tickets.', true);
              hideContextMenu();
              return;
          }
          // Confirmation dialog
          const shortId = contextMenuData.ticketId.slice(-6);
          if (confirm(`Are you sure you want to permanently delete ticket #${shortId}? This action cannot be undone.`)) {
              console.log(`[Action] Attempting to delete ticket: ${contextMenuData.ticketId}`);
              socket.emit('delete_ticket', { ticket_id: contextMenuData.ticketId });
          }
          hideContextMenu(); // Close menu regardless of confirmation
      }

    // --- Product Edit Modal Logic ---

    /** Opens the product edit/add modal, optionally pre-filling with product data. */
    function openProductEditModal(product = null) {
        // Ensure all modal elements exist (these are global/part of the shell)
         if (!productEditModal || !productEditForm || !customHexInputContainer || !productModalTitle || !productEditIdInput || !productEditNameInput || !productEditThumbnailInput || !productEditPriceInput || !productEditTagInput || !productEditTagColorSelect || !productEditCustomHexInput || !productEditDescriptionInput || !productEditFeaturesInput || !productEditPaymentLinkInput || !productEditStatus || !productEditThumbnailFilename) {
             console.error("Cannot open product modal: One or more elements not found.");
             showPopupMessage(errorMessagePopup, "Error opening product editor.", true);
             return;
         }
         // Reset form fields and status message
         productEditForm.reset();
         productEditStatus.textContent = '';
         productEditStatus.className = 'text-sm text-center h-5 mt-2'; // Reset style
         productEditThumbnailFilename.textContent = 'No file selected';

         if (product) { // Editing existing product
             productModalTitle.textContent = 'Edit Product';
             productEditIdInput.value = product._id; // Set hidden ID field
             productEditNameInput.value = product.name || '';
             productEditThumbnailInput.value = product.thumbnailUrl || '';
             productEditPriceInput.value = product.price || '';
             productEditTagInput.value = product.tag || '';
             // Handle tag color selection (including custom hex)
             const hasValidCustomHex = product.customBorderHex && /^#[0-9A-F]{6}$/i.test(product.customBorderHex);
             productEditTagColorSelect.value = hasValidCustomHex ? 'custom' : (product.tagColor || 'gray');
             productEditCustomHexInput.value = hasValidCustomHex ? product.customBorderHex : '';
             productEditDescriptionInput.value = product.description || '';
             productEditFeaturesInput.value = (product.features || []).join('\n'); // Join features array with newlines
             productEditPaymentLinkInput.value = product.paymentLink || '';
         } else { // Adding new product
             productModalTitle.textContent = 'Add New Product';
             productEditIdInput.value = ''; // Ensure ID is empty
             productEditTagColorSelect.value = 'gray'; // Default color
             productEditCustomHexInput.value = '';
         }
         // Show/hide the custom hex input based on the selected color
         toggleCustomHexInput();
         // Display the modal
         productEditModal.classList.add('active');
    }

    /** Shows or hides the custom HEX color input based on the dropdown selection. */
    function toggleCustomHexInput() {
         if (customHexInputContainer && productEditTagColorSelect) {
              const selectedColor = productEditTagColorSelect.value;
              customHexInputContainer.classList.toggle('hidden', selectedColor !== 'custom');
         }
     }

    /** Closes the product edit/add modal. */
    function closeProductEditModal() {
         if (productEditModal) productEditModal.classList.remove('active');
     }

    /** Handles the submission of the product edit/add form. Sends data to API. */
    async function handleSaveProduct(event) {
          event.preventDefault(); // Prevent default form submission
          // Ensure form and button exist
          if (!productEditForm || !productSaveButton) return;

          // Disable button and set loading state
          productSaveButton.disabled = true; productSaveButton.textContent = 'Saving...';
          productEditStatus.textContent = ''; productEditStatus.className = 'text-sm text-center h-5 mt-2'; // Reset status

          const productId = productEditIdInput.value;
          const isEditing = !!productId; // True if productId has a value
          const url = isEditing ? `${API_BASE_URL}/api/products/${productId}` : `${API_BASE_URL}/api/products`;
          const method = isEditing ? 'PUT' : 'POST';

          // --- Validate and determine tag color/hex ---
          let tagColorValue = productEditTagColorSelect.value;
          let customHexValue = productEditCustomHexInput.value.trim();
          let finalTagColor = 'gray'; // Default
          let finalCustomHex = null;

          if (tagColorValue === 'custom') {
              if (customHexValue && /^#[0-9A-F]{6}$/i.test(customHexValue)) {
                  finalTagColor = 'custom';
                  finalCustomHex = customHexValue;
              } else {
                  // Invalid custom hex format
                  productEditStatus.textContent = 'Invalid Custom HEX format. Use #RRGGBB (e.g., #FF5733).';
                  productEditStatus.classList.add('text-red-400');
                  productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
                  return; // Stop submission
              }
          } else {
              // Use the selected standard color
              finalTagColor = tagColorValue || 'gray';
              finalCustomHex = null; // Ensure custom hex is null if not selected
          }
          // --- End color validation ---

          // --- Construct product data object ---
          const productData = {
              name: productEditNameInput.value.trim(),
              thumbnailUrl: productEditThumbnailInput.value.trim() || null, // Use null if empty
              price: parseFloat(productEditPriceInput.value), // Convert to number
              tag: productEditTagInput.value.trim() || null,
              tagColor: finalTagColor,
              customBorderHex: finalCustomHex,
              description: productEditDescriptionInput.value.trim() || null,
              // Split features textarea by newline, trim whitespace, filter empty lines
              features: productEditFeaturesInput.value.split('\n').map(f => f.trim()).filter(f => f),
              paymentLink: productEditPaymentLinkInput.value.trim() || null
          };

          // Basic client-side validation for required fields
          if (!productData.name || isNaN(productData.price) || productData.price < 0) {
               productEditStatus.textContent = 'Product Name and a valid non-negative Price are required.';
               productEditStatus.classList.add('text-red-400');
               productSaveButton.disabled = false; productSaveButton.textContent = 'Save Product';
               return; // Stop submission
          }

          // TODO: Handle file upload if a file was selected
          // This currently only saves the URL from the text input.
          // If productEditThumbnailFileInput.files[0] exists, you'd need
          // to upload it (likely using FormData) separately or along with this request.

          console.log(`[Save Product] ${isEditing ? 'Updating' : 'Adding'} product:`, productData);

          try {
              // Send data to the API
              const response = await fetch(url, {
                  method: method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(productData),
                  credentials: 'include' // Send auth cookies
              });
              const result = await response.json(); // Attempt to parse response
              if (!response.ok) {
                  // Throw error using message from API or default
                  throw new Error(result.error || `HTTP error! status: ${response.status}`);
              }

              // --- Success ---
              showPopupMessage(productMessagePopup, `Product ${isEditing ? 'updated' : 'added'} successfully!`);
              closeProductEditModal(); // Close the modal on success
              // Refresh relevant views if the user is currently on them
              if (currentPage === 'dashboard') await loadProductManagementTable();
              if (currentPage === 'products') await fetchProducts();

          } catch (error) {
              // --- Error Handling ---
              console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
              productEditStatus.textContent = `Error: ${error.message}`;
              productEditStatus.classList.add('text-red-400');
              showPopupMessage(errorMessagePopup, `Failed to save product: ${error.message}`, true);
          } finally {
              // --- Cleanup ---
              // Re-enable the save button
              productSaveButton.disabled = false;
              productSaveButton.textContent = 'Save Product';
          }
     }

    /** Handles the click on a delete product button (usually in the admin table). */
    async function handleDeleteProduct(productId, productName) {
         if (!productId) return; // Need an ID to delete

         // Confirmation dialog
         if (!confirm(`Are you sure you want to permanently delete the product "${productName || 'this product'}"? This action cannot be undone.`)) {
             return; // User cancelled
         }

         console.log(`[Delete Product] Attempting to delete product ID: ${productId}`);
         // Optionally show loading state on the specific row or globally
         // loadingOverlay.classList.add('active');

         try {
             // Send DELETE request to the API
             const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                 method: 'DELETE',
                 credentials: 'include' // Send auth cookies
             });

             // Check response status (DELETE might return 200 OK or 204 No Content on success)
             if (!response.ok) {
                 let errorData = { error: `HTTP ${response.status}` };
                 try { errorData = await response.json(); } catch(e){} // Try parsing error JSON
                 throw new Error(errorData.error || `Failed to delete product.`);
             }

             // --- Success ---
             showPopupMessage(productMessagePopup, 'Product deleted successfully!');
             // Refresh relevant views
             if (currentPage === 'dashboard') await loadProductManagementTable(); // Refresh admin table
             if (currentPage === 'products') await fetchProducts(); // Refresh product grid
             // If the user was viewing the detail page of the deleted product, redirect them
             if (currentPage === 'productDetail' && window.location.hash.includes(`id=${productId}`)) {
                 console.log("Deleted product was being viewed, redirecting to products list.");
                 window.location.hash = '/#products';
             }

         } catch (error) {
             // --- Error Handling ---
             console.error("Error deleting product:", error);
             showPopupMessage(errorMessagePopup, `Failed to delete product: ${error.message}`, true);
         } finally {
             // --- Cleanup ---
             // loadingOverlay.classList.remove('active');
         }
     }

    // --- Logout Logic ---

    /** Handles the user logout process. */
    async function handleLogout() {
         console.log('[handleLogout] Initiating logout...');
         // Optionally show loading state
         // loadingOverlay.classList.add('active');

         try {
             // Attempt to notify the backend about the logout
             const response = await fetch(`${API_BASE_URL}/logout`, {
                 method: 'POST', // Use POST or GET as required by your backend API
                 credentials: 'include'
             });
             if (!response.ok) {
                 // Log backend logout failure but continue with client-side cleanup
                 let errorMsg = `Backend logout failed with status: ${response.status}`;
                 try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (parseError) {}
                 console.warn(`[handleLogout] ${errorMsg}. Proceeding with client-side cleanup.`);
             } else {
                 console.log("[handleLogout] Backend logout successful.");
             }
         } catch(error) {
             // Log network errors during backend logout attempt
             console.error("[handleLogout] Network error during backend logout request:", error);
         } finally {
              // --- Client-Side Cleanup (Always perform) ---
              currentUser = null; // Clear user state
              isInitialLoginCheckComplete = false; // Reset flags to force re-check on reload
              isInitialConfigLoadComplete = false;
              disconnectSocket(); // Disconnect WebSocket
              updateHeaderUI(null); // Update header to show login button
              // Clear the main content area (optional, as navigation will reload)
              // if (pageContentContainer) pageContentContainer.innerHTML = '';
              console.log("[handleLogout] Client-side cleanup complete. Redirecting to /#home.");
              // loadingOverlay.classList.remove('active'); // Hide loading state
              window.location.hash = '/#home'; // Navigate to home page
              // Force reload if navigation doesn't trigger content update reliably
              // window.location.reload();
         }
     }

    // --- Global Event Listeners Setup ---

    // Listen for URL hash changes to trigger navigation
    window.addEventListener('hashchange', runNavigation);

    // Initial setup on DOM ready
    createSnowflakes(); // Start snow effect
    checkLoginStatus(); // Start the initialization sequence (auth -> config -> navigation)

    // Listeners for static elements in the shell (header, modals, context menus)
    if (loginButton) loginButton.addEventListener('click', (e) => { e.preventDefault(); window.location.href = loginButton.href; });
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
             // Attempt to find the username from the message element that triggered the menu
             // This might be unreliable if the DOM changed. Consider fetching username if needed.
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
                // Clear the URL input if a file is selected, assuming file upload takes precedence
                if (productEditThumbnailInput) productEditThumbnailInput.value = '';
                // TODO: Implement file upload preview or preparation here if needed
            } else {
                productEditThumbnailFilename.textContent = 'No file selected';
            }
            // Reset file input value to allow selecting the same file again
            event.target.value = null;
        });
    }

    // --- End of Initialization ---
    console.log("Shillette MPF initialization complete. Waiting for navigation events.");

}); // End DOMContentLoaded
