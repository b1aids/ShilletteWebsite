// tickets.js
// Description: Handles fetching the list of tickets (for users and moderators),
// fetching details for a specific ticket, and managing the "Create New Ticket" form.

/**
 * Fetches the user's tickets (or all tickets for moderators) from the API
 * and renders the appropriate list(s) on the tickets page.
 * Toggles visibility between user view and moderator view based on user role.
 * Assumes `API_BASE_URL`, `currentUser`, DOM elements (`userTicketView`,
 * `moderatorManagementView`, list containers, status elements), `showPopupMessage`,
 * `errorMessagePopup`, `showTicketContextMenu` are globally accessible.
 */
async function fetchTickets() {
    console.log("[fetchTickets] Starting fetch...");
    // Ensure required DOM elements are available
    if (!userTicketView || !moderatorManagementView || !ticketListDiv || !ticketListStatus ||
        !moderatorActiveTicketListDiv || !moderatorActiveListStatus ||
        !moderatorArchivedTicketListDiv || !moderatorArchivedListStatus) {
        console.error("[fetchTickets] One or more required ticket list elements not found.");
        return;
    }

    // --- Authentication Check ---
    if (!currentUser || !currentUser.logged_in) {
        console.log("[fetchTickets] User not logged in. Displaying login prompt.");
        // Display login prompts in relevant status areas
        ticketListStatus.textContent = "Please log in to view tickets.";
        moderatorActiveListStatus.textContent = "Log in required."; // Shorter message for mod view
        moderatorArchivedListStatus.textContent = "Log in required.";
        // Clear any existing ticket lists
        ticketListDiv.innerHTML = '';
        moderatorActiveTicketListDiv.innerHTML = '';
        moderatorArchivedTicketListDiv.innerHTML = '';
        // Show the user view (which contains the create ticket form, etc.)
        // but the status message will indicate the need to log in.
        userTicketView.classList.remove('hidden');
        moderatorManagementView.classList.add('hidden'); // Hide moderator view
        return;
    }

    // --- Set Loading States ---
    ticketListStatus.textContent = "Loading your tickets...";
    moderatorActiveListStatus.textContent = "Loading active tickets...";
    moderatorArchivedListStatus.textContent = "Loading archived tickets...";
    // Clear previous lists
    ticketListDiv.innerHTML = '';
    moderatorActiveTicketListDiv.innerHTML = '';
    moderatorArchivedTicketListDiv.innerHTML = '';

    // --- Determine View (User vs Moderator) ---
    const isMod = currentUser.is_moderator === true;
    console.log(`[fetchTickets] User is moderator: ${isMod}`);
    userTicketView.classList.toggle('hidden', isMod); // Hide user list if moderator
    moderatorManagementView.classList.toggle('hidden', !isMod); // Show moderator view if moderator

    // --- Fetch Tickets from API ---
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`, { credentials: 'include' });
        if (!response.ok) {
             if (response.status === 401 || response.status === 403) {
                 throw new Error("Authentication required to view tickets.");
             } else {
                 throw new Error(`HTTP error! status: ${response.status}`);
             }
        }
        const tickets = await response.json();
        console.log(`[fetchTickets] Received ${tickets.length} tickets.`);

        // Clear loading messages now that data is received (or if list is empty)
        ticketListStatus.textContent = "";
        moderatorActiveListStatus.textContent = "";
        moderatorArchivedListStatus.textContent = "";

        // --- Render Tickets ---
        if (tickets.length === 0) {
            // Display "no tickets" messages if the list is empty
            if (isMod) {
                moderatorActiveListStatus.textContent = "No active tickets found.";
                moderatorArchivedListStatus.textContent = "No archived tickets found.";
            } else {
                ticketListStatus.textContent = "You have no support tickets.";
            }
        } else {
            let hasActive = false; // Flag for moderator view
            let hasArchived = false; // Flag for moderator view

            tickets.forEach(ticket => {
                const item = document.createElement('div');
                item.classList.add('ticket-list-item'); // Style defined in CSS
                // Store data attributes for navigation and context menus
                item.dataset.ticketId = ticket._id;
                item.dataset.ticketStatus = ticket.status;
                item.dataset.ticketSubject = ticket.subject || 'No Subject';

                // Determine status class and text
                const statusClass = ticket.status === 'open' ? 'status-open' : 'status-closed';
                const statusText = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'N/A';
                const dateOpened = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A';
                const shortId = ticket._id ? ticket._id.slice(-6) : 'N/A'; // Display last 6 chars of ID
                const subject = ticket.subject || 'No Subject';
                const username = ticket.username || 'Unknown User'; // Username of ticket creator

                // Populate the list item's HTML content
                item.innerHTML = `
                    <div>
                        <p class="font-medium text-white">#${shortId}: ${subject.replace(/</g, "&lt;")}</p> <p class="text-xs text-gray-400">User: ${username.replace(/</g, "&lt;")} | Opened: ${dateOpened}</p>
                    </div>
                    <span class="${statusClass}">${statusText}</span>
                `;

                // Add click listener to navigate to the ticket detail page
                item.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent any default behavior
                    const targetHash = `/#ticketDetail?id=${ticket._id}`;
                    console.log(`[fetchTickets] Ticket item clicked: ID=${ticket._id}. Navigating to: ${targetHash}`);
                    window.location.hash = targetHash; // Change hash to trigger navigation
                });

                // Add context menu listener (right-click)
                item.addEventListener('contextmenu', showTicketContextMenu); // Assumes global

                // Append the item to the correct list (user list or moderator active/archived)
                if (isMod) {
                    if (ticket.status === 'open') {
                        moderatorActiveTicketListDiv.appendChild(item);
                        hasActive = true;
                    } else {
                        moderatorArchivedTicketListDiv.appendChild(item);
                        hasArchived = true;
                    }
                } else {
                    ticketListDiv.appendChild(item);
                }
            });

            // Update status text for moderator view if lists ended up empty after filtering
            if (isMod) {
                if (!hasActive) moderatorActiveListStatus.textContent = "No active tickets found.";
                if (!hasArchived) moderatorArchivedListStatus.textContent = "No archived tickets found.";
            }
        }
    } catch (error) {
        console.error("[fetchTickets] Error fetching tickets:", error);
        const errorMsg = `Failed to load tickets: ${error.message}`;
        // Display error in all relevant status areas
        ticketListStatus.textContent = errorMsg;
        moderatorActiveListStatus.textContent = errorMsg;
        moderatorArchivedListStatus.textContent = errorMsg;
        showPopupMessage(errorMessagePopup, errorMsg, true); // Assumes global
    }
}

/**
 * Fetches details (subject, messages) for a specific ticket ID from the API.
 * Renders the messages in the chat container and joins the corresponding Socket.IO room.
 * Assumes `API_BASE_URL`, `currentUser`, `currentTicketId`, `socket`, DOM elements
 * (`ticketDetailSubject`, `chatMessagesDiv`, `backToTicketsButton`), `ensureSocketConnected`,
 * `appendChatMessage`, `showPopupMessage`, `errorMessagePopup` are globally accessible.
 * @param {string} ticketId - The ID of the ticket to fetch details for.
 */
async function fetchTicketDetails(ticketId) {
    console.log(`[fetchTicketDetails] Fetching details for ticket: ${ticketId}`);

    // Ensure user is logged in and required elements exist
    if (!currentUser || !currentUser.logged_in) {
        console.warn("[fetchTicketDetails] User not logged in. Aborting.");
        // Optionally redirect or show login message
        return;
    }
    if (!ticketDetailSubject || !chatMessagesDiv || !backToTicketsButton) {
        console.error("[fetchTicketDetails] Required ticket detail elements not found.");
        return;
    }

    ensureSocketConnected(); // Make sure socket connection is active or being established

    // Show loading state in the chat area
    chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Loading messages...</p>';
    // Ensure the "Back to Tickets" button points correctly
    backToTicketsButton.href = '/#tickets';

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, { credentials: 'include' });
        if (!response.ok) {
            // Handle specific HTTP errors
            if (response.status === 401 || response.status === 403) throw new Error("Access denied to this ticket.");
            if (response.status === 404) throw new Error("Ticket not found.");
            // Generic error for other statuses
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const ticket = await response.json();
        console.log(`[fetchTicketDetails] Received details for ticket: ${ticketId}`, ticket);

        // Update ticket subject title display
        ticketDetailSubject.textContent = ticket.subject || `Ticket #${ticketId.slice(-6)}`;
        // Clear loading message from chat area
        chatMessagesDiv.innerHTML = '';

        // Render existing messages
        if (ticket.messages && ticket.messages.length > 0) {
            ticket.messages.forEach(appendChatMessage); // Assumes appendChatMessage is global (from chat.js)
        } else {
            // Show a message if the ticket has no messages yet
            chatMessagesDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No messages in this ticket yet. Type below to start the conversation.</p>';
        }

        // Join the Socket.IO room for this ticket to receive real-time updates
        if (socket && socket.connected) {
            console.log(`[fetchTicketDetails] Emitting join_ticket_room for: ${ticketId}`);
            socket.emit('join_ticket_room', { ticket_id: ticketId });
        } else {
            // Socket might still be connecting, it should join upon connection event
            console.warn("[fetchTicketDetails] Socket not connected when trying to join room. Will attempt on connect.");
        }

    } catch (error) {
        console.error("[fetchTicketDetails] Error fetching ticket details:", error);
        // Display error message in the chat area
        chatMessagesDiv.innerHTML = `<p class="text-red-400 text-center py-4">Error loading messages: ${error.message}</p>`;
        showPopupMessage(errorMessagePopup, `Error loading ticket: ${error.message}`, true); // Assumes global
        // Redirect back to the tickets list if the ticket wasn't found or access was denied
        if (error.message.includes("not found") || error.message.includes("Access denied")) {
            window.location.hash = '/#tickets';
        }
    }
}

/**
 * Handles the submission of the "Create New Ticket" form.
 * Validates input, sends data to the API, and provides user feedback.
 * Refreshes the ticket list if the user is currently on the tickets page.
 * Assumes `createTicketForm`, form elements (`ticketSubjectInput`, etc.),
 * `API_BASE_URL`, `createTicketStatus`, `showPopupMessage`, `errorMessagePopup`,
 * `activeSectionId`, `pageSections`, `fetchTickets` are globally accessible.
 * @param {Event} event - The form submission event.
 */
async function handleCreateTicketSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Ensure required form elements exist
    if (!createTicketForm || !ticketSubjectInput || !ticketMessageInput || !createTicketStatus) {
        console.error("handleCreateTicketSubmit: Required form elements missing.");
        return;
    }
    const submitButton = document.getElementById('create-ticket-button'); // Get button inside handler
    if (!submitButton) {
        console.error("handleCreateTicketSubmit: Submit button not found.");
        return;
    }

    const subject = ticketSubjectInput.value.trim();
    const message = ticketMessageInput.value.trim();

    // --- Input Validation ---
    createTicketStatus.textContent = ''; // Clear previous status
    createTicketStatus.className = 'h-6 text-sm mt-4 mb-4 text-center'; // Reset style

    if (!subject || !message) {
        createTicketStatus.textContent = 'Please fill out both subject and message.';
        createTicketStatus.classList.add('error'); // Assumes 'error' class styles text red
        return;
    }

    // --- API Call ---
    // Disable button and show submitting state
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message }),
            credentials: 'include' // Send cookies for authentication
        });

        const result = await response.json(); // Try to parse JSON response

        if (!response.ok) {
            // Throw error using backend message if available
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        // --- Success ---
        console.log("[handleCreateTicketSubmit] Ticket created successfully:", result);
        createTicketStatus.textContent = 'Ticket submitted successfully!';
        createTicketStatus.classList.add('success'); // Assumes 'success' class styles text green
        createTicketForm.reset(); // Clear the form fields

        // Refresh the ticket list if the user is currently viewing it
        if (activeSectionId === pageSections['#tickets']) {
            fetchTickets(); // Assumes global
        }
        // Optionally show a success popup
        // showPopupMessage(ticketMessagePopup, 'Ticket submitted successfully!');

    } catch (error) {
        // --- Error ---
        console.error('Error creating ticket:', error);
        createTicketStatus.textContent = `Error: ${error.message}`;
        createTicketStatus.classList.add('error');
        showPopupMessage(errorMessagePopup, `Failed to create ticket: ${error.message}`, true); // Assumes global
    } finally {
        // --- Finally ---
        // Re-enable the submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Ticket';
    }
}
