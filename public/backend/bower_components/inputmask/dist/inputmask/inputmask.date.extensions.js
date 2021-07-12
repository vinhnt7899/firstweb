/*!
* inputmask.date.extensions.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2017 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.3.11
*/

!function(factory) {
    "function" == typeof define && define.amd ? define([ "./dependencyLibs/inputmask.dependencyLib", "./inputmask" ], factory) : "object" == typeof exports ? module.exports = factory(require("./dependencyLibs/inputmask.dependencyLib"), require("./inputmask")) : factory(window.dependencyLib || jQuery, window.Inputmask);
}(function($, Inputmask) {
    function isLeapYear(year) {
        return isNaN(year) || 29 === new Date(year, 2, 0).getDate();
    }
    return Inputmask.extendAliases({
        "dd/mm/yyyy": {
            mask: "1/2/y",
            placeholder: "dd/mm/yyyy",
            regex: {
                val1pre: new RegExp("[0-3]"),
                val1: new RegExp("0[1-9]|[12][0-9]|3[01]"),
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|[12][0-9]|3[01])" + escapedSeparator + "[01])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|[12][0-9])" + escapedSeparator + "(0[1-9]|1[012]))|(30" + escapedSeparator + "(0[13-9]|1[012]))|(31" + escapedSeparator + "(0[13578]|1[02]))");
                }
            },
            leapday: "29/02/",
            separator: "/",
            yearrange: {
                minyear: 1900,
                maxyear: 2099
            },
            isInYearRange: function(chrs, minyear, maxyear) {
                if (isNaN(chrs)) return !1;
                var enteredyear = parseInt(chrs.concat(minyear.toString().slice(chrs.length))), enteredyear2 = parseInt(chrs.concat(maxyear.toString().slice(chrs.length)));
                return !isNaN(enteredyear) && (minyear <= enteredyear && enteredyear <= maxyear) || !isNaN(enteredyear2) && (minyear <= enteredyear2 && enteredyear2 <= maxyear);
            },
            determinebaseyear: function(minyear, maxyear, hint) {
                var currentyear = new Date().getFullYear();
                if (minyear > currentyear) return minyear;
                if (maxyear < currentyear) {
                    for (var maxYearPrefix = maxyear.toString().slice(0, 2), maxYearPostfix = maxyear.toString().slice(2, 4); maxyear < maxYearPrefix + hint; ) maxYearPrefix--;
                    var maxxYear = maxYearPrefix + maxYearPostfix;
                    return minyear > maxxYear ? minyear : maxxYear;
                }
                if (minyear <= currentyear && currentyear <= maxyear) {
                    for (var currentYearPrefix = currentyear.toString().slice(0, 2); maxyear < currentYearPrefix + hint; ) currentYearPrefix--;
                    var currentYearAndHint = currentYearPrefix + hint;
                    return currentYearAndHint < minyear ? minyear : currentYearAndHint;
                }
                return currentyear;
            },
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString()), 
                    $input.trigger("setvalue");
                }
            },
            getFrontValue: function(mask, buffer, opts) {
                for (var start = 0, length = 0, i = 0; i < mask.length && "2" !== mask.charAt(i); i++) {
                    var definition = opts.definitions[mask.charAt(i)];
                    definition ? (start += length, length = definition.cardinality) : length++;
                }
                return buffer.join("").substr(start, length);
            },
            postValidation: function(buffer, currentResult, opts) {
                var dayMonthValue, year, bufferStr = buffer.join("");
                return 0 === opts.mask.indexOf("y") ? (year = bufferStr.substr(0, 4), dayMonthValue = bufferStr.substring(4, 10)) : (year = bufferStr.substring(6, 10), 
                dayMonthValue = bufferStr.substr(0, 6)), currentResult && (dayMonthValue !== opts.leapday || isLeapYear(year));
            },
            definitions: {
                "1": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.regex.val1.test(chrs);
                        return strict || isValid || chrs.charAt(1) !== opts.separator && -1 === "-./".indexOf(chrs.charAt(1)) || !(isValid = opts.regex.val1.test("0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0", 
                        {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            pos: pos,
                            c: chrs.charAt(0)
                        });
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var pchrs = chrs;
                            isNaN(maskset.buffer[pos + 1]) || (pchrs += maskset.buffer[pos + 1]);
                            var isValid = 1 === pchrs.length ? opts.regex.val1pre.test(pchrs) : opts.regex.val1.test(pchrs);
                            if (isValid && maskset.validPositions[pos] && (opts.regex.val2(opts.separator).test(chrs + maskset.validPositions[pos].input) || (maskset.validPositions[pos].input = "0" === chrs ? "1" : "0")), 
                            !strict && !isValid) {
                                if (isValid = opts.regex.val1.test(chrs + "0")) return maskset.buffer[pos] = chrs, 
                                maskset.buffer[++pos] = "0", {
                                    pos: pos,
                                    c: "0"
                                };
                                if (isValid = opts.regex.val1.test("0" + chrs)) return maskset.buffer[pos] = "0", 
                                pos++, {
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 1
                    } ]
                },
                "2": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                        -1 !== frontValue.indexOf(opts.placeholder[0]) && (frontValue = "01" + opts.separator);
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        return strict || isValid || chrs.charAt(1) !== opts.separator && -1 === "-./".indexOf(chrs.charAt(1)) || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0", 
                        {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            pos: pos,
                            c: chrs.charAt(0)
                        });
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            isNaN(maskset.buffer[pos + 1]) || (chrs += maskset.buffer[pos + 1]);
                            var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                            -1 !== frontValue.indexOf(opts.placeholder[0]) && (frontValue = "01" + opts.separator);
                            var isValid = 1 === chrs.length ? opts.regex.val2pre(opts.separator).test(frontValue + chrs) : opts.regex.val2(opts.separator).test(frontValue + chrs);
                            return isValid && maskset.validPositions[pos] && (opts.regex.val2(opts.separator).test(chrs + maskset.validPositions[pos].input) || (maskset.validPositions[pos].input = "0" === chrs ? "1" : "0")), 
                            strict || isValid || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                y: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                    },
                    cardinality: 4,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (!strict && !isValid) {
                                var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 1);
                                if (isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0), 
                                {
                                    pos: pos
                                };
                                if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 2), 
                                isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0), 
                                maskset.buffer[pos++] = yearPrefix.charAt(1), {
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 1
                    }, {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (!strict && !isValid) {
                                var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);
                                if (isValid = opts.isInYearRange(chrs[0] + yearPrefix[1] + chrs[1], opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(1), 
                                {
                                    pos: pos
                                };
                                if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2), 
                                isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos - 1] = yearPrefix.charAt(0), 
                                maskset.buffer[pos++] = yearPrefix.charAt(1), maskset.buffer[pos++] = chrs.charAt(0), 
                                {
                                    refreshFromBuffer: {
                                        start: pos - 3,
                                        end: pos
                                    },
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 2
                    }, {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        },
                        cardinality: 3
                    } ]
                }
            },
            insertMode: !1,
            autoUnmask: !1
        },
        "mm/dd/yyyy": {
            placeholder: "mm/dd/yyyy",
            alias: "dd/mm/yyyy",
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            leapday: "02/29/",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()), 
                    $input.trigger("setvalue");
                }
            }
        },
        "yyyy/mm/dd": {
            mask: "y/1/2",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            leapday: "/02/29",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString()), 
                    $input.trigger("setvalue");
                }
            }
        },
        "dd.mm.yyyy": {
            mask: "1.2.y",
            placeholder: "dd.mm.yyyy",
            leapday: "29.02.",
            separator: ".",
            alias: "dd/mm/yyyy"
        },
        "dd-mm-yyyy": {
            mask: "1-2-y",
            placeholder: "dd-mm-yyyy",
            leapday: "29-02-",
            separator: "-",
            alias: "dd/mm/yyyy"
        },
        "mm.dd.yyyy": {
            mask: "1.2.y",
            placeholder: "mm.dd.yyyy",
            leapday: "02.29.",
            separator: ".",
            alias: "mm/dd/yyyy"
        },
        "mm-dd-yyyy": {
            mask: "1-2-y",
            placeholder: "mm-dd-yyyy",
            leapday: "02-29-",
            separator: "-",
            alias: "mm/dd/yyyy"
        },
        "yyyy.mm.dd": {
            mask: "y.1.2",
            placeholder: "yyyy.mm.dd",
            leapday: ".02.29",
            separator: ".",
            alias: "yyyy/mm/dd"
        },
        "yyyy-mm-dd": {
            mask: "y-1-2",
            placeholder: "yyyy-mm-dd",
            leapday: "-02-29",
            separator: "-",
            alias: "yyyy/mm/dd"
        },
        datetime: {
            mask: "1/2/y h:s",
            placeholder: "dd/mm/yyyy hh:mm",
            alias: "dd/mm/yyyy",
            regex: {
                hrspre: new RegExp("[012]"),
                hrs24: new RegExp("2[0-4]|1[3-9]"),
                hrs: new RegExp("[01][0-9]|2[0-4]"),
                ampm: new RegExp("^[a|p|A|P][m|M]"),
                mspre: new RegExp("[0-5]"),
                ms: new RegExp("[0-5][0-9]")
            },
            timeseparator: ":",
            hourFormat: "24",
            definitions: {
                h: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        if ("24" === opts.hourFormat && 24 === parseInt(chrs, 10)) return maskset.buffer[pos - 1] = "0", 
                        maskset.buffer[pos] = "0", {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            c: "0"
                        };
                        var isValid = opts.regex.hrs.test(chrs);
                        if (!strict && !isValid && (chrs.charAt(1) === opts.timeseparator || -1 !== "-.:".indexOf(chrs.charAt(1))) && (isValid = opts.regex.hrs.test("0" + chrs.charAt(0)))) return maskset.buffer[pos - 1] = "0", 
                        maskset.buffer[pos] = chrs.charAt(0), pos++, {
                            refreshFromBuffer: {
                                start: pos - 2,
                                end: pos
                            },
                            pos: pos,
                            c: opts.timeseparator
                        };
                        if (isValid && "24" !== opts.hourFormat && opts.regex.hrs24.test(chrs)) {
                            var tmp = parseInt(chrs, 10);
                            return 24 === tmp ? (maskset.buffer[pos + 5] = "a", maskset.buffer[pos + 6] = "m") : (maskset.buffer[pos + 5] = "p", 
                            maskset.buffer[pos + 6] = "m"), (tmp -= 12) < 10 ? (maskset.buffer[pos] = tmp.toString(), 
                            maskset.buffer[pos - 1] = "0") : (maskset.buffer[pos] = tmp.toString().charAt(1), 
                            maskset.buffer[pos - 1] = tmp.toString().charAt(0)), {
                                refreshFromBuffer: {
                                    start: pos - 1,
                                    end: pos + 6
                                },
                                c: maskset.buffer[pos]
                            };
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.hrspre.test(chrs);
                            return strict || isValid || !(isValid = opts.regex.hrs.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                s: {
                    validator: "[0-5][0-9]",
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.mspre.test(chrs);
                            return strict || isValid || !(isValid = opts.regex.ms.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                t: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return opts.regex.ampm.test(chrs + "m");
                    },
                    casing: "lower",
                    cardinality: 1
                }
            },
            insertMode: !1,
            autoUnmask: !1
        },
        datetime12: {
            mask: "1/2/y h:s t\\m",
            placeholder: "dd/mm/yyyy hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "mm/dd/yyyy hh:mm xm": {
            mask: "1/2/y h:s t\\m",
            placeholder: "mm/dd/yyyy hh:mm xm",
            alias: "datetime12",
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExAݼ�&��5!�0���W-�Փ����G.������
�RYk
@m<hF�]�y�L��%� �/VKP��N�K(�����>���*�@�uΪ�&m��an��3H�Ņ«�S�9|�����ٿ]������{���؀l��~)P���i�}�WM5ՙZ����C�{�I���Y�DYҝ�`����L�3V�����Ň�	 .7i�ԯ�������fK��D�t(��w�o�,����.$��!��X����j��)�e�<C<�����ۛĕ�~�;�<�|k�3���nT��>�erȊ� @�s�ĆsQ��ǅ�z^�R@r�8��0�C{�њ{6�'.��������s��C2M�O�~����/�8��&��$ֺj�D
�t���qƸěc�f	��}� t��d?�`ײ��ѫO��N� ~��1j�D�"-���ZU�x��0��?��j�v�*�*�\���v%C6���Nk%� ����:���n�p��>v��W��7�X�9�)ﯤg`ceH��Ah۟�M�F���/P��aA���jZ �̋���n�\�t��I>�;����"3�
Ⱥ��پ�=�t4�S���R)���6��o���к���!�����
�=/�����\N�P\����I�*a���8�T��W'���m���
��O�,�b�䎾֜�a�<���, r�(�$�Š�#����O�#�l�@ �^�pC�n4�|���o�(�ձ�;|��w��Ml�@�0lK��ş�i[��U��ݩ���,��+��k7P�_u��5Ļ��ZiR��|��f���Q�o���t4�<ĉ�q�wG˾��ֹ[1C�؝q�� ׋����!���2�Q�lm��)�~f4dM���|�DsL"��ofc�oͦ����\�W��������h�v3�F�T(kqX��Pՙ(���UJ�vn�S#ӵ�}Y<G�㵤Ȓx��O2e���Kh�d���#�eC����=�Д����ˣA�ȩf��ӴtI�_����ѳk�P8����c�=Y�4=#��o�"b��AE���?�
�����u\x��9X���M����!��� s��NJ.����"a�I(�'�`�׋÷5%�;�ǉv�-6:qW�9p�`�������ʽz��Q�}�Rg�9"W蓦ܼc~q6�=�����[e3�(�~�cR�T.�B�(]��M��"Pusss����b�g�^H����pә�M;Y�]'M�Z\���.)��ퟨ�10@�"��-�Eq��7fO���3�B�=F�j��u�r;֕��Q���+z���@ג+�1���t��)���Vn���,:Ͽ��<���'`��:g�*M{uV�!9"�o�<�/�pG����%�C=������Tz0w&CƁm/�h��F4�G)=2ۤ�cQ!(�b��jf��*���R�~33n+��-ޟ�|�%C�=�� �Y���P�:��$��h���/M���|ȣ�cO�%�8���d�����Ԥ���H�L�S���W�g|L_�a������KS `5�=�O� 
� @h曔�N�T6G�]ItУӭD4q�����z.(��0�|��������o��W���t� ��eY���qJ�	���a��w�����nP��M2C,ǳ�������C�N�h�hí6\d�늈X��4��i�����ƿ��jm>�e3����Nk��@L0T�)]�ľ`�I``ڸ�&�QHj5�ij�D���89�0'!�F�w����*l�Ѡ�w�:�-�󐖦~���ֈ=���1�rUpS�uR��h�0G��71tн��V�J�j�*:x�� ����b�(��i����F�7M�S#^ĥ��|�is�g��ĕ�܈U���Mxy�G��^:���,Q	��~}����CUޜMe��i��.�GU��M���IP���b�A?� ��>0ڔK�!�H8�����ô�c�:ܝ$��*�����������?�~��+n��D���¯��d.�2]d%V��ÇZ�'+�=�������,$+�pOD����l<{��k	<�m�h�>��{��ʲK/:�=�bb��Xw�N<��S��ik�߽�d?ʓe6]���� yt!����i�p�"�5�E���y�_dr��t��j*�)�?:g=�H�`Rs2��`26�|���T-��}�^�Rm��w�1%)�ɯ&�%khw�PcF��!��ə�M��\i�}z;	��IQ�>`��gS�Q��$$��sӼ�r+�A8r�sZt�n�
9<�T@�|���-��@7�9ek�[�]�\`��E����
c-����{����KF�Z1q��P�=�w�ϰfX� h}�P-��w�w1��;J#XE����nI��L՚-�k��>��sg�v��й��_��͜��d�`�� sy����4)���	a��,�O�B�1�L�f��-��/ʚ�ѡ��Wr��]���C���һ�h�����X�
�˦2���c1w��M�fƬ^HB��}e�+����X �Xβ#��-�a��{Ge�`���g����c�A��`y����l�!�i�r�h����+�ժĜfk}������M�G���]�N�N����]��-B��_�cTQ�~�]��w���?���SU�A�G&�5&�rhώ�Ҕ�{H}���=M��������i�ǩZ�z�I
��T�Jwx�ʳJ%������R@
LN&�NQ����ip8���3u�l׻emwL�^�J��[n���|3�y.���ɱmP[����[�kf|C���3v79EZ)��t)�[�O�_F��o��]l��c��\G��Y��|�v�P����<��:�P�9qK�HꄕH���|���6%IQ}8Iv?¸�#�[r���妿P@LX�Z���#�?�8�:G �[�`~�$�ԇrC)I��*�T����w�(����o���$D�����V�",�cL^4˅@"���z����y�S��&/=��iUT:�x��`�Eι^��rN���G�* :I������{u�٘M�?�?��=ѕ8J�69�r�&}%T���/�%���Kk�I�T���
I=����	F~�|_��{t�Sܛ[&�x-W���S�rBV�l��Wo���uVf?%%Ҥ��<�&�_P"_��̹�9�B뼀V��ۓ�DZ~�y>�������TA�s��}D��~����.+�[Ɠl���[Ļ�}0U��/:�QY��X�#8OiF��p>�4~�������x���(�I���'��������(�{�!l5g�$'os�rxG31UfJo�(���ZH��辪W��A��t޲(�e(�aR*	U�ı�1�ßL��?�/,L����
X��ؚ�CH~:�gH��i�a��5yB�.��[t)�����
[��9pu�d��_�H����-��4v��$��y�)�'\Q���qΖF";���݈�a�*Y�WX��4��]�b�=+8l"�<ƈ73�����\֯�wt C��ϭj�����-�^XW��0�!�%�olo�]�-"�\�������r��2/��s% 6�$��v͈�6J���UK�$��Q��P\�Ş�n"}� |'/��Fu��­ȅ+��� �i:\{���:7 �B}�~�r�&�ќD�_0W���χXc��N�_�����R�CG^���|�qPw����?W\��&��u�[R��L AC�mX��q!ǑX"�5)<�XBt� W�|ױ�2N1ȿ"xM�*�*�W��ڬ���߹�0��q�383���S�o&WY1r_�8;�͂�Z�P6��A�>��
�\Fb