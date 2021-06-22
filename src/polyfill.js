(function() {
  const baseElm = {
    style: {},

    children: [],

    className: "",

    appendChild: function() {},
    setAttribute: function() {},
    replaceChild: function() {},
    removeEventListener: function() {},
    addEventListener: function() {},

    getBoundingClientRect: function() {
      return {
        width: 0,
        height: 0,
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
      };
    }
  };

  const touchStarts = new Set(["mousedown", "touchstart"]);
  const touchMoves = new Set(["mousemove", "touchmove"]);
  const touchEnds = new Set(["mouseup", "touchend"]);
  
  /**
   * 把 source 里 target 没有的属性赋给 target
   */
  function fillObj(target, source) {
    for (let key of Object.getOwnPropertyNames(source)) {
      if (!target[key]) {
        target[key] = source[key];
      }
    }

    return target;
  }

  window.mockDocument = {
    createElement: function(tag) {
      let elm = Object.assign({}, baseElm);

      if (tag === "canvas") {
        const canvas = window["__curHippySkiaCanvasInstance__"];
        if (!canvas) return elm;

        canvas._addEventListener = canvas.addEventListener || function() {};
        canvas._removeEventListener = canvas.removeEventListener || function() {};
        canvas.addEventListener = function(eventName, cb) {
          if (touchStarts.has(eventName)) {
            canvas._addEventListener("touchstart", cb);
          } else if (touchMoves.has(eventName)) {
            canvas._addEventListener("touchmove", cb);
          } else if(touchEnds.has(eventName)) {
            canvas._addEventListener("touchend", cb);
          } else if (eventName === "touchcancel") {
            canvas._addEventListener("touchcancel", cb);
          }
        }
        canvas.removeEventListener = function(eventName, cb) {
          if (!canvas._removeEventListener) return ;

          if (touchStarts.has(eventName)) {
            canvas._removeEventListener("touchstart", cb);
          } else if (touchMoves.has(eventName)) {
            canvas._removeEventListener("touchmove", cb);
          } else if(touchEnds.has(eventName)) {
            canvas._removeEventListener("touchend", cb);
          } else if (eventName === "touchcancel") {
            canvas._removeEventListener("touchcancel", cb);
          }
        }
        elm = fillObj(canvas, elm);
      }

      return elm;
    },
  };
  const documentElm = window.mockDocument.createElement("document");;
  window.mockDocument = fillObj(window.mockDocument, documentElm);
  window.mockDocument.documentElement = documentElm;

  window.addEventListener = function() {};
  window.removeEventListener = function() {};

  window.performance = {
    now: function() {
      return Number(new Date());
    }
  }

  window.devicePixelRatio = 3;

  window.requestAnimationFrame = function(cb) {
    return setTimeout(cb, 16);
  };
  window.cancelAnimationFrame = function(requestID) {
    clearTimeout(requestID);
  };
})();