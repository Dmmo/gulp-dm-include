var gutil = require('gulp-util'),
    through = require('through2'),
    path = require('path'),
    fs = require('fs'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'gulp-dm-include',
    reg = /<!--\s*dm\-include\s+([^=]+)\s*=\s*['"]([^'"]+)['"]\s*-->/g,
    reg2 = /<!--\s*dm\-include\s+(\w+)\s*=\s*['"]([^'"]+)['"]\s*-->/,
    _options,
    _self;


/**
 * 解析javascript
 * @param value [type=array]
 * @returns {*}
 */
var analysisJavascript = function(value, file){

    var returns = '',
        defer = _options.isDefer ? 'defer="defer"' : '',
        typeReg = /\.[^\.]+$/,
        type,
        tmpValue,
        tmp;

    if(value && value.length > 0 ){
        for (var i = 0; i < value.length; i++){
            tmpValue = value[i];
            type = typeReg.exec(tmpValue);

            if(type === null){
                tmpValue = tmpValue + '.js';
            }

            if(type !== null && type[0] !== '.js'){
                throw new PluginError(PLUGIN_NAME, '引入javascript['+tmpValue+']文件失败, 请确保您的js文件后缀为.js');
            }

            tmp = path.relative(path.dirname(_options.ENV+path.sep+path.relative('src',file.path)), tmpValue);

            returns += (i < value.length - 1) ? '<script ' + defer + ' type="text/javascript" src="' + tmp + '"></script>\r\n' :'<script ' + defer + ' type="text/javascript" src="' + tmp + '"></script>';
        }
    }
    return returns;
};

/**
 * 解析器: Stylesheel
 * @param value [type=array]
 * @returns {*}
 */
var analysisStylesheel = function(value, file) {
    var returns = '',
        typeReg = /\.[^\.]+$/,
        type,
        tmpValue,
        tmp;

    for(var i = 0; i < value.length; i++ ){
        tmpValue = value[i];
        type = typeReg.exec(tmpValue);
        //如果没有写后缀名就默认添加.css后缀
        if(type === null){
            tmpValue = tmpValue + '.css';
        }

        if(type !== null && type[0] !== '.css'){
            throw new PluginError(PLUGIN_NAME, '引入css['+tmpValue+']文件失败, 请确保您的css文件后缀为.css');
        }

        tmp = tmpValue;
        // tmpValue = _options.ENV+path.sep+tmpValue;
        // tmp = path.relative(path.dirname(_options.ENV+path.sep+path.relative('src',file.path)), tmpValue);
        returns += ( i === 0)  ? '\t<link rel="stylesheet" href="' + tmp + '"/>\r\n' : '\t<link rel="stylesheet" href="' + tmp + '"/>\r\n';
    }

    return returns;
};


var analysisTemplate = function(value, file) {
    var returns= '',
        typeReg = /\.[^\.]+$/,
        type,
        tmpValue;

    for (var i = 0; i< value.length; i++){
        tmpValue = value[i];
        type = typeReg.exec(tmpValue);

        if(type === null){
            tmpValue = tmpValue + '.html';
        }

        if(type !== null && type[0] !== '.html'){
            throw new PluginError(PLUGIN_NAME, '引入模板['+tmpValue+']文件失败, 请确保您的模板文件后缀为.html');
        }

        returns += fs.readFileSync(tmpValue, {encoding: 'utf-8'}) + "\r\n";

    }

    return returns;
};


/**
 * 根据指令及传入的值返回
 * @param control
 * @param value
 */
var analysisValue = function(control, value, file){
    value = value.indexOf(';') === -1 ? value : value.split(';');
    var returns = '',
        typeReg = /\.[^\.]+$/,
        type,
        tmp;

    switch (control){

        // javascript处理
        case 'javascript':

            // 一条标签引用多个javascript文件处理
            if(toString.apply(value) === '[object Array]'){
                returns = analysisJavascript(value, file);
            }else{ //一条标签引用一个javascript文件处理
                returns = analysisJavascript([value], file);
            }
            break;

        // 处理Stylesheel样式表
        case 'stylesheel':
            if(toString.apply(value) === '[object Array]'){
                returns = analysisStylesheel(value, file);
            }else{
                returns = analysisStylesheel([value], file);
            }
            break;

        // 处理一组规则
        case 'rule':
            var tmpValue;
            for(var i in _options.rules){
                if(i === value){
                    tmpValue = _options.rules[i];
                }
            }

            for(var n = 0; n < tmpValue.length; n++ ){
                var item = tmpValue[n];
                switch(item.type){
                    case 'javascript':
                        returns += analysisJavascript(item.value, file);
                        break;
                    case 'stylesheel':
                        returns += analysisStylesheel(item.value, file);
                        break;
                    case 'template':
                        returns += analysisTemplate(item.value, file);
                        break;
                }
            }
            break;

        case 'template':
            if(toString.apply(value) === '[object Array]'){
                returns = analysisTemplate(value, file);
            }else{
                returns = analysisTemplate([value], file);
            }
            break;
        default:
            throw new PluginError(PLUGIN_NAME, '不支持该类型:' + control);
            break;
    }
    return returns;
};


var DMInclude = function(options){
    return through.obj(function( file, enc, cb){
        options = options || {};
        options.rules = require(options.rule);
        _options = options;
        _self = this;

        if(file.isNull()){
            this.push(file);
            return cb();
        }

        if(file.isStream()){
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming out supported'));
            return cb();
        }

        var html = file.contents.toString(),
            matches = html.match(reg),
            control,
            value,
            filePath;

        if(matches){
            for(var i = 0; i < matches.length; i++){
                var tmp = matches[i].match(reg2);
                control = tmp[1];
                value   = tmp[2];
                html = html.replace(matches[i], analysisValue(control, value, file));
            }
        }
        file.contents = new Buffer(html);
        this.push(file);
        cb();
    });
};

module.exports = DMInclude;