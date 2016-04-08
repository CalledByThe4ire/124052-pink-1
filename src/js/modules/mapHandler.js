function mapHandler() {

  if (!window.ymaps) {
    return;
  }

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
      iconImageSize: [36, 36],
      iconImageOffset: [-10, -5]
    });

    myMap.geoObjects.add(myPlacemark);
  }
}
