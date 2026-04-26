const phoneForm = document.getElementById('phone-form');
const productGrid = document.getElementById('product-grid');
const searchContainer = document.getElementById('search-container');

// Crear input de búsqueda dinámicamente
searchContainer.innerHTML = `
    <input type="text" id="search-input" placeholder="Buscar por modelo..." style="width: 100%; margin-bottom: 20px; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white;">
`;

const searchInput = document.getElementById('search-input');

// Cargar productos de LocalStorage
let productos = JSON.parse(localStorage.getItem('celulares')) || [];
renderProducts(productos);

// EVENTO: Guardar o Actualizar
phoneForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const editingId = phoneForm.dataset.editingId;
    const model = document.getElementById('model-name').value;
    const desc = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value; // Captura de stock confirmada
    const urlInput = document.getElementById('img-url').value;
    const fileInput = document.getElementById('img-file');

    const finalizeSave = (src) => {
        const productData = {
            id: editingId || Date.now().toString(),
            model,
            desc,
            price,
            stock, // Propiedad incluida en el objeto
            imgSrc: src || 'https://via.placeholder.com/150?text=Sin+Imagen'
        };

        if (editingId) {
            productos = productos.map(p => p.id === editingId ? productData : p);
            delete phoneForm.dataset.editingId;
            document.getElementById('submit-btn').textContent = "Guardar en Catálogo";
        } else {
            productos.push(productData);
        }

        saveToLocalStorage(); // Guarda en localStorage
        phoneForm.reset();
        renderProducts(productos); // Refresca la vista en el admin
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => finalizeSave(event.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeSave(urlInput);
    }
});

// EVENTO: Buscador
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtrados = productos.filter(p => p.model.toLowerCase().includes(term));
    renderProducts(filtrados);
});

// FUNCIÓN: Renderizar Tarjetas en el Panel de Administración
function renderProducts(lista) {
    productGrid.innerHTML = "";
    lista.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${p.imgSrc}" alt="${p.model}">
            <h4>${p.model}</h4>
            <span class="stock-badge">Stock: ${p.stock}</span>
            <p>$${Number(p.price).toLocaleString()}</p>
            <div class="card-actions">
                <button onclick="editProduct('${p.id}')" class="btn-edit">Editar</button>
                <button onclick="deleteProduct('${p.id}')" class="btn-delete">Eliminar</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// FUNCIÓN: Editar - Carga los datos existentes al formulario
window.editProduct = function(id) {
    const p = productos.find(item => item.id === id);
    if (p) {
        document.getElementById('model-name').value = p.model;
        document.getElementById('description').value = p.desc;
        document.getElementById('price').value = p.price;
        document.getElementById('stock').value = p.stock;
        document.getElementById('img-url').value = p.imgSrc;

        phoneForm.dataset.editingId = id;
        document.getElementById('submit-btn').textContent = "Actualizar Producto";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// FUNCIÓN: Eliminar - Quita el producto del inventario
window.deleteProduct = function(id) {
    if (confirm("¿Seguro que quieres eliminar este equipo del inventario?")) {
        productos = productos.filter(p => p.id !== id);
        saveToLocalStorage();
        renderProducts(productos);
    }
};

// FUNCIÓN: Persistencia de datos
function saveToLocalStorage() {
    localStorage.setItem('celulares', JSON.stringify(productos));
}