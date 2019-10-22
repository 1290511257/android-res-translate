/**
 * 本文件修改后执行update.js更新
 * 翻译后建议使用vs code的XML Tools插件格式化一下排版
 */
var fileTranslate = require("/usr/local/lib/node_modules/res-translate-tool/index.js")
var path = require("path");
var filePath = path.resolve('./values/strings.xml');//如为mtk_strings.xml直接在此修改

/*翻译语言相关map*/
var bb2_language_map = new Map([//bb2项目翻译语言及其对应文件夹,不同app下文件夹名称可能会有所不同,
    //default:en_US fr_FR fr_CD sw_TZ ar_EG am_ET om_ET ti_ET ur_PK pt_PT pt_BR fa_IR 
    //hi_IN ru_RU zh_CN ne_NP si_LK ta_LK th_TH vi_VN my_MM zh_HK lo_LA
    ["am", "values-am"],
    ["fr", "values-fr"],
    ["sw", "values-sw"],
    ["ar", "values-ar"],
    //["om", "values-fr"],
    ["ur", "values-ur"],
    ["pt", "values-pt"],
    ["fa", "values-fa"],
    ["hi", "values-hi"],
    ["ru", "values-ru"],
    ["ne", "values-ne"],
    ["si", "values-si"],
    ["ta", "values-ta"],
    ["th", "values-th"],
    ["vi", "values-vi"],
    ["my", "values-my"],
    ["lo", "values-lo"],
    ["zh-cn", "values-zh-rCN"],
    ["zh-tw", "values-zh-rHK"],
]);

var test_language_map = new Map([
    ["zh-cn", "values-zh-rCN"]]);

/*翻译字段相关set*/


//全部翻译时默认选择此项
var translateAll = new Set();



//例如我只需要翻译以下三个name对应的字符串,将该set引用传给 stringsNameList
//如果目标语言不存在string.xml文件,则会优先选择全部翻译
var test_translate_name_set = new Set([//name属性值
    "secure_connect",
    "insecure_connect",
    "discoverable"
]);

/*End*/
var targetLanguage = bb2_language_map;
var stringsNameList = translateAll;
/*api传入参数
filePath:需要翻译文件的相对路径
targetLanguage:翻译语言存储信息Map {key:目标语言缩写,value:对应文件夹名}
stringsNameList:指定需要翻译的字段name,若传入数组为空则默认全部翻译
*/
fileTranslate(filePath,targetLanguage,stringsNameList);
