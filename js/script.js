// Constants and State Variables
const API_BASE_URL = 'http://localhost:3000'; // Changed to typical backend port
const SOCKET_URL = 'http://localhost:3000';
let currentUser = null;
let siteConfig = null;
let socket = null;
let currentTicketId = null;
let activeSectionId = null;
let currentContextMenu = null;
let contextMenuData = {
    ticketId: null,
    messageTimestamp: null,
    senderId: null,
    ticketStatus: null,
    productId: null,
    productName: null,
    orderId: null
};
let isInitialLoginCheckComplete = false;
let isInitialConfigLoadComplete = false;

// DOM Element References
let loginButton;
let logoutButton;
let dashboardLogoutButton;
let modalCloseButton;
let userInfoModal;
let contextDeleteButton;
let contextUserInfoButton;
let chatContextMenu;
let ticketContextMenu;
let chatMessagesDiv;
let errorMessagePopup;

/**
 * Checks the user's login status via the API.
 */
async function checkLoginStatus() {
    isInitialLoginCheckComplete = false; // Mark as not complete initially
    try {
        const response = await fetch(`${API_BASE_URL}/api/user`, { 
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            // If API is not available, use fallback logged out state
            console.warn('[checkLoginStatus] API not available, using fallback state');
            currentUser = { logged_in: false };
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
        console.warn("[checkLoginStatus] Error checking login status:", error);
        // Use fallback logged out state on error
        currentUser = { logged_in: false };
    } finally {
        isInitialLoginCheckComplete = true; // Mark as complete
        console.log("[checkLoginStatus] Initial login check complete.");
        updateUI(); // Update UI based on login status
        // Proceed to load config and navigate AFTER login check is done
        loadSiteConfigAndNavigate();
    }
}

/**
 * Handles user logout process
 */
async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logout`, { 
            credentials: 'include', 
            method: 'POST' 
        });
        if (!response.ok) {
            console.error('Logout failed:', response.status);
            showPopupMessage(errorMessagePopup, 'Logout failed.', true);
            return;
        }
        currentUser = { logged_in: false };
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/';
        updateUI();
    } catch (error) {
        console.error('Error during logout:', error);
        showPopupMessage(errorMessagePopup, 'Error during logout.', true);
    }
}

/**
 * Updates UI elements based on user login status
 */
function updateUI() {
    const userInfoArea = document.getElementById('user-info');
    const loginArea = document.getElementById('login-button');
    const userNameDisplay = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (currentUser && currentUser.logged_in) {
        if (userInfoArea) userInfoArea.classList.remove('hidden');
        if (loginArea) loginArea.classList.add('hidden');
        if (userNameDisplay) userNameDisplay.textContent = currentUser.username || 'User';
        if (userAvatar) userAvatar.src = currentUser.avatar || 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
    } else {
        if (userInfoArea) userInfoArea.classList.add('hidden');
        if (loginArea) loginArea.classList.remove('hidden');
    }
}

// Add the missing function
function createSnowflakes() {
    console.warn('createSnowflakes() is not implemented.');
}

// Show popup message function
function showPopupMessage(element, message, isError) {
    if (element) {
        element.textContent = message;
        element.classList.add(isError ? 'error' : 'success', 'show');
        setTimeout(() => {
            element.classList.remove('show');
            setTimeout(() => element.classList.remove('error', 'success'), 300);
        }, 5000);
    }
}

/**
 * Applies site configuration to the UI
 */
function applySiteConfig(config) {
    const titleElement = document.getElementById('site-title-display');
    if (titleElement) titleElement.textContent = config.siteTitle;
    
    const headerSiteIcon = document.getElementById('header-site-icon');
    if (headerSiteIcon) {
        headerSiteIcon.src = config.siteIconUrl;
        headerSiteIcon.onerror = () => {
            headerSiteIcon.src = '/assets/images/icon.png';
            headerSiteIcon.onerror = null;
        };
    }

    const favicon = document.getElementById('favicon');
    if (favicon) favicon.href = config.siteIconUrl;

    const headerLinksContainer = document.getElementById('main-navigation');
    if (headerLinksContainer) {
        headerLinksContainer.innerHTML = '';
        config.headerLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.name;
            a.className = 'text-gray-300 hover:text-white transition duration-200';
            if (link.target) a.target = link.target;
            headerLinksContainer.appendChild(a);
        });
    }

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.innerHTML = '';
        config.headerLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.name;
            a.className = 'mobile-menu-link';
            if (link.target) a.target = link.target;
            mobileMenu.appendChild(a);
        });
    }

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
}

/**
 * Loads site configuration and applies fallback if API is not available
 */
async function loadSiteConfigAndNavigate() {
    isInitialConfigLoadComplete = false;
    try {
        const response = await fetch(`${API_BASE_URL}/api/config`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        siteConfig = await response.json();
        console.log("[loadSiteConfig] Site config loaded:", siteConfig);
    } catch (error) {
        console.warn("[loadSiteConfig] Error loading site config:", error);
        console.log("[loadSiteConfig] Using default configuration");
        // Apply default config on error
        siteConfig = {
            siteTitle: "Shillette",
            siteIconUrl: "/assets/images/icon.png",
            headerLinks: [
                {name: "Home", href: "/"},
                {name: "Products", href: "/products"},
                {name: "Tickets", href: "/tickets"},
                {name: "Discord", href: "https://discord.gg/shillette", target: "_blank"}
            ]
        };
    } finally {
        applySiteConfig(siteConfig);
        isInitialConfigLoadComplete = true;
        console.log("[loadSiteConfig] Initial config load complete.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM references
    initializeDOMReferences();
    
    // Initialize page
    createSnowflakes(); // Initialize background effect
    checkLoginStatus(); // Start the process: Check login -> Load Config -> Navigate
    
    // Setup event listeners
    setupEventListeners();
});

function initializeDOMReferences() {
    loginButton = document.getElementById('login-button');
    logoutButton = document.getElementById('logout-button');
    dashboardLogoutButton = document.getElementById('dashboard-logout-button');
    modalCloseButton = document.getElementById('modal-close');
    userInfoModal = document.getElementById('user-info-modal');
    contextDeleteButton = document.getElementById('context-delete');
    contextUserInfoButton = document.getElementById('context-user-info');
    chatContextMenu = document.getElementById('chat-context-menu');
    ticketContextMenu = document.getElementById('ticket-context-menu');
    chatMessagesDiv = document.getElementById('chat-messages');
    errorMessagePopup = document.getElementById('error-message');
}

function setupEventListeners() {
    // Login/Logout event listeners
    if (loginButton) {
        loginButton.addEventListener('click', (e) => { 
            e.preventDefault(); 
            window.location.href = loginButton.href; 
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    if (dashboardLogoutButton) {
        dashboardLogoutButton.addEventListener('click', handleLogout);
    }

    // Modal event listeners
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', hideUserInfoModal);
    }
    
    if (userInfoModal) {
        userInfoModal.addEventListener('click', (event) => { 
            if (event.target === userInfoModal) hideUserInfoModal(); 
        });
    }
    
    // Context menu listeners
    if (contextDeleteButton) {
        contextDeleteButton.addEventListener('click', deleteChatMessage);
    }
    
    if (contextUserInfoButton) {
        contextUserInfoButton.addEventListener('click', () => {
            if (contextMenuData.senderId) {
                const messageElement = chatMessagesDiv?.querySelector(`.chat-message[data-timestamp="${contextMenuData.messageTimestamp}"]`);
                const usernameElement = messageElement?.querySelector('.username');
                const username = usernameElement ? usernameElement.textContent.replace(':', '') : 'Unknown User';
                showUserInfoModal(contextMenuData.senderId, username);
            }
            hideContextMenu();
        });
    }
}

function hideUserInfoModal() {
    if (userInfoModal) {
        userInfoModal.classList.remove('active');
    }
}

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