/* JavaScript PROFT END ЛОГИК - 20% */
/* AJAX / FETCH API - 20% */

// Глобал state объект - рестораны захиалгын системийн төлөв
const state = {
    menu: [],           // Меню зүйлс
    order: [],          // Захиалгын зүйлс
    customer: {         // Хэрэглэгчийн мэдээлэл
        name: '',
        phone: '',
        address: '',
        notes: '',
        deliveryTime: 'asap'
    },
    subtotal: 0,        // Нийт дүн
    tax: 0,             // Татвар
    deliveryFee: 3000,  // Хүргэлтийн төлбөр
    finalTotal: 3000,   // Төлөх дүн
    isLoading: false,   // Ачааллын төлөв
    error: null,        // Алдааны мэдээлэл
    currentCategory: 'all', // Одоогийн категори
    searchQuery: ''     // Хайлтын query
};

// DOM элементүүд
const DOM = {
    // Меню хэсэг
    menuItems: document.getElementById('menuItems'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    menuSearch: document.getElementById('menuSearch'),
    menuLoading: document.getElementById('menuLoading'),
    
    // Захиалгын хэсэг
    orderItems: document.getElementById('orderItems'),
    itemCount: document.getElementById('itemCount'),
    totalAmount: document.getElementById('totalAmount'),
    subtotalAmount: document.getElementById('subtotalAmount'),
    taxAmount: document.getElementById('taxAmount'),
    finalAmount: document.getElementById('finalAmount'),
    submitOrder: document.getElementById('submitOrder'),
    clearOrder: document.getElementById('clearOrder'),
    
    // Форм элементүүд
    customerForm: document.getElementById('customerForm'),
    nameInput: document.getElementById('name'),
    phoneInput: document.getElementById('phone'),
    addressInput: document.getElementById('address'),
    notesInput: document.getElementById('notes'),
    deliveryTimeSelect: document.getElementById('deliveryTime'),
    
    // Modal элементүүд
    paymentModal: document.getElementById('paymentModal'),
    closeModal: document.getElementById('closeModal'),
    confirmPayment: document.getElementById('confirmPayment'),
    cancelPayment: document.getElementById('cancelPayment'),
    modalCustomerName: document.getElementById('modalCustomerName'),
    modalCustomerAddress: document.getElementById('modalCustomerAddress'),
    modalTotalAmount: document.getElementById('modalTotalAmount'),
    orderNumber: document.getElementById('orderNumber'),
    
    // Баталгаажуулалтын modal
    confirmationModal: document.getElementById('confirmationModal'),
    confirmationMessage: document.getElementById('confirmationMessage'),
    orderDetails: document.getElementById('orderDetails'),
    closeConfirmation: document.getElementById('closeConfirmation'),
    
    // Мэдэгдэл элементүүд
    notificationMessage: document.getElementById('notificationMessage'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    
    // Бусад элементүүд
    themeToggle: document.getElementById('themeToggle')
};

// API URL - меню өгөгдлийг авах
const API_URL = 'menu.json';

// Хоосон захиалгын дэлгэц
const EMPTY_ORDER_HTML = `
    <div class="empty-order">
        <i class="fas fa-shopping-cart"></i>
        <p>Захиалга хоосон байна</p>
        <small>Меню-с хоол нэмнэ үү</small>
    </div>
`;

// Апп инициализаци
function initApp() {
    console.log('Апп инициализаци хийж байна...');
    
    // LocalStorage-аас төлөв сэргээх
    restoreStateFromLocalStorage();
    
    // Меню өгөгдөл ачаалах
    loadMenuData();
    
    // Event listener-уудыг бүртгэх
    setupEventListeners();
    
    // Анхны UI update хийх
    updateOrderUI();
    updateCustomerForm();
    
    console.log('Апп инициализаци дууслаа.');
}

// API ашиглан меню өгөгдөл ачаалах - async/await
async function loadMenuData() {
    try {
        console.log('Меню өгөгдөл ачаалж байна...');
        showLoadingIndicator(true);
        
        // API дуудаж өгөгдөл авах
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`API алдаа: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Меню өгөгдөл амжилттай ирлээ:', data);
        
        // State-д хадгалах
        state.menu = data.menu.map(item => ({
            ...item,
            imageUrl: `images/menu-item-${item.id}.jpg`
        }));
        
        // Меню UI update хийх
        renderMenuItems();
        
        showLoadingIndicator(false);
        showNotification('Менү амжилттай ачаалагдлаа', 'success');
        
    } catch (error) {
        console.error('Меню ачааллахад алдаа гарлаа:', error);
        showNotification('Меню ачааллахад алдаа гарлаа', 'error');
        showLoadingIndicator(false);
        
        // Алдааны тохиолдолд жишээ өгөгдөл ашиглах
        setTimeout(() => {
            useFallbackMenuData();
        }, 2000);
    }
}

// Алдааны тохиолдолд жишээ меню өгөгдөл ашиглах
function useFallbackMenuData() {
    console.log('Жишээ меню өгөгдөл ашиглаж байна...');
    
    const fallbackMenu = [
        {
            id: 1,
            name: "Бууз",
            description: "Монгол үндэстний уламжлалт хоол, мах, сонгино, давс, хар перец зэргээр хийгддэг",
            price: 2500,
            category: "main",
            image: "🥟",
            imageUrl: "images/menu-item-1.jpg"
        },
        {
            id: 2,
            name: "Хуушуур",
            description: "Шарсан махтай бялуу, гадна хүрэн шаргал, дотор зөөлөн",
            price: 2000,
            category: "main",
            image: "🥮",
            imageUrl: "images/menu-item-2.jpg"
        },
        {
            id: 3,
            name: "Цуйван",
            description: "Гурилтай махтай хоол, төмс, лууван, сонгино зэрэг ногоотой",
            price: 6000,
            category: "main",
            image: "🍜",
            imageUrl: "images/menu-item-3.jpg"
        },
        {
            id: 4,
            name: "Бяслагтай салад",
            description: "Шинэ ногоо, бяслаг, оливын тостой салад",
            price: 8000,
            category: "salad",
            image: "🥗",
            imageUrl: "images/menu-item-6.jpg"
        },
        {
            id: 5,
            name: "Кока Кола",
            description: "Халуун орны ундаа, 0.5л",
            price: 2000,
            category: "drink",
            image: "🥤",
            imageUrl: "images/menu-item-8.jpg"
        },
        {
            id: 6,
            name: "Цай",
            description: "Хөх цай сүүтэй",
            price: 1500,
            category: "drink",
            image: "🍵",
            imageUrl: "images/menu-item-10.jpg"
        },
        {
            id: 7,
            name: "Цагаан идээ",
            description: "Ааруул, цөцгий, хурууд",
            price: 5000,
            category: "dessert",
            image: "🧀",
            imageUrl: "images/menu-item-12.jpg"
        }
    ];
    
    state.menu = fallbackMenu;
    renderMenuItems();
    showNotification('Жишээ мэнү ашиглаж байна', 'info');
}

// Ачааллын индикатор харуулах
function showLoadingIndicator(show) {
    if (DOM.menuLoading) {
        DOM.menuLoading.classList.toggle('active', show);
    }
}

// Меню зүйлс дэлгэцэнд харуулах
function renderMenuItems() {
    console.log(`Меню зүйлс харуулж байна: ${state.currentCategory}, хайлт: "${state.searchQuery}"`);
    
    if (!state.menu || state.menu.length === 0) {
        DOM.menuItems.innerHTML = '<div class="loading">Меню хоосон байна</div>';
        return;
    }
    
    // Категориар шүүх
    let filteredMenu = state.currentCategory === 'all' 
        ? state.menu 
        : state.menu.filter(item => item.category === state.currentCategory);
    
    // Хайлтаар шүүх
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredMenu = filteredMenu.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
    }
    
    if (filteredMenu.length === 0) {
        DOM.menuItems.innerHTML = `
            <div class="empty-order" style="grid-column: 1 / -1; padding: 3rem;">
                <i class="fas fa-search"></i>
                <p>Ийм хоол олдсонгүй</p>
                <small>Өөр нэрээр хайна уу</small>
            </div>
        `;
        return;
    }
    
    // Меню HTML үүсгэх
    const menuHTML = filteredMenu.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <div class="menu-item-image">
                <img src="${item.imageUrl || item.image || 'images/placeholder.jpg'}" 
                     alt="${item.name}" 
                     onerror="this.src='images/placeholder.jpg'; this.onerror=null;">
                <span class="menu-item-category">${getCategoryName(item.category)}</span>
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <span class="menu-item-price">${item.price.toLocaleString()} ₮</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display" id="qty-${item.id}">
                            ${getOrderItemQuantity(item.id)}
                        </span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="add-to-order" data-id="${item.id}">
                        <i class="fas fa-cart-plus"></i> Нэмэх
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    DOM.menuItems.innerHTML = menuHTML;
    
    // Меню зүйлс дээр event listener нэмэх
    attachMenuEventListeners();
}

// Захиалгын зүйлсийн тоог авах
function getOrderItemQuantity(itemId) {
    const orderItem = state.order.find(item => item.id === itemId);
    return orderItem ? orderItem.quantity : 0;
}

// Категорийн нэр олох
function getCategoryName(categoryCode) {
    const categories = {
        'main': 'Үндсэн хоол',
        'salad': 'Салад',
        'drink': 'Ундаа',
        'dessert': 'Амттан'
    };
    
    return categories[categoryCode] || categoryCode;
}

// Захиалгын дүнг тооцоолох
function calculateOrderTotal() {
    let subtotal = 0;
    let itemCount = 0;
    
    state.order.forEach(item => {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;
    });
    
    state.subtotal = subtotal;
    state.tax = Math.round(subtotal * 0.1); // 10% татвар
    state.finalTotal = subtotal + state.tax + state.deliveryFee;
    
    console.log('Дүн тооцоолсон:', { 
        items: itemCount,
        subtotal: state.subtotal, 
        tax: state.tax, 
        delivery: state.deliveryFee,
        final: state.finalTotal 
    });
}

// Захиалгын UI шинэчлэх
function updateOrderUI() {
    console.log('Захиалгын UI шинэчлэж байна...');
    
    // Захиалга хоосон бол харуулах
    if (state.order.length === 0) {
        DOM.orderItems.innerHTML = EMPTY_ORDER_HTML;
        DOM.itemCount.textContent = '0';
        DOM.totalAmount.textContent = '0 ₮';
        DOM.subtotalAmount.textContent = '0 ₮';
        DOM.taxAmount.textContent = '0 ₮';
        DOM.finalAmount.textContent = '3,000 ₮';
        return;
    }
    
    // Захиалгын зүйлс HTML үүсгэх
    let totalItems = 0;
    const orderHTML = state.order.map(item => {
        totalItems += item.quantity;
        return `
            <div class="order-item" data-id="${item.id}">
                <div class="order-item-image">
                    <img src="${item.imageUrl || item.image || 'images/placeholder.jpg'}" 
                         alt="${item.name}"
                         onerror="this.src='images/placeholder.jpg'; this.onerror=null;">
                </div>
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-details">
                        <span>${item.quantity} x ${item.price.toLocaleString()} ₮</span>
                        <span class="order-item-price">
                            ${(item.price * item.quantity).toLocaleString()} ₮
                        </span>
                    </div>
                </div>
                <div class="order-item-controls">
                    <button class="decrease-order" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="remove-order" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    DOM.orderItems.innerHTML = orderHTML;
    
    // Тоонуудыг шинэчлэх
    DOM.itemCount.textContent = totalItems;
    DOM.totalAmount.textContent = `${state.subtotal.toLocaleString()} ₮`;
    DOM.subtotalAmount.textContent = `${state.subtotal.toLocaleString()} ₮`;
    DOM.taxAmount.textContent = `${state.tax.toLocaleString()} ₮`;
    DOM.finalAmount.textContent = `${state.finalTotal.toLocaleString()} ₮`;
    
    // Меню дээрх тоо шинэчлэх
    updateMenuQuantities();
    
    // LocalStorage-д хадгалах
    saveStateToLocalStorage();
    
    // Захиалгын event listener нэмэх
    attachOrderEventListeners();
}

// Меню дээрх тоог шинэчлэх
function updateMenuQuantities() {
    state.order.forEach(item => {
        const qtyElement = document.getElementById(`qty-${item.id}`);
        if (qtyElement) {
            qtyElement.textContent = item.quantity;
        }
    });
}

// Захиалгад нэмэх
function addToOrder(itemId, quantity = 1) {
    console.log(`Захиалгад нэмж байна: ${itemId} x${quantity}`);
    
    // Меню эд зүйл олох
    const menuItem = state.menu.find(item => item.id === itemId);
    if (!menuItem) {
        console.error(`Меню зүйл олдсонгүй: ${itemId}`);
        return;
    }
    
    // Захиалгад байгаа эсэхийг шалгах
    const existingItem = state.order.find(item => item.id === itemId);
    
    if (existingItem) {
        // Байгаа бол тоог нэмэгдүүлэх
        existingItem.quantity += quantity;
    } else {
        // Шинээр нэмэх
        const orderItem = {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: quantity,
            image: menuItem.image,
            imageUrl: menuItem.imageUrl
        };
        state.order.push(orderItem);
    }
    
    // Дүн тооцоолох
    calculateOrderTotal();
    
    // UI шинэчлэх
    updateOrderUI();
    
    // Амжилттай мэдээлэл харуулах
    showNotification(`${menuItem.name} захиалгад нэмэгдлээ`, 'success');
}

// Захиалгаас хасч тоог бууруулах
function decreaseOrderQuantity(itemId) {
    console.log(`Захиалгын тоог бууруулж байна: ${itemId}`);
    
    const orderItem = state.order.find(item => item.id === itemId);
    if (!orderItem) return;
    
    if (orderItem.quantity > 1) {
        // Тоог бууруулах
        orderItem.quantity -= 1;
    } else {
        // Тоо 1 бол устгах
        removeFromOrder(itemId);
        return;
    }
    
    calculateOrderTotal();
    updateOrderUI();
}

// Захиалгаас устгах
function removeFromOrder(itemId) {
    console.log(`Захиалгаас устгаж байна: ${itemId}`);
    
    // Filter ашиглан устгах
    state.order = state.order.filter(item => item.id !== itemId);
    
    calculateOrderTotal();
    updateOrderUI();
    
    // Мэдээлэл харуулах
    const menuItem = state.menu.find(item => item.id === itemId);
    if (menuItem) {
        showNotification(`${menuItem.name} захиалгаас хасагдлаа`, 'info');
    }
}

// Захиалгыг бүрэн цэвэрлэх
function clearOrder() {
    console.log('Захиалгыг цэвэрлэж байна...');
    
    if (state.order.length === 0) {
        showNotification('Захиалга хоосон байна', 'info');
        return;
    }
    
    if (confirm('Та захиалгаа цэвэрлэхдээ итгэлтэй байна уу?')) {
        state.order = [];
        calculateOrderTotal();
        updateOrderUI();
        showNotification('Захиалга цэвэрлэгдлээ', 'info');
    }
}

// Захиалгыг илгээх
function submitOrder() {
    console.log('Захиалгыг илгээж байна...');
    
    // Хэрэглэгчийн мэдээлэл шалгах
    if (!validateCustomerForm()) {
        showNotification('Хэрэглэгчийн мэдээллийг бүрэн оруулна уу', 'error');
        return;
    }
    
    // Захиалга шалгах
    if (state.order.length === 0) {
        showNotification('Захиалга хоосон байна', 'error');
        return;
    }
    
    // Төлбөрийн modal харуулах
    showPaymentModal();
}

// Хэрэглэгчийн форм баталгаажуулах
function validateCustomerForm() {
    const name = DOM.nameInput.value.trim();
    const phone = DOM.phoneInput.value.trim();
    const address = DOM.addressInput.value.trim();
    
    if (!name || !phone || !address) {
        // Алдааны талбар тодруулах
        if (!name) DOM.nameInput.focus();
        else if (!phone) DOM.phoneInput.focus();
        else if (!address) DOM.addressInput.focus();
        
        return false;
    }
    
    // Утасны дугаар шалгах
    const phoneRegex = /^\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        DOM.phoneInput.focus();
        showNotification('Утасны дугаарыг зөв оруулна уу (99119999)', 'error');
        return false;
    }
    
    // State-д хадгалах
    state.customer = {
        name: name,
        phone: phone,
        address: address,
        notes: DOM.notesInput.value.trim(),
        deliveryTime: DOM.deliveryTimeSelect.value
    };
    
    return true;
}

// Төлбөрийн modal харуулах
function showPaymentModal() {
    console.log('Төлбөрийн modal харуулж байна...');
    
    // Мэдээлэл бөглөх
    DOM.modalCustomerName.textContent = state.customer.name;
    DOM.modalCustomerAddress.textContent = state.customer.address;
    DOM.modalTotalAmount.textContent = `${state.finalTotal.toLocaleString()} ₮`;
    
    // Захиалгын дугаар үүсгэх
    const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
    DOM.orderNumber.textContent = orderNum;
    
    // Modal харуулах
    DOM.paymentModal.classList.add('active');
}

// Төлбөр төлөх
function processPayment() {
    console.log('Төлбөр төлөлт хийж байна...');
    
    showLoadingOverlay(true);
    
    // API дуудах (жишээ)
    setTimeout(() => {
        showLoadingOverlay(false);
        
        // Төлбөрийн modal хаах
        DOM.paymentModal.classList.remove('active');
        
        // Баталгаажуулалтын modal харуулах
        showConfirmationModal();
        
        // Захиалгыг сервер рүү илгээх (жишээ)
        sendOrderToServer();
        
    }, 2000);
}

// Ачааллын overlay харуулах
function showLoadingOverlay(show) {
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.toggle('active', show);
    }
}

// Захиалгыг сервер рүү илгээх (жишээ API)
async function sendOrderToServer() {
    try {
        const orderData = {
            order: state.order,
            customer: state.customer,
            subtotal: state.subtotal,
            tax: state.tax,
            deliveryFee: state.deliveryFee,
            finalTotal: state.finalTotal,
            timestamp: new Date().toISOString(),
            orderNumber: DOM.orderNumber.textContent
        };
        
        console.log('Захиалгыг илгээж байна:', orderData);
        
        // Энд API дуудаж болно
        const response = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        // Дэлгэцэнд мэдээлэл харуулах
        showNotification('Захиалга амжилттай илгээгдлээ', 'success');
        
    } catch (error) {
        console.error('Захиалга илгээхэд алдаа гарлаа:', error);
        showNotification('Захиалга илгээхэд алдаа гарлаа', 'error');
    }
}

// Баталгаажуулалтын modal харуулах
function showConfirmationModal() {
    console.log('Баталгаажуулалтын modal харуулж байна...');
    
    // Захиалгын дэлгэрэнгүй мэдээлэл бэлтгэх
    const deliveryTimeText = {
        'asap': 'Яаралтай',
        '30min': '30 минутын дараа',
        '1hour': '1 цагийн дараа',
        '2hour': '2 цагийн дараа'
    }[state.customer.deliveryTime];
    
    const orderItemsHTML = state.order.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>${item.name} x${item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString()} ₮</span>
        </div>
    `).join('');
    
    const orderDetailsHTML = `
        <p><strong>Захиалгын дугаар:</strong> ${DOM.orderNumber.textContent}</p>
        <p><strong>Захиалагч:</strong> ${state.customer.name}</p>
        <p><strong>Утас:</strong> ${state.customer.phone}</p>
        <p><strong>Хаяг:</strong> ${state.customer.address}</p>
        <p><strong>Хүргэх цаг:</strong> ${deliveryTimeText}</p>
        <hr style="margin: 1rem 0; border-color: var(--border-color);">
        <h5 style="margin-bottom: 0.8rem;">Захиалгын дэлгэрэнгүй:</h5>
        ${orderItemsHTML}
        <hr style="margin: 1rem 0; border-color: var(--border-color);">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Нийт дүн:</span>
            <span>${state.finalTotal.toLocaleString()} ₮</span>
        </div>
        ${state.customer.notes ? `
            <hr style="margin: 1rem 0; border-color: var(--border-color);">
            <p><strong>Тэмдэглэл:</strong> ${state.customer.notes}</p>
        ` : ''}
    `;
    
    DOM.orderDetails.innerHTML = orderDetailsHTML;
    DOM.confirmationMessage.textContent = 'Таны захиалга амжилттай хүлээн авлаа!';
    
    // Modal харуулах
    DOM.confirmationModal.classList.add('active');
    
    // Захиалгыг цэвэрлэх
    state.order = [];
    calculateOrderTotal();
    updateOrderUI();
    
    // Формыг цэвэрлэх
    DOM.customerForm.reset();
    state.customer = { 
        name: '', 
        phone: '', 
        address: '', 
        notes: '', 
        deliveryTime: 'asap' 
    };
    DOM.deliveryTimeSelect.value = 'asap';
}

// Event listener-уудыг бүртгэх
function setupEventListeners() {
    console.log('Event listener-уудыг бүртгэж байна...');
    
    // Категори шүүлтүүр
    DOM.categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Бүх товчнуудад active класс хасах
            DOM.categoryBtns.forEach(b => b.classList.remove('active'));
            
            // Дарсан товчинд active класс нэмэх
            this.classList.add('active');
            
            // Категориар меню шүүх
            state.currentCategory = this.getAttribute('data-category');
            renderMenuItems();
        });
    });
    
    // Хайлтын хэсэг
    if (DOM.menuSearch) {
        DOM.menuSearch.addEventListener('input', function() {
            state.searchQuery = this.value;
            renderMenuItems();
        });
    }
    
    // Захиалга илгээх
    DOM.submitOrder.addEventListener('click', submitOrder);
    
    // Захиалга цэвэрлэх
    DOM.clearOrder.addEventListener('click', clearOrder);
    
    // Форм submit
    DOM.customerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
    
    // Төлбөрийн modal
    DOM.closeModal.addEventListener('click', () => {
        DOM.paymentModal.classList.remove('active');
    });
    
    DOM.cancelPayment.addEventListener('click', () => {
        DOM.paymentModal.classList.remove('active');
    });
    
    DOM.confirmPayment.addEventListener('click', processPayment);
    
    // Баталгаажуулалтын modal
    DOM.closeConfirmation.addEventListener('click', () => {
        DOM.confirmationModal.classList.remove('active');
    });
    
    // Modal-ын гадна товшиж хаах
    [DOM.paymentModal, DOM.confirmationModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Гэрлийн горим солих
    DOM.themeToggle.addEventListener('click', toggleDarkMode);
    
    // Window event listener
    window.addEventListener('beforeunload', () => {
        saveStateToLocalStorage();
    });
}

// Меню event listener-уудыг бүртгэх
function attachMenuEventListeners() {
    // Нэмэх товчнууд
    document.querySelectorAll('.add-to-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            addToOrder(itemId, 1);
        });
    });
    
    // Тоо нэмэгдүүлэх товчнууд
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            addToOrder(itemId, 1);
        });
    });
    
    // Тоо бууруулах товчнууд
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            decreaseOrderQuantity(itemId);
        });
    });
}

// Захиалгын event listener-уудыг бүртгэх
function attachOrderEventListeners() {
    // Тоо бууруулах товчнууд
    document.querySelectorAll('.decrease-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            decreaseOrderQuantity(itemId);
        });
    });
    
    // Устгах товчнууд
    document.querySelectorAll('.remove-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            removeFromOrder(itemId);
        });
    });
}

// Хэрэглэгчийн форм дэлгэцэнд харуулах
function updateCustomerForm() {
    DOM.nameInput.value = state.customer.name;
    DOM.phoneInput.value = state.customer.phone;
    DOM.addressInput.value = state.customer.address;
    DOM.notesInput.value = state.customer.notes;
    DOM.deliveryTimeSelect.value = state.customer.deliveryTime;
}

// Гэрлийн горим солих
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const icon = DOM.themeToggle.querySelector('i');
    const text = isDarkMode ? ' Гэрийн горим' : ' Гэрлийн горим';
    
    icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    DOM.themeToggle.innerHTML = icon.outerHTML + text;
    
    // LocalStorage-д хадгалах
    localStorage.setItem('darkMode', isDarkMode);
}

// Мэдэгдэл харуулах
function showNotification(message, type = 'info') {
    console.log(`Мэдэгдэл: ${message} (${type})`);
    
    if (!DOM.notificationMessage) return;
    
    DOM.notificationMessage.textContent = message;
    DOM.notificationMessage.className = `notification-message ${type}`;
    DOM.notificationMessage.style.display = 'block';
    
    // 3 секундын дараа автоматаар нуух
    setTimeout(() => {
        DOM.notificationMessage.style.display = 'none';
    }, 3000);
}

// LocalStorage-д state хадгалах
function saveStateToLocalStorage() {
    const stateToSave = {
        order: state.order,
        customer: state.customer,
        subtotal: state.subtotal,
        tax: state.tax,
        finalTotal: state.finalTotal,
        currentCategory: state.currentCategory
    };
    
    localStorage.setItem('restaurantOrderState', JSON.stringify(stateToSave));
    console.log('State LocalStorage-д хадгаллаа');
}

// LocalStorage-аас state сэргээх
function restoreStateFromLocalStorage() {
    try {
        const savedState = localStorage.getItem('restaurantOrderState');
        
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            state.order = parsedState.order || [];
            state.customer = parsedState.customer || { 
                name: '', 
                phone: '', 
                address: '', 
                notes: '',
                deliveryTime: 'asap'
            };
            state.subtotal = parsedState.subtotal || 0;
            state.tax = parsedState.tax || 0;
            state.finalTotal = parsedState.finalTotal || 3000;
            state.currentCategory = parsedState.currentCategory || 'all';
            
            console.log('State LocalStorage-аас сэргээлээ:', parsedState);
            
            // Дүн тооцоолох
            calculateOrderTotal();
        }
        
        // Харанхуй горимын тохиргоо сэргээх
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            const icon = DOM.themeToggle.querySelector('i');
            icon.className = 'fas fa-sun';
            DOM.themeToggle.innerHTML = icon.outerHTML + ' Гэрийн горим';
        }
        
    } catch (error) {
        console.error('LocalStorage-аас state сэргээхэд алдаа гарлаа:', error);
    }
}

// DOM бүрэн ачаалагдсан эсэхийг шалгах
document.addEventListener('DOMContentLoaded', initApp);

console.log('JavaScript файл ачаалагдлаа. Рестораны захиалгын систем бэлэн.');