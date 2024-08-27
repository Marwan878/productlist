"use strict";
const dessertsContainer = document.getElementById("desserts-container");
const addedItemsContainer = document.getElementById("added-items-container");
const emptyCartImage = document.getElementById("empty-cart-image");
const emptyCartMessage = document.getElementById("empty-cart-message");
const cartTotalItems = document.getElementById("total-items");
const orderTotal = document.getElementById("order-total");
const fullCartContainer = document.getElementById("full-cart-container");
const confirmOrderBtn = document.getElementById("confirm-order");
const confirmedItems = document.getElementById("confirmed-items");
const checkout = document.getElementById("checkout");
const overlay = document.getElementById("overlay");
const confirmedTotal = document.getElementById("confirmed-total");
const startNewOrderBtn = document.getElementById("start-new-order");

let countControllers;
let incrementBtns;
let decrementBtns;
let dessertsImages;
let addToCartBtns;
let deleteBtns;

class ShoppingCart {
    constructor() {
        this.items = {}
        this.total = 0;
        this.totalItems = 0
    }
    addDessert(index) {
        fetch("./data.json")
        .then(res => res.json())
        .then(desserts => {
            this.totalItems++;
            emptyCartImage.style.display = "none";
            emptyCartMessage.style.display = "none";
            fullCartContainer.style.display = "flex";
            dessertsImages[index].classList.add("border-red");
            const dessert = desserts[index];
            const { name, price } = dessert;
            this.total += price;

            if(this.items.hasOwnProperty(index)) {
                this.items[index].quantity = this.items[index].quantity + 1;
            } else {
                this.items[index] = {
                    name: name,
                    price: price,
                    quantity: 1,
                    id: dessert.id,
                    url: dessert.image.thumbnail,
                }
            }

            const currentProductCount = this.items[index].quantity;

            if(currentProductCount > 1) {
                const currentProductCountSpans = document.querySelectorAll(`.product-count-for-id${dessert.id}`);
                const currentProductTotalSpan = document.getElementById(`product-total-for-id${dessert.id}`);
                currentProductCountSpans[0].textContent = `${currentProductCount}`;
                currentProductCountSpans[1].textContent = `${currentProductCount}x`;
                currentProductTotalSpan.textContent = `$${price * currentProductCount}`;
            } else {
                addedItemsContainer.innerHTML += `
                    <div class="cart-dessert">
                        <div class="left">
                            <div class="top">${name}</div>
                            <div class="bottom">
                                <span class="product-count product-count-for-id${dessert.id}" id="product-count-for-id${dessert.id}">${currentProductCount}x</span>
                                <span class="price-per-item">@ $${price}</span>
                                <span class="total-price-for-dessert" id="product-total-for-id${dessert.id}">$${price}</span>
                            </div>
                        </div>
                        <button class="remove-from-cart" data-id=${dessert.id}></button>
                    </div>
                `;
                const deleteBtns = document.querySelectorAll(".remove-from-cart");
                deleteBtns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        this.deleteDessert(btn.dataset.id);
                    });
                });
            }

            const dessertCardQuantitySpan = document.querySelector(`span.product-count-for-id${index}`);
            dessertCardQuantitySpan.textContent = currentProductCount;
            this.displayCartTotalItems();
            this.displayCartTotal();
        });
    }
    decrementDessert(id) {
        this.totalItems--;
        this.items[id].quantity = this.items[id].quantity - 1;
        this.total -= this.items[id].price;
        const dessertCardQuantitySpans = document.querySelectorAll(".count-controller-product-count");
        dessertCardQuantitySpans[id].textContent = this.items[id].quantity;

        if(this.items[id].quantity == 0) {
            countControllers[id].style.display = "none";
            addToCartBtns[id].style.display = "flex";
            dessertsImages[id].classList.remove("border-red");
            delete this.items[id];
        }

        if(Object.values(this.items).every(obj => obj.quantity == 0)) {
            emptyCartImage.style.display = "block";
            emptyCartMessage.style.display = "block";
            addedItemsContainer.innerHTML = "";
            fullCartContainer.style.display = "none"
        } else {
            this.updateCartItems();
            const deleteBtns = document.querySelectorAll(".remove-from-cart");
            deleteBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.deleteDessert(btn.dataset.id);
                })
            })
        }
        this.displayCartTotalItems();
        this.displayCartTotal();
    }
    deleteDessert(id) {
        const { quantity, price } = this.items[id];
        this.totalItems -= quantity;
        this.total -= price * quantity
        delete this.items[id];
        countControllers[id].style.display = "none";
        addToCartBtns[id].style.display = "flex";
        dessertsImages[id].classList.remove("border-red");

        if(Object.values(this.items).every(obj => obj.quantity == 0)) {
            emptyCartImage.style.display = "block";
            emptyCartMessage.style.display = "block";
            addedItemsContainer.innerHTML = "";
            fullCartContainer.style.display = "none"
        } else {
            this.updateCartItems();
            const deleteBtns = document.querySelectorAll(".remove-from-cart");
            deleteBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.deleteDessert(btn.dataset.id);
                })
            })
        }
        this.displayCartTotal();
        this.displayCartTotalItems();
    }
    updateCartItems() {
        addedItemsContainer.innerHTML = "";
        const itemsValues = Object.values(this.items);
        itemsValues.forEach(itemValue => {
            const { quantity, name, price, id } = itemValue;
            (quantity > 0) && (addedItemsContainer.innerHTML += `
                <div class="cart-dessert">
                    <div class="left">
                        <div class="top">${name}</div>
                        <div class="bottom">
                            <span class="product-count product-count-for-id${id}" id="product-count-for-id${id}">${quantity}x</span>
                            <span class="price-per-item">@ $${price}</span>
                            <span class="total-price-for-dessert" id="product-total-for-id${id}">$${price * quantity}</span>
                        </div>
                    </div>
                    <button class="remove-from-cart" data-id=${id}></button>
                </div>
            `)
        });
    }
    displayCartTotalItems() {
        cartTotalItems.textContent = this.totalItems;
    }
    displayCartTotal() {
        orderTotal.textContent = "$" + this.total;
    }
    displayCheckout() {
        overlay.style.display = "block";
        checkout.style.display = "flex";
        Object.values(this.items).forEach(item => {
            confirmedItems.innerHTML += `
                <div class="confirmed-item">
                    <img src=${item.url} />
                    <div class="middle">
                        <div class="top">${item.name}</div>
                        <div class="bottom">
                            <span class="product-count">${item.quantity}x</span>
                            <span class="price-per-item">@ $${item.price}</span>
                        </div>
                    </div>
                    <div class="confirmed-price-total">$${item.price * item.quantity}</div>
                </div>
            `;
        });
        confirmedTotal.textContent = "$" + this.total;
    }
}

const cart = new ShoppingCart();

const displayDesserts = (desserts) => {
        desserts.forEach((dessert) => {
        dessertsContainer.innerHTML += `
        <div class="dessert-container">
            <div class="image-container">
                <img 
                    src=${dessert.image.mobile} 
                    alt="${dessert.name} image."
                    class="dessert-image"
                >
                <button class="add-to-cart incrementer" data-id="${dessert.id}">
                    <img src="./assets/images/icon-add-to-cart.svg"/> Add to Cart
                </button>
                <div style="display: none;" class="count-controller">
                    <button class="decrementer" data-id="${dessert.id}"></button>
                    <span class="product-count-for-id${dessert.id} count-controller-product-count"></span>
                    <button class="incrementer" data-id="${dessert.id}"></button>
                </div>
            </div>
            <div class="dessert-details">
                <span class="dessert-category">${dessert.category}</span>
                <span class="dessert-name">${dessert.name}</span>
                <span class="dessert-price">$${dessert.price}</span>
            </div>
        </div>
        `;
    });
}
const changeImages = async () => {
    const res = await fetch("./data.json");
    const desserts = await res.json();
    let device = "";

    if(window.innerWidth <= 767) {
        device = "mobile"
    } else if (window.innerWidth <= 991) {
        device = "tablet"
    } else {
        device = "desktop"
    }

    dessertsImages.forEach((dessertImage, index) => {
        const dessertObject = desserts[index];
        dessertImage.setAttribute("src", dessertObject.image[device]);
    });
}

const resetApp = () => {
    overlay.style.display = "none";
    checkout.style.display = "none";
    confirmedItems.innerHTML = "";
    cart.items = {}
    cart.total = 0;
    cart.totalItems = 0;
    emptyCartImage.style.display = "block";
    emptyCartMessage.style.display = "block";
    fullCartContainer.style.display = "none";
    addedItemsContainer.innerHTML = "";
    fullCartContainer.style.display = "none";
    cart.displayCartTotalItems();
    for(let i = 0; i < dessertsImages.length; i++) {
        dessertsImages[i].classList.remove("border-red");
        countControllers[i].style.display = "none";
        addToCartBtns[i].style.display = "flex";
    }
}

fetch("./data.json")
.then(res => res.json())
.then(desserts => {
    displayDesserts(desserts);
    dessertsImages = document.querySelectorAll(".dessert-image");
    incrementBtns = document.querySelectorAll(".incrementer");
    decrementBtns = document.querySelectorAll(".decrementer");
    countControllers = document.querySelectorAll(".count-controller");
    addToCartBtns = document.querySelectorAll("button.add-to-cart");  
    changeImages();
    addToCartBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            btn.style.display = "none";
            countControllers[index].style.display = "flex";
        })
    })
    incrementBtns.forEach((btn) => {
        btn.addEventListener("click", () =>  {
            cart.addDessert(btn.dataset.id);
        });
    });
    decrementBtns.forEach(btn => {
        btn.addEventListener("click", () =>  cart.decrementDessert(btn.dataset.id));
    });

})
.catch(err => {console.error(err)});

window.addEventListener("resize", changeImages);
confirmOrderBtn.addEventListener("click", cart.displayCheckout.bind(cart));
startNewOrderBtn.addEventListener("click", resetApp);