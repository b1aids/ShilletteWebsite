// ticketActions.js
// Description: Contains handler functions for actions performed on tickets
// and chat messages, primarily triggered from context menus.

/**
 * Emits a socket event to delete a specific chat message.
 * Triggered from the chat context menu (moderator only).
 * Assumes `contextMenuData`, `socket`, `showPopupMessage`, `errorMessagePopup`,
 * `hideContextMenu` are globally accessible.
 */
function deleteChatMessage() {
    // Ensure necessary data and socket connection exist
    if (!contextMenuData.ticketId || !contextMenuData.messageTimestamp || !socket || !socket.connected) {
        showPopupMessage(errorMessagePopup, 'Cannot delete message: Invalid state or not connected.', true);
        hideContextMenu(); // Close menu even on error
        return;
    }

    // Log the action attempt
    console.log(`[deleteChatMessage] Attempting to delete message: Ticket=${contextMenuData.ticketId}, Timestamp=${contextMenuData.messageTimestamp}`);

    // Emit the delete event to the server
    socket.emit('delete_message', {
        ticket_id: contextMenuData.ticketId,
        message_timestamp: contextMenuData.messageTimestamp
    });

    // Provide immediate feedback (server will confirm via 'message_deleted' event)
    // showPopupMessage(ticketMessagePopup, 'Delete request sent...'); // Optional feedback

    hideContextMenu(); // Close the context menu after initiating the action
 }

 /**
  * Emits a socket event to change the status of a ticket to 'closed'.
  * Triggered from the ticket context menu. Server handles permission checks.
  * Assumes `contextMenuData`, `socket`, `showPopupMessage`, `errorMessagePopup`,
  * `hideContextMenu` are globally accessible.
  */
 function closeTicket() {
    // Ensure necessary data and socket connection exist
    if (!contextMenuData.ticketId || !socket || !socket.connected) {
        showPopupMessage(errorMessagePopup, 'Cannot close ticket: Invalid state or not connected.', true);
        hideContextMenu();
        return;
    }

    // Log the action attempt
    console.log(`[closeTicket] Attempting to close ticket: ${contextMenuData.ticketId}`);

    // Emit the status update event to the server
    socket.emit('update_ticket_status', {
        ticket_id: contextMenuData.ticketId,
        new_status: 'closed'
    });

    // Provide immediate feedback (server will confirm via 'ticket_status_updated' event)
    // showPopupMessage(ticketMessagePopup, 'Close request sent...'); // Optional feedback

    hideContextMenu(); // Close the context menu
 }

 /**
  * Emits a socket event to change the status of a ticket to 'open'.
  * Triggered from the ticket context menu (moderator only). Includes client-side permission check.
  * Assumes `contextMenuData`, `currentUser`, `socket`, `showPopupMessage`,
  * `errorMessagePopup`, `hideContextMenu` are globally accessible.
  */
 function reopenTicket() {
    // Ensure necessary data and socket connection exist
    if (!contextMenuData.ticketId || !socket || !socket.connected) {
        showPopupMessage(errorMessagePopup, 'Cannot reopen ticket: Invalid state or not connected.', true);
        hideContextMenu();
        return;
    }

    // Client-side permission check for immediate feedback (server also enforces this)
    if (!currentUser?.is_moderator) {
        showPopupMessage(errorMessagePopup, 'You do not have permission to reopen tickets.', true);
        hideContextMenu();
        return;
    }

    // Log the action attempt
    console.log(`[reopenTicket] Attempting to reopen ticket: ${contextMenuData.ticketId}`);

    // Emit the status update event to the server
    socket.emit('update_ticket_status', {
        ticket_id: contextMenuData.ticketId,
        new_status: 'open'
    });

    // Provide immediate feedback (server will confirm via 'ticket_status_updated' event)
    // showPopupMessage(ticketMessagePopup, 'Reopen request sent...'); // Optional feedback

    hideContextMenu(); // Close the context menu
 }

 /**
  * Emits a socket event to permanently delete a ticket.
  * Triggered from the ticket context menu (moderator only). Includes confirmation dialog.
  * Assumes `contextMenuData`, `currentUser`, `socket`, `showPopupMessage`,
  * `errorMessagePopup`, `hideContextMenu` are globally accessible.
  */
 function deleteTicket() {
    // Ensure necessary data and socket connection exist
    if (!contextMenuData.ticketId || !socket || !socket.connected) {
        showPopupMessage(errorMessagePopup, 'Cannot delete ticket: Invalid state or not connected.', true);
        hideContextMenu();
        return;
    }

    // Client-side permission check
    if (!currentUser?.is_moderator) {
        showPopupMessage(errorMessagePopup, 'You do not have permission to delete tickets.', true);
        hideContextMenu();
        return;
    }

    // Confirmation dialog before proceeding
    const shortId = contextMenuData.ticketId.slice(-6); // Get short ID for message
    const confirmation = confirm(`Are you sure you want to permanently delete ticket #${shortId}? This action cannot be undone.`);

    if (confirmation) {
        // Log the action attempt
        console.log(`[deleteTicket] Attempting to delete ticket: ${contextMenuData.ticketId}`);

        // Emit the delete event to the server
        socket.emit('delete_ticket', {
            ticket_id: contextMenuData.ticketId
        });

        // Provide immediate feedback (server will confirm via 'ticket_list_updated' event)
        // showPopupMessage(ticketMessagePopup, 'Delete request sent...'); // Optional feedback
    } else {
        console.log("[deleteTicket] Deletion cancelled by user.");
    }

    hideContextMenu(); // Close the context menu regardless of confirmation outcome
 }
