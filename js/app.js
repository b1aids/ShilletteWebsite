/**
 * Shillette Frontend Application Logic
 *
 * Handles routing (using Hash-based routing #/), API calls, WebSocket communication,
 * dynamic content loading, and UI interactions for the MPF structure.
 * Suitable for static hosting like GitHub Pages.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Shillette MPF with Hash Routing...");

    // --- Constants and DOM Element References (Global/Shell Elements) ---
    const pageContentContainer = document.getElementById('page-content-container');
    const siteTitleDisplay = document.getElementById('site-title-display');
    const headerSiteIcon = document.getElementById('header-site-icon');
    const faviconElement = document.getElementById('favicon');
    const mainNavigation = document.getElementById('main-navigation');
    const mobileMenuNav = document.getElementById('mobile-menu');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button'); // Inside user-info
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

    // --- Page Mapping (Map hash path segments to content file paths) ---
    // Keys should be lowercase for case-insensitive matching based on the first hash path segment
    const pageRoutes = {
        'home': 'pages/home.html', // Maps to '#/' or '#/home'
        'products': 'pages/products.html', // Maps to '#/products'
        'tickets': 'pages/tickets.html', // Maps to '#/tickets'
        'dashboard': 'pages/dashboard.html', // Maps to '#/dashboard'
        'ticketdetail': 'pages/ticketDetail.html', // Maps to '#/ticketdetail/:id'
        'productdetail': 'pages/productDetail.html' // Maps to '#/productdetail/:id'
    };

    // --- Utility Functions ---
    // ... (showPopupMessage, createSnowflakes, formatTimeAgo remain the same) ...
    function showPopupMessage(element, message, isError = false, duration = 3500) {
         if (!element) {
             console.warn("Attempted to show popup message on a null element.");
             return;
         }
         element.textContent = message;
         element.classList.toggle('bg-red-600', isError);
         element.classList.toggle('bg-green-600', !isError);
         element.classList.add('show');
         setTimeout(() => element.classList.remove('show'), duration);
    }
    function createSnowflakes() {
        const numberOfSnowflakes = 75;
        if (!snowContainer) return;
        snowContainer.innerHTML = '';
        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            const size = Math.random() * 3 + 2;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 10;
            const startLeft = Math.random() * 100;
            const opacity = Math.random() * 0.5 + 0.5;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${startLeft}vw`;
            snowflake.style.opacity = opacity;
            snowflake.style.animationDuration = `${duration}s`;
            snowflake.style.animationDelay = `-${delay}s`;
            snowContainer.appendChild(snowflake);
        }
    }
    function formatTimeAgo(dateString) {
         try {
             const date = new Date(dateString);
             const now = new Date();
             const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
             if (diffMonths < 1) return 'less than a month ago';
             if (diffMonths === 1) return '1 month ago';
             return `${diffMonths} months ago`;
         } catch (e) {
             console.warn("Error formatting time ago:", e);
             return 'a while ago';
         }
    }

    // --- Core Application Logic ---

    /**
     * Fetches HTML content for a given page key and injects it into the main container.
     * Also triggers page-specific initialization logic.
     * @param {string} pageKey - The lowercase key from pageRoutes (e.g., 'home', 'productdetail').
     * @param {object} [params={}] - Parameters extracted from the hash path (e.g., { id: '123' }).
     */
    async function loadPageContent(pageKey, params = {}) {
        console.log(`[loadPageContent] Attempting to load page for key: ${pageKey} with params:`, params);
        if (!pageContentContainer) {
            console.error("CRITICAL: Page content container (#page-content-container) not found!");
            return;
        }
        const filePath = pageRoutes[pageKey];
        if (!filePath) {
            console.error(`No route found for page key: ${pageKey}`);
            pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Page not found (${pageKey}). Please check the URL hash.</div>`;
            currentPageKey = null;
            return;
        }

        pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-gray-400">Loading ${pageKey}...</div>`;
        currentPageKey = pageKey;

        try {
            // Fetch path is relative to index.html location
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch page content ${filePath}: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            pageContentContainer.innerHTML = html;
            console.log(`[loadPageContent] Successfully loaded and injected HTML for ${pageKey} from ${filePath}`);

            window.scrollTo(0, 0);

            // --- Execute Page-Specific Initialization ---
            // Remember to update any internal links within these functions to use hash format!
            switch (pageKey) {
                case 'home':
                    updateActiveNavLink(pageKey);
                    break;
                case 'products':
                    updateActiveNavLink(pageKey);
                    await fetchProducts();
                    break;
                case 'tickets':
                    updateActiveNavLink(pageKey);
                    await fetchTickets();
                    setupTicketFormListener();
                    // Ensure back button uses hash:
                    document.getElementById('back-to-products-button-tickets')?.setAttribute('href', '/#/products');
                    break;
                case 'dashboard':
                    updateActiveNavLink(pageKey);
                    if (currentUser?.logged_in) {
                        displayDashboardUserInfo();
                        displayUserRoles(currentUser.roles || []);
                        if (currentUser.is_moderator === true) {
                            await loadAdminDashboardData();
                        } else {
                            document.getElementById('admin-dashboard-sections')?.classList.add('hidden');
                        }
                        setupDashboardListeners();
                    } else {
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Please log in to view the dashboard.</div>`;
                    }
                    break;
                case 'ticketdetail':
                    updateActiveNavLink('tickets');
                    currentTicketId = params.id;
                    if (currentTicketId) {
                         const backBtn = document.getElementById('back-to-tickets-button');
                         if (backBtn) backBtn.href = '/#/tickets'; // Use hash format
                         await fetchTicketDetails(currentTicketId);
                         setupTicketDetailListeners();
                    } else {
                         console.error("Ticket ID missing for ticketDetail page.");
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Ticket ID is missing in the URL hash.</div>`;
                         currentPageKey = null;
                    }
                    break;
                case 'productdetail':
                    updateActiveNavLink('products');
                    const productId = params.id;
                     if (productId) {
                         const backBtn = document.getElementById('back-to-products-button-detail');
                         if (backBtn) backBtn.href = '/#/products'; // Use hash format
                         await fetchProductDetails(productId);
                         setupProductDetailListeners();
                         // Update ticket link in product detail
                         const ticketLink = document.getElementById('product-detail-open-ticket');
                         if (ticketLink) ticketLink.href = '/#/tickets'; // Use hash format
                     } else {
                         console.error("Product ID missing for productDetail page.");
                         pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error: Product ID is missing in the URL hash.</div>`;
                         currentPageKey = null;
                     }
                    break;
                default:
                    updateActiveNavLink(null);
                    console.log(`No specific initialization logic defined for page key: ${pageKey}`);
            }

        } catch (error) {
            console.error(`Error loading or initializing page ${pageKey}:`, error);
            pageContentContainer.innerHTML = `<div class="container mx-auto px-6 py-10 text-center text-red-400">Error loading page content: ${error.message}</div>`;
            currentPageKey = null;
        }
    }

    // --- Authentication and Configuration ---
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
                 ensureSocketConnected(); // Attempt socket connection if logged in
             }
         } catch (error) {
             console.error("[checkLoginStatus] Error checking login status:", error);
             currentUser = { logged_in: false };
             updateHeaderUI(currentUser);
             showPopupMessage(errorMessagePopup, "Could not verify login status. Please try again later.", true);
         } finally {
             isInitialLoginCheckComplete = true;
             console.log("[checkLoginStatus] Initial login check complete.");
             await loadSiteConfigAndNavigate(); // Proceed to load config and navigate
         }
    }

    /**
     * Loads site configuration and then triggers the initial navigation based on hash.
     */
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
            applySiteConfig(siteConfig); // Apply config (updates header links to hash format)
        } catch (error) {
            console.error("[loadSiteConfig] Error loading site config:", error);
            showPopupMessage(errorMessagePopup, "Failed to load site configuration. Using default settings.", true);
            applySiteConfig(null); // Apply defaults
        } finally {
            isInitialConfigLoadComplete = true;
            console.log("[loadSiteConfig] Initial config load complete.");

            // --- GitHub Pages SPA Redirect Handling REMOVED ---
            // No longer needed with hash routing.

            console.log("[loadSiteConfigAndNavigate] Triggering initial navigation based on hash.");
            runNavigation(); // Trigger navigation based on the initial hash
        }
    }

    /** Applies site configuration to the UI, ensuring links use hash format */
    function applySiteConfig(config) {
        const title = config?.siteTitle || "Shillette";
        const iconUrl = config?.siteIconUrl || "/images/icon.png";
        // Default links now use hash format
        const links = config?.headerLinks || [
            {name: "Home", href: "/#/"}, // Use hash root
            {name: "Products", href: "/#/products"},
            {name: "Tickets", href: "/#/tickets"},
            {name: "Discord", href: "https://discord.gg/shillette", target: "_blank"}
        ];

        document.title = title;
        if (siteTitleDisplay) siteTitleDisplay.textContent = title;
        if (headerSiteIcon) headerSiteIcon.src = iconUrl;
        if (faviconElement) faviconElement.href = iconUrl;

        // Update main navigation links
        if (mainNavigation) {
            mainNavigation.innerHTML = '';
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href; // Use the hash-based href directly
                a.textContent = link.name;
                a.classList.add('text-gray-300', 'hover:text-white', 'transition', 'duration-200', 'main-nav-link');
                if (!link.target) { // Internal SPA link
                    // Extract page key from hash path
                    const hashPath = link.href.split('#/')[1] || 'home';
                    const pathKey = hashPath.split('/')[0]?.toLowerCase() || 'home';
                    a.dataset.pageKey = pathKey;
                    a.classList.add('spa-link'); // Add class to identify SPA links
                }
                if (link.target) {
                    a.target = link.target;
                    if (link.target === '_blank') a.rel = 'noopener noreferrer';
                }
                mainNavigation.appendChild(a);
            });
        }

        // Update mobile navigation links
        if (mobileMenuNav) {
            mobileMenuNav.innerHTML = '';
            links.forEach(link => {
                const mob_a = document.createElement('a');
                mob_a.href = link.href; // Use hash-based href
                mob_a.textContent = link.name;
                mob_a.classList.add('mobile-menu-link');
                if (!link.target) {
                    const hashPath = link.href.split('#/')[1] || 'home';
                    const pathKey = hashPath.split('/')[0]?.toLowerCase() || 'home';
                    mob_a.dataset.pageKey = pathKey;
                    mob_a.classList.add('spa-link');
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
        updateActiveNavLink(currentPageKey); // Update nav link styles
    }

    /** Updates header UI based on login state, ensures dashboard link uses hash */
    function updateHeaderUI(user) {
         const isLoggedIn = user?.logged_in;
         if (loginButton) loginButton.classList.toggle('hidden', isLoggedIn);
         if (userInfo) {
             userInfo.classList.toggle('hidden', !isLoggedIn);
             userInfo.classList.toggle('flex', isLoggedIn);
             // Update user-info link href to point to #/dashboard hash path
             userInfo.href = '/#/dashboard'; // Use hash format
         }
         if (isLoggedIn) {
             if (userNameDisplay) userNameDisplay.textContent = user.username || 'User';
             if (userAvatarDisplay) {
                 userAvatarDisplay.src = user.user_id && user.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32`
                    : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
                 userAvatarDisplay.onerror = () => { userAvatarDisplay.src = 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?'; };
             }
             if (logoutButton) logoutButton.classList.remove('hidden');
         } else {
             if (logoutButton) logoutButton.classList.add('hidden');
         }
    }

    /** Updates active nav link styling based on current page key */
    function updateActiveNavLink(activePageKey) {
        const navLinks = document.querySelectorAll('#main-navigation .main-nav-link[data-page-key], #mobile-menu .mobile-menu-link[data-page-key]');
        navLinks.forEach(link => {
            if (link.dataset.pageKey === activePageKey) {
                link.classList.add('text-orange-400', 'font-semibold');
                link.classList.remove('text-gray-300');
            } else {
                link.classList.remove('text-orange-400', 'font-semibold');
                link.classList.add('text-gray-300');
            }
        });
    }


    // --- Navigation (Routing based on URL Hash and hashchange event) ---

    /**
     * Parses the URL hash, determines the target page and parameters,
     * checks access control, and triggers loading of the page content.
     */
    function runNavigation() {
        // Read the hash part of the URL, remove the leading '#' or '#/'
        let hash = window.location.hash;
        if (hash.startsWith('#/')) {
            hash = hash.substring(2);
        } else if (hash.startsWith('#')) {
            hash = hash.substring(1);
        }
        // Now 'hash' contains the path part, e.g., "products", "ticketdetail/123", or ""

        console.log(`[runNavigation] Running navigation for hash: '#/${hash}'`);

        if (!isInitialLoginCheckComplete || !isInitialConfigLoadComplete) {
            console.log("[runNavigation] Initial checks (login/config) not complete. Deferring navigation.");
            return;
        }

        // Split hash path into segments
        const hashSegments = hash.split('/').filter(segment => segment);

        // Determine page key and parameters from hash
        let rawPageName = hashSegments[0] || 'home'; // Default to 'home' if hash is empty or '/'
        const pageKey = rawPageName.toLowerCase();

        const routeParams = {};
        // Extract ID parameter for detail pages (e.g., #/ticketdetail/123)
        if ((pageKey === 'productdetail' || pageKey === 'ticketdetail') && hashSegments[1]) {
            routeParams.id = hashSegments[1];
            console.log(`[runNavigation] Extracted ID: ${routeParams.id} for page ${pageKey} from hash`);
        }

        console.log(`[runNavigation] Hash: '#/${hash}', Parsed key: '${pageKey}', Params:`, routeParams);

        // --- Access Control (remains largely the same logic) ---
        const protectedRoutes = ['dashboard', 'tickets', 'ticketdetail'];
        if (protectedRoutes.includes(pageKey) && !currentUser?.logged_in) {
            console.warn(`[runNavigation] Access denied to protected route '#/${pageKey}'. User not logged in.`);
            showPopupMessage(errorMessagePopup, "Please log in to view this page.", true);
            if (pageKey !== 'home') {
                console.log("[runNavigation] Redirecting unauthenticated user to /#/");
                window.location.hash = '/'; // Redirect to home hash
                // runNavigation(); // Let the hashchange event handle the reload
            } else {
                loadPageContent('home', {}); // Load home directly if already there
            }
            return;
        }

        // --- Load Page Content ---
        console.log(`[runNavigation] Proceeding to load content for page key: '${pageKey}'`);

        // Handle WebSocket connection based on page context
        const isTicketRelated = ['tickets', 'ticketdetail'].includes(pageKey);
        if (!isTicketRelated && socket) {
             console.log(`[runNavigation] Navigating away from ticket-related page, disconnecting socket.`);
             disconnectSocket();
        }
        if (isTicketRelated && currentUser?.logged_in) {
             console.log(`[runNavigation] Navigating to ticket-related page, ensuring socket is connected.`);
             ensureSocketConnected();
        }

        loadPageContent(pageKey, routeParams);
    }

    // --- Page-Specific Functions ---
    // [NOTE: Ensure internal links created/modified in these functions use hash format '#/...' ]
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

    // [NOTE: All the functions listed above as "..." need to be reviewed for hash routing compatibility]
    // [Paste the full code for those functions here, ensuring hrefs use '#/']

    // --- Example Updates for Hash Routing ---

    // Products Page Logic (renderProductCard needs update)
    async function fetchProducts() { /* ... unchanged ... */ }
    function renderProductCard(product, productGridElement) {
         if (!productGridElement || !product) return;
         const card = document.createElement('div');
         card.className = `product-card flex flex-col`;
         card.dataset.productId = product._id;
         // ... (border/style logic unchanged) ...
         const tagColor = product.tagColor || 'gray';
         const customHex = product.customBorderHex;
         let borderClasses = ''; let inlineStyle = ''; let hoverStyleVar = '';
         if (tagColor === 'custom' && customHex && /^#[0-9A-F]{6}$/i.test(customHex)) { /* ... */ card.style.cssText = inlineStyle + hoverStyleVar; card.classList.add(borderClasses); }
         else if (tagColor !== 'custom' && ['gray', 'orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor)) { /* ... */ card.classList.add(...borderClasses.split(' ')); }
         else { /* ... */ card.classList.add(...borderClasses.split(' ')); }
         const displayTagColor = (tagColor === 'custom' && !customHex) ? 'gray' : tagColor;
         const tagBgClass = `bg-${displayTagColor}-500/20`; const tagTextClass = `text-${displayTagColor}-300`;
         let thumbnailElement = null; const placeholderDiv = document.createElement('div'); /* ... */
         if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') { /* ... */ } else { /* ... */ }

         const innerDiv = document.createElement('div');
         innerDiv.className = 'product-card-inner';
         // **** UPDATED href for View Details link ****
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
                 <a href="/#/productdetail/${product._id}" class="view-details-button spa-link block w-full bg-gray-600 hover:bg-gray-500 text-white text-center text-sm font-medium py-2 px-4 rounded-md transition duration-300" data-product-id="${product._id}">View Details</a>
             </div>
         `;
         if (thumbnailElement) card.appendChild(thumbnailElement);
         card.appendChild(placeholderDiv);
         card.appendChild(innerDiv);
         card.addEventListener('click', (event) => { /* ... purchase logic unchanged ... */ });
         productGridElement.appendChild(card);
    }
    function handlePurchaseClick(event) { /* ... unchanged ... */ }

    // Tickets Page Logic (createTicketListItem needs update)
    async function fetchTickets() { /* ... unchanged fetch logic ... */ }
    function createTicketListItem(ticket) {
        const link = document.createElement('a');
        // **** UPDATED href for ticket detail link ****
        link.href = `/#/ticketdetail/${ticket._id}`; // Path-based URL using hash
        link.classList.add('ticket-list-item', 'spa-link');
        link.dataset.ticketId = ticket._id;
        link.dataset.ticketStatus = ticket.status;
        link.dataset.ticketSubject = ticket.subject || 'No Subject';
        // Store user ID for context menu permission check
        link.dataset.userId = ticket.user_id;

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
        link.addEventListener('contextmenu', showTicketContextMenu);
        return link;
    }
    function setupTicketFormListener() { /* ... unchanged ... */ }

    // Ticket Detail Page Logic
    async function fetchTicketDetails(ticketId) { /* ... unchanged ... */ }
    function appendChatMessage(data, chatMessagesDivElement) { /* ... unchanged ... */ }
    function setupTicketDetailListeners() { /* ... unchanged ... */ }
    function handleChatSubmit(event) { /* ... unchanged ... */ }

    // Dashboard Page Logic
    function displayDashboardUserInfo() { /* ... unchanged ... */ }
    function displayUserRoles(roles) { /* ... unchanged ... */ }
    async function loadAdminDashboardData() { /* ... unchanged ... */ }
    async function loadSiteConfigForm() { /* ... unchanged ... */ }
    function addHeaderLinkInput(name = '', href = '', target = '') {
        // **** Ensure href uses hash format if it's an internal link ****
        const configHeaderLinksContainer = document.getElementById('config-header-links-container');
        if (!configHeaderLinksContainer) return;
        const linkGroup = document.createElement('div');
        linkGroup.className = 'link-group flex items-center space-x-2 mb-2';
        const safeName = name.replace(/"/g, '&quot;');
        // Ensure internal links generated here also use hash format
        let finalHref = href;
        if (href && !href.startsWith('http') && !href.startsWith('/#/') && href !== '#') {
            finalHref = `/#${href.startsWith('/') ? href : '/' + href}`; // Add hash prefix
        }
        const safeHref = finalHref.replace(/"/g, '&quot;');
        const safeTarget = target.replace(/"/g, '&quot;');
        linkGroup.innerHTML = `... [inputs with safeName, safeHref, safeTarget] ...`; // Use updated safeHref
        // ... rest of the function ...
        linkGroup.innerHTML = `
             <input type="text" placeholder="Link Name" value="${safeName}" class="link-name config-link-name flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
             <input type="text" placeholder="Path (#/path) or URL" value="${safeHref}" class="link-href config-link-href flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400" required>
             <input type="text" placeholder="Target (e.g., _blank)" value="${safeTarget || ''}" class="link-target config-link-target flex-none w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400">
             <button type="button" class="remove-link-button bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex-shrink-0" title="Remove Link">X</button>
         `;
         linkGroup.querySelector('.remove-link-button').addEventListener('click', () => linkGroup.remove());
         configHeaderLinksContainer.appendChild(linkGroup);
    }
    async function loadProductManagementTable() { /* ... unchanged ... */ }
    function setupDashboardListeners() { /* ... unchanged ... */ }
    function setupAdminDashboardListeners() { /* ... unchanged ... */ }
    function handleAddHeaderLinkButtonClick() { addHeaderLinkInput(); }
    function handleAddProductButtonClick() { openProductEditModal(); }
    async function handleSaveSiteConfig(event) {
        // **** Ensure headerLinks saved use hash format ****
        event.preventDefault();
        // ... (get elements) ...
        if (!siteConfigForm || !saveConfigButton || !configSaveStatus /*...*/) return;
        saveConfigButton.disabled = true; /*...*/
        const updatedConfig = { siteTitle: configSiteTitleInput.value.trim(), /*...*/ headerLinks: [] };
        configHeaderLinksContainer.querySelectorAll('.link-group').forEach(group => {
            const nameInput = group.querySelector('.link-name');
            const hrefInput = group.querySelector('.link-href');
            const targetInput = group.querySelector('.link-target');
            if (nameInput?.value.trim() && hrefInput?.value.trim()) {
                let hrefVal = hrefInput.value.trim();
                // Ensure internal links start with /#/
                if (!hrefVal.startsWith('http') && !hrefVal.startsWith('/#/') && hrefVal !== '#') {
                     hrefVal = `/#${hrefVal.startsWith('/') ? hrefVal : '/' + hrefVal}`;
                }
                updatedConfig.headerLinks.push({ name: nameInput.value.trim(), href: hrefVal, target: targetInput?.value.trim() || null });
            }
        });
        console.log("Saving site config (hash format):", updatedConfig);
        try {
            const response = await fetch(`${API_BASE_URL}/api/config`, { /*...*/ body: JSON.stringify(updatedConfig), /*...*/ });
            // ... (handle response) ...
            siteConfig = await response.json();
            applySiteConfig(siteConfig); // Re-apply to update UI
            // ... (show messages) ...
        } catch (error) { /*...*/ }
        finally { /*...*/ }
    }

    // Product Detail Page Logic
    async function fetchProductDetails(productId) { /* ... unchanged ... */ }
    function renderProductDetails(product) { /* ... unchanged ... */ }
    function setupProductDetailListeners() { /* ... unchanged ... */ }

    // Socket.IO Logic
    function connectSocket(ticketIdToJoin = null) { /* ... unchanged ... */ }
    function ensureSocketConnected() { /* ... unchanged ... */ }
    function setupSocketListeners() { /* ... unchanged ... */ }
    function disconnectSocket() { /* ... unchanged ... */ }

    // Modal and Context Menu Logic
    function showUserInfoModal(senderId, username) { /* ... unchanged ... */ }
    function hideUserInfoModal() { /* ... unchanged ... */ }
    function positionContextMenu(menuElement, event) { /* ... unchanged ... */ }
    function hideContextMenu() { /* ... unchanged ... */ }
    function hideContextMenuOnClickOutside(event) { /* ... unchanged ... */ }
    function showChatContextMenu(event) { /* ... unchanged ... */ }
    function showTicketContextMenu(event) { /* ... unchanged ... */ }

    // Context Menu Action Handlers
    function deleteChatMessage() { /* ... unchanged ... */ }
    function closeTicket() { /* ... unchanged ... */ }
    function reopenTicket() { /* ... unchanged ... */ }
    function deleteTicket() { /* ... unchanged ... */ }

    // Product Edit Modal Logic
    function openProductEditModal(product = null) { /* ... unchanged ... */ }
    function toggleCustomHexInput() { /* ... unchanged ... */ }
    function closeProductEditModal() { /* ... unchanged ... */ }
    async function handleSaveProduct(event) { /* ... unchanged ... */ }
    async function handleDeleteProduct(productId, productName) { /* ... unchanged ... */ }

    // Logout Logic
    async function handleLogout() {
         console.log('[handleLogout] Initiating logout...');
         try { /* ... backend call ... */ }
         catch(error) { /* ... */ }
         finally {
              currentUser = null; isInitialLoginCheckComplete = false; isInitialConfigLoadComplete = false;
              disconnectSocket(); updateHeaderUI(null);
              console.log("[handleLogout] Client-side cleanup complete. Navigating to /#/");
              // Navigate to home hash page
              window.location.hash = '/'; // Set hash to root
              // runNavigation(); // Let hashchange listener handle it
         }
     }

    // --- Global Event Listeners Setup ---

    // Listen for Hash Changes (Back/Forward/Manual)
    window.addEventListener('hashchange', (event) => {
        console.log("[HashChange] URL hash changed. New hash:", window.location.hash);
        // Re-run navigation logic based on the new hash
        runNavigation();
    });

    // Global click listener to intercept internal hash links
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a.spa-link'); // Only intercept links marked as SPA links

        // Check if it's an internal hash link we should handle
        if (link && // Was an SPA link clicked?
            link.target !== '_blank' && // Ignore links opening in new tabs
            link.getAttribute('href') && // Ensure link has an href
            link.getAttribute('href').startsWith('/#/') // Ensure it's a hash path link
           )
        {
            // We don't need to preventDefault for hash links if they are correctly formatted.
            // The browser will change the hash, and our 'hashchange' listener will call runNavigation.
            console.log(`[Link Intercept] Clicked SPA hash link: ${link.getAttribute('href')}. Allowing default behavior (hash change).`);

            // OPTIONAL: If we wanted to manually control history stack or do something before navigation:
            // event.preventDefault();
            // const targetHash = link.hash; // Includes the #
            // window.location.hash = targetHash; // Manually set hash
            // // runNavigation(); // Or call runNavigation directly if hashchange isn't reliable enough
        } else if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('/#/') && link.origin === window.location.origin && !link.target && !link.hasAttribute('data-spa-ignore')) {
            // Warn if an internal-looking link doesn't use hash format
            console.warn(`[Link Intercept] Found internal-looking link without hash format: ${link.getAttribute('href')}. It might not work correctly with hash routing.`);
        }
    });


    // --- Initial Application Setup ---
    createSnowflakes();
    checkLoginStatus(); // Start sequence (auth -> config -> initial navigation)

    // Static element listeners (Header, Modals, Context Menus)
    if (loginButton) { /* ... unchanged ... */ }
    if (logoutButton) { logoutButton.addEventListener('click', handleLogout); }
    if (mobileMenuButton && mobileMenuNav) { /* ... unchanged ... */ }
    if (modalCloseButton) { /* ... unchanged ... */ }
    if (userInfoModal) { /* ... unchanged ... */ }
    if (productModalCloseButton) { /* ... unchanged ... */ }
    if (productEditModal) { /* ... unchanged ... */ }
    if (contextDeleteButton) { /* ... unchanged ... */ }
    if (contextUserInfoButton) { /* ... unchanged ... */ }
    if (contextCloseTicketButton) { /* ... unchanged ... */ }
    if (contextReopenTicketButton) { /* ... unchanged ... */ }
    if (contextDeleteTicketButton) { /* ... unchanged ... */ }
    if (productEditForm) { /* ... unchanged ... */ }
    if (productEditTagColorSelect) { /* ... unchanged ... */ }
    if (productEditThumbnailButton && productEditThumbnailFileInput) { /* ... unchanged ... */ }
    if (productEditThumbnailFileInput && productEditThumbnailFilename) { /* ... unchanged ... */ }

    console.log("Shillette MPF initialization sequence started. Using Hash routing.");

}); // End DOMContentLoaded