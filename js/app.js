function handleMenu(nav, togglers) {

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

(function(){
  var nav = document.getElementById("nav");
  var btns = document.querySelectorAll(".js-toggle");

  nav.classList.add("nav--closed");
  handleMenu(nav, btns);
})();


ymaps.ready(init);
  var myMap;
  var map = document.getElementById("map");
  var latitude = map.getAttribute("data-latitude");
  var longitude = map.getAttribute("data-longitude");

  function init() {
    myMap = new ymaps.Map("map", {
        center: [latitude, longitude],
        zoom: [16],
        controls: []
      }),
      myMap.behaviors.disable("scrollZoom");
    myMap.controls.add("zoomControl");

    myPlacemark = new ymaps.Placemark([latitude, longitude], {
      hintContent: "г. Санкт-Петербург, ул. Б. Конюшенная, д. 19/8",
    }, {
      iconLayout: "default#image",
      iconImageHref: "./img/icon-map-marker.svg",
      iconImageSize: [20, 20],
      iconImageOffset: [0, 0]
    });

    myMap.geoObjects.add(myPlacemark);
  }
