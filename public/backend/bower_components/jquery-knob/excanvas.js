// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Known Issues:
//
// * Patterns are not implemented.
// * Radial gradient are not implemented. The VML version of these look very
//   different from the canvas one.
// * Clipping paths are not implemented.
// * Coordsize. The width and height attribute have higher priority than the
//   width and height style values which isn't correct.
// * Painting mode isn't implemented.
// * Canvas width/height should is using content-box by default. IE in
//   Quirks mode will draw the canvas using border-box. Either change your
//   doctype to HTML5
//   (http://www.whatwg.org/specs/web-apps/current-work/#the-doctype)
//   or use Box Sizing Behavior from WebFX
//   (http://webfx.eae.net/dhtml/boxsizing/boxsizing.html)
// * Non uniform scaling does not correctly scale strokes.
// * Optimize. There is always room for speed improvements.

// Only add this code if we do not already have a canvas implementation
if (!document.createElement('canvas').getContext) {

(function() {

  // alias some functions to make (compiled) code shorter
  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;
  var abs = m.abs;
  var sqrt = m.sqrt;

  // this is used for sub pixel precision
  var Z = 10;
  var Z2 = Z / 2;

  /**
   * This funtion is assigned to the <canvas> elements as element.getContext().
   * @this {HTMLElement}
   * @return {CanvasRenderingContext2D_}
   */
  function getContext() {
    return this.context_ ||
        (this.context_ = new CanvasRenderingContext2D_(this));
  }

  var slice = Array.prototype.slice;

  /**
   * Binds a function to an object. The returned function will always use the
   * passed in {@code obj} as {@code this}.
   *
   * Example:
   *
   *   g = bind(f, obj, a, b)
   *   g(c, d) // will do f.call(obj, a, b, c, d)
   *
   * @param {Function} f The function to bind the object to
   * @param {Object} obj The object that should act as this when the function
   *     is called
   * @param {*} var_args Rest arguments that will be used as the initial
   *     arguments when the function is called
   * @return {Function} A new function that has bound this
   */
  function bind(f, obj, var_args) {
    var a = slice.call(arguments, 2);
    return function() {
      return f.apply(obj, a.concat(slice.call(arguments)));
    };
  }

  var G_vmlCanvasManager_ = {
    init: function(opt_doc) {
      if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        var doc = opt_doc || document;
        // Create a dummy element so that IE will allow canvas elements to be
        // recognized.
        doc.createElement('canvas');
        doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
      }
    },

    init_: function(doc) {
      // create xmlns
      if (!doc.namespaces['g_vml_']) {
        doc.namespaces.add('g_vml_', 'urn:schemas-microsoft-com:vml',
                           '#default#VML');

      }
      if (!doc.namespaces['g_o_']) {
        doc.namespaces.add('g_o_', 'urn:schemas-microsoft-com:office:office',
                           '#default#VML');
      }

      // Setup default CSS.  Only add one style sheet per document
      if (!doc.styleSheets['ex_canvas_']) {
        var ss = doc.createStyleSheet();
        ss.owningElement.id = 'ex_canvas_';
        ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
            // default size is 300x150 in Gecko and Opera
            'text-align:left;width:300px;height:150px}' +
            'g_vml_\\:*{behavior:url(#default#VML)}' +
            'g_o_\\:*{behavior:url(#default#VML)}';

      }

      // find all canvas elements
      var els = doc.getElementsByTagName('canvas');
      for (var i = 0; i < els.length; i++) {
        this.initElement(els[i]);
      }
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function(el) {
      if (!el.getContext) {

        el.getContext = getContext;

        // Remove fallback content. There is no way to hide text nodes so we
        // just remove all childNodes. We could hide all elements and remove
        // text nodes but who really cares about the fallback content.
        el.innerHTML = '';

        // do not use inline function because that will leak memory
        el.attachEvent('onpropertychange', onPropertyChange);
        el.attachEvent('onresize', onResize);

        var attrs = el.attributes;
        if (attrs.width && attrs.width.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setWidth_(attrs.width.nodeValue);
          el.style.width = attrs.width.nodeValue + 'px';
        } else {
          el.width = el.clientWidth;
        }
        if (attrs.height && attrs.height.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setHeight_(attrs.height.nodeValue);
          el.style.height = attrs.height.nodeValue + 'px';
        } else {
          el.height = el.clientHeight;
        }
        //el.getContext().setCoordsize_()
      }
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;

    switch (e.propertyName) {
      case 'width':
        el.style.width = el.attributes.width.nodeValue + 'px';
        el.getContext().clearRect();
        break;
      case 'height':
        el.style.height = el.attributes.height.nodeValue + 'px';
        el.getContext().clearRect();
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }

  G_vmlCanvasManager_.init();

  // precompute "00" to "FF"
  var dec2hex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.globalAlpha   = o1.globalAlpha;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
    o2.lineScale_    = o1.lineScale_;
  }

  function processStyle(styleString) {
    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.substring(0, 3) == 'rgb') {
      var start = styleString.indexOf('(', 3);
      var end = styleString.indexOf(')', start + 1);
      var guts = styleString.substring(start + 1, end).split(',');

      str = '#';
      for (var i = 0; i < 3; i++) {
        str += dec2hex[Number(guts[i])];
      }

      if (guts.length == 4 && styleString.substr(3, 1) == 'a') {
        alpha = guts[3];
      }
    } else {
      str = styleString;
    }

    return {color: str, alpha: alpha};
  }

  function processLineCap(lineCap) {
    switch (lineCap) {
      case 'butt':
        return 'flat';
      case 'round':
        return 'round';
      case 'square':
      default:
        return 'square';
    }
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} surfaceElement The element that the 2D context should
   * be associated with
   */
  function CanvasRenderingContext2D_(surfaceElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    // Canvas context properties
    this.strokeStyle = '#000';
    this.fillStyle = '#000';

    this.lineWidth = 1;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.canvas = surfaceElement;

    var el = surfaceElement.ownerDocument.createElement('div');
    el.style.width =  surfaceElement.clientWidth + 'px';
    el.style.height = surfaceElement.clientHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    surfaceElement.appendChild(el);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
    this.lineScale_ = 1;
  }

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    this.element_.innerHTML = '';
  };

  contextPrototype.beginPath = function() {
    // TODO: Branch current matrix so that save/restore has no effect
    //       as per safari docs.
    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.lineTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});

    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    var p = this.getCoords_(aX, aY);
    var cp1 = this.getCoords_(aCP1x, aCP1y);
    var cp2 = this.getCoords_(aCP2x, aCP2y);
    bezierCurveTo(this, cp1, cp2, p);
  };

  // Helper function that takes the already fixed cordinates.
  function bezierCurveTo(self, cp1, cp2, p) {
    self.currentPath_.push({
      type: 'bezierCurveTo',
      cp1x: cp1.x,
      cp1y: cp1.y,
      cp2x: cp2.x,
      cp2y: cp2.y,
      x: p.x,
      y: p.y
    });
    self.currentX_ = p.x;
    self.currentY_ = p.y;
  }

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    // the following is lifted almost directly from
    // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes

    var cp = this.getCoords_(aCPx, aCPy);
    var p = this.getCoords_(aX, aY);

    var cp1 = {
      x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
      y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
    };
    var cp2 = {
      x: cp1.x + (p.x - this.currentX_) / 3.0,
      y: cp1.y + (p.y - this.currentY_) / 3.0
    };

    bezierCurveTo(this, cp1, cp2, p);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? 'at' : 'wa';

    var xStart = aX + mc(aStartAngle) * aRadius - Z2;
    var yStart = aY + ms(aStartAngle) * aRadius - Z2;

    var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
    var yEnd = aY + ms(aEndAngle) * aRadius - Z2;

    // IE won't render arches drawn counter clockwise if xStart == xEnd.
    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                       // that can be represented in binary
    }

    var p = this.getCoords_(aX, aY);
    var pStart = this.getCoords_(xStart, yStart);
    var pEnd = this.getCoords_(xEnd, yEnd);

    this.currentPath_.push({type: arcType,
                           x: p.x,
                           y: p.y,
                           radius: aRadius,
                           xStart: pStart.x,
                           yStart: pStart.y,
                           xEnd: pEnd.x,
                           yEnd: pEnd.y});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();

    this.currentPath_ = oldPath;
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();

    this.currentPath_ = oldPath;
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    var gradient = new CanvasGradient_('gradient');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    return gradient;
  };

  contextPrototype.createRadialGradient = function(aX0, aY0, aR0,
                                                   aX1, aY1, aR1) {
    var gradient = new CanvasGradient_('gradientradial');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.r0_ = aR0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    gradient.r1_ = aR1;
    return gradient;
  };

  contextPrototype.drawImage = function(image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    // to find the original width we overide the width and height
    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    // get the original size
    var w = image.width;
    var h = image.height;

    // and remove overides
    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw Error('Invalid number of arguments');
    }

    var d = this.getCoords_(dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    // For some reason that I've now forgotten, using divs didn't work
    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, 'px;height:', H, 'px;position:absolute;');

    // If filters are necessary (rotation exists), create them
    // filters are bog-slow, so only create them if abbsolutely necessary
    // The following check doesn't account for skews (which don't exist
    // in the canvas spec (yet) anyway.

    if (this.m_[0][0] != 1 || this.m_[0][1]) {
      var filter = [];

      // Note the 12/21 reversal
      filter.push('M11=', this.m_[0][0], ',',
                  'M12=', this.m_[1][0], ',',
                  'M21=', this.m_[0][1], ',',
                  'M22=', this.m_[1][1], ',',
                  'Dx=', mr(d.x / Z), ',',
                  'Dy=', mr(d.y / Z), '');

      // Bounding box calculation (need to minimize displayed area so that
      // filters don't waste time on unused pixels.
      var max = d;
      var c2 = this.getCoords_(dx + dw, dy);
      var c3 = this.getCoords_(dx, dy + dh);
      var c4 = this.getCoords_(dx + dw, dy + dh);

      max.x = m.max(max.x, c2.x, c3.x, c4.x);
      max.y = m.max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
                  'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
                  filter.join(''), ", sizingmethod='clip');")
    } else {
      vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, 'px;',
                ' height:', Z * dh, 'px;"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML('BeforeEnd',
                                    vmlStr.join(''));
  };

  contextPrototype.stroke = function(aFill) {
    var lineStr = [];
    var lineOpen = false;
    var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
    var color = a.color;
    var opacity = a.alpha * this.globalAlpha;

    var W = 10;
    var H = 10;

    lineStr.push('<g_vml_:shape',
                 ' filled="', !!aFill, '"',
                 ' style="position:absolute;width:', W, 'px;height:', H, 'px;"',
                 ' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
                 ' stroked="', !aFill, '"',
                 ' path="');

    var newSeq = false;
    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var i = 0; i < this.currentPath_.length; i++) {
      var p = this.currentPath_[i];
      var c;

      switch (p.type) {
        case 'moveTo':
          c = p;
          lineStr.push(' m ', mr(p.x), ',', mr(p.y));
          break;
        case 'lineTo':
          lineStr.push(' l ', mr(p.x), ',', mr(p.y));
          break;
        case 'close':
          lineStr.push(' x ');
          p = null;
          break;
        case 'bezierCurveTo':
          lineStr.push(' c ',
                       mr(p.cp1x), ',', mr(p.cp1y), ',',
                       mr(p.cp2x), ',', mr(p.cp2y), ',',
                       mr(p.x), ',', mr(p.y));
          break;
        case 'at':
        case 'wa':
          lineStr.push(' ', p.type, ' ',
                       mr(p.x - this.arcScaleX_ * p.radius), ',',
                       mr(p.y - this.arcScaleY_ * p.radius), ' ',
                       mr(p.x + this.arcScaleX_ * p.radius), ',',
                       mr(p.y + this.arcScaleY_ * p.radius), ' ',
                       mr(p.xStart), ',', mr(p.yStart), ' ',
                       mr(p.xEnd), ',', mr(p.yEnd));
          break;
      }


      // TODO: Following is broken for curves due to
      //       move to proper paths.

      // Figure out dimensions so we can do gradient fills
      // properly
      if (p) {
        if (min.x == null || p.x < min.x) {
          min.x = p.x;
        }
        if (max.x == null || p.x > max.x) {
          max.x = p.x;
        }
        if (min.y == null || p.y < min.y) {
          min.y = p.y;
        }
        if (max.y == null || p.y > max.y) {
          max.y = p.y;
        }
      }
    }
    lineStr.push(' ">');

    if (!aFill) {
      var lineWidth = this.lineScale_ * this.lineWidth;

      // VML cannot correctly render a line if the width is less than 1px.
      // In that case, we dilute the color to make the line look thinner.
      if (lineWidth < 1) {
        opacity *= lineWidth;
      }

      lineStr.push(
        '<g_vml_:stroke',
        ' opacity="', opacity, '"',
        ' joinstyL��8�`t+��Pַƃ��΁\߅}��}�3����"E/�X��n�q?����o|ۜ���9=�������Ā!#�����Ƶ�������-�X���\�s�d�:n�ŝ���^V[�L��M�Wl����&ƫj8��3:�f0�xQ��8���k���ft�
�n���`�c'h?9�rǷ�Ú�q�%�)�OGx���b�¾�����>������Ds��$�|*�� ۬M��w��	]-�)�+[Qx;VS�� �{� �3R���������W��I7�k�[z�Z�n�]����ȋ
��~GYS�'dC���T<pg�c�����S/���QV?p�ƻ��u�E�X���"��:܃��Q�J����aE��RaN~��[���[�1���b��T7>�9����jÜ0Mj���Uvz5O��x0΂��Rz�veY,E�7\1�P�V�vI�||������C���e�>f��n\��omZz�=6A��V�X�z+��  ��M�q
��	��+[v��%`���~��p?O�E���6MLPR1�c�$��(�|	��I*f�kh�5w��o�����C�V��Yv�P�bx�*�4�,�΃P���Rx�>�yh[��!P���%p��k�!'���pW{����;F���c�#c='��	3S�.�ʮ���w���Ǳ�m	ħt��f����{�HB;+���C���]#�Cņ����������_J�K�ǷRW�����8�vWpT	r�����oQ�zL���G�ї�c�_,�1;��Z��&�����t�(��ƶ$\�Ү�y��Ck�A�]���r�/��?`������ȉ//�D�iVg��-+�ӜI.X{���Y���e̪Q����a�D<0DA�tڥ�f	e�I���Eh��:�th���ax��C�Bz�=<��z��2���QbAБb5�f�2�{�@Q�&���4���Vl�,Q��yI��v�{'���a��'UbCf��4y20I�n��B_�Z@M�Q�t�:��z����e���ط�%���UP} ��-�^�,��-z�+�+�*Y.�a���q��p#B䪍=e�C��.83��l�%�,�/2�M�]�;�5�0����`D�iJ��I�j�%��s���#���q�ۦ�P�U�T�^�N�F���d���0���@�d|�IEm�1k�T�8I)�*_�ب���Ih����uXK� jD��N��~	�sm�D��O� �5���^���9�L{yH��湇���Z���z�2A�ȓ4�Y��F? �R�i.���}t`�gL$�XU	e�A��Q7?��44@~o����k P)s�VA��0���w�_����|ĩ�؝%��+q\2$������K�<��752iW	mo,�ʾ�K�NN��'����:�j>�5�����k�h�+�t�mk�;<IS�
�bJ��,��=p:�[��E(N[ڎ��Y�Y�~�u&�ׂ��&��k��G�a�w^K��p���'��gO��<5dK���%�;f*4V+�q���<�2�/�;��Y�&cF���@�s�T�v\բ���܈�RHM�m��:�1��ϙB���4��p6(�o� )�����!'/+�1|0�@9�������2����:�дX����Y?���߫��ڦf�U�xXt��Y}�fqH�����Gu��؟J{qA"�������Ώ�R32�D�{lW+�?�~�Ҁ� v�L`f�i�$��+:�%�3�&�˧�'����v��GT����:��=᳽���ws��%ջE�qStQȂ��ƾ�"����ŕ2,���yZ��O�79�s�L��O��-:~�6s�[V�+8����#�Tx�O!�p�'����M�ڪ�����{��\|��h9�=n�����M�!d��Y�5�O��������MƧf�r?���/�\�b�f�̧
	D!��g��Ke�����g�ܥ�rvG�F"�b�{
v��ؼ��\DJͷ<�k��[k�S^[��͛o�OAP�)}p�z�T%��{'�:�y)~��B�\P�����s�)ڧ�$�����m\%�z�s�@uz�'O���&�)�:��k�^g�5�X� 7QF����K60�X�6yB�I?�)t^V%�HH1Si�b�.�_,F�X��Y��\ų�|U��:����CV��aL�j�76��]|�i=Zx�wt���|!豓*Ƽ���E�ikK��˷I����b(U���N?� q ʨڣnV*�~G�KJo���C�#ml�y
��Yف;��Lo���?�L�9�{.���i2aC�q��7�9EY�� �ƣϱrFtO(�79ើ���-o�K�A��Kխ�K짋 �gtG����fw�?�ei�b�/1���pL9�;8� �qP\Q$c��yu��B��E���~m����(�*t��������23Fo�x�יWRĵ
�Z�~�K,Ll��(��؋�����/�5�.���5�x�A���{���fGF	8�Ⱦ2�-�8\�1 ���y0�JU��d��bd(+�NLF$ױ��o�l�5�"ڎӞ��R��?� |.�<֟��CY�g$�asCb�qt]������8����U�W��MW��>��սk7�<c1��u7vw�c�7��c���X�&
��6��6���ʗ��'^���>�[>�>�U�H2�M���K,׮��V�>#�W3W����)x�z�� �������=|��ퟶ&jFDh�_L4Z.c��u��F��ߜ�_.�J�)5��r�Y&v�"���1�I����p�������& ]�G�`�&wn2E��sQR�hm�.s�^m�ψJM�w�I�l�x�;�h��~(
�a3$�ǰ���<�<Q��{1G ��B�I��C�n��������)�`n��a#!����E�Vu�X�(8P���z��u��63qQx��ˌvE�Α�ٷBM;g�H��~%��B�
�h��z��e �u?�9�5��ݎ]	�I`Do�;[Q�������h���B��ia�eyz.+�r>��[j����9��3�Sk�7�7�.��y�/R��Gy�}�9H�+�a�d�4FlC���{���̈����k�;Զ6�IH#F���Ӂ�)#��rDɣ@��Oh�qRG�F�r���*<�5�1{h��z}7K�Mk�[����?o���_�q�X�_�wXB|� ��yuyN��2`y����pk��=V���tњ��5ݚ?k,��2�#<�ڐa��������ԟ��{�������%�?��q��4�3�=��X_[���`{�$�W4,�������	jX�� ��:(���KW�߹�)C~
 G�Vva�!q�v:���{m�ɐ�+��	=(e@a�+��f!a�\��!�byz�����x�x\U�l0��aV9�K;l�QRu`x���+��t9`й�l]qP����[��	�+�t�ja�E�n~~���K}O��e��&H�b����t%��^�v����q�&OU�_2z��*�Q,���t�wX�%0ɽ��Z�̿F˯[g���K�T�X	�hޚ�9�h������wX�U\͌M]�/��=X �e��.�M�m���#��'I���V�|��0��E��d\���w�)p��ɱ���_�*�bL���Jx�%�f'����U�Q��Ό��O����!�[o��}������$j;��t���W5۪�}��Q|����1�|	�ae�x�ě�~�VB҂2rU��Ŋ?�o�)*���K�$<N���N�l�gc�0�,*�T)'N�I�b� "7q�F�?:����]<�ˎ��w�[�����Kvn�f��c�r'�eJ�7�h�nr�Ǜ��+�[�Mߧ@M�����Fֆر��Ty�����Kzd���ykpL�	��5���M�x3O�y����5��6M���P`�P� s�\��_4\�Vݒ��ڣac]����B�7�;�qP�[ؿGA`�-ޢ%��R�m�o���k�d�9x�h�������e*�k�7D�{$Z���ZP'r@oG��qE\o��J�"B���l�f�߉�O���_�^�,�.S2�s�1;�&\Fy��T�0�$�z�;�ngD#[��P�+l���꒱�5���:�Pْ~r͋8t� 3x1'����[�0�/vxV�qI��0{��u%c�\k��Ȥ��ʸ샿?��r�&}�VVm�B�p�Wg������ E�g�G�����L���Z���U~Ӝ���k�9�p�
�u��p��K��� >�j�i��֧�vc""�b(�z$��[K��|p�-�~������ƛVXN7[��Y���^JP�9`����9\���Gz�>w���AY�DH�'^?�=?�b��veTQ���0E�cS���m����)��W-E�����f^�JpB8вGY�h]%ܴ�G�!x�y'��c�o%aLʹz�MV����m`4ؽ{+�2-y����.s_�K�*#�@ti�L�_�5"T�)���sٻ��ҋ��"�'PYR<��u�&����I������+��؈�O=vvT,�CfZ!���3+���į���K���xN�N��B�{uI�I��>a�2�(�~�>hvY]Q	2]j��ܻ=�+�7��N��j2���,���ϭ�Gp9��&��8�<���Ɨ'�؈+i$;�@O/{28�(�u��bk���z;���hJL�9�CWO W��5j!"&�#�F�EZ��)yab�L��@D�b��ݓMO!rbhJD�8�s=���-����6���%d�c�N�K�cU�n��nH٤u	�˯l"A�K���.�\,`��a}�� �(��g-ٙJ��6i!PP�,�\ɝ�B�F�'��j	ؽ/V����$���]_v\�.�	��M�D����{j߯E_
���c�L�X�[mDvƊ�K+�y�^��M��E��b�T����[l��g�]��R*�7���:/&,��5\k�����B]b1���HHo�Zw���-�����xf�kF 
�2/�>q@M"{�o��ĻN���ě\k�R��|�~[СؾOV�lE�[8�K���cg3:�ܢ�s>��e]R�3�R�.��>4�_���W	y��-��#ق�E%���Uu�  �A��~�Ѡ-*e�<�r1�3�	.Hw�uy�R�Z��A7�e��) ����-̝� ��TB��Vԕא1X��"����AڣG?�pe�����[�셉�{������"5f�Mud�������������½nR���Swi�����3�f�?��̓�|�ݾ'�c�������oDNѵ�Z��[���ۂQ���,��q��8BV�yl!�a�d�w�^H�Kb!{��#=ZJ2(z����k�pra��ql��2:SS�<�Y�f�"�6�K1q%?1ڠ�ƨ?+;�쌷nƂ��{+� C�}6:��}�#Y��p̋�|q�(�8�{���/��(��M�BgQ͍#D�M1Vt�W zQ
{�w�yw�@�oٟ�����4v�.L���%��Iׯ;ugF����j�K�d�ϻA)/s.����rȑ�}�8<+il�0
�e����
��]�y���n���?%놓�Y����vr�h+5o�
�֓nB�6���ɘ�w���d�؞��N5p��P>�KP�����ؘb�S2���rە��g�����R�1�$1L7͆��dD�/LP9�8�Z'V��8f=r����V�1η[ɑ!��h#�`�vl� �S�W�7٥D@~M�Ԙ�?X�����nM݄��|z��V���O�0��h�(V>�����*���� �| R�1Ժ؉�yaE�_�"`��|/IJU�j�|ګl�'j�����3�?R���g�-��X0Uß���U2�K��Fa[�r�@:���m�>πg�nu�s~����T�������!0��Z��R4f�aq�dё4�z�`�Tf:v~�� �%X3��J��t�Ī�]E?��QΆ�f��y%�N]�8J�3�eFNs�	�#Xݑ��=��f�gj7`\��4מM���Ѳ�	.����\lץ�ߊ�P�t�BW�`R �+�V�E�����zF�����J��^���
6jK�gW�6����dcx���s�ޏƅ�ྏ>ae,I��_���Eb�#*��$��b�u�#MޜZ�Ȭ#��=�Y/���Hat�8B�y�[�0f(���l����R�o����k�Xn�1#-6�7�Bǰ^0-��T0J�ـ���&7��,�c���9��S�%�	
�I����Y[ofp���d��<h�q��d
g��LlQR��1bC��$ﺢO���*Yuy����l
���M�C>���a���b-B��o"�рr����H��8/��8������bev�hc�0�U��=�?�α���q�ǻK�5�m?P53��V���$n���a;���S�9Z