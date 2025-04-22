// productsPublic.js
// Description: Handles fetching and displaying products on the public-facing
// product list page (#products) and the product detail page (#productDetail).

/**
 * Fetches the list of all products from the API and renders them onto the product grid.
 * Assumes `API_BASE_URL`, `productGrid`, `productLoadingStatus`, `errorMessagePopup`,
 * `showPopupMessage`, `renderProductCard` are globally accessible.
 */
async function fetchProducts() {
    // Ensure required DOM elements are available
    if (!productGrid || !productLoadingStatus) {
        console.error("fetchProducts: productGrid or productLoadingStatus element not found.");
        return;
    }

    // Clear previous products and show loading state
    productGrid.innerHTML = '';
    productLoadingStatus.textContent = 'Loading products...';
    productLoadingStatus.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) {
            // Throw an error if the API request fails
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        // Hide loading state once data is fetched
        productLoadingStatus.classList.add('hidden');

        if (!products || products.length === 0) {
            // Display a message if no products are available
            productGrid.innerHTML = `<p class="text-center text-gray-400 md:col-span-2 lg:col-span-3">No products available at this time.</p>`;
            return;
        }

        // Render each product card using the helper function
        products.forEach(renderProductCard); // Assumes renderProductCard is global

    } catch (error) {
        console.error("Error fetching products:", error);
        // Display error state in the loading status area
        productLoadingStatus.textContent = 'Failed to load products.';
        productLoadingStatus.classList.remove('hidden'); // Ensure error message is visible
        // Show a popup error message
        showPopupMessage(errorMessagePopup, `Error loading products: ${error.message}`, true);
    }
}

/**
 * Renders a single product card HTML element and appends it to the product grid.
 * Handles different border styles (gradient, custom hex) and hover effects.
 * Includes thumbnail display with fallback and error handling.
 * Adds click listeners for navigation and purchase actions.
 * Assumes `productGrid`, `handlePurchaseClick` are globally accessible.
 * @param {object} product - The product data object from the API.
 */
function renderProductCard(product) {
    // Ensure the grid container and product data exist
    if (!productGrid || !product) {
        console.warn("renderProductCard: productGrid element not found or product data missing.");
        return;
    }

    const card = document.createElement('div');
    // Base classes for the card layout and styling
    card.className = `product-card flex flex-col`;
    // Store product ID in a data attribute for easy access later (e.g., navigation)
    card.dataset.productId = product._id;

    // --- Border Styling Logic ---
    const tagColor = product.tagColor || 'gray'; // Default to gray if not specified
    const customHex = product.customBorderHex;
    let borderClasses = '';
    let inlineStyle = '';
    let hoverStyleVar = '';

    // Check for a valid custom hex color (#RRGGBB format)
    const isValidCustomHex = tagColor === 'custom' && customHex && /^#[0-9A-F]{6}$/i.test(customHex);

    if (isValidCustomHex) {
        // Apply custom border using inline styles and a CSS variable for hover
        borderClasses = 'custom-border'; // Class to apply border-width and style
        inlineStyle = `border-color: ${customHex};`; // Set the border color directly
        // Define a CSS variable for the custom hover shadow effect
        // Opacity values: 60% (99), 40% (66), 20% (33)
        hoverStyleVar = `--custom-hover-shadow: 0 0 8px 1px ${customHex}99, 0 0 16px 4px ${customHex}66, 0 0 32px 8px ${customHex}33;`;
        card.style.cssText = inlineStyle + hoverStyleVar; // Apply both styles
        card.classList.add(borderClasses);
    } else {
        // Use predefined gradient border classes
        // Fallback to gray if 'custom' is selected but hex is invalid/missing, or if tagColor is invalid
        const validPredefinedColor = ['orange', 'gray', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor) ? tagColor : 'gray';
        borderClasses = `card-gradient-border ${validPredefinedColor}-border`;
        card.classList.add(...borderClasses.split(' ')); // Add both classes
    }

    // --- Tag Styling Logic ---
    // Determine the color to use for the tag background/text
    const displayTagColor = isValidCustomHex ? 'custom' : (['orange', 'gray', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal'].includes(tagColor) ? tagColor : 'gray');

    let tagBgClass = '';
    let tagTextClass = '';
    let tagStyle = ''; // For inline styles (custom hex)

    if (displayTagColor === 'custom' && customHex) {
        // Calculate contrast and set inline style for custom hex tag
        try {
            const r = parseInt(customHex.slice(1, 3), 16) / 255;
            const g = parseInt(customHex.slice(3, 5), 16) / 255;
            const b = parseInt(customHex.slice(5, 7), 16) / 255;
            const lum = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            const luminance = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
            const textColor = luminance > 0.179 ? '#000000' : '#FFFFFF'; // Black text on light, white on dark
            tagStyle = `background-color: ${customHex}33; color: ${textColor};`; // Use 20% opacity (hex 33)
        } catch (e) {
            console.error("Error calculating tag color luminance:", e, customHex);
            tagStyle = `background-color: #80808033; color: #FFFFFF;`; // Fallback gray tag
        }
    } else {
        // Use Tailwind classes for predefined colors
        tagBgClass = `bg-${displayTagColor}-500/20`; // e.g., bg-orange-500/20
        tagTextClass = `text-${displayTagColor}-300`; // e.g., text-orange-300
    }

    // --- Thumbnail Element ---
    let thumbnailElement = null;
    const placeholderDiv = document.createElement('div');
    placeholderDiv.className = 'product-thumbnail-placeholder'; // Style defined in CSS
    placeholderDiv.style.display = 'none'; // Hide placeholder initially
    placeholderDiv.innerHTML = '<span>Image not found</span>';

    if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') {
        thumbnailElement = document.createElement('img');
        thumbnailElement.src = product.thumbnailUrl;
        thumbnailElement.alt = `${product.name || 'Product'} thumbnail`;
        thumbnailElement.className = 'product-thumbnail'; // Style defined in CSS
        // Add error handler: show placeholder if image fails to load
        thumbnailElement.onerror = () => {
            console.warn(`Failed to load thumbnail: ${product.thumbnailUrl}`);
            if (thumbnailElement) thumbnailElement.style.display = 'none'; // Hide broken image element
            placeholderDiv.style.display = 'flex'; // Show the placeholder div
            thumbnailElement.onerror = null; // Prevent infinite loop if placeholder also fails (unlikely)
        };
    } else {
        // No thumbnail URL provided, show placeholder immediately
        placeholderDiv.style.display = 'flex';
    }

    // --- Inner Card Content ---
    const innerDiv = document.createElement('div');
    innerDiv.className = 'product-card-inner'; // Applies padding, flex layout (defined in CSS)
    innerDiv.innerHTML = `
         <div class="flex justify-between items-center mb-4">
             <span class="${tagBgClass} ${tagTextClass} text-xs font-semibold px-2.5 py-0.5 rounded" style="${tagStyle}">
                 ${product.tag || 'PRODUCT'}
             </span>
             </div>
         <h3 class="text-xl font-semibold text-white mb-2">${product.name || 'Unnamed Product'}</h3>
         <p class="text-3xl font-bold text-white mb-4">$${product.price?.toFixed(2) || 'N/A'}</p>
         <ul class="text-sm text-gray-400 space-y-2 mb-6 flex-grow">
             ${(product.features && product.features.length > 0)
                 ? product.features.map(feature => `<li class="flex items-center"><svg class="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> ${feature}</li>`).join('')
                 : '<li class="text-gray-500">No features listed.</li>'
             }
         </ul>
         <div class="mt-auto space-y-3 pt-4 border-t border-slate-700/50">
             ${product.paymentLink
                 ? `<button class="purchase-button" data-product-id="${product._id}" data-payment-link="${product.paymentLink}">Pay with PayPal</button>`
                 : '<button class="purchase-button" disabled>Purchase Unavailable</button>'
             }
             </div>
     `;

    // --- Assemble Card ---
    if (thumbnailElement) {
        card.appendChild(thumbnailElement); // Add image if available
    }
    card.appendChild(placeholderDiv); // Add placeholder (initially hidden if image exists)
    card.appendChild(innerDiv); // Add main content

    // --- Event Listeners ---
    // Add click listener to the entire card for navigation
    card.addEventListener('click', (event) => {
        // Prevent navigation if the click was on the purchase button
        if (event.target.closest('.purchase-button')) {
            handlePurchaseClick(event); // Let the specific handler manage purchase clicks
            return;
        }
        // Navigate to the product detail page
        const productId = card.dataset.productId;
        if (productId) {
            window.location.hash = `/#productDetail?id=${productId}`;
        }
    });

    // Append the completed card to the product grid container
    productGrid.appendChild(card);
}


/**
 * Handles clicks on the "Pay with PayPal" or purchase button within a product card.
 * Prevents the card's navigation click listener from firing.
 * Initiates the purchase flow (placeholder implementation).
 * Assumes `showPopupMessage`, `paymentMessage`, `errorMessagePopup` are globally accessible.
 * @param {Event} event - The click event object.
 */
function handlePurchaseClick(event) {
    event.stopPropagation(); // IMPORTANT: Stop the click from bubbling up to the card's listener

    const button = event.target.closest('.purchase-button');
    if (!button || button.disabled) return; // Ignore if button not found or disabled

    const productId = button.dataset.productId;
    const paymentLink = button.dataset.paymentLink; // Could be a PayPal button ID or a direct link

    console.log(`Purchase clicked for product ID: ${productId}, Link/ID: ${paymentLink}`);

    if (paymentLink) {
         // --- Placeholder for actual payment integration ---
         // Option 1: If paymentLink is a direct URL
         // window.location.href = paymentLink;

         // Option 2: If paymentLink is an ID for PayPal SDK or similar
         // initializePayPal(paymentLink, productId); // Example function call

         // Show feedback message
         showPopupMessage(paymentMessage, `Initiating purchase for product ${productId}... (Integration needed)`);
         // --- End Placeholder ---
    } else {
         // This case should ideally be prevented by disabling the button server-side
         console.error(`Purchase button clicked for product ${productId}, but paymentLink is missing.`);
         showPopupMessage(errorMessagePopup, 'Payment link is missing for this product.', true);
    }
}

/**
 * Fetches details for a specific product ID from the API and renders the detail page.
 * Manages loading and error states for the product detail section.
 * Assumes `API_BASE_URL`, `productDetailPage`, `productDetailLoading`,
 * `productDetailContainer`, `renderProductDetails`, `showPopupMessage`,
 * `errorMessagePopup` are globally accessible.
 * @param {string} productId - The ID of the product to fetch.
 */
async function fetchProductDetails(productId) {
    // Ensure required DOM elements for the detail page exist
    if (!productDetailPage || !productDetailLoading || !productDetailContainer) {
        console.error("fetchProductDetails: One or more product detail page elements not found.");
        return;
    }

    // Show loading state and hide the main content container
    productDetailLoading.textContent = 'Loading product details...'; // Reset loading text
    productDetailLoading.classList.remove('hidden');
    productDetailContainer.classList.add('hidden');
    // Ensure the parent page section is visible (handled by showSection, but good practice)
    productDetailPage.classList.remove('hidden');
    productDetailPage.classList.add('active');


    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Product not found.");
            }
            // Handle other HTTP errors
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productData = await response.json();

        // Render the fetched product data onto the page
        renderProductDetails(productData); // Assumes renderProductDetails is global

        // Hide loading indicator and show the content container
        productDetailLoading.classList.add('hidden');
        productDetailContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Error fetching product details:", error);
        // Display error message in the loading area
        productDetailLoading.textContent = `Error loading product: ${error.message}`;
        productDetailLoading.classList.remove('hidden'); // Ensure error is visible
        // Show a popup error message
        showPopupMessage(errorMessagePopup, `Error loading product: ${error.message}`, true);
        // Optionally redirect if product not found
        // if (error.message === "Product not found.") {
        //     window.location.hash = '/#products';
        // }
    }
}

/**
 * Renders the fetched product details onto the product detail page elements.
 * Populates image, name, price, rating, stock, description, seller info, and reviews.
 * Assumes DOM elements for the detail page (`productDetailImage`, etc.) and
 * `formatTimeAgo` are globally accessible.
 * @param {object} product - The detailed product data object from the API.
 */
function renderProductDetails(product) {
    // Ensure product data is provided
    if (!product) {
        console.error("renderProductDetails: No product data provided.");
        // Optionally display an error message on the page
        if (productDetailLoading) {
            productDetailLoading.textContent = 'Failed to render product details: No data.';
            productDetailLoading.classList.remove('hidden');
        }
        if (productDetailContainer) productDetailContainer.classList.add('hidden');
        return;
    }

    // --- Populate Basic Product Info ---
    // Image with fallback and error handling
    if (productDetailImage) {
        productDetailImage.src = product.thumbnailUrl || 'https://placehold.co/600x400/374151/9ca3af?text=No+Image';
        productDetailImage.alt = `${product.name || 'Product'} Image`;
        productDetailImage.onerror = () => {
            productDetailImage.src = 'https://placehold.co/600x400/374151/9ca3af?text=Image+Error';
            productDetailImage.onerror = null; // Prevent infinite loops
        };
    }
    if (productDetailName) productDetailName.textContent = product.name || 'Product Name Unavailable';
    if (productDetailPrice) productDetailPrice.textContent = product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable';

    // --- Rating and Stock ---
    // Ensure rating is between 0 and 5, default to 5 if missing
    const rating = Math.max(0, Math.min(5, product.averageRating ?? 5));
    // Ensure stock is a non-negative number, default to a reasonable number (e.g., 6) if missing/null
    const stock = (product.stock !== undefined && product.stock !== null && product.stock >= 0) ? product.stock : 6;

    if (productDetailRating) {
        // Display stars based on the rounded rating
        productDetailRating.innerHTML = `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}`;
    }
    if (productDetailStock) {
        productDetailStock.textContent = stock > 0 ? `${stock} in stock` : 'Out of stock';
    }

    // --- Description ---
    if (productDetailDescriptionContainer && productDetailDescription) {
        if (product.description) {
           productDetailDescription.textContent = product.description;
           productDetailDescriptionContainer.classList.remove('hidden'); // Show container
        } else {
           productDetailDescription.textContent = 'No description provided.';
           // Optionally hide the container if description is empty
           // productDetailDescriptionContainer.classList.add('hidden');
           productDetailDescriptionContainer.classList.remove('hidden'); // Or ensure it's shown with the placeholder text
        }
    }

    // --- Seller Info ---
    if (sellerName) sellerName.textContent = product.sellerName || 'ShilletteFN'; // Default seller name
    if (sellerEstablished) {
        // Use formatTimeAgo (assumed global) for the established date
        sellerEstablished.textContent = product.sellerEstablishedDate
            ? `Established ${formatTimeAgo(product.sellerEstablishedDate)}`
            : 'Established recently'; // Default text
    }
    if (sellerReviewScore) {
        // Display the average rating with one decimal place
        sellerReviewScore.textContent = `The seller has an average review score of ${rating.toFixed(1)} stars out of 5`;
    }
    // Seller Avatar (Optional - Placeholder shown)
    // if (sellerAvatar && product.sellerAvatarUrl) sellerAvatar.src = product.sellerAvatarUrl;

    // --- Reviews List ---
    if (productReviewsList) {
        productReviewsList.innerHTML = ''; // Clear previous reviews
        const reviews = product.reviews || []; // Use empty array if no reviews

        if (reviews.length > 0) {
            reviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'review-card'; // Style defined in CSS
                // Ensure review rating is valid (0-5), default to 5
                const reviewRating = Math.max(0, Math.min(5, review.rating ?? 5));
                const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'recently';
                const reviewerName = review.reviewerName || 'Verified customer'; // Default reviewer name
                const reviewText = review.text || 'No comment left.'; // Default comment

                reviewCard.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs text-green-400 font-medium">Verified purchase</span>
                        <span class="star-rating text-sm">${'★'.repeat(reviewRating)}${'☆'.repeat(5 - reviewRating)}</span>
                    </div>
                    <p class="text-sm text-gray-300 mb-1">${reviewText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p> <p class="text-xs text-gray-500">Reviewed by ${reviewerName.replace(/</g, "&lt;").replace(/>/g, "&gt;")} on ${reviewDate}</p>
                `;
                productReviewsList.appendChild(reviewCard);
            });
        } else {
            // Display message if no reviews are found
            productReviewsList.innerHTML = '<p class="text-gray-400 md:col-span-2 lg:col-span-3">No reviews yet.</p>';
        }
    }

    // --- Action Buttons (Add listeners if needed) ---
    // Example: Wire up quantity buttons
    let currentQuantity = 1;
    if (quantityInput) quantityInput.value = currentQuantity;

    if (quantityIncrease) {
        quantityIncrease.onclick = () => {
            // Consider stock limit
            if (currentQuantity < stock) {
                currentQuantity++;
                if (quantityInput) quantityInput.value = currentQuantity;
            }
        };
    }
    if (quantityDecrease) {
        quantityDecrease.onclick = () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                if (quantityInput) quantityInput.value = currentQuantity;
            }
        };
    }
    // Example: Wire up Buy Now / Add Basket
    if (productDetailBuyNow) {
        productDetailBuyNow.onclick = () => {
            console.log(`Buy Now clicked for product ${product._id}, quantity ${currentQuantity}`);
            // Add purchase logic here, potentially using paymentLink and quantity
            handlePurchaseClick({ // Simulate event for consistency if needed
                target: productDetailBuyNow,
                stopPropagation: () => {}
            });
        };
        productDetailBuyNow.disabled = stock <= 0; // Disable if out of stock
    }
    if (productDetailAddBasket) {
        productDetailAddBasket.onclick = () => {
            console.log(`Add to Basket clicked for product ${product._id}, quantity ${currentQuantity}`);
            // Add basket logic here
            showPopupMessage(paymentMessage, `${currentQuantity} x ${product.name} added to basket (feature placeholder).`);
        };
        productDetailAddBasket.disabled = stock <= 0; // Disable if out of stock
    }
}
