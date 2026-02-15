let cart = [];
let allProducts = [];

async function loadKioskData() {
    try {
        // Buscamos el archivo en la raíz
        const response = await fetch('./products.json');
        
        if (!response.ok) {
            throw new Error(`No se pudo cargar el JSON. Status: ${response.status}`);
        }

        const data = await response.json();
        allProducts = data.products;
        
        renderCategories(data.categories);
        renderProducts(allProducts); // Mostrar todos al inicio
        console.log("Sistema Kiosk: Datos cargados.");

    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
        document.getElementById('products-container').innerHTML = `
            <div style="color: red; padding: 20px; border: 2px solid red;">
                <h3>SISTEMA OFFLINE</h3>
                <p>No se encontró 'products.json' en la raíz del proyecto.</p>
            </div>`;
    }
}

function renderCategories(categories) {
    const nav = document.getElementById('categories-nav');
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
    if (category === 'Todos') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>$${p.price.toLocaleString()}</p>
            </div>
            <button class="add-btn">+</button>
        `;
        card.onclick = () => addToCart(p);
        container.appendChild(card);
    });
}

function addToCart(product) {
    cart.push(product);
    updateCart();
}

function updateCart() {
    const cartList = document.getElementById('cart-items');
    const totalLabel = document.getElementById('total-amount');
    
    cartList.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<span>${item.name}</span> <span>$${item.price.toLocaleString()}</span>`;
        cartList.appendChild(div);
        total += item.price;
    });

    totalLabel.innerText = `$${total.toLocaleString()}`;
}

// Iniciar al cargar
document.addEventListener('DOMContentLoaded', loadKioskData);