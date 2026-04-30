const App = (() => {
    const state = {
        cart: JSON.parse(localStorage.getItem('burger-cart')) || [],
        isScrolling: false
    };

    const dom = {
        header: document.querySelector('header'),
        nav: document.querySelector('header nav'),
        toastContainer: document.getElementById('toast-container'),
        cartDrawer: document.getElementById('cart-drawer'),
        cartOverlay: document.getElementById('cart-overlay'),
        cartItems: document.querySelector('.cart-items'),
        cartTotal: document.getElementById('cart-total-value'),
        cartCount: document.getElementById('cart-count'),
        checkoutBtn: document.querySelector('.cart-footer .cta-button'),
        revealElements: document.querySelectorAll('.reveal, .fade-in')
    };

    const UI = {
        showToast(message, type = 'success') {
            if (!dom.toastContainer) return;
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `<span>${message}</span>`;
            dom.toastContainer.appendChild(toast);
            toast.offsetHeight;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        },

        updateCart() {
            if (!dom.cartItems || !dom.cartTotal) return;
            dom.cartItems.innerHTML = '';
            let total = 0;
            let count = 0;

            state.cart.forEach((item, index) => {
                const el = document.createElement('div');
                el.className = 'cart-item';
                el.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>CHF ${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button data-action="decrease" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button data-action="increase" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-action="remove" data-index="${index}">✕</button>
                `;
                dom.cartItems.appendChild(el);
                total += item.price * item.quantity;
                count += item.quantity;
            });

            dom.cartTotal.textContent = `CHF ${total.toFixed(2)}`;
            if (dom.cartCount) dom.cartCount.textContent = count;
            localStorage.setItem('burger-cart', JSON.stringify(state.cart));
        },

        toggleCart(isOpen) {
            if (!dom.cartDrawer || !dom.cartOverlay) return;
            dom.cartDrawer.classList.toggle('open', isOpen);
            dom.cartOverlay.classList.toggle('active', isOpen);
        }
    };

    const CartLogic = {
        add(name, price, image) {
            const item = state.cart.find(i => i.name === name);
            if (item) item.quantity += 1;
            else state.cart.push({ name, price, image, quantity: 1 });
            UI.updateCart();
            UI.toggleCart(true);
            UI.showToast(`${name} hinzugefügt!`);
        },

        changeQuantity(index, delta) {
            state.cart[index].quantity += delta;
            if (state.cart[index].quantity <= 0) this.remove(index);
            else UI.updateCart();
        },

        remove(index) {
            const name = state.cart[index].name;
            state.cart.splice(index, 1);
            UI.updateCart();
            UI.showToast(`${name} entfernt.`, 'error');
        }
    };

    const init = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('active'); });
        }, { threshold: 0.1 });
        dom.revealElements.forEach(el => observer.observe(el));

        if (dom.nav) {
            const current = window.location.pathname.split('/').pop() || 'index.html';
            dom.nav.querySelectorAll('a').forEach(link => {
                if (link.getAttribute('href') === current) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }

        if (dom.header && dom.nav) {
            const toggle = document.createElement('button');
            toggle.className = 'menu-toggle';
            toggle.innerHTML = '☰';
            dom.header.appendChild(toggle);
            toggle.onclick = () => {
                dom.nav.classList.toggle('active');
                toggle.innerHTML = dom.nav.classList.contains('active') ? '✕' : '☰';
            };
            dom.nav.querySelectorAll('a').forEach(l => l.onclick = () => {
                dom.nav.classList.remove('active');
                toggle.innerHTML = '☰';
            });
        }

        const btt = document.createElement('button');
        btt.innerHTML = '↑';
        btt.id = 'back-to-top';
        document.body.appendChild(btt);
        btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

        window.addEventListener('scroll', () => {
            if (!state.isScrolling) {
                window.requestAnimationFrame(() => {
                    const pos = window.scrollY;
                    if (dom.header) {
                        dom.header.style.padding = pos > 50 ? '10px 5%' : '20px 5%';
                        dom.header.style.background = pos > 50 ? 'rgba(26, 26, 26, 0.95)' : 'rgba(26, 26, 26, 0.85)';
                    }
                    btt.classList.toggle('visible', pos > 500);
                    state.isScrolling = false;
                });
                state.isScrolling = true;
            }
        });

        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('[data-action="decrease"]')) CartLogic.changeQuantity(target.closest('button').dataset.index, -1);
            if (target.closest('[data-action="increase"]')) CartLogic.changeQuantity(target.closest('button').dataset.index, 1);
            if (target.closest('[data-action="remove"]')) CartLogic.remove(target.closest('button').dataset.index);
            if (target.closest('.close-cart') || target === dom.cartOverlay) UI.toggleCart(false);
            if (target.closest('#cart-trigger')) { e.preventDefault(); UI.toggleCart(true); }
        });

        if (dom.checkoutBtn) {
            dom.checkoutBtn.onclick = () => {
                if (state.cart.length === 0) return UI.showToast('Leer!', 'error');
                const summary = state.cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
                window.location.href = `contact.html?request=order&item=${encodeURIComponent(summary)}`;
            };
        }

        const filterBtns = document.querySelectorAll('.filter-nav button');
        const sections = document.querySelectorAll('.menu-category');
        filterBtns.forEach(btn => {
            btn.onclick = () => {
                const cat = btn.dataset.filter;
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sections.forEach(s => {
                    s.style.display = (cat === 'all' || s.dataset.category === cat) ? 'block' : 'none';
                    if (s.style.display === 'block') s.classList.add('active');
                });
            };
        });

        document.querySelectorAll('form').forEach(f => {
            f.onsubmit = (e) => {
                e.preventDefault();
                const type = f.closest('.login-card')?.querySelector('h2')?.textContent || 'Form';
                UI.showToast(`${type} gesendet!`);
                f.reset();
            };
        });

        const params = new URLSearchParams(window.location.search);
        if (params.get('order')) {
            const msg = document.getElementById('message');
            if (msg) msg.value = `Bestellung:\n${params.get('order')}`;
        }

        UI.updateCart();
    };

    window.addToCart = CartLogic.add;
    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
