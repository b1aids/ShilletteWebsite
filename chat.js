// chat.js
// Description: Manages chat functionality within the ticket detail view,
// including appending messages, handling input submission, and chat context menus.

/**
 * Appends a chat message element to the chat messages container.
 * Formats the timestamp, sanitizes content, makes username clickable,
 * and adds a context menu listener for moderators.
 * Assumes `chatMessagesDiv`, `currentUser`, `showUserInfoModal`,
 * `showChatContextMenu` are globally accessible.
 * @param {object} data - The message data object from the server or initial fetch.
 * Expected properties: timestamp, sender_id, sender_username/username, text, ticket_id.
 */
function appendChatMessage(data) {
    // Ensure the chat container element exists
    if (!chatMessagesDiv) {
        console.error("appendChatMessage: chatMessagesDiv element not found.");
        return;
    }

    // Remove any placeholder messages (like "Loading..." or "No messages...")
    const placeholderMsg = chatMessagesDiv.querySelector('p.text-gray-500, p.text-red-400');
    if (placeholderMsg) {
        placeholderMsg.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message'); // Style defined in CSS
    // Store data attributes needed for context menu actions
    messageElement.dataset.timestamp = data.timestamp;
    messageElement.dataset.senderId = data.sender_id;

    // Format timestamp (e.g., "10:30 AM")
    const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    // Determine username, default to 'System' if none provided
    const username = data.sender_username || data.username || 'System';
    // Basic sanitization to prevent HTML injection
    const safeUsername = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeText = (data.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Create username span (clickable to show user info)
    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('username'); // Style defined in CSS
    usernameSpan.textContent = `${safeUsername}:`;
    // Add click listener only if sender_id is present
    if (data.sender_id) {
        usernameSpan.addEventListener('click', () => showUserInfoModal(data.sender_id, safeUsername)); // Assumes global
        usernameSpan.style.cursor = 'pointer'; // Indicate clickability
    } else {
        usernameSpan.style.cursor = 'default'; // Not clickable if no ID
    }

    messageElement.appendChild(usernameSpan); // Add username span to the message div
    // Add the message text (append as text node for safety, though already sanitized)
    messageElement.appendChild(document.createTextNode(` ${safeText} `));

    // Create and add timestamp span
    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp'); // Style defined in CSS
    timestampSpan.textContent = timestamp;
    messageElement.appendChild(timestampSpan);

    // Add context menu listener (right-click) only for moderators
    // Assumes currentUser is global
    if (currentUser && currentUser.is_moderator) {
       messageElement.addEventListener('contextmenu', showChatContextMenu); // Assumes global
    }

    // Append the fully constructed message element to the chat container
    chatMessagesDiv.appendChild(messageElement);

    // Scroll the chat container to the bottom to show the latest message
    // Use requestAnimationFrame for smoother scrolling after DOM update
    requestAnimationFrame(() => {
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    });
}

/**
 * Handles the submission of the chat input form.
 * Sends the message via Socket.IO if conditions are met (text exists, socket connected, ticket active).
 * Provides user feedback via popups if sending fails.
 * Assumes `chatInputForm`, `chatInput`, `socket`, `currentTicketId`,
 * `showPopupMessage`, `errorMessagePopup` are globally accessible.
 * @param {Event} event - The form submission event.
 */
function handleChatSubmit(event) {
    event.preventDefault(); // Prevent default form submission (page reload)

    // Ensure required elements and state exist
    if (!chatInput) {
        console.error("handleChatSubmit: chatInput element not found.");
        return;
    }
    const messageText = chatInput.value.trim();

    // --- Validation and Sending Logic ---
    if (messageText && socket && socket.connected && currentTicketId) {
        // All conditions met: send the message
        console.log(`[handleChatSubmit] Sending message to ticket ${currentTicketId}: ${messageText}`);
        socket.emit('send_message', {
            ticket_id: currentTicketId,
            text: messageText
        });
        chatInput.value = ''; // Clear the input field after sending
        chatInput.focus(); // Keep focus on the input field
    } else {
        // Handle failure cases with user feedback
        if (!messageText) {
            // Optionally provide feedback if trying to send empty message
            console.warn("[handleChatSubmit] Attempted to send empty message.");
        } else if (!socket || !socket.connected) {
            showPopupMessage(errorMessagePopup, 'Not connected to chat service.', true); // Assumes global
        } else if (!currentTicketId) {
            showPopupMessage(errorMessagePopup, 'No active ticket selected to send message to.', true); // Assumes global
        }
    }
}

/**
 * Shows the context menu for chat messages (Delete Message, User Info).
 * Only active for moderators. Stores relevant message data in `contextMenuData`.
 * Assumes `currentUser`, `chatContextMenu`, `contextMenuData`, `currentTicketId`,
 * `hideContextMenu`, `positionContextMenu`, `hideContextMenuOnClickOutside` are globally accessible.
 * @param {MouseEvent} event - The contextmenu event object.
 */
function showChatContextMenu(event) {
    event.preventDefault(); // Prevent default browser menu
    hideContextMenu(); // Hide any other menus first

    // Only show for moderators and if the menu element exists
    if (!currentUser?.is_moderator || !chatContextMenu) {
        return;
    }

    const messageElement = event.target.closest('.chat-message');
    // Ensure the right-click happened on a valid message element
    if (!messageElement || !messageElement.dataset.timestamp || !messageElement.dataset.senderId) {
        console.warn("[showChatContextMenu] Could not find valid message element or data attributes.");
        return;
    }

    // Store relevant data from the message element into the global context object
    contextMenuData.ticketId = currentTicketId; // Assumes currentTicketId is global
    contextMenuData.messageTimestamp = messageElement.dataset.timestamp;
    contextMenuData.senderId = messageElement.dataset.senderId;
    // Clear other potentially conflicting context data
    contextMenuData.ticketStatus = null;
    contextMenuData.productId = null; contextMenuData.productName = null; contextMenuData.orderId = null; contextMenuData.deviceType = null;

    console.log("[showChatContextMenu] Data:", contextMenuData);

    // --- Toggle Menu Items (Optional - currently both are always shown for mods) ---
    // Example: If delete was conditional
    // const deleteBtn = document.getElementById('context-delete-message');
    // if (deleteBtn) deleteBtn.classList.toggle('hidden', !canDeleteThisMessage(contextMenuData));

    // Position and display the chat context menu
    positionContextMenu(chatContextMenu, event); // Assumes global
    currentContextMenu = chatContextMenu; // Set as the active menu

    // Add listeners to close the menu on the next click outside or scroll
    setTimeout(() => {
         document.addEventListener('click', hideContextMenuOnClickOutside); // Assumes global
         window.addEventListener('scroll', hideContextMenu, { once: true }); // Assumes global
    }, 0);
}

// Note: The actual actions triggered by the chat context menu items (like deleting
// a message or showing user info) are handled by functions in other files
// (e.g., ticketActions.js for delete, uiUtils.js for user info modal) which are
// attached as event listeners in scripts.js.
