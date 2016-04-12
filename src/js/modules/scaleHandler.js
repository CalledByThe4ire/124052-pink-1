function scaleHandler() {
  var scales = document.querySelectorAll('.js-scale');

  for (var i = scales.length - 1; i >= 0; i--) {
    var scale = scales[i];
    var thumb = scale.children[0];

    // function thumbMove(scale) {
    //
    // }

    thumb.onmousedown = function(e) {
      var thumbCoords = getCoords(thumb);
      var shiftX = e.pageX - thumbCoords.left;
      // shiftY здесь не нужен, слайдер двигается только по горизонтали

      var scaleCoords = getCoords(scale);

      document.onmousemove = function(e) {
        //  вычесть координату родителя, т.к. position: relative
        var newLeft = e.pageX - shiftX - scaleCoords.left;

        // курсор ушёл вне слайдера
        if (newLeft < 0) {
          newLeft = 0;
        }
        var rightEdge = scale.offsetWidth - thumb.offsetWidth;
        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        thumb.style.left = newLeft + 'px';
      }

      document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null;
      };

      return false; // disable selection start (cursor change)
    };

    thumb.ondragstart = function() {
      return false;
    };

    function getCoords(elem) { // кроме IE8-
      var box = elem.getBoundingClientRect();

      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
      };
    }

  }
}
