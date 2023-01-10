import { productsData } from "./product.js"
const showModalBtn = document.querySelector(".fa-cart-shopping");
const modal = document.querySelector(".modal");
const backDrop = document.querySelector(".backdrop");
const closeBtn = document.querySelector(".clear-cart");
const confirm = document.querySelector(".confirm-modal")
// modal

const cartTotal = document.querySelector(".cart-total");
const productsDOM = document.querySelector(".products");
const navbarShoppingItem = document.querySelector(".navBar-shopping-item");
const cartContents = document.querySelector(".cartContent")
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDOM = [];
// 1.get product
class Product{
 getProduct(){
    return productsData;
 }
}
// 2.display product
class UI{
 displayProducts(products){
    let result = '';
    products.forEach((item) => {
        result += ` <div class="product-item">
        <div class="product-img">
            <img src=${item.imageUrl} />
        </div>
        <div class="product-text">
          <p class="product-price">${item.price}$</p>
          <p class="product-name">${item.title}</p>
        </div>
        <div class="product-btn">
           <button class="buy-btn" data-id=${item.id}>Buy</button>
        </div>
       </div>`
    });
    productsDOM.innerHTML = result;
 }
 getAddToCartBtns(){
    const addToCartBtn = [...document.querySelectorAll(".buy-btn")];
    buttonsDOM = addToCartBtn; 
    addToCartBtn.forEach((btn) => {
        const id = btn.dataset.id;
        // cheack if this product id is in cart
        const isInCart = cart.find((p) => p.id === parseInt(id));
        if(isInCart){
            btn.innerText = "In Cart";
            btn.disabled = true;
        }
        btn.addEventListener("click" , (event) => {
            event.target.innerText = "In Cart";
            event.target.disabled = true;
            // get product from products
            const addedProduct = {...Storage.getProducts(id),quantity: 1};
            // add to cart
            cart = [...cart, addedProduct];
            // save cart to lockal Storage
            Storage.saveCart(cart);
            // update cart value
            this.setCartValue(cart);
            // add to cart item
            this.addCartItem(addedProduct);
        })
    })
    console.log(addToCartBtn)
 }
 setCartValue(cart){
    // 1. cart Items
    // 2. cart Total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc,curr) => {
        tempCartItems += curr.quantity; // 2 + 1 => 3
        return acc + curr.quantity * curr.price;
    } , 0);
    cartTotal.innerText = `total price : ${totalPrice.toFixed(1)}$`;
    navbarShoppingItem.innerText = tempCartItems;
 }
 addCartItem(cartItem){
    const div = document.createElement("div");
    div.classList.add("cartModal-item");
    div.innerHTML = ` 
  <div class="cartModal-img">
    <img src=${cartItem.imageUrl} />
  </div>
  <div class="cartModal-price">
    <h4>${cartItem.title}</h4>
    <p>$${cartItem.price}</p>
  </div>
  <div class="cartModal-icon">
    <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
    <span>${cartItem.quantity}</span>
    <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
  </div>
  <i class="fa-solid fa-trash" data-id=${cartItem.id}></i>`;
  cartContents.appendChild(div);
 }
 setupApp(){
    // get cart from Storage
     cart = Storage.getCart();
    // add Cart in the modal
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    // setValues 
    this.setCartValue(cart);
 }
 cartLogic(){
   // clear cart
   clearCart.addEventListener("click" , () => this.clearCarts());
   
   // cart functionality 
    cartContents.addEventListener("click" , (event) => {
      if(event.target.classList.contains("fa-chevron-up")){
        console.log(event.target.dataset.id);
        const addQuantity = event.target;
        // get item from cart
        // save cart
        // update cart value
        const addedItem = cart.find((cItem) => cItem.id == addQuantity.dataset.id);
        addedItem.quantity++;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      }else if(event.target.classList.contains("fa-trash")){
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
         
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContents.removeChild(removeItem.parentElement)
      }else if(event.target.classList.contains("fa-chevron-down")){
        const subQuantity = event.target;
        const _subQunatitys = cart.find((c) => c.id == subQuantity.dataset.id);
         
        if(_subQunatitys.quantity === 1){
          this.removeItem(_subQunatitys.id);
          cartContents.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        _subQunatitys.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = _subQunatitys.quantity;
      }
    })
 }
 clearCarts(){
  // removeItem 
  cart.forEach((cItem) => this.removeItem(cItem.id));
  // remove cart content children
  while(cartContents.children.length){
     cartContents.removeChild(cartContents.children[0]);
  };
  closeModal();
 }
 removeItem(id){
    // update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // total price and cart items
    this.setCartValue(cart);
    // update Storage
    Storage.saveCart(cart);
    // get add to cart btns => update text and disabled
    const btn = buttonsDOM.find((btn) => btn.dataset.id == parseInt(id));
    btn.innerText = "Buy";
    btn.disabled = false;
 }
}
//3.save in Storage
class Storage{
    static saveProducts(products){
      localStorage.setItem("products" , JSON.stringify(products));
    }
    static getProducts(id){
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id === parseInt(id));
    }
    static saveCart(cart){
        localStorage.setItem("cart" ,JSON.stringify(cart));
    }
    static getCart(){
        return JSON.parse(localStorage.getItem("cart")) ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded" , () => {
    const products = new Product();
    const productData = products.getProduct();
    const ui = new UI();
    ui.setupApp();
    ui.displayProducts(productData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productData);
});

showModalBtn.addEventListener('click', () => {
    modal.style.opacity = "1";
    backDrop.style.display = "block";
    modal.style.transform = "translateY(20vh)"
})

function closeModal(){
    modal.style.opacity = "0";
    modal.style.transform = "translateY(-100vh)"
    backDrop.style.display = "none";
};

closeBtn.addEventListener("click" , closeModal);
backDrop.addEventListener("click" , closeModal);

confirm.addEventListener("click", () => {
    alert("modal is empty ...");
    closeModal();
})
console.log("reza")
