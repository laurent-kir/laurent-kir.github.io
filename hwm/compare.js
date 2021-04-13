(function(elem) {
  'use strict';
  var frameLeft = elem.parentNode.children[0];
  var frameRight = frameLeft.nextElementSibling;
  var width = elem.offsetWidth, max = window.innerWidth, test;

  function resize(n) {
    elem.style.left = frameLeft.style.width = n + 'px';
    frameRight.style.width = max - n + 'px';
  }

  elem.addEventListener('mousedown', function(e) {
    test = 1;
    resize(e.clientX);
  });

  document.addEventListener('mouseup', function(e) {
    test = 0;
  });

  document.addEventListener('mousemove', function(e) {
    var cx = test && e.clientX;
    return (!test || cx > max) ? 0 : resize(cx);
  });

  window.addEventListener('resize', function(e) {
    max = this.innerWidth;

    var left = parseInt(elem.style.left) >> 0;

    if (left && left === parseInt(frameRight.style.width) >> 0) return (elem.style.left = frameLeft.style.width = frameRight.style.width = (max / 2 >> 0) + 'px');
    if (left > max) left = max;

    resize(left || max / 2);
  });
})(document.querySelector('.range'));