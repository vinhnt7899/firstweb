(function(p){"object"==typeof exports&&"object"==typeof module?p(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],p):p(CodeMirror)})(function(p){p.defineMode("javascript",function(oa,t){function q(a,c,e){E=a;I=e;return c}function w(a,c){var e=a.next();if('"'==e||"'"==e)return c.tokenize=pa(e),c.tokenize(a,c);if("."==e&&a.match(/^\d+(?:[eE][+\-]?\d+)?/))return q("number","number");if("."==e&&a.match(".."))return q("spread","meta");if(/[\[\]{}\(\),;\:\.]/.test(e))return q(e);
if("\x3d"==e&&a.eat("\x3e"))return q("\x3d\x3e","operator");if("0"==e&&a.eat(/x/i))return a.eatWhile(/[\da-f]/i),q("number","number");if(/\d/.test(e))return a.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/),q("number","number");if("/"==e){if(a.eat("*"))return c.tokenize=J,J(a,c);if(a.eat("/"))return a.skipToEnd(),q("comment","comment");if("operator"==c.lastType||"keyword c"==c.lastType||"sof"==c.lastType||/^[\[{}\(,;:]$/.test(c.lastType)){a:for(var e=!1,d,b=!1;null!=(d=a.next());){if(!e){if("/"==d&&!b)break a;
"["==d?b=!0:b&&"]"==d&&(b=!1)}e=!e&&"\\"==d}a.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);return q("regexp","string-2")}a.eatWhile(K);return q("operator","operator",a.current())}if("`"==e)return c.tokenize=Q,Q(a,c);if("#"==e)return a.skipToEnd(),q("error","error");if(K.test(e))return a.eatWhile(K),q("operator","operator",a.current());if(R.test(e))return a.eatWhile(R),e=a.current(),(d=ba.propertyIsEnumerable(e)&&ba[e])&&"."!=c.lastType?q(d.type,d.style,e):q("variable","variable",e)}function pa(a){return function(c,
e){var d=!1,b;if(L&&"@"==c.peek()&&c.match(qa))return e.tokenize=w,q("jsonld-keyword","meta");for(;null!=(b=c.next())&&(b!=a||d);)d=!d&&"\\"==b;d||(e.tokenize=w);return q("string","string")}}function J(a,c){for(var e=!1,d;d=a.next();){if("/"==d&&e){c.tokenize=w;break}e="*"==d}return q("comment","comment")}function Q(a,c){for(var e=!1,d;null!=(d=a.next());){if(!e&&("`"==d||"$"==d&&a.eat("{"))){c.tokenize=w;break}e=!e&&"\\"==d}return q("quasi","string-2",a.current())}function S(a,c){c.fatArrowAt&&(c.fatArrowAt=
null);var e=a.string.indexOf("\x3d\x3e",a.start);if(!(0>e)){for(var d=0,b=!1,e=e-1;0<=e;--e){var f=a.string.charAt(e),g="([{}])".indexOf(f);if(0<=g&&3>g){if(!d){++e;break}if(0==--d)break}else if(3<=g&&6>g)++d;else if(R.test(f))b=!0;else{if(/["'\/]/.test(f))return;if(b&&!d){++e;break}}}b&&!d&&(c.fatArrowAt=e)}}function ca(a,c,b,d,f,h){this.indented=a;this.column=c;this.type=b;this.prev=f;this.info=h;null!=d&&(this.align=d)}function g(){for(var a=arguments.length-1;0<=a;a--)f.cc.push(arguments[a])}
function b(){g.apply(null,arguments);return!0}function x(a){function c(c){for(;c;c=c.next)if(c.name==a)return!0;return!1}var b=f.state;b.context?(f.marked="def",c(b.localVars)||(b.localVars={name:a,next:b.localVars})):!c(b.globalVars)&&t.globalVars&&(b.globalVars={name:a,next:b.globalVars})}function y(){f.state.context={prev:f.state.context,vars:f.state.localVars};f.state.localVars=ra}function z(){f.state.localVars=f.state.context.vars;f.state.context=f.state.context.prev}function l(a,c){var b=function(){var b=
f.state,e=b.indented;if("stat"==b.lexical.type)e=b.lexical.indented;else for(var h=b.lexical;h&&")"==h.type&&h.align;h=h.prev)e=h.indented;b.lexical=new ca(e,f.stream.column(),a,null,b.lexical,c)};b.lex=!0;return b}function k(){var a=f.state;a.lexical.prev&&(")"==a.lexical.type&&(a.indented=a.lexical.indented),a.lexical=a.lexical.prev)}function m(a){function c(e){return e==a?b():";"==a?g():b(c)}return c}function r(a,c){return"var"==a?b(l("vardef",c.length),T,m(";"),k):"keyword a"==a?b(l("form"),n,
r,k):"keyword b"==a?b(l("form"),r,k):"{"==a?b(l("}"),U,k):";"==a?b():"if"==a?("else"==f.state.lexical.info&&f.state.cc[f.state.cc.length-1]==k&&f.state.cc.pop()(),b(l("form"),n,r,k,da)):"function"==a?b(v):"for"==a?b(l("form"),ea,r,k):"variable"==a?b(l("stat"),sa):"switch"==a?b(l("form"),n,l("}","switch"),m("{"),U,k,k):"case"==a?b(n,m(":")):"default"==a?b(m(":")):"catch"==a?b(l("form"),y,m("("),V,m(")"),r,k,z):"module"==a?b(l("form"),y,ta,z,k):"class"==a?b(l("form"),ua,k):"export"==a?b(l("form"),va,
k):"import"==a?b(l("form"),wa,k):g(l("stat"),n,m(";"),k)}function n(a){return fa(a,!1)}function u(a){return fa(a,!0)}function fa(a,c){if(f.state.fatArrowAt==f.stream.start){var e=c?ga:ha;if("("==a)return b(y,l(")"),F(A,")"),k,m("\x3d\x3e"),e,z);if("variable"==a)return g(y,A,m("\x3d\x3e"),e,z)}e=c?W:M;return xa.hasOwnProperty(a)?b(e):"function"==a?b(v,e):"keyword c"==a?b(c?ia:X):"("==a?b(l(")"),X,N,m(")"),k,e):"operator"==a||"spread"==a?b(c?u:n):"["==a?b(l("]"),ya,k,e):"{"==a?G(za,"}",null,e):"quasi"==
a?g(O,e):b()}function X(a){return a.match(/[;\}\)\],]/)?g():g(n)}function ia(a){return a.match(/[;\}\)\],]/)?g():g(u)}function M(a,c){return","==a?b(n):W(a,c,!1)}function W(a,c,e){var d=0==e?M:W,f=0==e?n:u;if("\x3d\x3e"==a)return b(y,e?ga:ha,z);if("operator"==a)return/\+\+|--/.test(c)?b(d):"?"==c?b(n,m(":"),f):b(f);if("quasi"==a)return g(O,d);if(";"!=a){if("("==a)return G(u,")","call",d);if("."==a)return b(Aa,d);if("["==a)return b(l("]"),X,m("]"),k,d)}}function O(a,c){return"quasi"!=a?g():"${"!=c.slice(c.length-
2)?b(O):b(n,Ba)}function Ba(a){if("}"==a)return f.marked="string-2",f.state.tokenize=Q,b(O)}function ha(a){S(f.stream,f.state);return g("{"==a?r:n)}function ga(a){S(f.stream,f.state);return g("{"==a?r:u)}function sa(a){return":"==a?b(k,r):g(M,m(";"),k)}function Aa(a){if("variable"==a)return f.marked="property",b()}function za(a,c){if("variable"==a||"keyword"==f.style)return f.marked="property","get"==c||"set"==c?b(Ca):b(H);if("number"==a||"string"==a)return f.marked=L?"property":f.style+" property",
b(H);if("jsonld-keyword"==a)return b(H);if("["==a)return b(n,m("]"),H)}function Ca(a){if("variable"!=a)return g(H);f.marked="property";return b(v)}function H(a){if(":"==a)return b(u);if("("==a)return g(v)}function F(a,c){function e(d){return","==d?(d=f.state.lexical,"call"==d.info&&(d.pos=(d.pos||0)+1),b(a,e)):d==c?b():b(m(c))}return function(d){return d==c?b():g(a,e)}}function G(a,c,e){for(var d=3;d<arguments.length;d++)f.cc.push(arguments[d]);return b(l(c,e),F(a,c),k)}function U(a){return"}"==a?
b():g(r,U)}function ja(a){if(ka&&":"==a)return b(Da)}function Da(a){if("variable"==a)return f.marked="variable-3",b()}function T(){return g(A,ja,Y,Ea)}function A(a,c){if("variable"==a)return x(c),b();if("["==a)return G(A,"]");if("{"==a)return G(Fa,"}")}function Fa(a,c){if("variable"==a&&!f.stream.match(/^\s*:/,!1))return x(c),b(Y);"variable"==a&&(f.marked="property");return b(m(":"),A,Y)}function Y(a,c){if("\x3d"==c)return b(u)}function Ea(a){if(","==a)return b(T)}function da(a,c){if("keyword b"==
a&&"else"==c)return b(l("form","else"),r,k)}function ea(a){if("("==a)return b(l(")"),Ga,m(")"),k)}function Ga(a){return"var"==a?b(T,m(";"),P):";"==a?b(P):"variable"==a?b(Ha):g(n,m(";"),P)}function Ha(a,c){return"in"==c||"of"==c?(f.marked="keyword",b(n)):b(M,P)}function P(a,c){return";"==a?b(la):"in"==c||"of"==c?(f.marked="keyword",b(n)):g(n,m(";"),la)}function la(a){")"!=a&&b(n)}function v(a,c){if("*"==c)return f.marked="keyword",b(v);if("variable"==a)return x(c),b(v);if("("==a)return b(y,l(")"),
F(V,")"),k,r,z)}function V(a){return"spread"==a?b(V):g(A,ja)}function ua(a,c){if("variable"==a)return x(c),b(ma)}function ma(a,c){if("extends"==c)return b(n,ma);if("{"==a)return b(l("}"),B,k)}function B(a,c){if("variable"==a||"keyword"==f.style){if("static"==c)return f.marked="keyword",b(B);f.marked="property";return"get"==c||"set"==c?b(Ia,v,B):b(v,B)}if("*"==c)return f.marked="keyword",b(B);if(";"==a)return b(B);if("}"==a)return b()}function Ia(a){if("variable"!=a)return g();f.marked="property";
return b()}function ta(a,c){if("string"==a)return b(r);if("variable"==a)return x(c),b(Z)}function va(a,c){return"*"==c?(f.marked="keyword",b(Z,m(";"))):"default"==c?(f.marked="keyword",b(n,m(";"))):g(r)}function wa(a){return"string"==a?b():g(aa,Z)}function aa(a,c){if("{"==a)return G(aa,"}");"variable"==a&&x(c);"*"==c&&(f.marked="keyword");return b(Ja)}function Ja(a,c){if("as"==c)return f.marked="keyword",b(aa)}function Z(a,c){if("from"==c)return f.marked="keyword",b(n)}function ya(a){return"]"==a?
b():g(u,Ka)}function Ka(a){return"for"==a?g(N��A.�@� �mE�J�>���%��fiA�r��4��H��ۓf
�@#Slؗ<�\O&�y���UGu������iMu���I3��ˮ���=�U��n{���/�_������^KR�+�D�l�VEWC]_�͡�i���S�%�R.a#˙�_H(j�^bR�y_$���w9v�� ������������%j�NP��})��qAkod��
L��οma|��kM�U#��Z�b#��8����j��S��՘�"�(��S��`l�b?T�+J5��R�:��|�B���d�>�G,C�1���ǿ��м@Ƞ�`CYHT�?�H4��׌ԏ����v`bFC��t�9Wᥬr3<Q)7�!Ա��I7�?'F���փˊa������ʡ�
���W<ઘn{�3��NO;:��ˇ�4EQ=-�%�>�K!�	'�T
�[O��+w�Ƣ�F��2�Bbk�Q���� �����u,�·rr;�)N��U�UOU;u�zC4����A/��� �5����C�����bh���%���ŽN���o#{9��3��;DA��Xcs����+,0*�m}G�>�ҭ2��8L�{�aj���}~��1�iq}\?�K��9�N}�]�N[�Р`r ��F�l>�B��#^#Ut�����<����LA����p��h�uܘ�{�q�-��Xbt�	�y��ǥ�9�~�A�j��m��G��y��F[ȏ�^�s���{��`�S�WtB^�����T�������8���0��Z҇M�O�T������~b�����P�A�q�����1E���W�A7�ܿl���g���rB��l��KC����/wI�����%N�B}>���h��"V��&��]\���3�,3����?!d��ݭ彩8��~�:q�	����0���Įzm-c�r��\�QӢ�����~����|���N{i�<�^B��AM�����Դ9�Wj�o�`/~��P���n����:
�~.��*�\S:GY�Y�&fX95`9ܠ:C��U��$0���Wb{�f��N�1�"4�����s&ܴ�{�u���mE��B���/*��ј�AN���0�A��3l��O�ҫ"��QT�_��������AJd
|��H��#�]�H�Hp�+�hAw��$B����4=�*���5
�Ĭ����	�5(`Q`��G3K�O	lӍuF�0cz��A�sZդKW�da=-RNp�4�H��)H�(giLr��aB`���9�Փ�|h�W��-D���?��r����ϥ�Jt0��2�0x{��c�5(	i�]����)4Z�@|�}L�y�2Q�d��*��Z/�n�&�:y����o,�)z�w.��iE`�ǅ7/��������U=7�#��������-MOY�����K������dN{�ru
̐4m�F�!"�_W�`5ao8j�x�����Ⲅ��S���5�#�����?
#h
@r1�L����������M�F�bN)���$%:���Fs%�33�7Bd1�;�*��{����B���g֗��$���� �x�b�Ѿ���(�B���<'��B��2�q]p|y:��۫a�䄢�mZߗ.�t`�ζ&l�F����(a6�F��Z� z�eG�sEF�
#5���`ʞ�� Q-r�9����Pت8��+FM��|Pz��uhM"i�����U�=r����0��׍�1lZL ��<���.nù�MM;�n��C�8D�y�Z��xdu(���N�n��PB+*6Z����c�C{
[�8H��Z��_�ӌ �Ȇ��Xq��Uw�;���6W mS���v���qLv��h�S�7���/�uZ�Gp�r0?�g���zi�b(,{�(��kE��bX#���;]!��ŔTy�Bq��S^�QQ���������y����Q�q0�ǘ.-C0Yz*�J�G���S>����k���f�Bk��vd��]��V�[,[rA����s����u����E8a���������F�=_��`�'@&���	S�21��fpm�0���>���}����]q^Lu�\G�f��g�U����:*�`��^I�7š%DҵK m��|g1fȷ�L����+ׅ'��x�X�U�zd(O3�T
c:TY{z���t:�t��i��d"����-�]����~ޘ8�b7hx�nY~|gc�i��_D	���+��C�+�a��n�b��B���߹+ �:�
���=��2����1�.h��Mu1��G`�m@���A={$:�a�Dx�lU��
w��e�ա�V��)��������P+S٫V]�Y����L�I� �.����clR��J>���7E~ͭ-�)m�f~L�Z��'�滲>�yKuyĕ�����#6K[!Xw��n�wc�����Z~ￊ2PE�.q���o�?_(Ӌl��2:�a�x#����N\=��,f�2p����(����$��h�<����W,�+;z-��'gk�D�,9�
�o���5�S8��+�>����Y�:m�S���A�Ĭ�
 `��m�dO�"T_ 4��MCU�S�;��ú�����r`*��zg�\%Y����{�؀�w��V�����.�?�jL�h%��*�\:RYmԛG����w��H&Ǉ�G��(���"�g��T�CO>cA�!G%�Sr��C�%.����Y�HےGo���U���V���{=���4tK΂fy���04��Q�u�p�nl]eVaL�����Q[qgw/�]�B�_2��Xg� �h�hEk�;2?�@�`)�xP���g����Aַo�0�\/�sݠ �*��>���b<�d�J!�j}Y���/tE9�WU�_�<�EJ�|�#QN����17Tp�S���-W��2��5vJ��Wt�UYU|��� �G%f��
d��e�����G���S�C�ȭ\�t2�LV�q&���a&L0��{M��fXD#��Z[��*$��I.og:�m�	�14�h��i�Z�.5u����0-�/�c�$��̯n��<��?G Cn	�kh��V��M�z�[6c�E�ݏſy=�XZ��{5�[K��R7&��3s��>�+�-.�5vr���!��� �H��?"�H��`vz�-@�	�ί>?�3%��'�C�޴C�DR�i�����.wNW�9e4�0&){�/�>7=]~���i�5���+DQzAbs�1tW�@�l��~�9��c�A'�������<ÒA{�q_{��q�v�WB��W�ʆ�a+m�_���ÙE&�/~�.���l�O�h����LN�OH�إ�t�Z�b�3�C.5�Y���O�ļ��Z�g�%Q�r\9@�h�$>��6���q�$�e3�}uEvql0洊R�
;p�Qw�}�^:t�57�4$v��e�5�#T�#)<P�t�A²X�h�������ˍF�L�(��F�jw�\Q�R{5�?�R���h� �SS�M��L�9�N���&b���}��r�f�\|@�%v�I�{6�����P"Gl��/X�;^�	W�H���T�	JZ��毎���b*%k��WO��x��Ӭ���h����J_[��~"m�F2�:�\[��o8��M����n����1�������L������<w�披�tL��)�!�zR�ps��̏$�4Y�p���Z$}�#��~�0��R����V�	�z/���������N�U<���wve�(��`(��9*y �0�v3��Bh���5���&a���|�<+)�j�&�9G�*$!��\ª^3�gH�T?���>�X!�<�:� ��	�v21��B���k@�$�hR�ix�{�BiY���<��+�c���!L��$ f��&�C�����T������{�ɭ������G��P��pHp|����x��kt�&�4��������5��<;�B�rhHP6>3)�׆�f�~C�4�._09���_*�8FF�nE�}�ei����SȠ��%^�!?)xW묐��������� V5���шmS��|P��h>�v7q���q`��"O]�