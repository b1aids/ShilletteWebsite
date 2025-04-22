// auth.js
// Description: Handles user authentication, login status checks, logout,
// and updating the header UI based on authentication state.

/**
 * Checks the user's login status via the API.
 * Updates the global `currentUser` object.
 * Calls `ensureSocketConnected` if logged in.
 * Triggers `loadSiteConfigAndNavigate` upon completion.
 * Assumes `API_BASE_URL`, `currentUser`, `isInitialLoginCheckComplete`,
 * `errorMessagePopup`, `ensureSocketConnected`, `loadSiteConfigAndNavigate`
 * are globally accessible.
 */
async function checkLoginStatus() {
    // Mark initial check as incomplete until fetch completes
    isInitialLoginCheckComplete = false;
    try {
        const response = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Not logged in or forbidden access
                currentUser = { logged_in: false };
                console.log("[checkLoginStatus] User not logged in or forbidden.");
            } else {
                // Other server error during user check
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } else {
            // Logged in successfully, store user data
            currentUser = await response.json();
            console.log("[checkLoginStatus] User logged in:", currentUser);
            // Ensure socket is connected for logged-in users
            ensureSocketConnected();
        }
    } catch (error) {
        console.error("[checkLoginStatus] Error checking login status:", error);
        currentUser = { logged_in: false }; // Assume logged out on any error
        // Use showPopupMessage from uiUtils.js (assuming it's loaded first)
        showPopupMessage(errorMessagePopup, "Could not verify login status.", true);
    } finally {
        // Mark the initial login check as complete
        isInitialLoginCheckComplete = true;
        console.log("[checkLoginStatus] Initial login check complete.");
        // Proceed to load site config and navigate now that login status is known
        // Assumes loadSiteConfigAndNavigate is defined globally (in siteConfig.js or scripts.js)
        loadSiteConfigAndNavigate();
    }
}

/**
 * Updates the header UI elements based on the current login status.
 * Shows/hides login button vs user info/logout button.
 * Updates user avatar and name display.
 * Toggles visibility of admin sections based on moderator status.
 * Assumes `currentUser` and DOM element references (loginButton, userInfo, etc.)
 * are globally accessible.
 */
function updateHeaderUI() {
    // Assumes DOM refs like loginButton, userInfo, userNameDisplay, etc. are global
    if (!loginButton || !userInfo || !userNameDisplay || !userAvatarDisplay ||
        !dashboardUserNameDisplay || !dashboardUserAvatarDisplay || !adminDashboardSections) {
        console.error("updateHeaderUI: One or more required header elements not found.");
        return;
    }

    const isLoggedIn = currentUser && currentUser.logged_in;

    // Toggle visibility of login button vs user info section
    loginButton.classList.toggle('hidden', isLoggedIn);
    userInfo.classList.toggle('hidden', !isLoggedIn);
    userInfo.classList.toggle('flex', isLoggedIn); // Use flex to display user info correctly

    if (isLoggedIn) {
        // Update user display name
        userNameDisplay.textContent = currentUser.username || 'User';
        // Update user avatar (using Discord CDN format)
        const avatarUrl = currentUser.user_id && currentUser.avatar
            ? `https://cdn.discordapp.com/avatars/${currentUser.user_id}/${currentUser.avatar}.png?size=32`
            : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?'; // Placeholder
        userAvatarDisplay.src = avatarUrl;
        userAvatarDisplay.onerror = () => { userAvatarDisplay.src = 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?'; userAvatarDisplay.onerror=null; }; // Fallback on error

        // Update dashboard profile elements
        dashboardUserNameDisplay.textContent = currentUser.username || 'User';
        const dashboardAvatarUrl = currentUser.user_id && currentUser.avatar
            ? `https://cdn.discordapp.com/avatars/${currentUser.user_id}/${currentUser.avatar}.png?size=64`
            : 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?'; // Larger placeholder
        dashboardUserAvatarDisplay.src = dashboardAvatarUrl;
        dashboardUserAvatarDisplay.onerror = () => { dashboardUserAvatarDisplay.src = 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?'; dashboardUserAvatarDisplay.onerror=null; }; // Fallback on error

        // Toggle admin sections based on moderator status
        const isMod = currentUser.is_moderator === true;
        adminDashboardSections.classList.toggle('hidden', !isMod);
        console.log(`[updateHeaderUI] Admin sections visibility set based on moderator status: ${isMod}`);

    } else {
        // Reset dashboard profile elements if not logged in
        dashboardUserNameDisplay.textContent = 'User';
        dashboardUserAvatarDisplay.src = 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?';
        adminDashboardSections.classList.add('hidden'); // Ensure admin sections are hidden
    }
}

/**
 * Handles the user logout process.
 * Attempts to call the backend logout endpoint.
 * Performs client-side cleanup regardless of backend response:
 * - Clears `currentUser` state.
 * - Resets initialization flags.
 * - Disconnects the WebSocket.
 * - Updates the UI.
 * - Redirects to the home page.
 * Assumes `API_BASE_URL`, `currentUser`, `isInitialLoginCheckComplete`,
 * `isInitialConfigLoadComplete`, `disconnectSocket`, `updateHeaderUI`,
 * `adminDashboardSections` are globally accessible.
 */
async function handleLogout() {
    console.log('[handleLogout] Initiating logout...');
    try {
        // Attempt to hit the backend logout endpoint (best effort)
        const response = await fetch(`${API_BASE_URL}/logout`, { credentials: 'include' });
        if (!response.ok) {
            let errorMsg = `Logout request failed with status ${response.status}`;
            try {
                // Try to get a more specific error message from the response body
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (parseError) {
                // Ignore if response body is not valid JSON
            }
            console.warn(`[handleLogout] Backend logout failed: ${errorMsg}. Proceeding with client-side cleanup.`);
        } else {
            console.log("[handleLogout] Backend logout successful.");
        }
    } catch (error) {
        // Catch network errors during the fetch
        console.error("[handleLogout] Network error during logout fetch:", error);
    } finally {
        // --- Client-side cleanup (always perform this) ---
        console.log("[handleLogout] Performing client-side cleanup.");
        currentUser = { logged_in: false }; // Clear global user state
        isInitialLoginCheckComplete = false; // Reset flags to force re-check on next load/nav
        isInitialConfigLoadComplete = false;
        // localStorage.removeItem('currentPage'); // Example: Clear any stored page state if used

        // Disconnect WebSocket (assumes disconnectSocket is global)
        disconnectSocket();

        // Update header UI to show login button etc.
        updateHeaderUI();

        // Ensure admin sections are hidden
        if (adminDashboardSections) {
            adminDashboardSections.classList.add('hidden');
        }

        // Navigate to home page after cleanup
        console.log("[handleLogout] Redirecting to /#home after cleanup.");
        window.location.hash = '/#home';
        // The 'hashchange' event listener will call runNavigation() -> navigateTo()
    }
}
