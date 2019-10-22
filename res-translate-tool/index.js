var translate = require("./google-translate-api/index.js");
var DOMParser = require("xmldom").DOMParser;
var fs = require("fs");

async function fileTranslate(file_path, language_map, translate_list) {
    var xml_string_map = new Map();
    var isTranslateAll = false;

    const xml_string_default = fs.readFileSync(file_path, 'utf-8');
    const default_domParser = new DOMParser().parseFromString(xml_string_default, 'text/xml');
    const default_stringDomArray = default_domParser.getElementsByTagName("string");
    if ("" != xml_string_default) {
        if (translate_list.size === 0) {
            isTranslateAll = true;
        }
        console.log("translate string names:")
        for (var i = 0; i < default_stringDomArray.length; i++) {//键值对存储需要翻译的字符串
            if ("false" !== default_stringDomArray[i].getAttribute("translatable")) {
                var string_name = default_stringDomArray[i].getAttribute("name");
                if (isTranslateAll && string_name !== "" && null !== string_name) {
                    var string_value = default_stringDomArray[i].textContent;
                    xml_string_map.set(string_name, string_value);
                } else if (!isTranslateAll) {
                    if (translate_list.has(string_name)) {
                        var string_value = default_stringDomArray[i].textContent;
                        xml_string_map.set(string_name, string_value);
                        console.log(string_name);
                    }
                } else {
                    console.log("finding translate words need translate", default_stringDomArray[i].getAttribute("name") + " no attribute named \'name\',skiped it.")
                }
            } else {
                console.log("finding translate words need translate", default_stringDomArray[i].getAttribute("name") + " no need translate.");
            }
        }
    } else {
        console.error("default xml string is empty!");
        return;
    }



    for (var [lang_name, lang_dir] of language_map) {

        let trans_dir_path = "./" + lang_dir;

        let trans_file_path = file_path.replace("values", lang_dir).trim();
        let domParser = new DOMParser().parseFromString(xml_string_default, 'text/xml');
        ignoreComentNode(domParser);
        let stringDomArray = domParser.getElementsByTagName("string");
        var domArrayLength = stringDomArray.length;//实际使用过程中会发现遍历中会出现length大小前后不同的情况
        let trans_string_map = new Map();

        xml_string_map.forEach((value, key) => {
            trans_string_map.set(key, value);
        })

        if (!fs.existsSync(trans_file_path)) {//无基础翻译文件
            console.log("create new xml string file ", trans_file_path);
            if (!fs.existsSync(trans_dir_path)) {
                fs.mkdirSync(trans_dir_path);
            }

            for (var i = 0; i < domArrayLength; i++) {//键值对存储需要翻译的字符串
                if ("false" !== stringDomArray[i].getAttribute("translatable")) {
                    var string_name = stringDomArray[i].getAttribute("name");
                    if (string_name !== "" && null !== string_name) {//需要翻译的对象
                        var targetNode = stringDomArray[i];
                        var childNodes = targetNode.childNodes;
                        var childNodesLength = childNodes.length;
                        for (var j = 0; j < childNodesLength; j++) {
                            if (childNodes[j].nodeType === 3) {//需要翻译的node类型
                                var trans_string = convertSpecialValue(childNodes[j].textContent);
                                if (null !== trans_string && trans_string !== "") {
                                    var result;
                                    try {
                                        result = await translateWithSpecial(trans_string, lang_name, childNodesLength > 1);
                                    } catch (error) {
                                        result = null;
                                    }
                                    if (null !== result) {
                                        domParser.getElementsByTagName("string")[i].childNodes[j].textContent = result;
                                    } else {
                                        console.error("error in google translate result about word :", string_name);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            fs.writeFile(trans_file_path, domParser, (err) => {
                if (err) {
                    console.error("write file error!");
                }
            })

        } else {
            console.log("progress existed string file", trans_file_path);
            try {
                var data = fs.readFileSync(trans_file_path, "utf-8");
            } catch (err) {
                console.error("read file error ", err);
                return;
            }
            let baseDomParser = new DOMParser().parseFromString(data, 'text/xml');
            let baseStringDomArray = baseDomParser.getElementsByTagName("string");
            let baseDomArrayLength = baseStringDomArray.length;
            for (var i = 0; i < baseDomArrayLength; i++) {//查找过滤当前已翻译的字段
                let string_name = baseStringDomArray[i].getAttribute("name");
                if (string_name !== "" && null !== string_name) {
                    if (trans_string_map.has(string_name)) {
                        trans_string_map.delete(string_name);
                    }
                } else {
                    // console.log("finding translated words ", default_stringDomArray[i].textContent+ " no attribute named \'name\',skiped it.")
                }
            }

            if (trans_string_map.size > 0) {//存在需要翻译的string
                for (var i = 0; i < domArrayLength; i++) {
                    let string_name = stringDomArray[i].getAttribute("name");
                    if (trans_string_map.has(string_name) && "false" !== stringDomArray[i].getAttribute("translatable")) {
                        let targetNode = stringDomArray[i];
                        let childNodes = targetNode.childNodes;
                        let childNodesLength = childNodes.length;
                        let needAppendTranslate = false;
                        for (var j = 0; j < childNodesLength; j++) {
                            if (childNodes[j].nodeType === 3) {//需要翻译的node类型
                                let new_node = childNodes[j];
                                if (null !== convertSpecialValue(new_node.textContent)) {
                                    try {
                                        let result = await translateWithSpecial(new_node.textContent, lang_name, childNodesLength > 1);
                                        new_node.textContent = result;
                                    } catch (err) {
                                        console.log("error in get result from google", err);
                                    }
                                    needAppendTranslate = true;
                                }
                            }
                        }
                        needAppendTranslate ? appendNodeWithFormart(baseDomParser, targetNode) : "";
                    }
                }

                fs.writeFile(trans_file_path, baseDomParser, function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("file has translated!", "file path:" + trans_file_path);
                    }
                });
            } else {
                console.log("file no need translate,skiped :" + trans_file_path);
            }
        }
    }
}

/**
 * 处理翻译字符串,将特殊字符串处理后返回
 * @param {string} string_value 
 * @returns 返回处理后的结果,无法翻译的返回null
 */
function convertSpecialValue(string_value) {
    if (string_value.indexOf("@string/") === 0 | string_value == "") {
        string_value = null;
    }
    return string_value;
}

/**
 * 翻译文本,对于特殊项进行分割翻译处理
 * @param {string} string_value 
 * @param {string} lang_code 
 * @param {boolean} with_trim_code
 */
async function translateWithSpecial(string_value, lang_code, with_trim_code) {
    var string_map = new Map();
    var log_string = string_value + "===> ";
    var reg = /\\n|\\u[a-zA-Z0-9]{4}|<xliff:.*?>|<\/xliff:.*?>|%[0-9]\$[0-9]*?[s|d|g]|%s/;

    string_value.replace("\\'", "'");
    if (null === string_value.match(reg)) {//无特殊匹配项
        string_value = (await translate(string_value, { to: lang_code })).text;
    } else {
        var trans_string = string_value.split(reg);

        for (var i = 0; i < trans_string.length; i++) {
            let value = trans_string[i].trim();
            if (null != value && value !== "") {
                let s = await translate(value, { to: lang_code });
                string_map.set(value, s.text);
            }
        }

        string_map.forEach((value, key) => {
            if (value !== key) {
                string_value = string_value.replace(key, value);
            }
        })
    }

    log_string += string_value;
    console.log("translateWithSpecial", log_string);
    return with_trim_code ? string_value : (null === string_value.match(/^"[\s\S]+?"$/)) ? "\"" + string_value + "\"" : string_value;
}

/**
 * 删除xml文件下的注释和多余换行符
 * @param {document}} default_domParser 
 */
function ignoreComentNode(dom_parser) {
    var resChildNode = dom_parser.documentElement.childNodes;
    var childNodesLength = resChildNode.length;
    for (var i = 0; i < childNodesLength; i++) {//nodeType: 7,xml头标志 ; 3:文本节点,包含空格换行. 8:注释节点
        if (resChildNode[i].nodeType === 3) {//文本节点,删除存多余换行 
            resChildNode[i].textContent = resChildNode[i].textContent.replace(/\n+/, "\n");
        } else if (resChildNode[i].nodeType === 8) {//删除注释
            if (null !== dom_parser.documentElement.removeChild(dom_parser.documentElement.childNodes[i])) {//删除注释成功
                (resChildNode[i].nodeType === 3 && resChildNode[i].textContent.match(/^\n+\s*$/)) ? dom_parser.documentElement.removeChild(dom_parser.documentElement.childNodes[i]) : null;
                i--;
                childNodesLength = resChildNode.length;
            }
        }
    }
}

/**
 * 追加子结点并保证一定排版
 * @param {document} dom_parser 
 * @param {childNode} new_node 
 */
function appendNodeWithFormart(dom_parser, new_node) {
    let lastChild = dom_parser.documentElement.lastChild;
    let firstChild = dom_parser.documentElement.firstChild.cloneNode(true);
    if (lastChild.nodeType === 3 && lastChild.textContent.match(/^\n+\s*$/)) {
        if (firstChild.nodeType === 3 && firstChild.textContent.match(/^\n+\s*$/)) {
            dom_parser.documentElement.insertBefore(firstChild, lastChild);
        } else {
            let tempChild = lastChild.cloneNode(true);
            tempChild.textContent = "\n    ";
            dom_parser.documentElement.insertBefore(tempChild, lastChild);
        }
        dom_parser.documentElement.insertBefore(new_node, lastChild);
    } else {
        dom_parser.documentElement.appendChild(new_node);
    }
}


module.exports = fileTranslate;
module.exports.translateWithSpecial = translateWithSpecial;
