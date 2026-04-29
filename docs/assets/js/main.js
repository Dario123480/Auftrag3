document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const nav = header ? header.querySelector('nav') : null;

    // --- Scroll Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal, .fade-in');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Toast Notifications System ---
    const toastContainer = document.getElementById('toast-container');
    window.showToast = (message, type = 'success') => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        // Trigger reflow for animation
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // --- Shopping Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('burger-cart')) || [];
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cart-total-value');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.querySelector('.cart-footer .cta-button');

    function updateCartUI() {
        if (!cartItemsContainer || !cartTotalElement) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>CHF ${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">✕</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
            itemCount += item.quantity;
        });

        cartTotalElement.textContent = `CHF ${total.toFixed(2)}`;
        if(cartCountElement) cartCountElement.textContent = itemCount;
        localStorage.setItem('burger-cart', JSON.stringify(cart));
    }

    window.addToCart = (name, price, image) => {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        updateCartUI();
        openCart();
        showToast(`${name} zum Warenkorb hinzugefügt!`);
    };

    window.changeQuantity = (index, delta) => {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            updateCartUI();
        }
    };

    window.removeFromCart = (index) => {
        const name = cart[index].name;
        cart.splice(index, 1);
        updateCartUI();
        showToast(`${name} entfernt.`, 'error');
    };

    // Checkout Logic
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Der Warenkorb ist leer!', 'error');
                return;
            }
            const cartSummary = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
            window.location.href = `contact.html?request=order&item=${encodeURIComponent(cartSummary)}`;
        });
    }

    function openCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('active');
        }
    }

    window.closeCart = () => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('active');
        }
    };

    // Global listeners for cart
    document.querySelector('.close-cart')?.addEventListener('click', window.closeCart);
    cartOverlay?.addEventListener('click', window.closeCart);
    document.getElementById('cart-trigger')?.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    // --- Menu Filter Logic ---
    const filterButtons = document.querySelectorAll('.filter-nav button');
    const menuSections = document.querySelectorAll('.menu-category');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-filter');
            
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            menuSections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                if (category === 'all' || sectionCategory === category) {
                    section.style.display = 'block';
                    section.classList.add('active');
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });

    // --- Active Link Logic ---
    if (nav) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        nav.querySelectorAll('a').forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    // --- Mobile Menu Logic ---
    if (header && nav) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰';
        header.appendChild(menuToggle);
        
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.innerHTML = '☰';
            });
        });
    }

    // --- Header Scroll Effect & Back to Top (Throttled) ---
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.id = 'back-to-top';
    document.body.appendChild(backToTop);

    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollPos = window.scrollY;
                
                // Header effect
                if (header) {
                    if (scrollPos > 50) {
                        header.style.padding = '10px 5%';
                        header.style.background = 'rgba(26, 26, 26, 0.95)';
                    } else {
                        header.style.padding = '20px 5%';
                        header.style.background = 'rgba(26, 26, 26, 0.85)';
                    }
                }

                // Back to top effect
                if (scrollPos > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }

                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Form Interception ---
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formType = form.closest('.login-card')?.querySelector('h2')?.textContent || 'Formular';
            showToast(`${formType} erfolgreich gesendet!`);
            form.reset();
        });
    });

    // Initial UI Sync
    updateCartUI();
});
