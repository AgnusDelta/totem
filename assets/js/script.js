let cart = JSON.parse(localStorage.getItem('kiosk_cart')) || [];
let allProducts = [];
let orderCounter = parseInt(localStorage.getItem('kiosk_order_counter')) || 1;

async function initKiosk() {
    try {
        const res = await fetch('./products.json');
        const data = await res.json();
        allProducts = data.products;
        renderCategories(data.categories);
        renderProducts(allProducts);
        updateCartUI();
    } catch (err) {
        console.error("Error cargando productos:", err);
    }
}

function renderCategories(cats) {
    const nav = document.getElementById('categories-nav');
    if (!nav) return;
    nav.innerHTML = '<button class="category-btn active">Todos</button>';
    cats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.innerText = c;
        nav.appendChild(btn);
    });
}

function renderProducts(list) {
    const container = document.getElementById('products-container');
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding: 40px; color: #888;">No encontramos ese producto...</p>';
        return;
    }
    container.innerHTML = list.map(p => `
        <div class="product-card" data-id="${p.id}">
            <div class="product-img-container"><img src="${p.image}" class="product-img" loading="lazy"></div>
            <h3>${p.name}</h3>
            <p class="price-tag">$${p.price.toLocaleString()}</p>
        </div>
    `).join('');
}

function updateCartUI() {
    localStorage.setItem('kiosk_cart', JSON.stringify(cart));
    const list = document.getElementById('cart-items');
    const totalDisp = document.getElementById('total-amount');
    if (!list || !totalDisp) return;

    let total = 0;
    list.innerHTML = cart.map((p, i) => {
        total += p.price * p.qty;
        return `
            <div class="cart-item">
                <div class="cart-item-info"><span class="qty-tag">x${p.qty}</span><span>${p.name}</span></div>
                <div class="cart-item-actions">
                    <span style="font-weight:bold; margin-right:10px;">$${(p.price * p.qty).toLocaleString()}</span>
                    <button class="btn-remove" data-index="${i}">✕</button>
                </div>
            </div>`;
    }).join('');
    totalDisp.innerText = `$${total.toLocaleString()}`;
}

// BUSCADOR Y MÁSCARA
document.addEventListener('input', (e) => {
    if (e.target.id === 'product-search') {
        const term = e.target.value.toLowerCase();
        // Filtrar basándose en la categoría activa
        const activeCat = document.querySelector('.category-btn.active').innerText;
        let filtered = allProducts.filter(p => p.name.toLowerCase().includes(term));
        if (activeCat !== 'Todos') {
            filtered = filtered.filter(p => p.category === activeCat);
        }
        renderProducts(filtered);
    }
    if (e.target.id === 'card-number') {
        let val = e.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = formatted;
    }
});

document.addEventListener('click', (e) => {
    // Categorías
    if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const cat = e.target.innerText;
        document.getElementById('product-search').value = ""; // Limpiar buscador al cambiar categoría
        renderProducts(cat === 'Todos' ? allProducts : allProducts.filter(p => p.category === cat));
    }

    // Agregar Item
    const card = e.target.closest('.product-card');
    if (card) {
        const id = card.dataset.id;
        const prod = allProducts.find(p => p.id == id);
        const exist = cart.find(item => item.id == id);
        if (exist) exist.qty++; else cart.push({ ...prod, qty: 1 });
        updateCartUI();
    }

    // Quitar Item
    if (e.target.classList.contains('btn-remove')) {
        const idx = e.target.dataset.index;
        if (cart[idx].qty > 1) cart[idx].qty--; else cart.splice(idx, 1);
        updateCartUI();
    }

    // Pago
    if (e.target.id === 'pay-btn') {
        if (cart.length === 0) return;
        document.getElementById('payment-total').innerText = document.getElementById('total-amount').innerText;
        document.getElementById('payment-modal').classList.remove('hidden');
    }

    if (e.target.id === 'confirm-payment-btn') {
        const cardVal = document.getElementById('card-number').value.replace(/\s/g, '');
        if (cardVal.length !== 16) return alert("Ingresa los 16 dígitos");

        e.target.innerText = "PROCESANDO...";
        setTimeout(() => {
            document.getElementById('order-number').innerText = `#${orderCounter.toString().padStart(3, '0')}`;
            orderCounter++;
            localStorage.setItem('kiosk_order_counter', orderCounter);
            document.getElementById('payment-modal').classList.add('hidden');
            document.getElementById('order-modal').classList.remove('hidden');
            e.target.innerText = "CONFIRMAR PAGO";
        }, 1500);
    }

    if (e.target.id === 'cancel-payment-btn') document.getElementById('payment-modal').classList.add('hidden');
    if (e.target.id === 'close-modal-btn') { cart = []; updateCartUI(); document.getElementById('order-modal').classList.add('hidden'); }
    if (e.target.id === 'clear-cart') { cart = []; updateCartUI(); }
});

initKiosk();