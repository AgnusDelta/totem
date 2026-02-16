// 1. Estado de la App (Declarado una sola vez)
let cart = JSON.parse(localStorage.getItem('kiosk_cart')) || [];
let allProducts = [];

// 2. Función de Inicio
async function initKiosk() {
    try {
        const res = await fetch('./products.json');
        if (!res.ok) throw new Error("No se cargó el JSON");
        const data = await res.json();
        allProducts = data.products;

        renderCategories(data.categories);
        renderProducts(allProducts);
        updateCartUI();
    } catch (err) {
        console.error("Error al iniciar:", err);
    }
}

// 3. Renderizado
function renderCategories(cats) {
    const nav = document.getElementById('categories-nav');
    if(!nav) return;
    nav.innerHTML = `<button class="category-btn active" onclick="filter('Todos')">Todos</button>`;
    cats.forEach(c => {
        nav.innerHTML += `<button class="category-btn" onclick="filter('${c}')">${c}</button>`;
    });
}

function filter(cat) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.toggle('active', b.innerText === cat));
    const filtered = cat === 'Todos' ? allProducts : allProducts.filter(p => p.category === cat);
    renderProducts(filtered);
}

function renderProducts(list) {
    const container = document.getElementById('products-container');
    if(!container) return;
    container.innerHTML = list.map(p => `
        <div class="product-card" onclick="addToCart(${p.id})">
            <div class="product-img-container">
                <img src="${p.image}" class="product-img" onerror="this.src='https://placehold.co/200x200?text=Comida'">
            </div>
            <h3>${p.name}</h3>
            <p style="color:var(--primary); font-weight:bold">$${p.price.toLocaleString()}</p>
            <button class="btn-primary" style="padding:8px; font-size:12px; margin-top:10px; pointer-events:none;">AÑADIR</button>
        </div>
    `).join('');
}

// 4. Lógica de Carrito
function addToCart(id) {
    const prod = allProducts.find(p => p.id === id);
    const exist = cart.find(item => item.id === id);
    if (exist) { exist.qty++; } else { cart.push({ ...prod, qty: 1 }); }
    showToast(`¡${prod.name} añadido!`);
    updateCartUI();
}

function removeFromCart(index) {
    if (cart[index].qty > 1) { cart[index].qty--; } else { cart.splice(index, 1); }
    updateCartUI();
}

function updateCartUI() {
    localStorage.setItem('kiosk_cart', JSON.stringify(cart));
    const list = document.getElementById('cart-items');
    const totalDisp = document.getElementById('total-amount');
    if(!list || !totalDisp) return;

    let total = 0;
    list.innerHTML = cart.map((p, i) => {
        total += p.price * p.qty;
        return `
            <div class="cart-item">
                <div><span class="qty-tag">x${p.qty}</span> ${p.name}</div>
                <div style="display:flex; align-items:center;">
                    <span style="font-weight:bold; margin-right:10px">$${(p.price * p.qty).toLocaleString()}</span>
                    <button class="btn-remove" onclick="event.stopPropagation(); removeFromCart(${i})">✕</button>
                </div>
            </div>`;
    }).join('');
    totalDisp.innerText = `$${total.toLocaleString()}`;
}

// 5. ESCUCHADORES DE EVENTOS (Versión Robusta)
document.addEventListener('click', (e) => {
    // Botón Finalizar Pedido
    if (e.target.id === 'pay-btn') {
        if (cart.length === 0) {
            showToast("⚠️ El carrito está vacío");
        } else {
            const num = Math.floor(Math.random() * 900) + 100;
            document.getElementById('order-number').innerText = `#${num}`;
            document.getElementById('order-modal').classList.remove('hidden');
        }
    }

    // Botón Vaciar Carrito
    if (e.target.id === 'clear-cart') {
        if (cart.length > 0 && confirm("¿Vaciar todo el pedido?")) {
            cart = [];
            updateCartUI();
        }
    }

    // Botón Cerrar Modal
    if (e.target.id === 'close-modal-btn') {
        cart = [];
        updateCartUI();
        document.getElementById('order-modal').classList.add('hidden');
    }
});

// Buscador
document.addEventListener('input', (e) => {
    if (e.target.id === 'product-search') {
        const term = e.target.value.toLowerCase();
        renderProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
    }
});

// Utilidades
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 2000);
}

// Arrancar
initKiosk();