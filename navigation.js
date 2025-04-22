// navigation.js
// Description: Handles client-side routing based on URL hash changes,
// manages page section visibility, and triggers data loading for specific views.

/**
 * Hides all page sections defined in `pageSections` and shows the one
 * with the specified element ID. Updates the global `activeSectionId`.
 * Also handles socket disconnection/connection logic based on the target section.
 * Assumes `pageSections`, `activeSectionId`, `currentTicketId`, `hideContextMenu`,
 * `disconnectSocket`, `ensureSocketConnected` are globally accessible.
 * @param {string} sectionElementId - The ID of the page section element to show.
 */
function showSection(sectionElementId) {
    console.log(`[showSection] Attempting to show element ID: ${sectionElementId}`);
    hideContextMenu(); // Close any open context menus

    let foundSection = false;
    // Hide all sections first
    Object.values(pageSections).forEach(id => {
        const sectionElement = document.getElementById(id);
        if (sectionElement) {
            sectionElement.classList.remove('active');
            sectionElement.classList.add('hidden');
        } else {
            // This warning is helpful during development
            console.warn(`[showSection] Element not found for ID during hide phase: ${id}`);
        }
    });

    // Show the target section
    const targetElement = document.getElementById(sectionElementId);
    if (targetElement) {
        targetElement.classList.remove('hidden');
        targetElement.classList.add('active');
        activeSectionId = sectionElementId; // Update global state
        foundSection = true;
        console.log(`[showSection] Successfully shown: ${sectionElementId}`);
        window.scrollTo(0, 0); // Scroll to the top of the page
    }

    // Fallback to home section if the target element ID wasn't found
    if (!foundSection) {
        console.warn(`[showSection] Target element ID not found: ${sectionElementId}. Defaulting to home.`);
        const homeElementId = pageSections['#home']; // Get home section ID
        const homeElement = document.getElementById(homeElementId);
        if (homeElement) {
            homeElement.classList.remove('hidden');
            homeElement.classList.add('active');
            activeSectionId = homeElementId; // Update global state
            console.log(`[showSection] Defaulted to ${activeSectionId}.`);
            window.scrollTo(0, 0);
        } else {
             // This would be a critical error - the home section itself is missing
             activeSectionId = null;
             console.error("[showSection] Could not find home element either! Check pageSections mapping and HTML structure.");
        }
    }

    // Manage socket connection based on the section being shown
    const isTicketRelated = sectionElementId === pageSections['#ticketDetail'] || sectionElementId === pageSections['#tickets'];
    if (!isTicketRelated && activeSectionId !== pageSections['#ticketDetail'] && activeSectionId !== pageSections['#tickets']) {
        // Disconnect socket ONLY if navigating *away* from ticket-related pages
        console.log(`[showSection] Navigating away from tickets/detail, disconnecting socket.`);
        disconnectSocket(); // Assumes disconnectSocket is global
    } else if (isTicketRelated) {
        // Ensure socket is connected if navigating *to* ticket-related pages
        console.log(`[showSection] Navigating to tickets/detail, ensuring socket is connected.`);
        ensureSocketConnected(); // Assumes ensureSocketConnected is global
    }

    // Reset current ticket ID if we are not on the ticket detail page
    if (sectionElementId !== pageSections['#ticketDetail']) {
         currentTicketId = null;
    }
}


/**
 * Handles navigation logic based on the URL hash. Parses the hash,
 * determines the target section, handles authentication checks for protected routes,
 * extracts parameters (like ticket ID or product ID), triggers data loading,
 * and finally calls `showSection` to display the correct page content.
 * Assumes global variables/functions: `pageSections`, `currentUser`,
 * `isInitialLoginCheckComplete`, `isInitialConfigLoadComplete`, `activeSectionId`,
 * `currentTicketId`, `socket`, `errorMessagePopup`, `ticketMessagePopup`,
 * `showPopupMessage`, `ensureSocketConnected`, `fetchTicketDetails`,
 * `fetchProductDetails`, `fetchTickets`, `fetchProducts`, `displayUserRoles`,
 * `displayRegisteredProducts`, `loadAdminDashboardData`, `updateHeaderUI`, `fetchAllProducts`.
 * @param {string} hash - The URL hash (e.g., '#dashboard', '#ticketDetail?id=123').
 */
function navigateTo(hash) {
    console.log(`[navigateTo] Received hash: ${hash}`);
    const hashParts = hash.split('?');
    const baseHash = hashParts[0] || '#home'; // Default to #home if hash is empty or just '?'
    const targetElementId = pageSections[baseHash] || pageSections['#home']; // Fallback to home section ID

    console.log(`[navigateTo] Base hash: ${baseHash}, Target element ID: ${targetElementId}`);

    // --- Initial Checks for Protected Routes ---
    const isProtected = ['#dashboard', '#tickets', '#ticketDetail'].includes(baseHash);
    // Product detail page might be public, adjust if needed:
    // const isProtected = ['#dashboard', '#tickets', '#ticketDetail', '#productDetail'].includes(baseHash);

    // Defer navigation to protected routes until initial login/config checks are done
    if (isProtected && (!isInitialLoginCheckComplete || !isInitialConfigLoadComplete)) {
        console.log(`[navigateTo] Initial checks not complete for protected route ${baseHash}. Deferring action.`);
        return; // Exit and wait for checks to complete
    }

    // --- Authentication Check for Protected Routes ---
    if (isProtected && (!currentUser || !currentUser.logged_in)) {
        console.log(`[navigateTo] Access denied to protected route: ${baseHash}. User not logged in.`);
        showPopupMessage(errorMessagePopup, "Please log in to view this page.", true);
        // Redirect to home page if access is denied
        if (window.location.hash !== '#home' && window.location.hash !== '/#home' && window.location.hash !== '') {
            console.log(`[navigateTo] Redirecting to /#home due to auth failure.`);
            window.location.hash = '/#home';
        } else {
            // If already on home, ensure the home section is visible
            console.log(`[navigateTo] Already on home, ensuring #home section is shown after auth failure.`);
            if(activeSectionId !== pageSections['#home']) showSection(pageSections['#home']);
        }
        return; // Stop further processing for this route
    }

    // --- Parameter Extraction ---
    let idParam = null;
    if (baseHash === '#ticketDetail' || baseHash === '#productDetail') {
         const params = new URLSearchParams(hashParts[1] || '');
         idParam = params.get('id');
         console.log(`[navigateTo] Extracted ID parameter for ${baseHash}: ${idParam}`);
    }

    // --- Data Loading and Specific Route Logic ---

    // Ticket Detail Page
    if (baseHash === '#ticketDetail') {
        if (idParam) {
            // Only fetch details if the ticket ID has changed or is newly set
            if (currentTicketId !== idParam) {
                console.log(`[navigateTo] Fetching details for new ticket ID: ${idParam}`);
                currentTicketId = idParam; // Update global state
                // Update UI elements immediately (title, loading message)
                if(ticketDetailSubject) ticketDetailSubject.textContent = `Ticket #${idParam.slice(-6)}`;
                if(chatMessagesDiv) chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Connecting to chat...</p>';
                fetchTicketDetails(idParam); // Assumes fetchTicketDetails is global (from tickets.js)
            } else {
                 console.log(`[navigateTo] Already viewing ticket ${idParam}, ensuring socket room join.`);
                 // Ensure joined to the room even if not re-fetching details
                 if (socket && socket.connected) socket.emit('join_ticket_room', { ticket_id: currentTicketId });
            }
        } else {
            // No ID provided for detail view - redirect to list
            console.warn("[navigateTo] Ticket ID missing for #ticketDetail view. Redirecting to tickets list.");
            showPopupMessage(errorMessagePopup, "Invalid ticket link.", true);
            window.location.hash = '/#tickets';
            return; // Stop processing, redirect will trigger navigation again
        }
    }
    // Product Detail Page
    else if (baseHash === '#productDetail') {
         if (idParam) {
              console.log(`[navigateTo] Fetching product details for ID: ${idParam}`);
              fetchProductDetails(idParam); // Assumes fetchProductDetails is global (from productsPublic.js)
         } else {
              // No ID provided for detail view - redirect to list
              console.warn("[navigateTo] Product ID missing for #productDetail view. Redirecting to products list.");
              showPopupMessage(errorMessagePopup, "Invalid product link.", true);
              window.location.hash = '/#products';
              return; // Stop processing, redirect will trigger navigation again
         }
    }
    // Tickets List Page
    else if (baseHash === '#tickets') {
        console.log(`[navigateTo] Fetching tickets for #tickets view.`);
        fetchTickets(); // Assumes fetchTickets is global (from tickets.js)
    }
    // Products List Page
    else if (baseHash === '#products') {
         console.log(`[navigateTo] Fetching products for #products view.`);
         fetchProducts(); // Assumes fetchProducts is global (from productsPublic.js)
    }
    // Dashboard Page
    else if (baseHash === '#dashboard' && currentUser?.logged_in) {
         console.log(`[navigateTo] Loading dashboard data. User:`, currentUser);
         // Display user roles (assumes displayUserRoles is global from uiUtils.js)
         displayUserRoles(currentUser.roles);

         // Display registered products (assumes displayRegisteredProducts is global from productRegistration.js)
         const myRegisteredDetails = currentUser.registered_product_details || [];
         displayRegisteredProducts(myRegisteredDetails);

         // Load admin sections if user is a moderator
         if (currentUser.is_moderator === true) {
             console.log(`[navigateTo] User is moderator, loading admin data.`);
             loadAdminDashboardData(); // Assumes loadAdminDashboardData is global (from productsAdmin.js/siteConfig.js)
         } else {
             console.log(`[navigateTo] User is NOT moderator, skipping admin data load.`);
         }
    }

    // --- Show the Target Section ---
    // This happens after potentially starting async data loads
    showSection(targetElementId);

    // --- Final UI Updates ---
    // Ensure header UI (login/logout button, avatar) is up-to-date
    updateHeaderUI(); // Assumes updateHeaderUI is global (from auth.js)
}

/**
 * Parses the current URL hash and calls `navigateTo` to handle routing.
 * This function is typically called on initial page load and on `hashchange` events.
 */
function runNavigation() {
    console.log(`[runNavigation] Processing raw hash: ${window.location.hash}`);
    const rawHash = window.location.hash;

    // Robust hash parsing
    let pathPart = '';
    let queryPart = '';
    const firstHashIndex = rawHash.indexOf('#');

    if (firstHashIndex !== -1) {
        const hashContent = rawHash.substring(firstHashIndex + 1); // Content after #
        const queryIndex = hashContent.indexOf('?');

        if (queryIndex !== -1) {
            pathPart = hashContent.substring(0, queryIndex);
            queryPart = hashContent.substring(queryIndex); // Includes '?'
        } else {
            pathPart = hashContent;
        }

        // Remove leading slashes if present (e.g., /#dashboard -> #dashboard)
        pathPart = pathPart.replace(/^\/+/, '');
    }

    // Construct the clean hash, defaulting to 'home' if pathPart is empty
    const hashToNavigate = `#${pathPart || 'home'}${queryPart}`;
    console.log(`[runNavigation] Cleaned hash to navigate: ${hashToNavigate}`);

    // Navigate only if initial checks are done OR if it's the home page (or empty hash)
    const isHomePageTarget = pathPart === '' || pathPart === 'home';
    if ((isInitialLoginCheckComplete && isInitialConfigLoadComplete) || isHomePageTarget) {
        navigateTo(hashToNavigate);
    } else {
        console.log(`[runNavigation] Initial checks not complete for target ${hashToNavigate}. Deferring navigation.`);
        // Navigation will be triggered again by loadSiteConfigAndNavigate once checks complete.
    }
}
