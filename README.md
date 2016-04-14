#### 查看gulp-dm-include 配置文件
安装完毕后查看src/public/conf/rule.js
类似于下面这样：
```javascript
var config = {
    main: [
        {
            type: 'javascript',
            value: [
                'public/lib/zepto/zepto.min.js',
                'public/lib/zepto/touch.min.js',
                'public/lib/underscore.min.js',
                'public/lib/iscroll',
                'public/js/common',
                'public/lib/oop',
                'public/js/D',
                'public/native/platformAdapter.js',
                'public/native/api.js'
            ]
        }
    ],

    head: [
        {
            type: 'template',
            value: [
                'src/public/include/header.html'
            ]
        },
        {
            type: 'stylesheel',
            value: [
                'public/style/comm'
            ]
        }
    ]
};

module.exports = config;
```
gulp-dm-include 支持三种（js、html、css）文件的引用，所对应的分别为: javascript、template、stylesheel。
type参数必填只要指定引用类型可忽略后缀名。

gulp-dm-include 支持多文件的引用. 例如：
```javascript
    main: [
        {
            type: 'javascript',
            value: [
                'public/lib/zepto/zepto.min.js',
                'public/lib/zepto/touch.min.js',
                'public/lib/underscore.min.js',
                'public/lib/iscroll',
                'public/js/common',
                'public/lib/oop',
                'public/js/D',
                'public/native/platformAdapter.js',
                'public/native/api.js'
            ]
        }
    ],
```
#### 页面中使用gulp-dm-include
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>首页</title>
    <!-- dm-include rule="head"-->
    <!-- dm-include stylesheel="modules/dmTest/css/style;modules/dmTest/css/comm.css" -->
</head>
<body>

<div id="test" style="width: 60px; height: 30px; background:red;"></div>

<div id="testTplContainer">

</div>
<script type="text/template" id="testTpl">
    <%
        _.each(arr, function(i){
    %>
        <h1><%= i%></h1>
    <%
        });
    %>
</script>
<!-- dm-include rule="main" -->
<!-- dm-include javascript="modules/dmTest/js/index" -->
</body>
</html>
```
#### 页面中gulp-dm-include指令说明
##### 引用一组rule
`<!-- dm-include rule="head" --> `
指明引用类型为rule，将通过public/conf/rule.js里面的规则引用.
##### 引用多个样式表
`<!-- dm-include stylesheel="modules/dmTest/css/style;modules/dmTest/css/comm.css" -->`
指明引用类型为stylesheel，多个样式引用以英文分号（;）隔开。可忽略后缀名。
##### 引用多个js文件
<!-- dm-include javascript="modules/dmTest/js/index;modules/dmTest/js/test" -->
指明引用类型为javascript，多个样式引用以英文分号（;）隔开。可忽略后缀名。