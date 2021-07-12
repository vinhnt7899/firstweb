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
        ' joinstyL©ˆ8ˆ`t+²õPÖ·Æƒ±ÅÎ\ß…}ìŞ}ñ3š¨Ÿ¦"E/˜Xˆnq?¸ĞÖÖo|ÛœÃÂ†Æà9=ëğ¢±îëùÄ€!#‰ˆÚ‰ÍÆµŒ˜¾Ä÷ã’-¶XßÍê\õs‰dµ:nÒÅö¼Ó^V[÷L‘ÂM•WlìüÿÁ&Æ«j8‘³3:‘f0ÇxQ‹ë“8ôøkÊØãftÃ
Œn˜æğ`Åc'h?9ÒrÇ·ŸÃš—q%·)üOGx­‘òbäœÂ¾ÄÊşÛá>µ›Ìô×ÁDsã÷$—|*œ„ Û¬Mè°ìw °	]-ì)¥+[Qx;VS‡‰ ˜{Í Ì3R§ª®™£«Á°÷WØÉI7¡k¼[zıZÏnÄ] éßúÈ‹
½ğ~GYSè'dCıúÑT<pg¤cÜıÑ¿S/ßÈQV?p¼Æ»ü½u‡Eó™ŠXÄãë"°à:ÜƒµœQ¨Jª¢ó„êaE•ÉRaN~š[‘°ó[1ÖàÎbô—T7>†9ãĞøÑjÃœ0Mj•ÆUvz5OÕx0Î‚ÈÿRz’veY,Eú7\1ˆP¨V¦vI€||œÊëğåÁCı³“eÖ>fáün\°ÆomZzñ=6AæçV¨Xz+éÑ  ã­äMûq
ğŠ	Š×+[vßò%`¥ˆ ~§½p?OçE­¼¹6MLPR1§cÚ$™£(Ğ|	ÿæI*fëkh¨5w¾–o´›·óÖC¤V–¦Yv¬PÆbx¾*’4Ø,ƒÎƒPäã£¡Rx¢>˜yh[·“!PƒÖ×%pêôkğ!'ÑöçpW{ƒ·…Ä;FµÖc¢#c='Ûö	3Sâ¶.™Ê®µ¨Òw‡˜îÇ±Üm	Ä§tóˆéfˆ¶½åª{ÕHB;+±¨ëCúùæ]#¼CÅ†‘¨†ñ™²ğùäö _JÛKêÇ·RW±®‘¥¡8‰vWpT	r‰çÆÏoQêzLÔáĞG¦Ñ—Êc¶_,ç1;ÿZ­Ğ&‘§Ÿ¥át«(°íÆ¶$\‰Ò®ªyœ”Ck‹AÖ]ñÿàr¤/ÜÃ?`ÿµÈêÔÖÈ‰//ÜD†iVg¬¡-+’ÓœI.X{–ÒùY²©eÌªQ‰†…aÛD<0DAètÚ¥†f	eèI€øÛEh†Ç:¹th²›ÅaxÿËC×Bzö=<Ñ·z©á2ª±QbAĞ‘b5êf‡2ò{@Q‘&¡¡4×êïVlª,Qğ¹æyI¶Ğvİ{'¨æİa³®'UbCfÉß4y20IÆnÛÿB_Z@MñQ˜tî:ÒïzşõÆÍeÜ¾»Ø·ÿ%ûğğUP} §Â˜À-ú^¬,Æó-zš+Ë+ò*Y.Õa£¯ªqÿöp#Bäª=e¹C¸Ã.83é¢©lş%ä,ó/2¶M¼]ß;í‘5ø0¹·`DêiJ¹½IãjŸ%í®Ës¬ÔÑ#† ŞqŠÛ¦PİUáTâ^²NÂF„’Ádç–ñÈ0ÀœÖ@ªd|·IEmØ1kÙTæ8I)¼*_šØ¨˜©ÓIhÁçşâuXKŸ jDŠN© ~	”smìDšıOÎ á5ñšÓÖ^»çš9»L{yHùÎæ¹‡íåáZ²øzñ”2AºÈ“4…YŒøF? ËR¡i.’õÊ}t`ºgL$ÂXU	eõAüÆQ7?µÖ44@~o£šˆïk P)s¡VA¥İ0±³¦w¢_¨®—À|Ä©Ø%¨©+q\2$€êŠÈİÔÍK“<È752iW	mo,å­Ê¾“K¿NN›é'¯ö³¯:˜j>¨5½»şµækh +şt•mké;<ISÉ
¸bJšÆ,ğÁ=p:Ÿ[õ—E(N[ÚşõYåYÇ~¢u&ğ×‚†°&ã´ëk’µGìa¿w^K©Šp¯œ©'»ÊgOí‘ß<5dKÈ…÷%‰;f*4V+Õq‡àÜ<”2ˆ/Ò;‘³Y×&cF›•›@ÿs’T×v\Õ¢ÙáÉÜˆ¬RHM¢mº·:ò1ºÙÏ™Bº­ä‰4³Ìp6(ˆoñ )†ãú‡û!'/+Ç1|0ô@9äßİêùÔ2ÂñòŠ¢Û:ßĞ´XçÁĞ‚Y?„Œæß«·Ú¦f“U¤xXt»Y}áfqH‡ÊéÍÎGuÁ¦ØŸJ{qA"’ù€ ¾¦Î÷R32æDÊ{lW+ç?©~€Ò€µ vœL`fiâ$½ğ‘¥+:ù%É3Ç&ôË§û'ªúÁàv“‚GTô¼Üà¾:ÜÎ=á³½Şñ»ìwsá®À%Õ»E÷qStQÈ‚¦±Æ¾è"´öÜrÌ2,ÇúıyZìÉOù79ƒsÉL•àO±Ò-:~ì6s[V£+8™ß#ò–TxöO!ÇpŠ'ìïûíM‚Úªä’şÅÇÎ{çÎ\|àÀh9„=n®¥•ëœĞMœ!dıâY½5‹Oğš•Ÿ¸¸òMÆ§fÔr?‰µì/İ\ˆb¹fÆÌ§
	D!õ…gèğ§KeöÃ¥æËgºÜ¥rvGÇF"ób³{
v‰ËØ¼¾Ú\DJÍ·<¾k•Ü[k›S^[åÕÍ›oOAPó°)}pÑzT%³ü{'£:¹y)~ßåB®\PÛíÉÁêsó)Ú§ñ$ÿ“ÏëÇm\%İzÜs£@uzŒ'Oºâü&í)ê:æÀk¯^gà5›X 7QFêÔßÎK60‘X—6yBÿI?®)t^V%ùHH1Siåb¾.¹_,FƒXìîY™Õ\Å³Ò|U¢¼:àÌ¤CVŒŠaLìjŠ76ÁÈ]|×i=Zxêwtšµ|!è±“*Æ¼â¨ö±E©ikKàáË·I–ü²âb(U‚³çN?é q Ê¨Ú£nV*¬~G•KJoµÒåCÛ#mlüy
’ØYÙ;ñíLoœŞâ?Lå9†{.Ÿi2aC–qÇ7Ô9EYôœ ®Æ£Ï±rFtO(79á¾Ïè”Ş-oKÛAº»KÕ­Kì§‹ ”gtG«ƒÑôfwı?„eib/1üÑÀpL9“;8ô ùqP\Q$cÕŞyuã¨ÆBıöEóÀé¦~m£ªÇ(*t™ŒÁïü±ßú23Foñ¼x®×™WRÄµ
³ZÀ~†K,LlÇı(³ìØ‹ñ¢Œü”°/åŸ5Î.ª™«5ØxºAÈöÒ{ˆ÷æfGF	8ÚÈ¾2¬-ƒ8\Û1 õ—†y0íJU¨¾dö„bd(+ÎNLF$×±ƒÒoßl½5Ê"ÚÓ×¥RÎƒ?™ |.«<ÖŸ°ÊCYèg$²asCbÑqt]ÊÇÍö¨ª8óÚ—¾UøW¬ÍMWÆ“>÷Õ½k7¥<c1™Øu7vwÛc³7ˆ¹c¢´±X&
’¶6à6°íÊ—¢’'^‘…¢>Ù[>±>‡U·H2¦Måÿ¶K,×®®´VÀ>#êW3W£ŠÉ)xæŸzäó´ ¿™êÂõ¿á§=|“¯íŸ¶&jFDhÉ_L4Z.cöÕu’F•°ßœŠ_.ùJİ)5¬°ràY&vÆ"¨ÌÉ1Iëÿˆ pÂ²à‘ıßÌ& ]€Gò`—&wn2EısQRÇhmŒ.sî^mİÏˆJM”wÏI¶lèxı;¢h€ö~(
¹a3$Ç°úà¸É<ç<QŸØ{1G ÔÏBçIïC¨nŸæõÎä¤¶¼)Ò`nŠ†a#!¾ï¦ÕE¶VuXÆ(8PĞÙöz¸üuà†63qQxşĞËŒvEÉÂ‘Î‘ğÙ·BM;gÜH¤ü~%”‘BÓ
“h¸Üz¨Óe ¿u?9—5‘ÿİ]	ßI`Doª;[QãŞÇÁÙ¼Øh‰çÉBôİiaßeyz.+ºr>¤„[j¡°²9¤Õ3ÍSkÜ7Ñ7Ğ.®Ùyº/RıGy¾}¬9H·+şa¥dş4FlCû½{ôÅãÌˆ»ıÇÇkŞÍ¾Ô¶6IH#FÁ»ÖÓí)#†ƒrDÉ£@÷»Oh‘qRGòF§rù“Û*<¡5¤1{h„—z}7K¿Mk™[ÉÚéŠ?o´ªí_ˆq“Xã_×wXB|Ò ô´yuyNÄÍ2`yŒäÓğpk¸ù=Vó¥tÑšò5İš?k,€2ì#<§Úaœ¨‡÷õãÔŸ·Ø{«Êÿ¿»ŠÙ%Ş?´óqò‡æ4Ÿ3·=ØX_[åıÄ`{î$ìW4,şáá¤±œÊ	jXÄÉ ÿÊ:(şÆüKW®ß¹ç)C~
 GæVvaÃ!qäv:’àŒ{m›Éµ+Ÿõ	=(e@aô+¥¿f!aÕ\Ââ­!ä˜byzµøú£x¨x\Ußl0ÎöaV9áK;l¨QRu`x²œÁ+ßßt9`Ğ¹‚l]qPòÈõ—[†	¿+Ãt—jaEğn~~¸ÙÉK}OŸe³î&Hb‹ÆÍë°t%şİ^ÖvÌîıøq¯&OU–_2z˜á‹*ÜQ,ô¥•tÑwX¤%0É½‡»ZÆÌ¿FË¯[gĞ¸ÅKâT÷X	ïhŞšŞ9‰hš® ¾ÿËwX­U\ÍŒM]Ä/¬¼=X ¥e…ø.¼MÖm°Êï‡#¤'Iè×V½|ş0¾èEÉd\’ë¦Áwã)p×ÜÉ±–ëİ_•*ßbL¶±¸Jx%šf'ğ¯³º¬U’Q–ŠÎŒ™ÖOĞÖÛñ!É[o“ë}Š—Êóïø$j;•œt¸ÀW5Ûªã}‘ÛQ|öÌØÑ1ú|	şae‘xÓÄ›¥~€VBÒ‚2rUø”ÅŠ?¸oû)*¦¨Kª$<NõÀİNÌl gcÒ0Œ,*¶T)'NªIÃb "7qéFò›?:ôÌêç]<Ë¶wÙ[¾âÃüâKvn©f¦Ùcïr'eJä£7Üh¼nrÿÇ›‘…+ù[¤Mß§@M°£ú¨¨FÖ†Ø± ãTyàóÆûøKzd–üykpLì	¼ñ5‰â×MÎx3Oğ¸y…²¥óœ5êÙ6MìÑËP`ÎP‡ sÆ\‘›_4\¦Vİ’ˆÚ£ac]•ƒÙáBè7ÿ;°qPø[Ø¿GA`ÿ-Ş¢%˜‹R¸mÃo·¶–k—d´9xÜhº‘™Ÿ‘˜—e*òkÄ7Dµ{$ZæÓ‘ZP'r@oG±¶qE\oïå‚JÕ"B¦Ál«fĞß‰“OÎ÷Û_¤^½,ğ.S2¨sñ1;±&\FyçÔTæ¦0Ë$«zá—;íngD#[ åP¨+lœÀÆê’±Ş5ûŠ:²PÙ’~rÍ‹8tŒ 3x1'å˜À÷É[…0ÿ/vxVùqIğö0{‹u%cô\kÃÚÈ¤ÜêÊ¸ìƒ¿?’¬rû&}µVVmçBçp˜Wg‹ğ¡… EìŠg°G€‘àş®L–ëZšÇè´U~Óœ¢áŠÃkŸ9ÖpÃ
´u€èpƒ­K¡¸½ >‰j¼iİóÖ§Ùvc""Ùb(Óz$š·[K¨™|pé-ş~³µ–ĞƒàÆ›VXN7[ø·Yšà^JPÙ9`‰ş˜ÿ9\ÂGz¹>wÒÅÓAYÏDH¸'^?É=?Áb¿veTQ—Îò0E×cSÅÍ÷m‰åŒô)¼åW-Eøø§åŒf^†JpB8Ğ²GYıh]%Ü´·G”!x¾y'¼ßc´o%aLÍ´zÎMVü«¢øm`4Ø½{+‘2-yúöƒ§.s_‚K´*#@tié¹L‰_¦5"TË)ªÅÁsÙ»„ŞÒ‹¡À"Ñ'PYR<¶uÌ&¦¶ÔÖIú¿ıúÚî+ıËØˆâ¯O=vvT,CfZ!ôÚè3+µ±Ä¯·‚K…¼÷xNˆN…Bï{uIIáÏ>aµ2½(™~ç>hvY]Q	2]j–¹Ü»=î+ï7¯¨N•é™j2²±õ,—ÁÒÏ­×Gp9©Ù&¹ş8ß<ÄíÆ—'˜Øˆ+i$;@O/{28â(ğuœÓbk¨ÉÎz;Ôñš¹hJLí9éCWO Wæªı5j!"&„#¾F÷EZ¿Ç)yabÇL€Ğ@D®bÃÑİ“MO!rbhJDà8÷s=¦°·-ÑîÏÃ6¨­˜%d²cšNÑKcU½nâùnHÙ¤u	ûË¯l"AßKåĞÇ.Ş\,`½Úa}˜ š(‰Âg-Ù™JÈ6i!PP©,÷\É‹B¸FÙ'şŒj	Ø½/VÊÙÚÆ$”…”]_v\Á.¡	ÇßMÂD£ÂŞÔ{jß¯E_
‚æ¬c˜LæX¶[mDvÆŠ¯K+y´^ĞÈM£øEÇÑbÙTû­Œ‹[l©ågÇ]ÓÑR*Ô7ú´:/&,¤·5\kúŸš¤¾B]b1ÒÁşHHoÃZw·¤‹-›ä÷İÛxfòkF 
µ2/Œ>q@M"{…oÑÑÄ»Nú¿¯Ä›\kŸR›ó|¡~[Ğ¡Ø¾OVÕlE•[8K¡ÕëŸcg3:ïÜ¢òs>º‰e]R¸3†R .ĞÛ>4İ_ş„÷W	y®…-ò¨É#Ù‚şE%»«Uu¹  ¤AïÑ~–Ñ -*e½<Är1î3•	.HwóuyÿRñZ½›A7îeëì) Îıöº-Ì® ñÅTBêÙVÔ•×1X¾À"°¿£úAÚ£G?ºpe¶øÇÌà[Åì…‰É{£õØ‰Ø"5f¢Mud×Öß”ØÑÛò¨ã˜µŞÂ½nRÂ÷şSwiîÍÛÍæ3ğfÃ?ééÌ“º|‹İ¾'ÃcÀ»¤ÍÀåÂoDNÑµËZ¡¤[‹¤ÆÛ‚Q¥ò÷,ÇÁqßâ8BVŸyl!¿aİdŠw•^H•Kb!{öÂ#=ZJ2(z€‚â§ík–pra¶˜qlÈë2:SS·<ûYöfÄ"÷6ÛK1q%?1Ú ·Æ¨?+;µìŒ·nÆ‚—Ğ{+± C}6:†Š}·#Y±ÜpÌ‹Ã|qí(å8ı{Íåè/¨¼(ĞéMç¹BgQÍ#DãM1Vt—W zQ
{â w«ywÔ@õoÙŸ Çï…Øì4v¿.LÿŒĞ%±¸I×¯;ugF§èıàjÒKºdçÏ»A)/s.‹ïñŸúrÈ‘Ê}ï²8<+ilÔ0
‰e’“Ç
Šê]yˆ£Änœ›¿?%ë†“®Y«ÆöÅvr¢h+5o
·Ö“nB•6†ëçÉ˜çwåÔd‚Ø²¦N5p³P>¡KPíù›¡€Ø˜bÆS2²”ärÛ•—üg˜¬ÀŒRú1¡$1L7Í†ÓßdD/LP9“8âZ'V·†8f=rÅî–˜¯èçVê1Î·[É‘!®·h#ò`ÉvlÌ …SíWÊ7Ù¥D@~MóÔ˜¹?Xƒ‘··nMİ„«Œ|z£ÙV¿ÜæOä0³Éh†(V>¬¸…Î*¾´Èÿ ü| R¾1ÔºØ‰¬yaE _²"`†§|/IJUäjß|Ú«lú'jøòìÒ3ä?RĞúg–-½†X0UÃŸ¦¨¾U2ÚK—›Fa[²rá@î–š:„ÁámŸ>Ï€gšnuĞs~˜¿±ÀTş®‚½üÆ!0»„Z±à£R4fÜaqádÑ‘4Ãzé`ÈTf:v~ìÖ å%X3ÁºJ©ÓtíÄªÆ]E?‰µQÎ†‡f›“y%‹N]ğ8JÉ3ŸeFNs	Ç#Xİ‘µä=æîf¹gj7`\º—4×MÌş Ñ²”	.«€şä\l×¥ßŠ•PtêBW·`R +ÕVãE¢ÒåôÔzF¤–ïı¨JäÑ^Òîë
6jKØgW6¯Ëêædcxô¢—síŞÆ…à¾>ae,I‰º_ø‡ûEbê#*áò$”àbÆuØ#MŞœZñÈ¬#¾È=ØY/ÑîƒÍHatá8B¬yï[¥0f(‡ĞólìóèúRëoö‘Ğ¢k™Xn 1#-6õ7üBÇ°^0-ÎïT0J§Ù€º¼Ã&7¤¼,c‰Ëü9èùS¼%Ê	
œI‚îÜåY[ofpûû¸dŸß<hüqµ™d
g¥ÒLlQR‚Ç1bCÏ$ïº¢OéÛÑ*Yuy«øé–l
Åÿ‹M‚C>¾ˆŸaö­–b-B¸‚o"‹Ñ€rŞÕÌŒHæé8/‡Õ8ƒÈæ÷ÙÒbev¦hc•0ØU­€=¼?äÎ±ÛßÉqá‘Ç»K¡5·m?P53âÜVòÖ˜$nİÇó€a;­¡—SÂ9Z