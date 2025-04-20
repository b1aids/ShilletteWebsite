// --- Common DOM References (Will be null if element not on current page) ---
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button'); // Header logout
const userInfo = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name'); // Header username
const userAvatarDisplay = document.getElementById('user-avatar'); // Header avatar
const paymentMessage = document.getElementById('payment-message');
const ticketMessagePopup = document.getElementById('ticket-message');
const errorMessagePopup = document.getElementById('error-message');
const snowContainer = document.getElementById('snow-container');
const loadingOverlay = document.getElementById('loading-overlay');

// --- Page Specific DOM References (Check if they exist before using) ---
// Index Page Elements (None specific needed in JS currently)

// Products Page Elements
const productsSection = document.querySelector('main.content-section'); // Assuming products are in main

// Tickets Page Elements
const createTicketForm = document.getElementById('create-ticket-form');
const ticketSubjectInput = document.getElementById('ticket-subject');
const ticketMessageInput = document.getElementById('ticket-message-input');
const createTicketStatus = document.getElementById('create-ticket-status');
const ticketListDiv = document.getElementById('ticket-list');
const ticketListStatus = document.getElementById('ticket-list-status');

// Dashboard Page Elements
const dashboardUserNameDisplay = document.getElementById('dashboard-user-name');
const dashboardUserAvatarDisplay = document.getElementById('dashboard-user-avatar');
const dashboardUserStatus = document.getElementById('dashboard-user-status');
const dashboardLogoutButton = document.getElementById('dashboard-logout-button'); // Dashboard logout
const dashboardTicketListCard = document.getElementById('dashboard-ticket-list-card');
const dashboardTicketListDiv = document.getElementById('dashboard-ticket-list');
const dashboardTicketListStatus = document.getElementById('dashboard-ticket-list-status');
const dashboardRolesCard = document.getElementById('dashboard-roles-card');
const dashboardRolesList = document.getElementById('dashboard-roles-list');

// Ticket Detail Page Elements
const ticketDetailSubject = document.getElementById('ticket-detail-subject');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInputForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');


// --- Configuration ---
const API_BASE_URL = 'https://api.shillette.com'; // Ensure this is correct
const SOCKET_URL = 'https://api.shillette.com';   // Ensure this is correct (if using SocketIO)

// --- State ---
let currentUser = null; // Holds user info if logged in
let socket = null;      // Holds Socket.IO connection
let currentTicketId = null; // Holds ID for ticket detail page

// --- Utility Functions ---

/**
 * Shows a temporary popup message.
 */
function showPopupMessage(element, message, isError = false) {
     if (!element) return; // Exit if element doesn't exist on the page
     element.textContent = message;
     // Add 'show' class and set background color
     element.classList.add('show');
     if (isError) {
         element.classList.remove('bg-green-600');
         element.classList.add('bg-red-600');
     } else {
         element.classList.remove('bg-red-600');
         element.classList.add('bg-green-600');
     }
     // Hide after delay
     setTimeout(() => {
         element.classList.remove('show');
     }, 3500);
}

/**
 * Updates header UI based on login status.
 */
function updateHeaderUI(user) {
     // Check if header elements exist
     if (!loginButton || !userInfo || !userNameDisplay || !userAvatarDisplay) return;

     if (user && user.logged_in) {
         loginButton.classList.add('hidden');
         userInfo.classList.remove('hidden');
         userInfo.classList.add('flex');
         userNameDisplay.textContent = user.username || 'User';
         if (user.user_id && user.avatar) {
             userAvatarDisplay.src = `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32`;
         } else {
             userAvatarDisplay.src = 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
         }
     } else {
         loginButton.classList.remove('hidden');
         userInfo.classList.add('hidden');
         userInfo.classList.remove('flex');
     }
}

/**
 * Creates snowflake effect.
 */
 function createSnowflakes() {
    const numberOfSnowflakes = 75;
    if (!snowContainer) return; // Exit if container doesn't exist
    snowContainer.innerHTML = ''; // Clear previous snowflakes
    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = Math.random() * 3 + 2;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 10;
        const startLeft = Math.random() * 100;
        const opacity = Math.random() * 0.5 + 0.5;
        // Set styles dynamically
        snowflake.style.cssText = `width:${size}px; height:${size}px; left:${startLeft}vw; opacity:${opacity}; animation-duration:${duration}s; animation-delay:-${delay}s;`;
        snowContainer.appendChild(snowflake);
    }
}

/**
 * Handles logout action.
 */
async function handleLogout() {
    console.log('Logging out...');
    try {
         const response = await fetch(`${API_BASE_URL}/logout`, { credentials: 'include' });
         if (!response.ok) { throw new Error('Logout request failed'); }
         currentUser = { logged_in: false };
         updateHeaderUI(currentUser); // Update header immediately
         showPopupMessage(paymentMessage, "Logged out successfully.");
         // Redirect to home page after logout
         window.location.href = 'index.html';
    } catch(error) {
         console.error("Logout error:", error);
         showPopupMessage(errorMessagePopup, "Logout failed.", true);
         // Still update UI assuming logout locally
         currentUser = { logged_in: false };
         updateHeaderUI(currentUser);
    }
}

/**
 * Checks login status. Returns user object or null.
 * This is the core function called on most pages.
 */
async function checkLoginStatus() {
     try {
         const response = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });
         if (!response.ok) {
             if (response.status === 401 || response.status === 403) {
                 currentUser = { logged_in: false };
             } else { throw new Error(`HTTP error! status: ${response.status}`); }
         } else {
             currentUser = await response.json();
         }
         console.log("User status checked:", currentUser);
     } catch (error) {
         console.error("Error checking login status:", error);
         currentUser = { logged_in: false };
         // Optionally show error: showPopupMessage(errorMessagePopup, "Could not verify login status.", true);
     } finally {
         updateHeaderUI(currentUser); // Update header based on status
         return currentUser; // Return status for page-specific logic
     }
}

// --- Page Specific Functions ---

// ** Products Page **
function handleProductPurchase(event) {
    const button = event.target.closest('.paypal-button');
    if (!button) return;

    const productId = button.dataset.productId;
    if (!productId) {
        showPopupMessage(errorMessagePopup, "Product ID missing.", true);
        return;
    }

    if (!currentUser || !currentUser.logged_in) {
        showPopupMessage(errorMessagePopup, "Please log in to purchase.", true);
        return;
    }

    console.log(`Initiating purchase for product: ${productId}`);
    showPopupMessage(paymentMessage, `Processing purchase for ${productId}...`);
    // Add actual PayPal integration logic here
}

// ** Tickets Page **
async function fetchTicketsPageTickets() {
    if (!ticketListDiv || !ticketListStatus) return; // Check if elements exist on page

    // Login status is checked before calling this function
    if (!currentUser || !currentUser.logged_in) {
        ticketListStatus.textContent = "Please log in to view your tickets.";
        ticketListDiv.innerHTML = '';
        return;
    }

    ticketListStatus.textContent = "Loading tickets...";
    ticketListDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`, { credentials: 'include' });
        if (!response.ok) {
             if (response.status === 401 || response.status === 403) { throw new Error("Authentication required."); }
             else { throw new Error(`HTTP error! status: ${response.status}`); }
        }
        const tickets = await response.json();

        if (tickets.length === 0) {
            ticketListStatus.textContent = "You have no support tickets.";
        } else {
            ticketListStatus.textContent = ""; // Clear loading
            tickets.forEach(ticket => {
                const item = document.createElement('a'); // Use anchor tag
                item.classList.add('ticket-list-item');
                const ticketId = ticket._id || 'N/A';
                item.href = `ticket.html?id=${ticketId}`; // Link to detail page

                const statusClass = ticket.status === 'open' ? 'status-open' : 'status-closed';
                const statusText = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'N/A';
                const dateOpened = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A';
                const subject = ticket.subject || 'No Subject';
                const shortId = ticketId !== 'N/A' ? ticketId.slice(-6) : 'N/A';

                item.innerHTML = `
                    <div>
                        <p class="font-medium text-white">#${shortId}: ${subject}</p>
                        <p class="text-xs text-gray-400">Opened: ${dateOpened}</p>
                    </div>
                    <span class="${statusClass}">${statusText}</span>`;
                ticketListDiv.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Error fetching tickets:", error);
        ticketListStatus.textContent = `Failed to load tickets: ${error.message}`;
        showPopupMessage(errorMessagePopup, `Error fetching tickets: ${error.message}`, true);
    }
}

async function handleCreateTicket(event) {
    event.preventDefault();
    if (!createTicketForm || !createTicketStatus) return; // Check elements exist

    const subject = ticketSubjectInput.value.trim();
    const message = ticketMessageInput.value.trim();

    createTicketStatus.textContent = '';
    createTicketStatus.className = 'text-sm mt-4 mb-4 text-center h-6'; // Reset

    if (!subject || !message) {
        createTicketStatus.textContent = 'Please fill out both subject and message.';
        createTicketStatus.classList.add('error'); // Add error class directly
        return;
    }
     if (!currentUser || !currentUser.logged_in) {
        createTicketStatus.textContent = 'Please log in to create a ticket.';
        createTicketStatus.classList.add('error');
        return;
    }

    const submitButton = document.getElementById('create-ticket-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message }),
            credentials: 'include'
        });
        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch (e) {}
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }
        // Success
        createTicketStatus.textContent = 'Ticket submitted successfully!';
        createTicketStatus.classList.add('success'); // Add success class
        createTicketForm.reset();
        fetchTicketsPageTickets(); // Refresh list on this page
    } catch (error) {
        console.error('Error creating ticket:', error);
        createTicketStatus.textContent = `Error: ${error.message}`;
        createTicketStatus.classList.add('error'); // Add error class
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Ticket';
    }
}

// ** Dashboard Page **
function updateDashboardPageUI(user) {
    // Check if dashboard elements exist
    if (!dashboardUserNameDisplay || !dashboardUserAvatarDisplay || !dashboardUserStatus || !dashboardRolesCard || !dashboardRolesList || !dashboardTicketListCard) {
        console.warn("Dashboard elements not found on this page.");
        return;
    }

    if (!user || !user.logged_in) {
         // Should be redirected by checkLoginStatus, but as fallback:
         showPopupMessage(errorMessagePopup, "Please log in.", true);
         window.location.href = 'index.html';
         return;
    }

    // Update Welcome Card
    dashboardUserNameDisplay.textContent = user.username || 'User';
    if (user.user_id && user.avatar) {
       dashboardUserAvatarDisplay.src = `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=64`;
    } else {
       dashboardUserAvatarDisplay.src = 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?';
    }
    dashboardUserStatus.textContent = "Status: Active";

    // Update Roles Card
    dashboardRolesList.innerHTML = ''; // Clear previous
    let hasRoles = false;
    if (user.is_moderator) { // Check the flag
        const roleP = document.createElement('p');
        roleP.textContent = 'Moderator';
        roleP.classList.add('text-orange-400', 'font-semibold');
        dashboardRolesList.appendChild(roleP);
        hasRoles = true;
    }
    if (!hasRoles) {
        const roleP = document.createElement('p');
        roleP.textContent = 'User';
        dashboardRolesList.appendChild(roleP);
    }
    dashboardRolesCard.classList.remove('hidden'); // Show roles card

    // Show/Hide and Fetch Tickets for Mods
    if (user.is_moderator) {
        dashboardTicketListCard.classList.remove('hidden');
        fetchDashboardTickets(); // Fetch tickets for the dashboard
    } else {
        dashboardTicketListCard.classList.add('hidden');
    }
}

async function fetchDashboardTickets() {
    if (!dashboardTicketListDiv || !dashboardTicketListStatus) return;
    if (!currentUser || !currentUser.logged_in || !currentUser.is_moderator) return; // Re-check just in case

    dashboardTicketListStatus.textContent = "Loading tickets...";
    dashboardTicketListDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`, { credentials: 'include' });
        if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
        const tickets = await response.json();

        if (tickets.length === 0) {
            dashboardTicketListStatus.textContent = "You have no support tickets.";
        } else {
            dashboardTicketListStatus.textContent = ""; // Clear loading
            tickets.forEach(ticket => {
                const item = document.createElement('a');
                item.classList.add('ticket-list-item');
                const ticketId = ticket._id || 'N/A';
                item.href = `ticket.html?id=${ticketId}`;

                const statusClass = ticket.status === 'open' ? 'status-open' : 'status-closed';
                const statusText = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'N/A';
                const dateOpened = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A';
                const subject = ticket.subject || 'No Subject';
                const shortId = ticketId !== 'N/A' ? ticketId.slice(-6) : 'N/A';

                item.innerHTML = `
                    <div>
                        <p class="font-medium text-white">#${shortId}: ${subject}</p>
                        <p class="text-xs text-gray-400">Opened: ${dateOpened}</p>
                    </div>
                    <span class="${statusClass}">${statusText}</span>`;
                dashboardTicketListDiv.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Error fetching dashboard tickets:", error);
        dashboardTicketListStatus.textContent = `Failed to load tickets: ${error.message}`;
    }
}

// ** Ticket Detail Page **
function appendChatMessage(data, isHistory = false) {
     if (!chatMessagesDiv) return;

     const loadingMsg = chatMessagesDiv.querySelector('p.text-gray-500');
     if (loadingMsg) loadingMsg.remove();

     const messageElement = document.createElement('div');
     messageElement.classList.add('chat-message');
     const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
     // Adjust sender key based on whether it's history (sender_username) or live (username)
     const safeUsername = (data.sender_username || data.username || 'System').replace(/</g, "&lt;").replace(/>/g, "&gt;");
     const safeText = (data.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");

     messageElement.innerHTML = `<span class="username">${safeUsername}:</span> ${safeText} <span class="timestamp">${timestamp}</span>`;

     chatMessagesDiv.appendChild(messageElement);

     // Scroll down only for new messages
     if (!isHistory) {
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
     }
}

async function fetchTicketDetails(ticketId) {
    // Check elements exist
    if (!ticketDetailSubject || !chatMessagesDiv) return;
    // Check login status (already done before calling this)
    if (!currentUser || !currentUser.logged_in) return;

     if (!ticketId) {
         ticketDetailSubject.textContent = "Invalid Ticket ID";
         chatMessagesDiv.innerHTML = '<p class="text-red-500 text-center py-4">Error: No Ticket ID provided.</p>';
         return;
     }

     currentTicketId = ticketId; // Store globally for socket use
     ticketDetailSubject.textContent = `Loading Ticket #${ticketId.slice(-6)}...`;
     chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Loading chat history...</p>';

     try {
         const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, { credentials: 'include' });
         if (!response.ok) {
             if (response.status === 404) throw new Error("Ticket not found.");
             if (response.status === 401 || response.status === 403) throw new Error("Access denied.");
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         const ticketData = await response.json();

         const subject = ticketData.subject || 'No Subject';
         document.title = `Ticket #${ticketId.slice(-6)} - ${subject}`;
         ticketDetailSubject.textContent = `#${ticketId.slice(-6)}: ${subject}`;

         chatMessagesDiv.innerHTML = ''; // Clear loading
         if (ticketData.messages && ticketData.messages.length > 0) {
             ticketData.messages.forEach(msg => appendChatMessage(msg, true));
             chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll after loading history
         } else {
             chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No messages yet.</p>';
         }

         connectSocket(ticketId); // Connect WebSocket

     } catch (error) {
          console.error("Error fetching ticket details:", error);
          ticketDetailSubject.textContent = "Error Loading Ticket";
          chatMessagesDiv.innerHTML = `<p class="text-red-500 text-center py-4">Error: ${error.message}</p>`;
          showPopupMessage(errorMessagePopup, `Failed to load ticket: ${error.message}`, true);
     }
}

function connectSocket(ticketId) {
    if (!ticketId || typeof io === 'undefined') {
        console.error("Socket.IO client not loaded or no Ticket ID.");
        appendChatMessage({ username: 'System', text: 'Chat connection failed (setup error).' });
        return;
    };
    if (socket && socket.connected) {
         socket.emit('join_ticket_room', { ticket_id: ticketId });
         return;
     }
    if (socket) { socket.disconnect(); }

    console.log(`Connecting WebSocket for ticket: ${ticketId}`);
    socket = io(SOCKET_URL, { reconnectionAttempts: 3, withCredentials: true });

    socket.on('connect', () => {
        console.log('WS connected:', socket.id);
        appendChatMessage({ username: 'System', text: 'Connected to chat.' });
        socket.emit('join_ticket_room', { ticket_id: ticketId });
    });
    socket.on('disconnect', (reason) => {
        console.log('WS disconnected:', reason);
        appendChatMessage({ username: 'System', text: `Disconnected: ${reason}` });
        socket = null;
    });
    socket.on('connect_error', (error) => {
        console.error('WS connection error:', error);
        appendChatMessage({ username: 'System', text: `Connection error.` });
        socket = null;
    });
    socket.on('new_message', (data) => {
        if (data.ticket_id === currentTicketId) { appendChatMessage(data); }
    });
    socket.on('room_joined', (data) => {
        console.log('Joined room:', data.room);
        appendChatMessage({ username: 'System', text: `Joined ticket room.` });
    });
    socket.on('error_message', (data) => {
        console.error('WS error:', data.message);
        showPopupMessage(errorMessagePopup, data.message || 'Chat error.', true);
    });
}

function disconnectSocket() {
    if (socket) {
        console.log('Disconnecting socket...');
        socket.disconnect();
        socket = null;
    }
}

function handleChatSubmit(event) {
     event.preventDefault();
     if (!chatInput) return;
     const messageText = chatInput.value.trim();
     if (messageText && socket && socket.connected && currentTicketId) {
         socket.emit('send_message', { ticket_id: currentTicketId, text: messageText });
         chatInput.value = '';
     } else if (!socket || !socket.connected) {
         showPopupMessage(errorMessagePopup, 'Not connected to chat.', true);
     }
}


// --- Global Initial Setup ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded. Determining page...");
    createSnowflakes(); // Add snow effect to all pages

    // --- Run Login Check ---
    // We need user status for almost all pages (header, protected content)
    await checkLoginStatus(); // Wait for status check to complete

    // --- Page-Specific Initialization ---
    const path = window.location.pathname;

    if (path.endsWith('/') || path.endsWith('/index.html')) {
        console.log("Initializing index.html");
        // No specific JS needed for index page beyond login check/header update
    }
    else if (path.endsWith('/products.html')) {
        console.log("Initializing products.html");
        if (productsSection) {
            productsSection.addEventListener('click', handleProductPurchase);
        }
    }
    else if (path.endsWith('/tickets.html')) {
        console.log("Initializing tickets.html");
        if (currentUser && currentUser.logged_in) {
            fetchTicketsPageTickets(); // Fetch tickets if logged in
        } else {
            // Show login prompt if tickets page elements exist
            if(ticketListStatus) ticketListStatus.textContent = "Please log in to view or create tickets.";
             if(createTicketStatus) createTicketStatus.textContent = "Please log in to create a ticket.";
        }
        if (createTicketForm) {
            createTicketForm.addEventListener('submit', handleCreateTicket);
        }
    }
    else if (path.endsWith('/dashboard.html')) {
        console.log("Initializing dashboard.html");
        if (currentUser && currentUser.logged_in) {
            updateDashboardPageUI(currentUser); // Update dashboard if logged in
        } else {
             // Redirect if not logged in (should be handled by updateDashboardPageUI too)
             showPopupMessage(errorMessagePopup, "Please log in to view the dashboard.", true);
             window.location.href = 'index.html';
        }
         // Add listener for dashboard logout button
         if (dashboardLogoutButton) {
             dashboardLogoutButton.addEventListener('click', (e) => {
                 e.preventDefault();
                 handleLogout();
             });
         }
    }
    else if (path.endsWith('/ticket.html')) {
        console.log("Initializing ticket.html");
        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get('id');
        if (currentUser && currentUser.logged_in) {
            if (ticketId) {
                fetchTicketDetails(ticketId); // Fetch details if logged in and ID exists
            } else {
                 // Handle missing ID
                 if(ticketDetailSubject) ticketDetailSubject.textContent = "Invalid Ticket";
                 if(chatMessagesDiv) chatMessagesDiv.innerHTML = '<p class="text-red-500 text-center py-4">Error: No Ticket ID found in URL.</p>';
                 showPopupMessage(errorMessagePopup, "No ticket ID specified.", true);
            }
        } else {
            // Redirect if not logged in
            showPopupMessage(errorMessagePopup, "Please log in to view this ticket.", true);
            window.location.href = 'index.html'; // Or maybe tickets.html
        }
        if (chatInputForm) {
            chatInputForm.addEventListener('submit', handleChatSubmit);
        }
        // Disconnect socket when leaving the page
        window.addEventListener('beforeunload', disconnectSocket);
    }

    // --- Common Event Listeners ---
    // Add header logout listener (if header logout button exists)
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent link navigation if it's an <a>
            handleLogout();
        });
    }

});
