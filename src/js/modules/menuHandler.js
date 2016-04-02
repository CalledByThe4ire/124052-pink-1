function menuHandler() {
  var nav = document.getElementById("nav");
  var btns = document.querySelectorAll(".js-toggle");

  nav.classList.add("nav--closed");


  addListeners(nav, btns);

  function addListeners(nav, togglers) {

    function onToggleClick(event){
      event.preventDefault();
      nav.classList.toggle("nav--closed");
      nav.classList.toggle("nav--opened");
    }

    for (var i = togglers.length - 1; i >= 0; i--) {
      var toggler = togglers[i];
      toggler.addEventListener("click", onToggleClick);
    }
  }

}
