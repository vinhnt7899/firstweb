<?php

use League\Flysystem\Cached\Storage\Memory;
use League\Flysystem\Util;
use PHPUnit\Framework\TestCase;

class MemoryCacheTests extends TestCase
{
    public function testAutosave()
    {
        $cache = new Memory();
        $cache->setAutosave(true);
        $this->assertTrue($cache->getAutosave());
        $cache->setAutosave(false);
        $this->assertFalse($cache->getAutosave());
    }

    public function testCacheMiss()
    {
        $cache = new Memory();
        $cache->storeMiss('path.txt');
        $this->assertFalse($cache->has('path.txt'));
    }

    public function testIsComplete()
    {
        $cache = new Memory();
        $this->assertFalse($cache->isComplete('dirname', false));
        $cache->setComplete('dirname', false);
        $this->assertFalse($cache->isComplete('dirname', true));
        $cache->setComplete('dirname', true);
        $this->assertTrue($cache->isComplete('dirname', true));
    }

    public function testCleanContents()
    {
        $cache = new Memory();
        $input = [[
            'path'       => 'path.txt',
            'visibility' => 'public',
            'invalid'    => 'thing',
        ]];

        $expected = [[
            'path'       => 'path.txt',
            'visibility' => 'public',
        ]];

        $output = $cache->cleanContents($input);
        $this->assertEquals($expected, $output);
    }

    public function testGetForStorage()
    {
        $cache = new Memory();
        $input = [[
            'path'       => 'path.txt',
            'visibility' => 'public',
            'type'       => 'file',
        ]];

        $cache->storeContents('', $input, true);
        $contents = $cache->listContents('', true);
        $cached = [];
        foreach ($contents as $item) {
            $cached[$item['path']] = $item;
        }

        $this->assertEquals(json_encode([$cached, ['' => 'recursive']]), $cache->getForStorage());
    }

    public function testParentCompleteIsUsedDuringHas()
    {
        $cache = new Memory();
        $cache->setComplete('dirname', false);
        $this->assertFalse($cache->has('dirname/path.txt'));
    }

    public function testFlush()
    {
        $cache = new Memory();
        $cache->setComplete('dirname', true);
        $cache->updateObject('path.txt', [
            'path'       => 'path.txt',
            'visibility' => 'public',
        ]);
        $cache->flush();
        $this->assertFalse($cache->isComplete('dirname', true));
        $this->assertNull($cache->has('path.txt'));
    }

    public function testSetFromStorage()
    {
        $cache = new Memory();
        $json = [[
            'path.txt' => ['path' => 'path.txt', 'type' => 'file'],
        ], ['dirname' => 'recursive']];
        $jsonString = json_encode($json);
        $cache->setFromStorage($jsonString);
        $this->assertTrue($cache->has('path.txt'));
        $this->assertTrue($cache->isComplete('dirname', true));
    }

    public function testGetMetadataFail()
    {
        $cache = new Memory();
        $this->assertFalse($cache->getMetadata('path.txt'));
    }

    public function metaGetterProvider()
    {
        return [
            ['getTimestamp', 'timestamp', 12344],
            ['getMimetype', 'mimetype', 'text/plain'],
            ['getSize', 'size', 12],
            ['getVisibility', 'visibility', 'private'],
            ['read', 'contents', '__contents__'],
        ];
    }

    /**
     * @dataProvider metaGetterProvider
     *
     * @param $method
     * @param $key
     * @param $value
     */
    public function testMetaGetters($method, $key, $value)
    {
        $cache = new Memory();
        $this->assertFalse($cache->{$method}('path.txt'));
        $cache->updateObject('path.txt', $object = [
                'path' => 'path.txt',
                'type' => 'file',
                $key   => $value,
            ] + Util::pathinfo('path.txt'), true);
        $this->assertEquals($object, $cache->{$method}('path.txt'));
        $this->assertEquals($object, $cache->getMetadata('path.txt'));
    }

    public function testGe������jj;�a�X'+|��j�<[!|`�ʡ�:��ذ�4�t�~�e�s/XO�Bq�%��''�) �v E ��B)Ҧ*�n7�<�����(�*̟�֊.��7���,Rjr�D���EP� a)
A�nh�X���C�c�9q��/x9uϠsp&��VȄ5O���+��?�d�>Yr����� c/Z�<]`��+�Xy1���������Ί!������O#������W��q���П�Z`K� y*�<���'4;�����jy��h �P���#���f���ѽe�pp����>�����0\�֍�ƙ�.���7k!�1Y��fS��8ހDZ�p���p�Xz�B���CRa}�3�̵#���Tne�Z��gp�Ѳ�A�H���.����;A�y�%N�u*��)�!`vH���NQ �^�ney?���O ��o��7�����ܭd��96_�X����X��fU\aned˧�Q��$�dmS)�ɕ�)b�ɷ4 ����H���B |o4ZXA}���r����)�`LJXU���K����O'�H`К��ޫ�f|�+�H��~�w��Ń@-�[E�~B��Ʀ3C;ǉ!��a��j�� }�ǎ4��OJW��{v>b�M�ѵ>IJѐ��ٰt�n������^'��ʓ� �t�-Ȗt._0�ׇ�U7g�J��H����vk�;6i��� ��4��J�(i�.u���@E��;o����7	��=�=L� ܙ�} ��"���p����^D�e �ֹ�N�Z��|%��Q���s�`�����!�="�ۊщ�}�%(?�j���N�M>���]7ⱻ�F.�_�65^c�R)hQ�z��Z������n�����q����W��
�|Mmb x_��I��>�_�ޞ%0�/�d��������z8�^��D��:T:r4��gcɸ�u~C�grb���7�/� 9 �:�X_�yF~|�`�E� ����������O ��VU,��Z�+��� L��,VΞ��q"�ܰ B�?�8@�]N���[�M&��	Æ\�<ߚ�C@�,�HAmf�
g��rQ�W�a	5��"��E�=4���,\H��c,N�� :��)
��nF�xGτ�`��u
�p�"g���p)��ST��Ruo�g���ȩGл4��4�Tt�uH�Z�ð�YT���g� �c'F���5å�G�Χ:��{���̜��*Cq=��sו@���~��F�1��bX�u�I(=wYEp��Lr�r�gj{cF�eV� �^��2���>����r�t�Gx�M��֠�C!�/=�b��<�w>G��eLY�)-��m�sc�9/g�?��;Iu�@�	�_�Y\���v��m�9���l�\u,1[qt3S|�	w�*��V��<��S��r�������.S�JR�˯�/mq��#�[��]��E簷�jn��@�`Aڜ���']X��#m�o��
� �)'��2����߿���kx�� S�>��
cq��O`�5+�m�?��hA�Q+ޱ�"�,�ƮnHq.ğ3���8��I͊��϶>��W[GQ�q̊l�"�$�Ȅ��|���-'
�C� :c$I�KN�G��
3}����2�܎���8%���� �+𚀐ِ�f*|��V2:(`V�ھ
�����Z�;���ߢ���i$���	� �\] �Q�.�>��.s����\��TjEm:+)��xI� F�w4d7Ep�aՂ��A]A�X���s���t�bQ��hHu~�z�\�)����.Zr����HtH�X�ǨnxJ��D�#��iT��a������69�N�e'F�] �T_��iT��i�J�2�#��a�RHF�FU�{���� H��?    v�w����i�����������������ʘ���h���u���������������ɹ���������xw�Yiy����ʹ� ɫ�̪����������wx�{�����ɻ���ɬ����fz�˘������i   �           � � �  �wɺ �  ��ʩ�� ������ ���v���� ��v�����w�����v��� ʺv�̺������     ��
  �                         ^H*�*�֘�3'�n��E�:]h&�
ز^�L2P|����1�ӌ<����`�*�0Lh�0�9`��E(��0}�.$��ZL�tD�#0rB�4������TyH�.a�՗�jB �ET|�� �T�ntT ��N�(J�L��4�*��tA��4<��i��F�9�����ߺT@ߐ��\'X�7���j=�&�͝R!��藯ۤ�5"�=15��5�g �E�Z��ꋲ�'F�HQ�v|W�!\S�3�sC4t�tuA9P�F��@��3��Mv����g�1��O��6h��*?ŧ�5k[;�>���p#F��M�����g1�]��!�,��� ���X@b1k�(�Τ�`���)C��<�)X�G�$��Ea� zƱ��f�|��R�������a�nC��L��ra)zK;�go��r^�g��ƜCn��̢�6���j�8.As]�F���0���Ι�^L睩�^�ܝ&*q� )�/g|5�֨*�rEԡ+*��#RQ��6ITQ�_1�ɷ,�c����Ubq� �?^OQ���x���	.�[�����oŬ��� ���6��b��E�I���"��x��R; �|�{��D]~0�&�H������:��'+�CVo��	�Em�$Z�������G���W����~PB��ץ��8�!͸�Oy�����͛r�Q*��n��V*0��p�S���y��3��è���'w<��#6:V4m�� ��^��>��  �ȉ$��#GE�1�d�dG���A�$�5�I���d�Æ�=��RE���jY^[��[�������='dP��ΏSL�{����%�.�r���m0�T�� �*�J��u���N��) �	9'b���6s�l�8&�2Q,(��8�X��əی�Q�R&��}<���B��z����0s���sh7��"6BB*����$
6�(7::��muSw�J�*W	����n��*7I�
?�8���N�?�8�!^��lI�G����7�ҋ7��W���k7hE����6������M��֐�vuGJ媰�'�gxh-���%(�Pj�[z�OȀĕOt��@AM�]Q
K830���Ydр�������<�=�R@���0H5<��3��w@ �π�� �h44 3�ع,�v���7����,��)��ru#ɪ~gPpm]�[���du?졐N_/�?�nQ�團�N1&��*L~�:\d-U#(̇?Ҁ��>��P	���О����Z�� �_=w���D�FB�ǰ�|��'�/�o�4��y�h �y;�� 骲bL�l�Pt�2�LgP]�Z ����Xg�R ]2��(�>����h /}A2�`r8E� �S�1爫�E��+����d 1���h