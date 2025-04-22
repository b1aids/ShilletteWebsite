// socketHandlers.js
// Description: Manages the Socket.IO connection lifecycle (connect, disconnect),
// ensures connection when needed, and sets up event listeners for real-time updates.

/**
 * Establishes or verifies the Socket.IO connection.
 * If already connected, potentially rejoins the current ticket room.
 * If not connected, initializes a new connection and sets up listeners.
 * Assumes `socket`, `SOCKET_URL`, `currentTicketId`, `io` (from Socket.IO library),
 * `setupSocketListeners`, `showPopupMessage`, `errorMessagePopup` are globally accessible.
 * @param {string | null} [ticketIdToJoin=null] - Optional ticket ID to attempt joining immediately after connection or if already connected.
 */
function connectSocket(ticketIdToJoin = null) {
    // Check if already connected
    if (socket && socket.connected) {
        // If connected and a specific ticket room needs joining (and it's the current one)
        if (ticketIdToJoin && currentTicketId === ticketIdToJoin) {
            console.log(`[connectSocket] Socket already connected. Re-joining room: ${ticketIdToJoin}`);
            socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
        } else {
            console.log(`[connectSocket] Socket already connected. No specific room join needed or ticket ID mismatch.`);
        }
        return; // Already connected, nothing more to do here
    }

    // If socket exists but is disconnected, try to reconnect explicitly
    if (socket && !socket.connected) {
        console.log(`[connectSocket] Socket exists but disconnected. Attempting reconnect...`);
        socket.connect(); // Attempt to reuse existing socket object
        // Listeners should still be attached from previous connection attempt
        return;
    }

    // If no socket object exists, create a new connection
    if (!socket) {
        console.log(`[connectSocket] No existing socket. Attempting new connection to ${SOCKET_URL}... (Potential room join: ${ticketIdToJoin || 'none'})`);
        try {
            // Initialize Socket.IO client
            // Assumes 'io' is globally available from the Socket.IO library script
            socket = io(SOCKET_URL, {
                reconnectionAttempts: 3, // Limit reconnection attempts
                withCredentials: true    // Send cookies with the connection request
            });

            // --- Setup Core Socket Event Listeners ---
            socket.on('connect', () => {
                console.log('[Socket] Connected successfully:', socket.id);
                // Join the specified room if needed, now that connection is established
                if (ticketIdToJoin && currentTicketId === ticketIdToJoin) {
                    console.log(`[Socket] Joining room post-connect: ${ticketIdToJoin}`);
                    socket.emit('join_ticket_room', { ticket_id: ticketIdToJoin });
                }
                // Setup application-specific listeners (new_message, etc.)
                setupSocketListeners(); // Assumes global
            });

            socket.on('disconnect', (reason) => {
                console.warn('[Socket] Disconnected:', reason);
                // Optionally show feedback to the user
                // showPopupMessage(errorMessagePopup, "Chat disconnected. Attempting to reconnect...", true, 5000);
                // Socket.IO handles reconnection attempts automatically based on options
                // We might clear the `socket` variable here if we want to force a new object on next connect attempt
                // socket = null;
            });

            socket.on('connect_error', (error) => {
                console.error('[Socket] Connection Error:', error);
                showPopupMessage(errorMessagePopup, "Chat connection failed.", true); // Assumes global
                // Consider clearing the socket object on persistent failure
                // socket = null;
            });

            // Handle reconnection attempts/failures if needed
            socket.io.on('reconnect_attempt', (attempt) => {
                console.log(`[Socket] Reconnect attempt #${attempt}...`);
            });
            socket.io.on('reconnect_failed', () => {
                console.error('[Socket] Reconnection failed after maximum attempts.');
                showPopupMessage(errorMessagePopup, "Could not reconnect to chat.", true);
            });

        } catch (error) {
            console.error("[connectSocket] Error initializing Socket.IO:", error);
            showPopupMessage(errorMessagePopup, "Failed to initialize chat connection.", true);
            socket = null; // Ensure socket is null on initialization error
        }
    }
}

/**
 * Checks if the socket is connected and initiates a connection if not.
 * Useful before performing actions that require a live socket connection.
 * Assumes `socket`, `currentTicketId`, `connectSocket` are globally accessible.
 */
function ensureSocketConnected() {
     if (!socket || !socket.connected) {
         console.log("[ensureSocketConnected] Socket not connected or object doesn't exist. Attempting connection...");
         connectSocket(currentTicketId); // Attempt connection, pass current ticket ID if relevant
     } else {
         console.log("[ensureSocketConnected] Socket already connected.");
         // Optional: Re-join room if necessary, e.g., if navigating back to ticket detail
         if (currentTicketId && activeSectionId === pageSections['#ticketDetail']) {
            console.log(`[ensureSocketConnected] Re-joining room ${currentTicketId} as already connected.`);
            socket.emit('join_ticket_room', { ticket_id: currentTicketId });
         }
     }
}

/**
 * Sets up the main application-specific Socket.IO event listeners.
 * This should be called once the socket is connected. It removes previous
 * listeners before adding new ones to prevent duplicates on reconnect.
 * Assumes `socket`, `currentTicketId`, `activeSectionId`, `pageSections`,
 * `appendChatMessage`, `showPopupMessage`, `errorMessagePopup`, `ticketMessagePopup`,
 * `productMessagePopup`, `fetchTickets`, `chatMessagesDiv` are globally accessible.
 */
function setupSocketListeners() {
     if (!socket) {
        console.error("[setupSocketListeners] Cannot setup listeners: Socket object is null.");
        return;
     }
     console.log("[setupSocketListeners] Setting up application event listeners.");

     // --- Remove previous listeners to prevent duplicates on reconnect ---
     socket.off('connect'); // Core listeners might be handled by connectSocket
     socket.off('disconnect');
     socket.off('connect_error');
     // Application specific listeners:
     socket.off('new_message');
     socket.off('room_joined');
     socket.off('error_message');
     socket.off('message_deleted');
     socket.off('ticket_status_updated');
     socket.off('ticket_list_updated');
     socket.off('action_success');
     socket.off('firmware_progress');

     // --- Add Application Event Listeners ---

     // Handle new chat messages
     socket.on('new_message', (data) => {
         console.log("[Socket Listener] Received 'new_message':", data);
         // Add sender ID if missing and message is from current user (useful for context menu)
         if (!data.sender_id && currentUser && data.username === currentUser.username) {
             data.sender_id = currentUser.user_id;
         }
         // Only append the message if the user is currently viewing the correct ticket
         if (data.ticket_id === currentTicketId) {
             appendChatMessage(data); // Assumes global (from chat.js)
         } else {
             // Optional: Show a notification for messages in other tickets
             console.log(`[Socket Listener] Received message for different ticket (${data.ticket_id}). Current: ${currentTicketId}`);
         }
     });

     // Log successful room joins (optional, useful for debugging)
     socket.on('room_joined', (data) => {
        console.log(`[Socket Listener] Successfully joined room: ${data?.room}`);
     });

     // Handle generic error messages from the server via socket
     socket.on('error_message', (data) => {
        console.error('[Socket Listener] Received server error:', data.message);
        showPopupMessage(errorMessagePopup, data.message || 'An error occurred via chat service.', true); // Assumes global
     });

     // Handle confirmation that a message was deleted
     socket.on('message_deleted', (data) => {
         console.log("[Socket Listener] Received 'message_deleted':", data);
         // If viewing the affected ticket, remove the message element from the DOM
         if (data.ticket_id === currentTicketId && chatMessagesDiv) {
             // Find the message element using the timestamp data attribute
             const messageToRemove = chatMessagesDiv.querySelector(`.chat-message[data-timestamp="${data.timestamp}"]`);
             if (messageToRemove) {
                 messageToRemove.remove();
                 console.log(`[Socket Listener] Removed deleted message with timestamp: ${data.timestamp}`);
             } else {
                 // This might happen if the message wasn't rendered yet or already removed
                 console.warn(`[Socket Listener] Could not find message to delete with timestamp: ${data.timestamp}`);
             }
         }
     });

     // Handle updates to a ticket's status (e.g., opened/closed)
     socket.on('ticket_status_updated', (data) => {
          console.log("[Socket Listener] Received 'ticket_status_updated':", data);
          // If the user is currently on the tickets list page, refresh the list
          if (activeSectionId === pageSections['#tickets']) {
              console.log(`[Socket Listener] Ticket ${data.ticket_id} status updated to ${data.status}. Refreshing list.`);
              fetchTickets(); // Assumes global (from tickets.js)
          }
          // If the user is viewing the specific ticket that was updated, show a popup
          if (data.ticket_id === currentTicketId) {
              showPopupMessage(ticketMessagePopup, `Ticket status updated to ${data.status}.`); // Assumes global
          }
          // Update the status in the data attribute of the list item if it exists in the DOM
          // This keeps the context menu logic consistent even if the list isn't immediately refreshed
          const ticketItem = document.querySelector(`.ticket-list-item[data-ticket-id="${data.ticket_id}"]`);
          if(ticketItem) {
              ticketItem.dataset.ticketStatus = data.status;
              // Optionally update the visual status badge as well
              const statusBadge = ticketItem.querySelector('.status-open, .status-closed');
              if (statusBadge) {
                  statusBadge.className = `text-xs font-bold px-2 py-0.5 rounded-full ${data.status === 'open' ? 'status-open' : 'status-closed'}`;
                  statusBadge.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);
              }
          }
     });

     // Handle events indicating the overall ticket list needs refreshing (e.g., after deletion)
      socket.on('ticket_list_updated', () => {
          console.log("[Socket Listener] Received 'ticket_list_updated' (likely due to deletion/creation).");
          // If the user is on the tickets list page, refresh it
          if (activeSectionId === pageSections['#tickets']) {
              console.log("[Socket Listener] Refreshing ticket list.");
              fetchTickets(); // Assumes global
          }
          // If viewing a ticket that might have been deleted, redirect to the list
          // (Check if the currently viewed ticket still exists might be better if possible)
          if (currentTicketId && activeSectionId === pageSections['#ticketDetail']) {
              console.warn(`[Socket Listener] Ticket list updated while viewing ticket ${currentTicketId}. Redirecting to list as ticket might be deleted.`);
              showPopupMessage(errorMessagePopup, "The ticket list was updated. Returning to list.", true);
              window.location.hash = '/#tickets'; // Navigate away from potentially deleted ticket
          }
      });

     // Handle generic success messages from the server (e.g., after an action)
     socket.on('action_success', (data) => {
        console.log("[Socket Listener] Received 'action_success':", data);
        showPopupMessage(paymentMessage, data.message || 'Action successful.'); // Using paymentMessage popup for general success
     });

     // Handle firmware generation progress updates
     socket.on('firmware_progress', (data) => {
        console.log("[Socket Listener] Received 'firmware_progress':", data);
        const message = data.message || 'Processing...';
        const step = data.step || 'unknown'; // e.g., 'queued', 'building', 'signing', 'complete', 'failed'
        const isError = step === 'failed' || step === 'cancelled';
        const isComplete = step === 'complete';

        // Determine which popup to use and duration
        const popupElement = isError ? errorMessagePopup : productMessagePopup;
        const duration = isComplete || isError ? 6000 : 4000; // Longer duration for final status

        // Show the progress update using a popup
        showPopupMessage(
            popupElement,
            `[Firmware: ${step.toUpperCase()}] ${message}`,
            isError,
            duration
        );

        // Optional: Update a dedicated build status area in the UI if one exists
        // const buildLogArea = document.getElementById('firmware-build-log');
        // if (buildLogArea && data.log) {
        //    buildLogArea.textContent += `\n[${step}] ${message}`;
        //    buildLogArea.scrollTop = buildLogArea.scrollHeight;
        // }
     });
}

/**
 * Disconnects the Socket.IO connection if it exists and is connected.
 * Assumes `socket` is globally accessible.
 */
function disconnectSocket() {
    if (socket && socket.connected) {
        console.log('[disconnectSocket] Disconnecting WebSocket...');
        socket.disconnect();
        // Consider setting socket = null here if you want to force a new object on next connect
        // socket = null;
    } else if (socket) {
        console.log('[disconnectSocket] Socket exists but is already disconnected.');
    } else {
        console.log('[disconnectSocket] No socket object to disconnect.');
    }
}
