// ==========================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let cart = [];
let allProducts = [];

// ==========================================
// 2. CARGA DE DATOS (INICIO)
// ==========================================
async function initKiosk() {
    try {
        const response = await fetch('./products.json');
        
        if (!response.ok) throw new Error("No se pudo encontrar products.json");

        const data = await response.json();
        allProducts = data.products;

        // Inicializar la interfaz
        renderCategories(data.categories);
        renderProducts(allProducts); 

    } catch (error) {
        console.error("Error de Sistema:", error);
        document.getElementById('products-container').innerHTML = `
            <div style="color:white; background:red; padding:20px; border-radius:10px;">
                <h3>SISTEMA OFFLINE</h3>
                <p>Error al cargar el menú. Revisa que products.json esté en la raíz.</p>
            </div>`;
    }
}

// ==========================================
// 3. LÓGICA DE CATEGORÍAS (SIDEBAR)
// ==========================================
function renderCategories(categories) {
    const nav = document.getElementById('categories-nav');
    // Botón inicial de "Todos"
    nav.innerHTML = '<button class="category-btn active" onclick="filterByCategory(\'Todos\')">Todos</button>';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.innerText = cat;
        btn.onclick = () => filterByCategory(cat);
        nav.appendChild(btn);
    });
}

function filterByCategory(category) {
    // Cambiar estado visual de los botones
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === category);
    });

    // Filtrar lógica
    const filtered = (category === 'Todos') 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
    
    renderProducts(filtered);
}

// ==========================================
// 4. RENDERIZADO DE PRODUCTOS (GRILLA)
// ==========================================
function renderProducts(productsList) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    productsList.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-img-container">
                <img src="${p.image}" alt="${p.name}" class="product-img">
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="price">$${p.price.toLocaleString()}</p>
            </div>
            <button class="add-btn">AÑADIR</button>
        `;
        
        // Al hacer clic en cualquier parte de la tarjeta se añade al carrito
        card.onclick = () => addToCart(p);
        container.appendChild(card);
    });
}

// ==========================================
// 5. GESTIÓN DEL CARRITO (CON ELIMINAR)
// ==========================================
function addToCart(product) {
    cart.push(product);
    updateCartUI();
}

// Función para quitar un producto específico
function removeFromCart(index, event) {
    // event.stopPropagation() evita que el clic "atraviese" el botón 
    // y active funciones de elementos que estén debajo.
    event.stopPropagation(); 
    
    cart.splice(index, 1); // Elimina el elemento del arreglo
    updateCartUI();        // Refresca la vista del carrito
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalLabel = document.getElementById('total-amount');
    
    cartList.innerHTML = ''; 
    let totalValue = 0;

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        div.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${item.price.toLocaleString()}</span>
            </div>
            <button class="btn-remove" onclick="removeFromCart(${index}, event)">
                ✕
            </button>
        `;
        
        cartList.appendChild(div);
        totalValue += item.price;
    });

    totalLabel.innerText = `$${totalValue.toLocaleString()}`;
}

// ==========================================
// 6. FINALIZAR COMPRA (MODAL)
// ==========================================
document.getElementById('pay-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("El carrito está vacío. Selecciona un producto.");
        return;
    }

    // Generar número de orden
    const randomOrder = Math.floor(Math.random() * 100) + 1;
    document.getElementById('order-number').innerText = `#${randomOrder}`;
    
    // Mostrar modal
    document.getElementById('order-modal').classList.remove('hidden');
});

function closeModal() {
    // Resetear todo para el siguiente cliente
    cart = [];
    updateCartUI();
    document.getElementById('order-modal').classList.add('hidden');
    filterByCategory('Todos');
}

// ==========================================
// 7. INICIO AUTOMÁTICO
// ==========================================
document.addEventListener('DOMContentLoaded', initKiosk);