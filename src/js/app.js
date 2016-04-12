(function(){

  svg4everybody();

  document.getElementById("nav") && menuHandler();

  document.getElementById("map") && mapHandler();

  document.querySelector('.js-scale') && scaleHandler();

})();
