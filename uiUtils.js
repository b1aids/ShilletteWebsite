// uiUtils.js
// Description: Contains utility functions for UI manipulation like popups,
// date formatting, context menus, modals, and role display.

/**
 * Shows a temporary popup message at the bottom center of the screen.
 * Assumes popup elements exist in the DOM (defined in scripts.js or HTML).
 * @param {HTMLElement} element - The message container element.
 * @param {string} message - The message text to display.
 * @param {boolean} [isError=false] - If true, styles the message as an error (red).
 * @param {number} [duration=3500] - How long the message stays visible (in milliseconds).
 */
function showPopupMessage(element, message, isError = false, duration = 3500) {
    if (!element) {
        console.error("showPopupMessage: Provided element is null or undefined.");
        return;
    }
    element.textContent = message;
    // Ensure correct class toggling based on error status
    element.classList.remove('bg-red-600', 'bg-green-600'); // Clear previous color classes
    if (isError) {
        element.classList.add('bg-red-600');
    } else {
        element.classList.add('bg-green-600');
    }
    element.classList.add('show');
    // Use a timeout to remove the 'show' class after the specified duration
    setTimeout(() => element.classList.remove('show'), duration);
}

/**
 * Formats a date string into a relative time ago string (e.g., "3 months ago").
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted relative time string.
 */
function formatTimeAgo(dateString) {
    try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date string");
        }
        const now = new Date();
        const diffTime = now - date; // Difference in milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        const diffYears = Math.floor(diffMonths / 12);

        if (diffTime < 0) return 'in the future'; // Handle future dates if necessary
        if (diffDays < 1) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffMonths === 1) return '1 month ago';
        if (diffMonths < 12) return `${diffMonths} months ago`;
        return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;

    } catch (e) {
        console.error("Error formatting time ago:", e, "Input:", dateString);
        // Fallback if date string is invalid or another error occurs
        return 'a while ago';
    }
}

/**
 * Positions a context menu element near the mouse event coordinates.
 * Adjusts position to keep the menu within the viewport.
 * Assumes `currentContextMenu` is a global variable managed in scripts.js.
 * @param {HTMLElement} menuElement - The context menu element.
 * @param {MouseEvent} event - The contextmenu event object.
 */
function positionContextMenu(menuElement, event) {
    if (!menuElement || !event) return;

    // Make the menu temporarily visible but off-screen to measure its dimensions
    menuElement.style.visibility = 'hidden';
    menuElement.style.display = 'block';
    const menuHeight = menuElement.offsetHeight;
    const menuWidth = menuElement.offsetWidth;
    menuElement.style.display = 'none'; // Hide again immediately
    menuElement.style.visibility = 'visible';

    // Initial position below and to the right of the cursor
    let top = event.clientY + window.scrollY + 5;
    let left = event.clientX + window.scrollX + 5;

    // Get window dimensions
    const windowHeight = window.innerHeight; // Viewport height
    const windowWidth = window.innerWidth;   // Viewport width
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Adjust position if menu goes off-screen vertically
    if (event.clientY + menuHeight + 5 > windowHeight) { // Off bottom of viewport
        top = event.clientY + scrollY - menuHeight - 5; // Move above cursor
    }
    // Adjust position if menu goes off-screen horizontally
    if (event.clientX + menuWidth + 5 > windowWidth) { // Off right of viewport
        left = event.clientX + scrollX - menuWidth - 5; // Move left of cursor
    }

    // Ensure menu doesn't go off the top or left edge of the document
    if (top < scrollY) top = scrollY;
    if (left < scrollX) left = scrollX;

    // Apply calculated position and make visible
    menuElement.style.top = `${top}px`;
    menuElement.style.left = `${left}px`;
    menuElement.style.display = 'block';
}

/**
 * Hides any active context menu.
 * Assumes context menu elements and `currentContextMenu` are globally accessible.
 */
function hideContextMenu() {
    // Use the globally defined context menu elements from scripts.js
    if (chatContextMenu) chatContextMenu.style.display = 'none';
    if (ticketContextMenu) ticketContextMenu.style.display = 'none';
    if (adminProductContextMenu) adminProductContextMenu.style.display = 'none';
    if (myProductContextMenu) myProductContextMenu.style.display = 'none';

    // Remove global listeners used to close the menu
    document.removeEventListener('click', hideContextMenuOnClickOutside);
    window.removeEventListener('scroll', hideContextMenu);
    currentContextMenu = null; // Reset the global reference
}

/**
 * Event listener callback to close the context menu if a click occurs outside of it.
 * Assumes `currentContextMenu` is a global variable.
 * @param {MouseEvent} event - The click event object.
 */
function hideContextMenuOnClickOutside(event) {
    if (currentContextMenu && !currentContextMenu.contains(event.target)) {
        hideContextMenu();
    }
}

/**
 * Displays user roles in a specified container element.
 * Calculates text color based on role background color for contrast.
 * @param {Array<object>} roles - An array of role objects (expecting {id, name, color}).
 * @param {HTMLElement} container - The container element to append roles to.
 */
function displayUserRolesInContainer(roles, container) {
    if (!container) {
        console.error('[displayUserRolesInContainer] Container element not provided!');
        return;
    }
    container.innerHTML = ''; // Clear previous roles

    if (roles && Array.isArray(roles) && roles.length > 0) {
        roles.forEach(role => {
            const roleElement = document.createElement('span');
            roleElement.classList.add('role-span'); // Base styling class

            // Determine color and text contrast
            let hexColor = '#9CA3AF'; // Default gray (Tailwind gray-400)
            if (role.color && role.color !== 0) {
                // Convert Discord decimal color to hex
                hexColor = '#' + role.color.toString(16).padStart(6, '0');
            }

            // Calculate luminance to decide text color (black or white)
            // Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
            try {
                const r = parseInt(hexColor.slice(1, 3), 16) / 255;
                const g = parseInt(hexColor.slice(3, 5), 16) / 255;
                const b = parseInt(hexColor.slice(5, 7), 16) / 255;
                const lum = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                const luminance = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
                const textColorClass = luminance > 0.179 ? 'text-black' : 'text-white'; // Threshold for contrast ratio of ~4.5:1 against black/white

                roleElement.textContent = role.name || `Role ${role.id}`; // Display role name or ID
                roleElement.style.backgroundColor = hexColor; // Set background color
                roleElement.classList.add(textColorClass); // Add text color class
            } catch (e) {
                console.error("Error calculating role color luminance:", e, role);
                roleElement.textContent = role.name || `Role ${role.id}`;
                roleElement.style.backgroundColor = '#9CA3AF'; // Fallback color
                roleElement.classList.add('text-white'); // Fallback text color
            }

            container.appendChild(roleElement); // Append to container
        });
    } else {
        // Display message if no roles found
        container.innerHTML = '<p class="text-gray-500 text-xs w-full">No roles found.</p>';
    }
}

/**
 * Shows the user info modal with details for a given user ID.
 * Assumes modal elements and `currentUser` are globally accessible.
 * @param {string} senderId - The Discord User ID.
 * @param {string} username - The Discord Username.
 */
function showUserInfoModal(senderId, username) {
     // Assumes userInfoModal, modalUsername, modalUserId, modalUserRoles are global refs
     if (!userInfoModal || !senderId) return;
     // Populate basic info
     modalUsername.textContent = username || 'Unknown User';
     modalUserId.textContent = senderId;
     modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Loading roles...</p>'; // Show loading state for roles

     // If the modal is for the currently logged-in user, display their roles directly
     // Assumes currentUser is a global variable
     if (currentUser && currentUser.user_id === senderId && currentUser.roles) {
         displayUserRolesInContainer(currentUser.roles, modalUserRoles);
     } else {
         // Fetch roles for other users via API if needed/allowed
         // Example placeholder:
         // fetch(`/api/user/${senderId}/roles`).then(...).then(roles => displayUserRolesInContainer(roles, modalUserRoles));
         modalUserRoles.innerHTML = '<p class="text-gray-500 text-xs">Role information unavailable for this user.</p>';
     }
     // Show the modal
     userInfoModal.classList.add('active');
}

/**
 * Hides the user info modal.
 * Assumes `userInfoModal` is a global reference.
 */
function hideUserInfoModal() {
    // Assumes userInfoModal is a global ref
    if (userInfoModal) userInfoModal.classList.remove('active');
}

/**
 * Shows or hides the custom hex color input based on the tag color dropdown selection.
 * Assumes `customHexInputContainer` and `productEditTagColorSelect` are global references.
 */
function toggleCustomHexInput() {
    // Assumes customHexInputContainer and productEditTagColorSelect are global refs
    if (customHexInputContainer && productEditTagColorSelect) {
         const selectedColor = productEditTagColorSelect.value;
         customHexInputContainer.classList.toggle('hidden', selectedColor !== 'custom'); // Hide if not 'custom'
    }
}
