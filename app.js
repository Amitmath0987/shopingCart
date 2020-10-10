const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "jzq85ld3wz27",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "J6nQSr7kNmztqBM0Us5v1xbhLlni7LET16_AkBaacxQ"
})

// selecting element
//----declaring variables-----
const cartbtn = document.querySelector(".cart-btn");
const cartitems = document.querySelector(".cart-items");
const cartclosebtn = document.querySelector(".close-cart");
const cartoverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartcontent = document.querySelector(".cart-content");
const carttotal = document.querySelector(".cart-total");
const clearcartbtn = document.querySelector(".clear-cart");
const productDom = document.querySelector(".products-center");

//------ cart --------
let cart = [];
//--------buttons-----
let buttonDom = [];
console.log(buttonDom);

//getting the products
class Products {
  async getProducts() {
    try {

     let contentfull = await client.getEntries({
      content_type: 'compfyhouseProducts'
     });

      // let result = await fetch("products.json");
      // let data = await result.json();

      let products = contentfull.items;
      products = products.map((item) => {
        //destructuring the data
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(`the error: ${error}`);
    }
  }
}

// display product
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
           <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i> add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>

        <!-- End of single product-->
           `;
    });
    productDom.innerHTML = result;
    // console.log(products);
  }
  getbagBtn() {
    const btn = [...document.querySelectorAll(".bag-btn")];
    buttonDom = btn;

    btn.forEach((button) => {
      let id = button.dataset.id;
      //check in cart for the item is there
      let incart = cart.find((item) => item.id === id);
      // console.log(incart);
      if (incart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products storage where we store
        let cartItem = { ...Storage.getStorageProduct(id), amount: 1 };
        // console.log(cartItem);

        // add product to the cart array
        cart = [...cart, cartItem];
        // console.log(cart);

        // save cart in local storage
        Storage.savecartLocal(cart);

        // set cart values( that how many values in cart)
        this.setCartValues(cart);
        // console.log(this);

        // display cart item(display the items in the cart)
        this.displayCartItem(cartItem);
        //show the cart(overlay)
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    carttotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartitems.innerText = itemsTotal;
    // console.log(carttotal,cartitems);
  }

  displayCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
    cartcontent.appendChild(div);
  }
  showCart() {
    cartoverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.displayCartItem(item);
    });
  }
  //this function set the cart(cart-items,cartDom) according to the localstorage data
  setupAPP() {
    cart = Storage.getCart();
    // console.log(cart);
    this.setCartValues(cart);
    this.populateCart(cart);
    cartbtn.addEventListener("click", this.showCart);
    cartclosebtn.addEventListener("click", this.hideCart);
    // set the cart values
  }
  hideCart() {
    cartoverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    // clear cart button
    //by using Arrow function this points to the main class
    clearcartbtn.addEventListener("click", () => this.clearCart());

    // cart functionality
    cartcontent.addEventListener("click", (event) => {
      // -----Logic for removing the specific item from cart--------
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;

        // first step:get id
        let id = removeItem.dataset.id;

        //remove that child from cartDOM
        // remove from cartDOM
        let parentCard = removeItem.parentElement.parentElement;
        // parentCard.classList.add("fall");
        // parentCard.addEventListener("transitionend", function () {

        // });
        cartcontent.removeChild(parentCard);

        // remove the specific item of that dataset-id
        this.removeItem(id);
      }

      // ------ Logic for increasing the items-----------
      else if (event.target.classList.contains("fa-chevron-up")) {
        // increase amount by 1
        // first we get the current amount of cart item
        let amountAdd = event.target;

        let id = amountAdd.dataset.id;
        // console.log(id);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.savecartLocal(cart);
        this.setCartValues(cart);
        amountAdd.nextElementSibling.innerText = tempItem.amount;
        
      }

     // ------ Logic for decreasing the items-----------
     else if (event.target.classList.contains("fa-chevron-down")) {
       //decrease amount by 1
       let loweramount = event.target;
       let id = loweramount.dataset.id;
       let tempItem = cart.find((item) => item.id === id);
       tempItem.amount = tempItem.amount - 1;
       if(tempItem.amount > 0){
        Storage.savecartLocal(cart);
        this.setCartValues(cart);
       loweramount.previousElementSibling.innerText = tempItem.amount;
       }
       else{
         cartcontent.removeChild(loweramount.parentElement.parentElement);
         this.removeItem(id);
       }
       
     }

    });
  }
  clearCart() {
    // get all available cart id
    let cartItems = cart.map((item) => item.id);
    // // console.log(cartItems);
    // loop over the cartItems which have id of the cart
    cartItems.forEach((id) => this.removeItem(id));
    // console.log(cartcontent.children.length);
    while (cartcontent.children.length > 0) {
      cartcontent.removeChild(cartcontent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    // this will filter the cart which have not matching id
    cart = cart.filter((item) => item.id !== id);
    // now set the new updated cart value
    this.setCartValues(cart);
    // save the new cart in the storage
    Storage.savecartLocal(cart);
    //now we want to set the bag-button "In Cart" to "Add to Cart"
    // so we want the button id that we want to update
    let button = this.getSingleButton(id);
    // console.log(button);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
  }
  // this function will return an specific button that we pass in its argument
  getSingleButton(id) {
    return buttonDom.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveLocalstorage(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getStorageProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static savecartLocal(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //   setuppAPP
  ui.setupAPP();

  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveLocalstorage(products);
    })
    .then(() => {
      ui.getbagBtn();
      ui.cartLogic();
    });
});
