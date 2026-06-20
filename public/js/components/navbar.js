let mobileButton = document.querySelector(".nav-toggle");
let mobileNav = document.querySelector("#mobile-nav-panel");
let iconBurger = document.querySelector(".icon-burger");
let iconClose = document.querySelector(".icon-close");

mobileButton.addEventListener("click", (e) => {
  e.preventDefault();

  iconBurger.classList.toggle("d-none");
  iconClose.classList.toggle("d-block");
  mobileNav.classList.toggle("d-none")
});