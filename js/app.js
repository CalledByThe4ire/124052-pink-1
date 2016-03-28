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

  function init() {
    myMap = new ymaps.Map("map", {
        center: [59.938429885190054, 30.32991749740603],
        zoom: [16],
        controls: []
      }),
      myMap.behaviors.disable("scrollZoom");
    myMap.controls.add("zoomControl");

    myPlacemark = new ymaps.Placemark([59.93866675783276,30.32307250000002], {
      hintContent: "г. Санкт-Петербург, ул. Б. Конюшенная, д. 19/8",
    }, {
      iconLayout: "default#image",
      iconImageHref: "./img/icon-map-marker.svg",
      iconImageSize: [218, 142],
      iconImageOffset: [-38, -125]
    });

    myMap.geoObjects.add(myPlacemark);
  }
