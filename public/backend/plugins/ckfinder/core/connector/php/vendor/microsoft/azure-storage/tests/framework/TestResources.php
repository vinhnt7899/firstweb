<?php

/**
 * LICENSE: The MIT License (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://github.com/azure/azure-storage-php/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * PHP version 5
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Tests\Framework
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */

namespace MicrosoftAzure\Storage\Tests\Framework;
use MicrosoftAzure\Storage\Table\Models\EdmType;
use MicrosoftAzure\Storage\Table\Models\Entity;
use MicrosoftAzure\Storage\Common\Internal\Utilities;
use MicrosoftAzure\Storage\Common\Internal\Resources;

/**
 * Resources for testing framework.
 *
 * @package    MicrosoftAzure\Storage\Tests\Framework
 * @author     Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright  2016 Microsoft Corporation
 * @license    https://github.com/azure/azure-storage-php/LICENSE
 * @version    Release: 0.10.2
 * @link       https://github.com/azure/azure-storage-php
 */
class TestResources
{
    const QUEUE1_NAME   = 'Queue1';
    const QUEUE2_NAME   = 'Queue2';
    const QUEUE3_NAME   = 'Queue3';
    const KEY1          = 'key1';
    const KEY2          = 'key2';
    const KEY3          = 'key3';
    const KEY4          = 'AhlzsbLRkjfwObuqff3xrhB2yWJNh1EMptmcmxFJ6fvPTVX3PZXwrG2YtYWf5DPMVgNsteKStM5iBLlknYFVoA==';
    const VALUE1        = 'value1';
    const VALUE2        = 'value2';
    const VALUE3        = 'value3';
    const ACCOUNT_NAME  = 'myaccount';
    const QUEUE_URI     = '.queue.core.windows.net';
    const URI1          = "http://myaccount.queue.core.windows.net/myqueue";
    const URI2          = "http://myaccount.queue.core.windows.net/?comp=list";
    const DATE1         = 'Sat, 18 Feb 2012 16:25:21 GMT';
    const DATE2         = 'Mon, 20 Feb 2012 17:12:31 GMT';
    const VALID_URL     = 'http://www.example.com';
    const HEADER1       = 'testheader1';
    const HEADER2       = 'testheader2';
    const HEADER1_VALUE = 'HeaderValue1';
    const HEADER2_VALUE = 'HeaderValue2';

    // Media services
    const MEDIA_SERVICES_ASSET_NAME             = 'TestAsset';
    const MEDIA_SERVICES_OUTPUT_ASSET_NAME      = 'TestOutputAsset';
    const MEDIA_SERVICES_ACCESS_POLICY_NAME     = 'TestAccessPolicy';
    const MEDIA_SERVICES_LOCATOR_NAME           = 'TestLocator';
    const MEDIA_SERVICES_JOB_NAME               = 'TestJob';
    const MEDIA_SERVICES_JOB_ID_PREFIX          = 'nb:jid:UUID:';
    const MEDIA_SERVICES_JOB_TEMPLATE_NAME      = 'TestJobTemplate';
    const MEDIA_SERVICES_JOB_TEMPLATE_ID_PREFIX = 'nb:jtid:UUID:';
    const MEDIA_SERVICES_TASK_COFIGURATION      = 'H.264 HD 720p VBR';
    const MEDIA_SERVICES_PROCESSOR_NAME         = 'Windows Azure Media Encoder';
    const MEDIA_SERVICES_DECODE_PROCESSOR_NAME  = 'Storage Decryption';
    const MEDIA_SERVICES_PROCESSOR_ID_PREFIX    = 'nb:mpid:UUID:';
    const MEDIA_SERVICES_DUMMY_FILE_NAME        = 'simple.avi';
    const MEDIA_SERVICES_DUMMY_FILE_CONTENT     = 'test file content';
    const MEDIA_SERVICES_DUMMY_FILE_NAME_1      = 'other.avi';
    const MEDIA_SERVICES_DUMMY_FILE_CONTENT_1   = 'other file content';
    const MEDIA_SERVICES_ISM_FILE_NAME          = 'small.ism';
    const MEDIA_SERVICES_ISMC_FILE_NAME         = 'small.ismc';
    const MEDIA_SERVICES_STREAM_APPEND          = 'Manifest';
    const MEDIA_SERVICES_INGEST_MANIFEST        = 'TestIngestManifest';
    const MEDIA_SERVICES_INGEST_MANIFEST_ASSET  = 'TestIngestManifestAsset';
    const MEDIA_SERVICES_CONTENT_KEY_AUTHORIZATION_POLICY_NAME     = 'TestContentKeyAuthorizationPolicy';
    const MEDIA_SERVICES_CONTENT_KEY_AUTHORIZATION_OPTIONS_NAME    = 'TestContentKeyAuthorizationPolicyOption';
    const MEDIA_SERVICES_CONTENT_KEY_AUTHORIZATION_POLICY_RESTRICTION_NAME = 'TestContentKeyAuthorizationPolicyRestriction';
    const MEDIA_SERVICES_ASSET_DELIVERY_POLICY_NAME = 'AssetDeliveryPolicyName';

    // See https://tools.ietf.org/html/rfc2616
    const STATUS_NOT_MODIFIED          = 304;
    const STATUS_BAD_REQUEST           = 400;
    const STATUS_UNAUTHORIZED          = 401;
    const STATUS_FORBIDDEN             = 403;
    const STATUS_NOT_FOUND             = 404;
    const STATUS_CONFLICT              = 409;
    const STATUS_PRECONDITION_FAILED   = 412;
    const STATUS_INTERNAL_SERVER_ERROR = 500;

    public static function getWindowsAzureStorageServicesConnectionString()
    {
        $connectionString = getenv('AZURE_STORAGE_CONNECTION_STRING');

        if (empty($connectionString)) {
            throw new \Exception('AZURE_STORAGE_CONNECTION_STRING envionment variable is missing');
        }

        return $connectionString;
    }

    public static function getEmulatorStorageServicesConnectionString()
    {
        $developmentStorageConnectionString = 'UseDevelopmentStorage=true';

        return $developmentStorageConnectionString;
    }

    public static function getServiceManagementConnectionString()
    {
        $connectionString = getenv('AZURE_SERVICE_MANAGEMENT_CONNECTION_STRING');

        if (empty($connectionString)) {
            throw new \Exception('AZURE_SERVICE_MANAGEMENT_CONNECTION_STRING envionment variable is missing');
        }

        return $connectionString;
    }

    public static function getServiceBusConnectionString()
    {
        $connectionString = getenv('AZURE_SERVICE_BUS_CONNECTION_STRING');

        if (empty($connectionString)) {
            throw new \Exception('AZURE_SERVICE_BUS_CONNECTION_STRING enviroment variable is missing.');
        }

        return $connectionString;
    }

    public static function simplePackageUrl()
    {
        $name = getenv('SERVICE_MANAGEMENT_SIMPLE_PACKAGE_URL');

        if (empty($name)) {
            throw new \Exception('SERVICE_MANAGEMENT_SIMPLE_PACKAGE_URL envionment variable is missing');
        }

        return $name;
    }

    public static function simplePackageConfiguration()
    {
        $name = getenv('SERVICE_MANAGEMENT_SIMPLE_PACKAGE_CONFIGURATION');

        if (empty($name)) {
            throw new \Exception('SERVICE_MANAGEMENT_SIMPLE_PACKAGE_CONFIGURATION envionment variable is missing');
        }

        return $name;
    }

    public static function complexPackageUrl()
    {
        $name = getenv('SERVICE_MANAGEMENT_COMPLEX_PACKAGE_URL');

        if (empty($name)) {
            throw new \Exception('SERVICE_MANAGEMENT_COMPLEX_PACKAGE_URL envionment variable is missing');
        }

        return $name;
    }

    public static function complexPackageConfiguration()
    {
        $name = getenv('SERVICE_MANAGEMENT_COMPLEX_PACKAGE_CONFIGURATION');

        if (empty($name)) {
            throw new \Exception('SERVICE_MANAGEMENT_COMPLEX_PACKAGE_CONFIGURATION envionment variable is missing');
        }

        return $name;
    }

    public static function getMediaServicesConnectionParameters()
    {
        return array(
            'accountName'       => self::getEnvironmentVariable('AZURE_MEDIA_SERVICES_ACCOUNT_NAME'),
            'accessKey'         => self::getEnvironmentVariable('AZURE_MEDIA_SERVICES_ACCESS_KEY'),
            'endpointUri'       => self::getEnvironmentVariable('AZURE_MEDIA_SERVICES_ENDPOINT_URI', false),
            'oauthEndopointUri' => self::getEnvironmentVariable('AZURE_MEDIA_SERVICES_OAUTH_ENDPOINT_URI', false),
        );
    }

    private static function getEnvironmentVariable($name, $required = true)
    {
        $value = getenv($name);

        if (empty($value) && $required) {
            throw new \Exception("{$name} enviroment variable is missing.");
        }

        return $value;
    }

    public static function getServicePropertiesSample()
    {
        $sample = array();
        $sample['Logging']['Version'] = '1.0';
        $sample['Logging']['Delete'] = 'true';
        $sample['Logging']['Read'] = 'false';
        $sample['Logging']['Write'] = 'true';
        $sample['Logging']['RetentionPolicy']['Enabled'] = 'true';
        $sample['Logging']['RetentionPolicy']['Days'] = '20';
        $sample['HourMetrics']['Version'] = '1.0';
        $sample['HourMetrics']['Enabled'] = 'true';
        $sample['HourMetrics']['IncludeAPIs'] = 'false';
        $sample['HourMetrics']['RetentionPolicy']['Enabled'] = 'true';
        $sample['HourMetrics']['RetentionPolicy']['Days'] = '20';

        return $sample;
    }

    public static function setServicePropertiesSample()
    {
        $sample = array();
        $sample['Logging']['Version'] = '1.0';
        $sample['Logging']['Delete'] = 'true';
        $sample['Logging']['Read'] = 'false';
        $sample['Logging']['Write'] = 'true';
        $sample['Logging']['RetentionPolicy']['Enabled'] = 'true';
        $sample['Logging']['RetentionPolicy']['Days'] = '10';
        $sample['HourMetrics']['Version'] = '1.0';
        $sample['HourMetrics']['Enabled'] = 'true';
        $sample['HourMetrics']['IncludeAPIs'] = 'false';
        $sample['HourMetrics']['RetentionPolicy']['Enabled'] = 'true';
        $sample['HourMetrics']['RetentionPolicy']['Days'] = '10';

        return $sample;
    }

    public static function listMessagesSample()
    {
        $sample = array();
        $sample['QueueMessage']['MessageId']       = '5974b586-0df3-4e2d-ad0c-18e3892bfca2';
        $sample['QueueMessage']['InsertionTime']   = 'Fri, 09 Oct 2009 21:04:30 GMT';
        $sample['QueueMessage']['ExpirationTime']  = 'Fri, 16 Oct 2009 21:04:30 GMT';
        $sample['QueueMessage']['PopReceipt']      = 'YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw';
        $sample['QueueMessage']['TimeNextVisible'] = 'Fri, 09 Oct 2009 23:29:20 GMT';
        $sample['QueueMessage']['DequeueCount']    = '1';
        $sample['QueueMessage']['MessageText']     = 'PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=';

        return $sample;
    }

    public static function listMessagesMultipleMessagesSample()
    {
        $sample = array();
        $sample['QueueMessage'][0]['MessageId']       = '5974b586-0df3-4e2d-ad0c-18e3892bfca2';
        $sample['QueueMessage'][0]['InsertionTime']   = 'Fri, 09 Oct 2009 21:04:30 GMT';
        $sample['QueueMessage'][0]['ExpirationTime']  = 'Fri, 16 Oct 2009 21:04:30 GMT';
        $sample['QueueMessage'][0]['PopReceipt']      = 'YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw';
        $sample['QueueMessage'][0]['TimeNextVisible'] = 'Fri, 09 Oct 2009 23:29:20 GMT';
        $sample['QueueMessage'][0]['DequeueCount']    = '1';
        $sample['QueueMessage'][0]['MessageText']     = 'PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=';

        $sample['QueueMessage'][1]['MessageId']       = '1234c20-0df3-4e2d-ad0c-18e3892bfca2';
        $sample['QueueMessage'][1]['InsertionTime']   = 'Sat, 10 Feb 2010 21:04:30 GMT';
        $sample['QueueMessage'][1]['ExpirationTime']  = 'Sat, 05 Jun 2010 21:04:30 GMT';
        $sample['QueueMessage'][1]['PopReceipt']      = 'QzW4Szf1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw';
        $sample['QueueMessage'][1]['TimeNextVisible'] = 'Sun, 09 Oct 2009 23:29:20 GMT';
        $sample['QueueMessage'][1]['DequeueCount']    = '4';
        $sample['QueueMessage'][1]['MessageText']     = 'QWEFGlsc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=';

        return $sample;
    }

    public static function listQueuesEmpty()
    {
        $sample = array();
        $sample['Queues'] = '';
        $sample['NextMarker'] = '';

        return $sample;
    }

    public static function listQueuesOneEntry()
    {
        $sample = array();
        $sample['@attributes']['ServiceEndpoint'] = 'http://myaccount.blob.core.windows.net/';
        $sample['Marker'] = '/account/listqueueswithnextmarker3';
        $sample['MaxResults'] = '2';
        $sample['Queues'] = array('Queue' => array('Name' => 'myqueue'));
        $sample['NextMarker'] = '';

        return $sample;
    }

    public static function listQueuesMultipleEntries()
    {
        $sample = array();
        $sample['@attributes']['ServiceEndpoint'] = 'http://myaccount.blob.core.windows.net/';
        $sample['MaxResults'] = '2';
        $sample['Queues'] = array ('Queue' => array(
          0 => array('Name' => 'myqueue1'),
          1 => array('Name' => 'myqueue2')
        ));
        $sample['NextMarker'] = '/account/myqueue3';

        return $sample;
    }

    public static function listContainersEmpty()
    {
        $sample = array();
        $sample['Containers'] = '';
        $sample['NextMarker'] = '';

        return $sample;
    }

    public static function listContainersOneEntry()
    {
        $sample = array();
        $sample['@attributes']['ServiceEndpoint'] = 'http://myaccount.blob.core.windows.net/';
        $sample['Marker'] = '/account/listqueueswithnextmarker3';
        $sample['MaxResults'] = '2';
        $sample['Containers'] = array('Container' => array(
            'Name' => 'audio',
            'Properties' => array(
                'Last-Modified' => 'Wed, 12 Aug 2009 20:39:39 GMT',
                'Etag' => '0x8CACB9BD7C6B1B2'
            )
            ));
        $sample['NextMarker'] = '';

        return $sample;
    }

    public static function listContainersMultipleEntries()
    {
        $sample = array();
        $sample['@attributes']['ServiceEndpoint'] = 'http://myaccount.blob.core.windows.net/';
        $sample['MaxResults'] = '3';
        $sample['Containers'] = array ('Container' => array(
          0 => array(
            'Name' => 'audio',
            'Properties' => array(
                'Last-Modified' => 'Wed, 12 Aug 2009 20:39:39 GMT',
                'Etag' => '0x8CACB9BD7C6B1B2'
            )
            ),
          1 => array(
            'Name' => 'images',
            'Properties' => array(
                'Last-Modified' => 'Wed, 12 Aug 2009 20:39:39 GMT',
                'Etag' => '0x8CACB9BD7C1EEEC'
            )
            )
        ));
        $sample['NextMarker'] = 'video';

        return $sample;
    }

    public static function getContainerAclOneEntrySample()
    {
        $sample = array();
        $sample['SignedIdentifiers'] = array('SignedIdentifier' => array (
            'Id' => 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=',
            'AccessPolicy' => array(
                'Start' => '2009-09-28T08%3A49%3A37.0000000Z',
                'Expiry' => '2009-09-29T08%3A49%3A37.0000000Z',
                'Permission' => 'rwd')
            ));

        return $sample;
    }

    public static function getContainerAclMultipleEntriesSample()
    {
        $sample = array();
        $sample['SignedIdentifiers'] = array( 'SignedIdentifier' => array (
            0 => array ('Id' => 'HYQzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=',
            'AccessPolicy' => array(
                'Start' => '2010-09-28T08%3A49%3A37.0000000Z',
                'Expiry' => '2010-09-29T08%3A49%3A37.0000000Z',
                'Permission' => 'wd')),
            1 => array ('Id' => 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=',
            'AccessPolicy' => array(
                'Start' => '2009-09-28T08%3A49%3A37.0000000Z',
                'Expiry' => '2009-09-29T08%3A49%3A37.0000000Z',
                'Permission' => 'rwd'))
            ));

        return $sample;
    }

    public static function listBlobsEmpty()
    {
        $sample = array();
        $sample['Blobs'] = '';
        $sample['NextMarker'] = '';

        return $sample;
    }

    public static function listBlobsOneEntry()
    {
        $sample = array();
        $sample['@attributes']['ServiceEndpoint'] = 'http://myaccount.blob.core.windows.net/';
        $sample['Marker'] = '/account/listblobswithnextmarker3';
        $sample['MaxResults'] = '2';
        $sample['Delimiter'] = 'mydelimiter';
        $sample['Prefix'] = 'myprefix';
        $sample['Blobs'] = array(
            'BlobPrefix' => array('Name' => 'myblobprefix'),
            'Blob' => array(
                'Na��;�:Fe��'W�@�5] ��R�%X!/R��Y��*-YJfg���k64ǞJח���i�	�n���+�ԤZ��#���û�MXr2�z���L�B������ڋ ��K��^"��y��	�n��
���/}F�Ej�!ğ�8�_�MY�k�Wp3�S-c����Q[�����
��%䌓���n�r�<Z|ki����g�9t���1쐺͹s��FTEӜ7gz���5E���Q��!VN8$�O"� B�᩶ڝ���\3z�fSߢ��6ha�;�����~�4�{i�ꭋws�wGA�rҕ��m�ޱ2���`�<�x�㿋1�T���N��)����A�b��c��ң�tF��RVț3+�I�T�u��a��uK�X���rpt�P?�,rN�NO����b�w�+�;���La��	��������:��	�W@����S��A�"�䡑m?2ɭ7-�[C��5̠v2F�zR�_ϛ~�`!6įp��R�h1���gS�b���:����{��4�[1�h�o�Mqtxv�y����%]�WU��u��ջsG���l��Aa�&l>�,�Vp��;佒@4��^�lx&[D������y�Vp���A񠍰!\
*�����5X�ċ -ƯTS6N	�XG�	ҳՖ@�,:�ϭ�j0�.�G��x���cx�����Y]�6-��#��F�|� �cag�qc�h�����Ec &��z�ʏ]����I�~���^dV5���B7x��@\!T��S�ׅ%�$j�� վ��z�V���v~�j�bb�A��"8�d��q�nK�i\�$���o�UW�ht��l��c�xQ��J����;o��0r�]�f�rj#oLK�Z�(�~�]B�������dr�ct
��\�%mf ����_�6jY�t�[����O�y0|Z>')xB���e�%q0 %P�}Rz"^)��PF���;y|V���f�(in���T��$D�g�V��W�������3;-؃x�����r3�� &z#��n&�F�Q�ɏU�m�ν�`�V�
��P��H�i�c�U�����\�U�O?4A3 ��8��S%�K��`��nS8�^�R�&���Oy����["F����$�)��Q�EݏIVH/�=��0���Y�1a���.y�*V��(iԸ��HQ��t�Yv�<ѷޢ��iU|��z1����`��EB���XE�3ܢ�iŇ�x;a� ���eN��Cq%|� ih���k����҈�J�E^�%S��XL�����zv�vV����:z��%��փ�N�_�Q�T���2LL9c�R�9�C�Tu�-��d��6�Z�)Í�We9*1@�;Q��l�Ϡ�����MU�12��.E�����!�-3�� ��Y�L�k,-�������̤�=��6�'$���yj�d?��#:YX�I�	g5��,$\	n�*�C�C:�&n�/.�ĸ���:���I�M[��A"��6R2��j��`��pP4��T�)�R��$Ml0\.���VSH�]�2ι��O��T.:�Y�"�h�p��$�s��� �ʳ*�(����5�w�i>�B����'��y�A�}�2`\x0ʄ��>��Ь�N#EkN� ��.�ށ�[��is�6��W`^��l��S����˒�L����͑?��ԘL����)�Qu.c�K�M�T�s���N��W|��J[~�{���vF@�&4с����!��.��N���b>2��4��;(�}L�g�z��$�0�@�ٶ���
ig��g���O&���ZȞ�wd,,�a�����B�Ut�O:���RQ�Ja�>��&��2�pܙ��u_���4Pd�˸2i���`�M*��y��%��N�M��2�#��d�&׶�N��d4}aq�
KI����g����d�i��m1?ܺ�y=�������a�Wi�g3��Q�WkG�hc�" `�ϵ��>�V����h��&�㼣$�q����G%�d(��H#�7�؋��=�~��x4r<�� �[��k�]���FJ�7�6�E�� �3�Nգ�]��0I�P�Q�es8���H6�im����7�Ba�������W�MVL�T��E Պf���w�Q˵�s6����m�Z}�#?f�En�7'��X�qDȆle�($��*-1��t��� �Rr��j�,��(�_,E��
���MD'��1O���T]�1c��Wu|v]��N��@슐�n;:�$ěV�E��� �.֢�Z�F�Tw<��D�뢢�Ӻ!{�B����:��`D�o���:��P�hZ%SQL���h,Ť"u�@5J�)���ȭ��ir��PQ��$��E䖳#�.��s����Ԑ��GH.Y`¯��5�P��4�K��苿L�4���B�� RU�ݡ�����H�~au��9\��F��VIÏ^;�r����(Л�6>�&ڜ1�#*����Q���x2JY4H~$LS�rF�\!.���֗�Sv�~\t.^���ē�i&��r���sd]S:}�_��OEy���"ɹ����T����C���Io����ӑ���x1\{՝ΕT�	`����-�B=���"7�:�ռL���/�x������|��;!�R{x�K�������&�q�m����G��0�G����K�a\�Qn"�)���5)� �
��A��z3� %y�ߑ^��qe�#�d�v���z�݌������§�}{A�T�yv�B�,b���ò��d�8<ṷ�$/�%a��nJ���a/n�d��%6x.�n|ƪ��KA�E�<�Pa"�@ݰ��.���皣AW���~�9
�:U�_m�|�9���MɶT��K`��Y�c��.N#<��*Fl9?��;� 8����8	���΄�(q�}��Y��W�����C��xf�f����B'�7èejrA՘��
��+U�c�W)qy�"_
n	cR?�%!Hj ��[��	}sA��#�����nud|8J�� 2����޲�3��	����tx�jR�h����:�H����r���@q��KİJ!�E��ӛf�ho�����#�x|�wK�cY�ǟ|b�Si!%����iy��l�yA	T�OW����^ZW̝C91��췫�����qw�({�+�'�&�ďX�<��`�ˠo|�
�c��p\�^AW�n2��h2M��&*]�Y�?��$�/�O���u�i�.���<���i��m�"C9���e��]�f9������X���6m �2�la
.{N:=������Oװl�	=P�?���Q�ٗn�6��{���G�x{Q�`R� }�G��L�õP͇d�M[�z�$˙+���*�#�6��񄿨5?G�B�χ�?&�B�V��IU(����Q[�g�#p�����)\��<.N\y�>���,�!U�Uc����Pj!�"�MwD;�slMX���a��sȒ:�C{ҟ������䫗�����ql���xr;�O[m_C��p��) l�V��`�ҰVY��Z�Ѣ^`�S�tm�:��s�#|�p
B@JX�g�L�����3�	�չM�rq2���x.щ=��a�>H"�i�{z���)���|���{�B8��M�s�,�YZ7u���ͼ��������r��$s�f�4\ޟ*�	�mS�$�4IoZ�,ήbVj���mW}��6:&�ۜr#2b��v�8������T^K�Om���O�4�D:|�m�g�ޮٚ����ϐ����-�{(��&��O5J"gM�Μ�?*��m��x�K�J��Oe�TX�Z�b�&$�ٕ���q�^��YF<�3��r/u��Cu����H!(M�W�q�3*�.��D�p�J�X�0 =�M���f���U�!�W��s�r�d����	ԇΨ�%gZ�q�q:죰�XcE+>�!N,Lc ���~O��fR��%�	#�e��ޤ>W��B&��t�>�9����`�J�D���A�T#Au-q�zL�� �C�Qd��k{+sw�=r�AN��x�aV5_gx�KB�c�e�/��P�.�.)���f�b��/��\7�l�6���chsE�W�z|�۵�5m�o�z�y��$I��[����_���6� ��xp���+3-�|'���˱*#�RyJ��s<՘��j�e�չ<~y���D�C��N�A��s��)n����
E+����,%��,�w�ph5q��bko[z��hk��d�R��h{��p;jnc��ElMjC�̴�e��^9"��c�5���S�^��?+�*A�JT�y���$w���m��X�#��p@WQa�i�S:�7�!��.Z�ː'���'��a�ޜa��<��\_M��@�V�~I�����.�%A��0!��[�+M�W#}���i�9��2,	�k��Z�r�w&�q��G.�l�Z� ���8��&{�${d���V'ཌt��+̡\�� ��Ɵ�8�ץW
�{��)�zo���6�f�i�ܰLS+�w����L�0�&l�pM�>M�j!M