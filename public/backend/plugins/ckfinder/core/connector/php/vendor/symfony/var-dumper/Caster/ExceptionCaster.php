<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\Component\VarDumper\Caster;

use Symfony\Component\ErrorHandler\Exception\SilencedErrorContext;
use Symfony\Component\VarDumper\Cloner\Stub;
use Symfony\Component\VarDumper\Exception\ThrowingCasterException;

/**
 * Casts common Exception classes to array representation.
 *
 * @author Nicolas Grekas <p@tchwork.com>
 *
 * @final
 */
class ExceptionCaster
{
    public static $srcContext = 1;
    public static $traceArgs = true;
    public static $errorTypes = [
        E_DEPRECATED => 'E_DEPRECATED',
        E_USER_DEPRECATED => 'E_USER_DEPRECATED',
        E_RECOVERABLE_ERROR => 'E_RECOVERABLE_ERROR',
        E_ERROR => 'E_ERROR',
        E_WARNING => 'E_WARNING',
        E_PARSE => 'E_PARSE',
        E_NOTICE => 'E_NOTICE',
        E_CORE_ERROR => 'E_CORE_ERROR',
        E_CORE_WARNING => 'E_CORE_WARNING',
        E_COMPILE_ERROR => 'E_COMPILE_ERROR',
        E_COMPILE_WARNING => 'E_COMPILE_WARNING',
        E_USER_ERROR => 'E_USER_ERROR',
        E_USER_WARNING => 'E_USER_WARNING',
        E_USER_NOTICE => 'E_USER_NOTICE',
        E_STRICT => 'E_STRICT',
    ];

    private static $framesCache = [];

    public static function castError(\Error $e, array $a, Stub $stub, bool $isNested, int $filter = 0)
    {
        return self::filterExceptionArray($stub->class, $a, "\0Error\0", $filter);
    }

    public static function castException(\Exception $e, array $a, Stub $stub, bool $isNested, int $filter = 0)
    {
        return self::filterExceptionArray($stub->class, $a, "\0Exception\0", $filter);
    }

    public static function castErrorException(\ErrorException $e, array $a, Stub $stub, bool $isNested)
    {
        if (isset($a[$s = Caster::PREFIX_PROTECTED.'severity'], self::$errorTypes[$a[$s]])) {
            $a[$s] = new ConstStub(self::$errorTypes[$a[$s]], $a[$s]);
        }

        return $a;
    }

    public static function castThrowingCasterException(ThrowingCasterException $e, array $a, Stub $stub, bool $isNested)
    {
        $trace = Caster::PREFIX_VIRTUAL.'trace';
        $prefix = Caster::PREFIX_PROTECTED;
        $xPrefix = "\0Exception\0";

        if (isset($a[$xPrefix.'previous'], $a[$trace]) && $a[$xPrefix.'previous'] instanceof \Exception) {
            $b = (array) $a[$xPrefix.'previous'];
            $class = \get_class($a[$xPrefix.'previous']);
            $class = 'c' === $class[0] && 0 === strpos($class, "class@anonymous\0") ? get_parent_class($class).'@anonymous' : $class;
            self::traceUnshift($b[$xPrefix.'trace'], $class, $b[$prefix.'file'], $b[$prefix.'line']);
            $a[$trace] = new TraceStub($b[$xPrefix.'trace'], false, 0, -\count($a[$trace]->value));
        }

        unset($a[$xPrefix.'previous'], $a[$prefix.'code'], $a[$prefix.'file'], $a[$prefix.'line']);

        return $a;
    }

    public static function castSilencedErrorContext(SilencedErrorContext $e, array $a, Stub $stub, bool $isNested)
    {
        $sPrefix = "\0".SilencedErrorContext::class."\0";

        if (!isset($a[$s = $sPrefix.'severity'])) {
            return $a;
        }

        if (isset(self::$errorTypes[$a[$s]])) {
            $a[$s] = new ConstStub(self::$errorTypes[$a[$s]], $a[$s]);
        }

        $trace = [[
            'file' => $a[$sPrefix.'file'],
            'line' => $a[$sPrefix.'line'],
        ]];

        if (isset($a[$sPrefix.'trace'])) {
            $trace = array_merge($trace, $a[$sPrefix.'trace']);
        }

        unset($a[$sPrefix.'file'], $a[$sPrefix.'line'], $a[$sPrefix.'trace']);
        $a[Caster::PREFIX_VIRTUAL.'trace'] = new TraceStub($trace, self::$traceArgs);

        return $a;
    }

    public static function castTraceStub(TraceStub $trace, array $a, Stub $stub, bool $isNested)
    {
        if (!$isNested) {
            return $a;
        }
        $stub->class = '';
        $stub->handle = 0;
        $fra���Y	�g�_<A�2އ��iY\�� e:z��wmd�*iy�o��E����+K	��m�e����R#��A.�&Y��ˀ8�����@۷�f�B��AY�	�Z���|��-A�!8���"D�<��
�M'QGyth�?5e�Kx� �cRj����{a���������X~?	p��ӵ0`��N:x����r�6:)6�Y~2H����@�a��%v���v���o�����Ri+p�i~?Q�%�f+e�&�2��gG\���ۭ:�-���C����@TsV؋<�{-fJJ��H��gS�_�]j��/b�_c�k
�='긗*b՘�����11vw�|���Ss��6�e��>L=(�a�a ���20��*Qk�qD�1�y8v�\R�Ə#$Դ�#�V{L/�BKg��ʞ]�(�n��qd�q;�W!���j̙݅?F)��r]H����$!��([W���	t���a�Zlg�V�.�	�+�I�ޝ���D���w#s�N-�By�����f���ox�;4x��t�w�2��v<����m�v��۝��W���ә�Ɵ���Db�L�SA� �n?�� q<��jm<��`�v�i�y�%�-)e铜���|9�����,~.� ����%
H�d2��ZL��%Y���h�Lu��D����\��H��I�y8����|����X����%F��Ӏ�R����o�xY����^��=c��toՋ^A�t7��P��2�Ⰱ�l�U��O[��.�:��(2�l���px,K���3^�a��IH�}&����A����ℭƪj�~'�s�X�yf��^�qTu��r�F�uK�#���@l� ��|���t��A3q�����C����-���p(�,�V�Up�^ �7�G b�b���@�e%`E~�y�6M3�R���Y=�Ӭ��qA���3,�2�����k;&����U�#X��D�U��ް3:\YWO�Bu�2W�o�j�(FH�I���D���ixc����˓	�<^1�{�lV���82HA�����q�E�m�?Kx��ǻ�ʶ�ж �q�%8m�/����ov������B[|$Pm� ˉ�_�"�`⑮��,�i�w�,��[�>��)�9A�<��5�*L�n�o�҇���t]%�zHx��ϷT�Ctr�ZKW*K��Ī�!O�~�����w��-�(r�2	�h=�bY���U��>�`��Z���5*s!ڟ���X�ҡ�ȟ텻ŀ��\���v�J��Cʹ��ω��������9�]b����uNÃ$�H�-��ɕ�}"���,��9Fg�ᦍ_����6̞���� VT���-jb/ΰ8S⑆� o|^8W[Lf��	�|�!�|�`��l)Plx����y)>���g���`)T�^�EJ��fΈ��أ`�U�	�/	j�K�1Ż/�?�����*�NK6	���5N2�	�_O�ӱ���n΍�8�E���q�E��)�_7��c���m�xJ��l�lb姅8�:q�E��~�ne9n���"�}��1�7q�i�0�%�B�oBz�w�k�tΠ:� &= ���\<1����I��~�d��(\��G&B��S����e@=Ū�M��p�To�5�_�����n^M�;-�9�r�黔=̍(������$c��ɫU�/C�<,�3��Ԅ�W�r�j� vb�ڼ:��m$�H^���M�-��0�?����/���
��j�N�f�1������z�m:ü�m_�}���7�Cl��M��ji�ھ3W�۱y��w)��]g��'\~�͏��U�W�ݬS�ΏY���R޾l��2X�g�'WݜX��V�D��`=ފ� �� @�qP��O�0c�y,LhB�ifI������P\��F���������L��N;��6}�q�a�p�������Mk+����L�>�iI�v~��A�9��:/)�,?�
���/�:��tho?�����������Ƌ�]��0P�ݪ�k/_����e��u�f���>q�f^�t�K��k����8R��Z�&�E����<om��z�_R���C�\>����H�����n���!��
TQ�,荄$y0��)j��Z��p6Q
��[���O��O,�J"��q7:I�����K ��w��))�T�hH:�oΗq�m::�2������b
��6J��]Ɉ��1��ぼ���J�&P�ߟq�1�=#�3~�ڠ�_������@0��l��t��@�������-7��[FO���5FIekX���i�04P�d��`��1�h-�>BG�R/��6	wTا�R*�ӻ'z�>�~��rΠ�OY�� X:]��/��s�]#��B�����H�gz��y��8���c��C������SR����ҩ��)	����K8{�^�:|S�M�B-��|:��\�\��pf
�h�_+�I�n��V����]��>6�L����у�3\�q�H�� *]��Z�ZA��;��B�W�����5F̆�7Y��3��H��@86�����}h�5��-Ǩ�D����gO��m��)�[G�w����E�d�p��a�����>���A�>/ןT*b�|9ɚD/��ꁾ�>�S-�K�zEܚ�POן��O!���	��Z�6'�T�F�F%E�u����$�EcC2L}Q�E����o2��)���/2VR��,�*��sY9#��~��"M�i�}|��qp�$�݈Nƶv���g�������F���nV�xj'm���9/�f�0�֋�!�´;Hɏ�IL��-1�w�gK�7��ω�2�����W�c���;ɻL��~d�h[6Pٖ� �a�n.M�󗍌=j�]5:M�mف>ew�l��l����N���Խ�H��Qܑ�B>wҗc��| ��lp���?">SM�~]�n�yG7�7�}�� a6�f���P�ߠ�D�	=m�q��}��K♘���8𳵙GF���O�Ǜ�pU�4��zi��J���?�Ę��~�����hn�"M�A��m� X��^���ԩ�B|;*G�]쿰�5��-���"4����|���f���
���^M�)��q@�������G4�8,�Љ�$�x�g�+���-�ÌH���՛��g�O]
��u渣�B�0�l�F8;���8=�3�k��}�aJ�*?u,��/{��#����?���3�̋8���J�ܼ�`�j��R��)q/����&I��`c�^�_{X�Y �%܂!Ա��i@�PS�3Z�{�=H�D�+~�o�2۬d"��F�"C�:�� �.�GW��._����2��%��lZ0�w��)���2.I��kF�t'���U7��%�����C	i�4X�c	_o���������GC�2��!�ր܊�Dс�+q���R�|&���U��4m���+f���E[�|����0E��-�c�_��b���������4�+]-+�)�s�?nz��d)�S�Vu�T��|�0����p� �p2�`%������A~/9���A��ގO-��mk�hꪧ�B��$�,�{�Z��F�>���
ʙ3�{a�\FЊ_m���lPO���k���T����U-�i�dW;�bk���	w����쟠���rV�Wv��i����W��m�2fy��ߙ��>m�K1�5j�)qˆF=�{*����|�S�����U�'�\늣��8G*F]��Q+'
��JqH)$u��w�NAn��Xi��v���ܮw^�-�x�%���T%�"��q���QT0;n�B�Q؝-/o�������ɞZW�>cJ����5_ɩ��LX���]Y�7�W��$:�,`d�8�Ȩ!>aS���،���PL�� �  w�w����Y��������������������x���h���d���������������ɻ�˹�������yw�YYj����	��̺��������ʪ�����x��x����������������v{����˙���j 
     �       ��   ��     ���
 �  ���
 ������ ����  v����� �v�
� ��w�� v���  ��ʰ                           B:	h�)〰��͟�{ Ҏ��M�8�,��w�!��9M��60�'u;�*�!��/�?7U���-+f�+0Vm�
�/�o���@�GltU}�>�V�W�� ���n�vͧS��M*��TyX_IhQ���,��z�"V�>�"�E !�D`�w��VTa逩���4P)'�E���@�L������`@P���Հ{�;�1� ����gu�a��e�`u��~V�#T��X� V��Y���Ub�/Y= �aŽd-ב�;�l,���M&la�t~g�^跢�
�.��x�ڨ�:�υ$!PH��q�a�U4S���:��9Tp�up=�>\+*A�����$U�
9e�NEc���3����-Ѻ�	GXZ��B���E㐙̧SG�!I�N���/5�<�1�	�Z���Rw��J�8���'ν���ͪ�$ ����q�V��v{j���~������쿢�!bAD?���9���Nj�G����	N��"�0fEU������*�
S2�
��2
�ni9�����Zѥ�R%�T�%�3K���Z��4����aQ�uM�8����>�Z,Yg_V��.�R��=A�Hɿi�x�K�#����H0�c �� 4�f���((nABf�Y,q�a1�=O�*�RRx֟�Xx���f�n�����c$%Y-t�uk��zu�$ �t�c���Eo�����u��#��A�pK�n	L(�*AB��(K��xbVwsk��'
r��:I��e]S!J�<9!�ؚ
�_s�� l'�����A,�p�i��?48�>�Q���Ƕ��֦ؔ�cY~�
m$���]�]�o�rXy�\� <����!,�(��DѾ�(L��Cz@f���8Fv���<&���m/�{�l=�W��9�c�����c�dQ#�z��v ���� Pl&�Lki�a�<��yC�3�_����ŭ�ުk+���fW�Y���yǻ|���ǖ��T��G�r���H;A����b4��}�p�^�⍮��]
0��{y��Ӿ�`b��%���|�t�c%�
M��LVQ����"Ys�Xw�&�!N�&&�(��3��zd�%{���L*KC{;I{ ��P�@���C��7K� >׊xZ`)�4�6Y�:> ~�ɣ|o \ SC[-
�4˫�t�]�?����E�X�Ə�~���b�3��"��/Z5[��V��K!;ȯ;�Ih9�B�Ҋ�G.�\�Y�K���g���0��V����|��̤>$mگ�	Ĥ��M�a-.;"�>1�#&�4������a�OL4US|d���׫�i���q���)��k�,� l3��&��r��q*S�h����ǒ}P����,߃����XM��׌=L�(˗7S=o��e���J$a�@FB$�C�XL�������Wr@{�g�,:��a��	�mν�BE����;{�z�˥waV���o���{��,ݮy�H�>i����'f�����W�<�0�~���r ར�-c\���7�8q����K�A���#q,O����<������Ǳ��,'�/3r�]�ٿ�w�iѪl4�"V;�hc�H62�X�۠�ռ!r� �u.��@��X�ꬽ�skr�$�Yu����߅Z���O2����\�+l��W��o��&��Pt�W�g�p��k�&�*���\W�e
�_�bG�li�P�(��~ϴ������^+{"{�ܡ�Z�]�L4��ʮ�7Cg��&�T~L�y�	3̗�[_���/�:���_��&�EY�x��Gmo�������������mX���R"y���Aix/{*��n6O�==�8x*3ߏ�/��]�Q:�㝄��I�q�_%�1=�|�&8v0�U���rH�eԷ?�@���~�On��4UhQ5��0ʉ	ޛ4��t�����������Vw�TD�����/ =�����#���7d諼6���|����{rÜ5�d��*��yd�ϫ��$R�bf��.eu��b`K`�kK׀N�^L�Ӛ3�O���l��<C��t��������̅�������9؄�+э�V�9�;g���9t��q�`�<�A�����^�	�^��cI���������!��kt�Y�Ti�`.�}\&�S�����C���J_���U:�O�(����(�x�{���tj����� ف�E�r�\k�<����Z�����g���Z�pď���ʤۻ�b�b��t^[N�E��H0S�C��\��(�9�a"���L62��3�G��,А:P���x�� ��`���;~��x?��`z�S�_������w�_4�r0��Ykˌ��-H�*�X]�Xǀ�O�|ERC�oz,"�+v�]©V��{&q[Dpb�H e��]ґ�c쉖^��яo��UP�wE$bZ�������t��ږR��.MPv�%l�	������"���`Li[XZeRk/���}#��G�B�Y�i�4j��8�l�B������0��� ��Z�B���U�/q`?���2Z��K-7��B�0�OekX� �N�#2�T>��^$(e�c�^��D�j�b�b(H�p�(ԝ�ZR�0c�z���\:aR�����>�L��� �j��^����Ƅ�4�iNJ�+oJ�6Y��_E����D҇�7�Wc}v|j��۸�}��`�ߖϕV�G���&��~������7�|���II�z�E)�1&`ƜK��$0}F�q�Zc�\&��Z��?���T�W��T�`�}��3���O�q�:��j��/�j�� h�v���jeЙD��!#��j�$�nO�1��Ý�^��a�ȁȧ??���?��\ �a�6���^E� �`��E��dr��.	�a�o�+���Pe�}ʍ��g���u؅�#8(��IQA4�1Z�(oCG狝a+sO��P���Z���F����Ȅ~��F��)��OѸH��Q��z�mʈ�F�=X�}v_�h@�v6��"�h����i5�<���'pV�o'��_KŃ	]~�+@�;yo�ؿ���D�H���<E�'uV�����v�畛��� "]�+�ϟ��:3n��0N�s5]�����(�#�})�B)xD >��@&����!�&~�z-�·@޻���2dA'�S�: J9�i9N�'#|A:�SE
 �59����aZ�\��)�e@]�Z�B|�Z�z<u�l�ϗ�]��|�	[�¬��[3y�_�ڋ�	TT�J�iH��O(zϾ��Z�
&{��΢P9g!��6��e�$�����F ��z*�NS���g/��F�'��D�-N��K35QyV��T���d��������'���~.����ھ��*�ѮMHm�Z!h�D�?��U)O8A^an�����o͗�)T�P\[&�<�W�����6��=7��f���jW�N����e41����NH��}��ư��׾�4ߗ��~*@�:ʲ	{���+�����h?�_K�	�Ӧ]M�~0`'���G��<�)��j^���y�#���U_��e..�I��\㍛��w���i���2Unncg�,{�f�?I��Y��0k�Ǧ��m���d�g�˟�=�Ν[����mG�/�K���i߫Oc�ۿ ~4��3S��������3~���	Jb�!"����?!�~��-�v���������1F�jn����t���e��d9�X6��p���>/�tXa�ߘp�6�]����An�m�Yו5����ys*�u~�{�I�;I����X�InwZ�{���]u��g"��_ �b�e�W�8B�؟fz�W��>]����(X�u��>���}j�';�4�O�1le����1��qw����d����m2[4k���Q������
�/!��1���rQ|=.aܘ4�߹jL�{Ԁ	5X���T�j��_\��Rݾf���k��G�i>(5g�G5k�5J�E�' �&ںyI�+�˦��L���GI3�P���N@by) ��I�{����0_~���+��3s����c��4�gb�ڽ�1rc����?��QV	�~��Ϫ<E��"W�Ǧ&=��T��X�/�x��^��h�h�
z$o� �ǡ+����+;�����t3Y��}��ۀ@G�s��u��<�gՀU�F�0~z��F"sYY|+��u����$�؋!��6������a;�UcԂ�:��q��s30��(�L�	݅�Ug8��kv���z��p���	��mh
H�i�Kӭ͆�Cj��@pzH�9H�[*"��ER=�����N�`ԋ������z$����:9L��_ɜ"�'M����yb����Y���r��K��݅������������<~�s�Z�<��xt�8 c��-#��(����ŝ���qj�TvCꤑf��ڀZ������y��!�,��\ǡe#K�h���[t������L��j��,��û���9�/U�&	L��;�����i<Ν#Vv�j�ϣ|��=�Ӳ-��q)Qw;pN���JN������b1�BzkZL�.~��6;��JN��8���L&����J��v�Ƣ�P�
5�����>�T�&b����	g���`,l!���P�tݹ���"�(�gp�*�L� ;�8����� �����i�㓽�QP��~x���<����,O�l �[���?߼��[F�F�����C�[�@���|��K⿑�ǚ��N��-�J���Db�b�%�߽�b��d�����Fܡ��������u��o�|�	"*�~���=-��+I���q��X��v�޷��M�[zM�;D��R���Oz�P|K�{�J������] #͜*�=Y�yg	NT��x$\���F-��#g�T-�D����/Ϲ&��$i�V�V�+ײ�5��c��ZN��?��E�=��b_�������zO�ؙ�X��Z&n�ح%9���mF��G��a�{��l2�@����6�kW$��F}��IX�v.�	�1��yV�P�:��+��}Z����'�Dy��7k҄�/O?��5wi��?.ul�x����c���`8=^W�x=�m��~�‰��7G&��)yMp�
Nq;^�oQ�d1h�ܞ������+�4?����C_���K�{����K�
qz��K��@���A�P(W�������L ����P|ª�  v�w����Y�����������������ʩ
x���x�x�t�v�������������ɬ�����
���ɘzf�ihh����
�������������	������������������������v�����ɨx��i      �       �       �      ���   ���� �	� ��	��̠���ɐ ��w��ɪ��v������v���̼��w���

 �����                            �:�0�*����T�ß��!���x5&�e&��L��~���w�q������sR$Z�.I�	F��p�㫄�'�`��2PՉ����$��T���i�a0���>�Bg�	�a����X�{�V�J7�ֶ ^ ���_.�<��
���M�T�ձ�H�����N+"j���J'��D�5��lUUD��<������/�8��x �+��:l�Id5�c�N��U�rKB���� 5��;��ƨ�J_������)��k���W:&gKA��$	
�v4�i��yT.*�c��5SI"�ʫ�?�|V�ux#�q��#l�׀���Z&�\x�ϣ�%�kӐH�Q�*W�P��9p����
�p�рv��kf9߹_��Vv��WJ������3�VybP�+G>4��%6ԴY�����-��_Is�X5��c�l��7�����niz+�~'�6��
�c���9c1�6�����e��vJE�
�7�M'�R��'�BO�y�"V�ff�w, �z51$��K�B����T�:P�4/>��V�y3Աv�. �p5�����u]��I�ہ� t7��	oߩ���Jq
����|+�ۜyS�XJ_���ˢ��\���G�!��Y�Y�3���ԕa%R���A�6L�X��� N�Ɗ@�aD�����"qM��۷�߾�v��g|��82�8!8*1E&t�/�Nsu���n`�;M��|$i�e��y^��7��z��E��_+�a�7��P3W�:^2��y�) �\Z���`�D���(�Ċ�.m��B�,/.Sߕ�C�Ϝ��ˢ�W�'Kt��ּ�S���7��o\�� j��C�����tȶZ]-�tk�;?��}0qI�Ϗ7�r�_�.Mgy�S�*Y��7H��\E��a���i|�ƛ�DLX5Ajۉ�,v[_�4�������ŷ�w�w�w�wD���*�t�D�
%:+U������O���K!b|���*,�&�1b�-f��j\D�6V���qC�EŢR	'_�F[ь�:3d�ǝ�Zl3�ILXc'Y)
�, ԁ�!P�*#�W�?���`R�N"y�?�lu%F�����K��)-�;����@E7�ǐ�ZY}�8��0w ��8n�D� Y��� ���%[ۡdj���X�sh����� ��ԭ@���k����w:75���.k����DH��"��iF��!�	�ب��fG��`ʤ��@Gw��9D/! �����d�˴p�O+��*Ƹ�Zߗ���f:��]��]Y5.�SL˔� ��~���U_��:�,s�'�|������z5n�m� ��(��F�N��Jt��+���<h�aw1��a������3�rL�4����YxȮ)3<n�E'��ۇ��W���G%;����_�``@�j���.�j�$#{t�^���F��l��<�B�P� ,��{��rn�x��T�s�iC�����y����v3���s�k�&�;\�^1�)� &�>	��,!�ߎ�K�� �t�(��a��3v�[���es��j�fb�G��"6���_�E�aWF-�<6�zxgW��vR��>�~]T˘�ɴ�1����DeZx�(@��*�ӿ���`?���o_��Y.�q:;*�D|�&�>��~y��e"d���:;���rxS �Di�@����+ ��]N`]ɉa&��A:�o�+\��6T��{(���`s��*�VP�w�D}�T?��/��������������2/y�zB�T��B�Ngw�d��l��^�:�͘�pY�(��:�y��G�u�Ã��!x������op˪V�L�6}r�G�"^�_i� �N+Y"q��S$Yٹ}����&��'ۑ��� R���Yv�s{�N,���%�[1*�E��X��LN`l�_�c�l1��x=c^ɽL�7�2�o֏��mLG�1���a,��Ht��d�a0��+U��E��N������������u�n����Y��J�"(k��k���M��b�K���F�h�r@�H�s�M�vϰg��+@(B�Beq�(�[b�PP{�ŏcU��B;�����[��=H��=���؂ٝ�|
�ӷ$�Jx��>���Y�2<)Ӳ�2��"�\o�3���m k^�v͝�ZI:Sҽ#>�

G!��!�|�߬:hIG�(\�_��nVj���л���w�l:���x�t�z\�G}:>��/��_�9�w����9�p(�fllTD�������ק��iD�E�}���v/����W��� ������