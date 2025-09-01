document.addEventListener("DOMContentLoaded", () => {
  const addProductBtns = document.querySelectorAll(".addproductbtn");
  const allUsersBtns = document.querySelectorAll(".alluserbtn");
  const allProductsBtns = document.querySelectorAll(".allproductbtn");

  const addProductContainer = document.querySelector(".addproduct-container");
  const allUsersContainer = document.querySelector(".allusers-container");
  const allProductsContainer = document.querySelector(".allproducts-container");

  function hideAll() {
    addProductContainer.classList.add("hidden");
    allUsersContainer.classList.add("hidden");
    allProductsContainer.classList.add("hidden");
  }

  // Loop through all Add Product buttons (desktop + mobile)
  addProductBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      hideAll();
      addProductContainer.classList.remove("hidden");
      console.log("Add Product button clicked");
    });
  });

  // Loop through all All Users buttons
  allUsersBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      hideAll();
      allUsersContainer.classList.remove("hidden");
      console.log("All Users button clicked");
    });
  });

  // Loop through all All Products buttons
  allProductsBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      hideAll();
      allProductsContainer.classList.remove("hidden");
      console.log("All Products button clicked");
    });
  });
});
