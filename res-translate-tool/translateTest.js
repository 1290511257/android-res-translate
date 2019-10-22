var translateSpecial = require("./index.js").translateWithSpecial;
var DOMParser = require("xmldom").DOMParser;
var path = require("path");
var fs = require("fs");
var filePath = path.resolve('./strings.xml');


var testString = "HongKong";


testFunction(testString);
// testDomFunction(filePath);
function testFunction(params) {
    // translateSpecial(params, "zh-cn");
    console.log(convertSpecialValue(""));
}

function testDomFunction(filePath) {
    const xml_string_default = fs.readFileSync(filePath, 'utf-8');
    var default_domParser = new DOMParser().parseFromString(xml_string_default, 'text/xml');
    appendNodeWithFormart(default_domParser, default_domParser.documentElement.childNodes[1]);
    default_domParser.documentElement.firstChild.nodeType
    // ignoreComentNode(default_domParser);
    console.log(default_domParser.documentElement.childNodes.length);
}


function ignoreComentNode(default_domParser) {
    var resChildNode = default_domParser.documentElement.childNodes;
    var childNodesLength = resChildNode.length;
    for (var i = 0; i < childNodesLength; i++) {//nodeType: 7,xml头标志 ; 3:文本节点,包含空格换行. 8:注释节点
        if (resChildNode[i].nodeType === 3) {//文本节点,删除存多余换行 
            resChildNode[i].textContent = resChildNode[i].textContent.replace(/\n+/, "\n");
        } else if (resChildNode[i].nodeType === 8) {//删除注释
            if (null !== default_domParser.documentElement.removeChild(default_domParser.documentElement.childNodes[i])) {//删除注释成功
                (resChildNode[i].nodeType === 3 && resChildNode[i].textContent.match(/^\n+\s*$/)) ? default_domParser.documentElement.removeChild(default_domParser.documentElement.childNodes[i]) : null;
                i--;
                childNodesLength = resChildNode.length;
            }
        }
    }
}

/**
 * 追加子结点并保证一定排版
 * @param {document} default_domParser 
 * @param {childNode} new_node 
 */
function appendNodeWithFormart(default_domParser, new_node) {
    let lastChild = default_domParser.documentElement.lastChild;
    let firstChild = default_domParser.documentElement.firstChild;
    if (lastChild.nodeType === 3 && lastChild.textContent.match(/^\n+\s*$/)) {
        if (firstChild.nodeType === 3 && firstChild.textContent.match(/^\n+\s*$/)) {
            default_domParser.documentElement.insertBefore(firstChild, lastChild);
        } else {
            let tempChild = lastChild.cloneNode(true);
            tempChild.textContent = "\n    ";
            default_domParser.documentElement.insertBefore(tempChild, lastChild);
        }
        default_domParser.documentElement.insertBefore(new_node, lastChild);
    } else {
        default_domParser.documentElement.appendChild(new_node);
    }
}

function convertSpecialValue(string_value) {
    console.log(string_value.indexOf("@string/"));
    if (string_value.indexOf("@string/") === 0 | string_value == "") {
        string_value = null;
    }
    return string_value;
}

