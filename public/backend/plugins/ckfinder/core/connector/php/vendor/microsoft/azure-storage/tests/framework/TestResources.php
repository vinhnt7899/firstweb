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
                'NaşÃ;Ñ:Feü¼'WË@5]Â —ì€Rˆ%X!/RÏñ¢Yóœ*-YJfg°â³k64ÇJ×—‚òi‚	õnÈíâ+ºÔ¤ZÙ¡#¥Ï–Ã»ÇMXr2‘zşîÍLàBğô³åÚ‹ ×ßK¨²^"¿Ãyşš	§n…Ş
Ëò‘/}FéEj³!ÄŸŸ8±_ÁMYªkŞWp3™S-c±ú¾›Q[’®ûòæ
„í%äŒ“ıınÎré<Z|kiššóg»9tØâÄ1ìºÍ¹s‡¶FTEÓœ7gzàÂï5E³ÿ´Q°‹!VN8$çO" B¾á©¶ÚáÅÁ\3zŞfSß¢õØ6hañ;Ñîñ×Ñ~ì4ƒ{iŞê­‹wsËwGA÷rÒ•ôğmìŞ±2¡«­`›<šx×ã¿‹1¾TåÁºN—)·‘æAá¼bşŸc ¹Ò£¬tFäRVÈ›3+›I°Tßu®µa£áuKæˆX Ö•rpt¿P?Ê,rNœNO¸¿îébìwÛ+ö;£¥»La¿»	¹ŸŒ›µµ:±—	æW@²®‡ÃSèÿAƒ"÷ä¡‘m?2É­7-Ó[CäĞ5Ì v2FzRÕ_Ï›~µ`!6Ä¯pƒšR‘h1÷ëgS›b·ä£Å:ùÈ{ÂÙ4¥[1«h“oİMqtxvûy“óÑŞ%]ñ…WU «u›Õ»sGœ†Ël¹äAaÉ&l>ô,÷Vp†ô;ä½’@4õÙ^µlx&[Dü¬õ¬ÖøyÑVpùAñ °!\
*ìÖìş¼5XŞÄ‹ -Æ¯TS6N	ÏXG‹	Ò³Õ–@Ì,:ŒÏ­âj0‹.¥GÑ÷x‘Ãğcx°ıàÛÌY]Ì6-ˆæ#øªFÛ|¼ cag·qcøh µ·Ec &­ÊzÊ]Á•ÀIò~˜²Í^dV5ª‘‹B7xªÇ@\!Tí¾”¾S¿×…%á$jÊÂ Õ¾µ…zµVÙv~­jŞbbÉAøá"8÷d•©qànKÆi\·$›Â‡oôUWÄhtŞÜláòcÂxQŒœJÑ¡šî;oéÈ0rí]ˆf¢rj#oLK™Z˜(ª~ò]B™ü÷–ÍõÔdrÓct
â\ˆ%mf ä½³_¡6jYòtœ[€ú‚”OÏy0|Z>')xB–ÏàeŒ%q0 %P«}Rz"^)œ‡PFÁå;y|VŒ›×f¾(in¯ˆáTÄ$D³gÑV÷ÂWğ ÿÊÚœº3;-Øƒx±öä¹ãÍr3¡´ &z#Äïn&êFôQÇÉUÎmÔÎ½ó`ÀV†
¤ûPª¾HûiŠc»UûŠ©†™\—U¦O?4A3 ¶«8‘ÅS%ËK·ñ`ÃÿnS8î±^§RÄ&òèÏOy÷®Çı["F‚‹Óô„$ı)¬°QŞEİIVH/€=úğ¦0”€Y™1a–şæ.yî*Vçø(iÔ¸ßÑHQÑÍtYvÚ<Ñ·Ş¢±¢iU|Áéz1­•©¢`áöEB»ãí¦³XE¦3Ü¢iÅ‡Üx;aş õ‹‘eN­¬Cq%|¡ ihÍé÷kà™­åÒˆùJ’E^ı%SŠûXL ˆËı™zvÏvV†§×İ:z ˜%ƒ›ÖƒŸN£_ÎQØT«“è2LL9cİR9´CñTuè-ëòdş‡6Z´)Ã«We9*1@¡;QúÖlíÏ ¾¦¢£ÚMUá12å.Eıõ‘½ã†!„-3¯á ïÚYL°k,-íøõ…ÕèÌ¤º=¡ò6„'$£¥óyj­d?”Á#:YX·I±	g5‹‹,$\	næ*ÜC¶C:¶&nØ/.Ä¸ëÏ¹:»’I¥M[§ªA"¬ÿ6R2º²j¹ğ«`¯ÆpP4áôT²)áRƒæ$Ml0\.©¦ïˆVSH§]§2Î¹©‹O•T.:óYä"ĞhÕpøˆ$”sÏ™Ú ÷Ê³*Ã(÷ô‚§5ÇwÂi>şB¤Öá'Ô÷yÚAõ}•2`\x0Ê„±´>¡—Ğ¬…N#EkNØ âÎ.ÚŞ¶[÷is­6€‚W`^îÈløêSƒ†îŞË’†LŒ¿ÏÔÍ‘?ŒÎÔ˜L—¿)ÖQu.cÿKM Tñs”ÂÇNäÜW|ãØJ[~ {ÃùˆvF@õ&4Ñ²¶´ö!ÜË. ïNà©ÎÔb>2”Ø4®;(î}L©g™zÈË$Ş0º@Ù¶»Â‰´ê
ig‡ì‡gíáŞO&æíŸZÈ£wd,,şa›‡±BÖUtÖO:ÛÄÃRQ¿Ja“>üŸ&¾2şpÜ™µ§u_¿İÏ4PdòË¸2içù©`¯M*Øøy¨Ñ%Ë‘N»Mè™Ğ2‚#ÿ‚d¶&×¶¹N¤Ãd4}aqÊ
KIİÜÙí—g²¿ Êd¥iÛÙm1?ÜºÁy=Ë×áÀÀğa÷WiÍg3ºÀQüWkG¤hcâ" `ìšÏµ÷ù>‡VÕÁªh¶ö&œã¼£$ÀqÀ›ŞØG%ìd(±ªH#ˆ7‰Ø‹úÅ=·~ÛÊx4r<Éİ Ş[óØkâ]»±ÏFJ•7˜6ôEú˜ •3¡NÕ£å]ë¸í0IéPæ¬QØes8èÃÎH6ìimö‡®ü7BaëÆÚ»îãí¯WïMVLìT½»E ÕŠfÈÜÛw¥QËµâs6¨‹”¬m‚Z}å#?f÷En­7'¢–XáqDÈ†leŒ($š…*-1êôtú£º ÇRr•æjâ,şø(Æ_,E÷î
ı“ÔMD'ú1OÌÆT]¶1cØ€Wu|v]™€NÀ‡@ìŠ«n;:ô$Ä›VéEÀº Œ.Ö¢¬ZäFıTw<“äD—ë¢¢çÓº!{»BÑïİŞ:šÄ`D¾oóâÙ:×ÕP€hZ%SQLñŠÑõh,Å¤"u«@5JŒ)—õÈ­“Ïir¢ùPQèê$›–Eä–³#×.¸ÑsÉ¿¦¥Ô§²GH.Y`Â¯Òı5¤PŠ¨4úK‹Äè‹¿L’4¶€ûB‡ÿ RUÂİ¡à†‚ûòH~auÎü9\¸‹F—­VIÃ^;Ér­ÅãÙ(Ğ›ğ6>Œ&Úœ1´#* şƒâQÿÚŞx2JY4H~$LS„rFË\!.¨ÛåÖ—Svâ~\t.^÷ãÜeÌ„ıi&˜ërç½²sd]S:}Ò_°®OEyÂõí"É¹´®ü“T„„‡C‘ÆÔIoÈİÿÃÓ‘¤ìçx1\{ÕÎ•TÉ	`õ¼ÎÔ-ÚB=ªŸ÷"7¥:¤Õ¼L­ß“/½x¸—àŒÄü|Û;!¸R{xKèàüŸ’ô&ıqïm‹™‡ÉG Ë0œG¨æÛÈK¯a\ëQn"È)Õìã5)ä é
ÙŸA‰ z3Â %yïß‘^–àqeã®# dìŒváßÅz´İŒîäô”›ÇÂ§÷}{A¸T„yvûB‡,bäùæÃ²»±d¸8<á¹·å$/ÿ%aıİnJ’¿Ça/nÚd¿º%6x.Ùn|Æª§ŒKAÒEæ<£Pa"Ô@İ°Áá¸.Ìë§çš£AW¿†¸~—9
í:UÄ_mÈ| 9ÎÚØMÉ¶T×óK`­ YÔcğâ.N#<¤¤*Fl9?šó;Ü 8´ü‰¨8	š¸Î„ô(qº}œY™èWş›™¡¼C»ßxf¡f„êÁäB'ô7Ã¨ejrAÕ˜¦Ù
¨†+UĞcÔW)qy‘"_
n	cR?š%!Hj ½[Íç	}sAÅÔ#Ğ÷¦£Ìnud|8JÖã 2²õø•Ş²ı3âë	ÖÚÜtxÄjRhâô—ë:×HƒÈÔñ¹r¢‚Ê@qşãKÄ°J!ÜE‘¼Ó›fhoûå³ğÇ#ÿx|şwKòcYñ²“ÇŸ|bÓSi!%©±®…iyÀøl„yA	T°OWÌÂö^ZWÌC91·áì·«œ€ ü©qw ({ú+•'û&‚ÄX˜<ÿÄ`àË o|å
»còçp\î^AWùn2¤òh2M÷ô&*]µY¥?š¬$Ö/åO¤Õåu¯iğ.ãùô<–ìèiš€m»"C9Äû eş¨]¦f9´©ÄX°¼ä£6m Ì2äla
.{N:=ºÉÔ¯Ÿ»O×°lİ	=Pô?Ÿ€ğQ„Ù—ná6ÅÈ{Š¾Gx{Q×`Rğ }äGéÃLîÃµPÍ‡dşM[Èzñ$Ë™+Ñûï*õ#ô6Üíñ„¿¨5?G¤BÌÏ‡Â?&ŒB³VêüIU(×ÎŠ§Q[úg‰#pÚÜõ³„)\§<.N\yµ>¡¡·,°!U“Ucı‚Ÿ£Pj!ƒ"ÉMwD;slMX§—¹a“ğsÈ’:·C{ÒŸìøãƒ¡ä«—õş©£ql¿áxr;êO[m_CıÁpÒ¡) l²V³ÏÂƒ`Ò°VY±ZÕÑ¢^`ˆS¤tmÛ:“–s¤#|”p
B@JX’gÔL›‚”µø3Ã	…Õ¹M“rq2•¯Âx.Ñ‰=šŸaˆ>H"Şiƒ{zö¾ê)ÉñÄ|°­ë¡{ƒB8ªMèsæ,×YZ7u¾¢ùÍ¼ÓáÛşğş¯ÒrŸ½$sŠf²4\ŞŸ*…	ÈmSî$È4IoZ’,Î®bVj¡ ÏmW}çİ6:&ÄÛœr#2bôóvš8ˆ†ôÇÑT^KûOm­¯¤Oî4öD:|õmÿg—Ş®Ùš°Á¥´Ïöü¸-{(ıº&‚ÓO5J"gMüÎœ¸?*më×xíKøJ…OeíTXšZêb„&$ÄÙ•ÌìqØ^ËYF<¡3ˆ”r/u¶éCu›­¨¸H!(MœWÀq‹3*.¼¢D†pÓJÈX›0 =·M¢ öfìãğU³!†WÔsÓrådİõ‘Ã	Ô‡Î¨%gZqÄq:ì£°‚XcE+>Ğ!N,Lc çÁÂ~O”µfRË·%è	#ºeàŞ¤>WÈÊB&éèt»>š9û§À½`‹J¾DÙ×ëAÂT#Au-qãzLæğ ¯CìQdıİk{+sw³=rÜANû÷xaV5_gxÀKB½cûeà/ª‚Pæ.‹.)÷Œfï¨bƒÚ/ê\7ÔlĞ6šµÑchsE­WÔz|Ûµß5mo‰z©yşù$IØ‡[³Çæş_äöË6Ü ‚ÛxpÚèï+3-|'Äğ¦©ÁË±*#®RyJúÂs<Õ˜ıÁjâeİÕ¹<~yèàĞD¢CÕŒNğAŒÉs¤Ÿ)núÄà÷
E+è«é½Ğî†,%“à,©wph5q«™bko[zÓøhkƒÀdÏR®§h{úĞp;jnc—çElMjCîµÌ´Ìe£Ä^9"®¥c 5²ÒÙSÀ^½‰?+À*A‡JTÛy—ãş$wü½İmêõXÈ# ¥p@WQa­iÕS:å¹7’!Óï.ZôË'ø£§'«Êa¤Şœaâ·<éÇ\_MÊş@ÚVÖ~IÁ··ôô.´%AÀª0!‚î[¢+MW#}»‰›iú9º½2,	‘kÄòZ¶rÒw&“q™¹G.õl©Z– ª¤ı8³ı&{‹${dÌÉËV'à½Œt¶Á+Ì¡\çÑ œæÆŸÄ8§×¥W
ï{âõ)¯zoà˜6şfúi“Ü°LS+îw§¼ü·LÀ0ä&l‡pM³>Mæj!M