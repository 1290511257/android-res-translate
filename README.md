###本工具用来批量翻译string.xml文件
1.首次使用在有网环境下运行install.sh文件配置环境,更新翻译参数信息运行update.js
2.正常配置后,在res路径下使用translate命令即可批量翻译
3.支持翻译的语言见language.js文件

4.具体使用见translate.js文件

注意事项:
增加string资源时如不需要翻译可设置 translatable="false" 属性 
部分特殊字符会无法正常翻译,如发现请及时通知我更新过滤规则
翻译文件后如有排版问题,数量较多的话建议使用vs code的XML Tools插件格式化一下排版

常见问题:
(1).async function fileTranslate报错,node版本未成功升级,缺少环境变量配置,
将node路径配置为/usr/local/n/versions/node/{node_version}下对应版本

#19.10.12.01
优化输出排版,更新对xliff结点的过滤规则

#19.10.14.01
修复@string/xxx无法过滤问题
# android-res-translate
