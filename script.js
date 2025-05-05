 // Global variables
 let products = [];
 let filteredProducts = [];
 let categories = [];
 let currentPage = 1;
 let itemsPerPage = 8;
 let cart = JSON.parse(localStorage.getItem('cart')) || [];
 let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
 
 // DOM Elements
 const productGrid = document.getElementById('product-grid');
 const pagination = document.getElementById('pagination');
 const categoryList = document.getElementById('category-list');
 const filterCategory = document.getElementById('filter-category');
 const sortBy = document.getElementById('sort-by');
 const priceRange = document.getElementById('price-range');
 const searchInput = document.getElementById('search-input');
 const cartIcon = document.getElementById('cart-icon');
 const cartSidebar = document.getElementById('cart-sidebar');
 const cartClose = document.getElementById('cart-close');
 const cartItems = document.getElementById('cart-items');
 const emptyCart = document.getElementById('empty-cart');
 const cartTotal = document.getElementById('cart-total');
 const cartCount = document.querySelector('.cart-count');
 const wishlistCount = document.querySelector('.wishlist-count');
 const overlay = document.getElementById('overlay');
 const productModal = document.getElementById('product-modal');
 const modalClose = document.getElementById('modal-close');
 const productDetail = document.getElementById('product-detail');
 const checkoutBtn = document.getElementById('checkout-btn');
 const wishlistIcon = document.getElementById('wishlist-icon');
 const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
 
 // Fetch products from API
 async function fetchProducts() {
     try {
         const response = await fetch('https://fakestoreapi.com/products');
         products = await response.json();
         
         // Extract unique categories
         categories = [...new Set(products.map(product => product.category))];
         
         // Initialize filtered products
         filteredProducts = [...products];
         
         // Populate categories
         populateCategories();
         
         // Display products
         displayProducts();
         
         // Update cart and wishlist UI
         updateCartUI();
         updateWishlistUI();
         
     } catch (error) {
         console.error('Error fetching products:', error);
         productGrid.innerHTML = '<div class="error">Failed to load products. Please try again later.</div>';
     }
 }
 
 // Populate category filters
 function populateCategories() {
     categoryList.innerHTML = '<li><a href="#" class="active" data-category="all">All Products</a></li>';
     
     categories.forEach(category => {
         const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
         
         const li = document.createElement('li');
         li.innerHTML = `<a href="#" data-category="${category}">${formattedCategory}</a>`;
         categoryList.appendChild(li);
         
         const option = document.createElement('option');
         option.value = category;
         option.textContent = formattedCategory;
         filterCategory.appendChild(option);
     });
     
     const categoryLinks = document.querySelectorAll('.category-list a');
     categoryLinks.forEach(link => {
         link.addEventListener('click', function(e) {
             e.preventDefault();
             categoryLinks.forEach(link => link.classList.remove('active'));
             this.classList.add('active');
             const category = this.getAttribute('data-category');
             filterCategory.value = category === 'all' ? 'all' : category;
             applyFilters();
         });
     });
 }
 
 // Display products
 function displayProducts() {
     const startIndex = (currentPage - 1) * itemsPerPage;
     const endIndex = startIndex + itemsPerPage;
     const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
     
     productGrid.innerHTML = '';
     
     if (paginatedProducts.length === 0) {
         productGrid.innerHTML = '<div class="no-items"><i class="fas fa-search"></i><p>No products found.</p><button class="btn btn-primary" id="clear-filters">Clear Filters</button></div>';
         const clearFiltersBtn = document.getElementById('clear-filters');
         clearFiltersBtn.addEventListener('click', function() {
             searchInput.value = '';
             sortBy.value = 'default';
             filterCategory.value = 'all';
             priceRange.value = 'all';
             const categoryLinks = document.querySelectorAll('.category-list a');
             categoryLinks.forEach(link => link.classList.remove('active'));
             document.querySelector('.category-list a[data-category="all"]').classList.add('active');
             applyFilters();
         });
         return;
     }
     
     paginatedProducts.forEach(product => {
         const card = document.createElement('div');
         card.className = 'product-card';
         
         const formattedPrice = `$${product.price.toFixed(2)}`;
         const isWishlisted = wishlist.some(item => item.id === product.id);
         
         card.innerHTML = `
             <div class="product-image">
                 <img src="${product.image}" alt="${product.title}">
             </div>
             <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}">
                 <i class="fas fa-heart"></i>
             </button>
             <div class="product-info">
                 <div class="product-category">${product.category}</div>
                 <h3 class="product-title">${product.title}</h3>
                 <div class="product-price">${formattedPrice}</div>
                 <div class="product-actions">
                     <button class="add-to-cart" data-id="${product.id}">
                         <i class="fas fa-shopping-cart"></i>
                         Add to Cart
                     </button>
                     <button class="quick-view" data-id="${product.id}">
                         <i class="fas fa-eye"></i>
                     </button>
                 </div>
             </div>
         `;
         
         productGrid.appendChild(card);
     });
     
     addProductEventListeners();
     createPagination();
 }
 
 // Create pagination
 function createPagination() {
     const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
     pagination.innerHTML = '';
     
     if (totalPages <= 1) return;
     
     const prevBtn = document.createElement('button');
     prevBtn.className = 'pagination-btn';
     prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
     prevBtn.disabled = currentPage === 1;
     prevBtn.addEventListener('click', function() {
         if (currentPage > 1) {
             currentPage--;
             displayProducts();
             window.scrollTo({ top: 0, behavior: 'smooth' });
         }
     });
     pagination.appendChild(prevBtn);
     
     let startPage = Math.max(1, currentPage - 2);
     let endPage = Math.min(totalPages, startPage + 4);
     if (endPage - startPage < 4) {
         startPage = Math.max(1, endPage - 4);
     }
     
     for (let i = startPage; i <= endPage; i++) {
         const pageBtn = document.createElement('button');
         pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
         pageBtn.textContent = i;
         pageBtn.addEventListener('click', function() {
             currentPage = i;
             displayProducts();
             window.scrollTo({ top: 0, behavior: 'smooth' });
         });
         pagination.appendChild(pageBtn);
     }
     
     const nextBtn = document.createElement('button');
     nextBtn.className = 'pagination-btn';
     nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
     nextBtn.disabled = currentPage === totalPages;
     nextBtn.addEventListener('click', function() {
         if (currentPage < totalPages) {
             currentPage++;
             displayProducts();
             window.scrollTo({ top: 0, behavior: 'smooth' });
         }
     });
     pagination.appendChild(nextBtn);
 }
 
 // Add event listeners to product buttons
 function addProductEventListeners() {
     const addToCartBtns = document.querySelectorAll('.add-to-cart');
     addToCartBtns.forEach(btn => {
         btn.addEventListener('click', function() {
             const productId = parseInt(this.getAttribute('data-id'));
             addToCart(productId);
         });
     });
     
     const quickViewBtns = document.querySelectorAll('.quick-view');
     quickViewBtns.forEach(btn => {
         btn.addEventListener('click', function() {
             const productId = parseInt(this.getAttribute('data-id'));
             openProductModal(productId);
         });
     });
     
     const wishlistBtns = document.querySelectorAll('.wishlist-btn');
     wishlistBtns.forEach(btn => {
         btn.addEventListener('click', function() {
             const productId = parseInt(this.getAttribute('data-id'));
             toggleWishlist(productId);
         });
     });
 }
 
 // Apply filters
 function applyFilters() {
     const categoryFilter = filterCategory.value;
     const sortOption = sortBy.value;
     const priceFilter = priceRange.value;
     const searchTerm = searchInput.value.toLowerCase().trim();
     
     filteredProducts = products.filter(product => {
         if (categoryFilter === 'all') return true;
         return product.category === categoryFilter;
     });
     
     if (priceFilter !== 'all') {
         const [minPrice, maxPrice] = priceFilter.split('-').map(Number);
         filteredProducts = filteredProducts.filter(product => {
             if (!maxPrice) return product.price >= minPrice;
             return product.price >= minPrice && product.price <= maxPrice;
         });
     }
     
     if (searchTerm) {
         filteredProducts = filteredProducts.filter(product => {
             return (
                 product.title.toLowerCase().includes(searchTerm) ||
                 product.description.toLowerCase().includes(searchTerm) ||
                 product.category.toLowerCase().includes(searchTerm)
             );
         });
     }
     
     if (sortOption === 'price-low') {
         filteredProducts.sort((a, b) => a.price - b.price);
     } else if (sortOption === 'price-high') {
         filteredProducts.sort((a, b) => b.price - a.price);
     } else if (sortOption === 'rating') {
         filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
     }
     
     currentPage = 1;
     displayProducts();
 }
 
 // Add to cart
 function addToCart(productId, quantity = 1) {
     const product = products.find(p => p.id === productId);
     if (!product) return;
     
     const existingItemIndex = cart.findIndex(item => item.id === productId);
     
     if (existingItemIndex !== -1) {
         cart[existingItemIndex].quantity += quantity;
     } else {
         cart.push({
             id: product.id,
             title: product.title,
             price: product.price,
             image: product.image,
             quantity
         });
     }
     
     localStorage.setItem('cart', JSON.stringify(cart));
     updateCartUI();
     showNotification(`${product.title} added to cart!`);
     openCartSidebar();
 }
 
 // Toggle wishlist
 function toggleWishlist(productId) {
     const product = products.find(p => p.id === productId);
     if (!product) return;
     
     const existingItemIndex = wishlist.findIndex(item => item.id === productId);
     
     if (existingItemIndex !== -1) {
         wishlist.splice(existingItemIndex, 1);
         showNotification(`${product.title} removed from wishlist!`);
     } else {
         wishlist.push({
             id: product.id,
             title: product.title,
             price: product.price,
             image: product.image
         });
         showNotification(`${product.title} added to wishlist!`);
     }
     
     localStorage.setItem('wishlist', JSON.stringify(wishlist));
     updateWishlistUI();
 }
 
 // Update cart UI
 function updateCartUI() {
     cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
     
     if (cart.length === 0) {
         emptyCart.style.display = 'flex';
         while (cartItems.children.length > 1) {
             cartItems.removeChild(cartItems.lastChild);
         }
         cartTotal.textContent = '$0.00';
     } else {
         emptyCart.style.display = 'none';
         while (cartItems.children.length > 1) {
             cartItems.removeChild(cartItems.lastChild);
         }
         
         cart.forEach(item => {
             const cartItem = document.createElement('div');
             cartItem.className = 'cart-item';
             const itemTotal = (item.price * item.quantity).toFixed(2);
             
             cartItem.innerHTML = `
                 <div class="cart-item-img">
                     <img src="${item.image}" alt="${item.title}">
                 </div>
                 <div class="cart-item-info">
                     <h3 class="cart-item-title">${item.title}</h3>
                     <div class="cart-item-price">$${itemTotal}</div>
                     <div class="cart-item-actions">
                         <div class="cart-qty">
                             <button class="cart-qty-btn minus" data-id="${item.id}">
                                 <i class="fas fa-minus"></i>
                             </button>
                             <input type="text" class="cart-qty-input" value="${item.quantity}" readonly>
                             <button class="cart-qty-btn plus" data-id="${item.id}">
                                 <i class="fas fa-plus"></i>
                             </button>
                         </div>
                         <button class="cart-item-remove" data-id="${item.id}">
                             <i class="fas fa-trash-alt"></i>
                             Remove
                         </button>
                     </div>
                 </div>
             `;
             
             cartItems.appendChild(cartItem);
         });
         
         addCartItemEventListeners();
         const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
         cartTotal.textContent = `$${total}`;
     }
 }
 
 // Add event listeners to cart item buttons
 function addCartItemEventListeners() {
     const minusBtns = document.querySelectorAll('.cart-qty-btn.minus');
     minusBtns.forEach(btn => {
         btn.addEventListener('click', function() {
             const productId = parseInt(this.getAttribute('data-id'));
             updateCartItemQuantity(productId, -1);
         });
     });
     
     const plusBtns = document.querySelectorAll('.cart-qty-btn.plus');
     plusBtns.forEach(btn => {
         btn.addEventListener('click', function() {
             const productId = parseInt(this.getAttribute('data-id'));
             updateCartItemQuantity(productId, 1);
         });
     });
     
     const removeBtns = document.querySelectorAll('.cart-item-remove');
     removeBtns.forEach(btn => {
         btn.addEventListener('click', function() {
             const productId = parseInt(this.getAttribute('data-id'));
             removeCartItem(productId);
         });
     });
 }
 
 // Update cart item quantity
 function updateCartItemQuantity(productId, change) {
     const itemIndex = cart.findIndex(item => item.id === productId);
     
     if (itemIndex === -1) return;
     
     cart[itemIndex].quantity += change;
     
     if (cart[itemIndex].quantity <= 0) {
         cart.splice(itemIndex, 1);
     }
     
     localStorage.setItem('cart', JSON.stringify(cart));
     updateCartUI();
 }
 
 // Remove cart item
 function removeCartItem(productId) {
     const itemIndex = cart.findIndex(item => item.id === productId);
     
     if (itemIndex === -1) return;
     
     const productName = cart[itemIndex].title;
     cart.splice(itemIndex, 1);
     
     localStorage.setItem('cart', JSON.stringify(cart));
     updateCartUI();
     showNotification(`${productName} removed from cart!`);
 }
 
 // Update wishlist UI
 function updateWishlistUI() {
     wishlistCount.textContent = wishlist.length;
     
     const wishlistBtns = document.querySelectorAll('.wishlist-btn');
     wishlistBtns.forEach(btn => {
         const productId = parseInt(btn.getAttribute('data-id'));
         btn.classList.toggle('active', wishlist.some(item => item.id === productId));
     });
 }
 
 // Open cart sidebar
 function openCartSidebar() {
     cartSidebar.classList.add('open');
     overlay.classList.add('active');
     document.body.style.overflow = 'hidden';
 }
 
 // Close cart sidebar
 function closeCartSidebar() {
     cartSidebar.classList.remove('open');
     overlay.classList.remove('active');
     document.body.style.overflow = '';
 }
 
 // Open product modal
 function openProductModal(productId) {
     const product = products.find(p => p.id === productId);
     if (!product) return;
     
     const isWishlisted = wishlist.some(item => item.id === productId);
     const formattedPrice = `$${product.price.toFixed(2)}`;
     
     const rating = product.rating.rate;
     const fullStars = Math.floor(rating);
     const halfStar = rating % 1 >= 0.5;
     const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
     
     let starsHTML = '';
     for (let i = 0; i < fullStars; i++) {
         starsHTML += '<i class="fas fa-star"></i>';
     }
     if (halfStar) {
         starsHTML += '<i class="fas fa-star-half-alt"></i>';
     }
     for (let i = 0; i < emptyStars; i++) {
         starsHTML += '<i class="far fa-star"></i>';
     }
     
     productDetail.innerHTML = `
         <div class="product-detail-img">
             <img src="${product.image}" alt="${product.title}">
         </div>
         <div class="product-detail-info">
             <div class="product-detail-category">${product.category}</div>
             <h2 class="product-detail-title">${product.title}</h2>
             <div class="product-detail-rating">
                 <div class="stars">${starsHTML}</div>
                 <div class="rating-count">(${product.rating.count} reviews)</div>
             </div>
             <div class="product-detail-price">${formattedPrice}</div>
             <div class="product-detail-desc">${product.description}</div>
             <div class="product-detail-actions">
                 <div class="quantity-control">
                     <button class="qty-btn minus" data-id="${product.id}">
                         <i class="fas fa-minus"></i>
                     </button>
                     <input type="text" class="qty-input" id="detail-qty" value="1" readonly>
                     <button class="qty-btn plus" data-id="${product.id}">
                         <i class="fas fa-plus"></i>
                     </button>
                 </div>
                 <button class="detail-add-to-cart" data-id="${product.id}">
                     <i class="fas fa-shopping-cart"></i>
                     Add to Cart
                 </button>
                 <button class="detail-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}">
                     <i class="fas fa-heart"></i>
                 </button>
             </div>
         </div>
     `;
     
     productModal.classList.add('show');
     overlay.classList.add('active');
     document.body.style.overflow = 'hidden';
     
     // Add event listeners
     const detailQty = document.getElementById('detail-qty');
     const minusBtn = productDetail.querySelector('.qty-btn.minus');
     const plusBtn = productDetail.querySelector('.qty-btn.plus');
     const addToCartBtn = productDetail.querySelector('.detail-add-to-cart');
     const wishlistBtn = productDetail.querySelector('.detail-wishlist-btn');
     
     minusBtn.addEventListener('click', () => {
         let qty = parseInt(detailQty.value);
         if (qty > 1) {
             detailQty.value = qty - 1;
         }
     });
     
     plusBtn.addEventListener('click', () => {
         let qty = parseInt(detailQty.value);
         detailQty.value = qty + 1;
     });
     
     addToCartBtn.addEventListener('click', () => {
         const qty = parseInt(detailQty.value);
         addToCart(productId, qty);
         closeProductModal();
     });
     
     wishlistBtn.addEventListener('click', () => {
         toggleWishlist(productId);
         wishlistBtn.classList.toggle('active');
     });
 }
 
 // Close product modal
 function closeProductModal() {
     productModal.classList.remove('show');
     overlay.classList.remove('active');
     document.body.style.overflow = '';
 }
 
 // Show notification
 function showNotification(message) {
     const notification = document.createElement('div');
     notification.className = 'notification';
     notification.style.cssText = `
         position: fixed;
         top: 20px;
         right: 20px;
         background-color: var(--success);
         color: white;
         padding: 1rem;
         border-radius: 5px;
         z-index: 1000;
         animation: slideIn 0.3s, slideOut 0.3s 2.7s;
     `;
     notification.textContent = message;
     
     document.body.appendChild(notification);
     
     setTimeout(() => {
         notification.remove();
     }, 3000);
     
     // Add keyframes for animation
     const styleSheet = document.createElement('style');
     styleSheet.innerHTML = `
         @keyframes slideIn {
             from { transform: translateX(100%); opacity: 0; }
             to { transform: translateX(0); opacity: 1; }
         }
         @keyframes slideOut {
             from { transform: translateX(0); opacity: 1; }
             to { transform: translateX(100%); opacity: 0; }
         }
     `;
     document.head.appendChild(styleSheet);
 }
 
 // Event listeners
 document.addEventListener('DOMContentLoaded', () => {
     fetchProducts();
     
     cartIcon.addEventListener('click', (e) => {
         e.preventDefault();
         openCartSidebar();
     });
     
     cartClose.addEventListener('click', closeCartSidebar);
     
     modalClose.addEventListener('click', closeProductModal);
     
     overlay.addEventListener('click', () => {
         closeCartSidebar();
         closeProductModal();
     });
     
     sortBy.addEventListener('change', applyFilters);
     filterCategory.addEventListener('change', () => {
         const categoryLinks = document.querySelectorAll('.category-list a');
         categoryLinks.forEach(link => link.classList.remove('active'));
         const selectedCategory = filterCategory.value === 'all' ? 'all' : filterCategory.value;
         document.querySelector(`.category-list a[data-category="${selectedCategory}"]`).classList.add('active');
         applyFilters();
     });
     priceRange.addEventListener('change', applyFilters);
     
     searchInput.addEventListener('input', () => {
         applyFilters();
     });
     
     checkoutBtn.addEventListener('click', () => {
         if (cart.length === 0) {
             showNotification('Your cart is empty!');
         } else {
             showNotification('Proceeding to checkout...');
             // Implement checkout logic here
         }
     });
     
     wishlistIcon.addEventListener('click', (e) => {
         e.preventDefault();
         // Implement wishlist page navigation here
         showNotification('Wishlist functionality to be implemented!');
     });
     
     mobileMenuBtn.addEventListener('click', () => {
         categoryList.classList.toggle('mobile-open');
         categoryList.style.cssText = categoryList.classList.contains('mobile-open') ? `
             display: flex;
             flex-direction: column;
             position: absolute;
             top: 100%;
             left: 0;
             right: 0;
             background-color: white;
             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
             padding: 1rem;
         ` : '';
     });
 });