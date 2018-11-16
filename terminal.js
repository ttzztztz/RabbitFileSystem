const terminalReg = /\s*(".+?"|[^:\s])+((\s*:\s*(".+?"|[^\s])+)|)|(".+?"|[^"\s])+/g;

function Method() {

}

Method.prototype.cat = function (route) {
    let file = new File();
    return file.read(route);
};

Method.prototype.mkdir = function(route){
    let directory = new Directory();
    let arr = route.split("/");
    let dirname = arr[arr.length -1];
    arr.pop();
    let path = "/" + arr.join("/");
    return Directory.create(path , dirname);
};

Method.prototype.touch = function(route){
    let file = new File();
    let time = new Time();
    return file.changeDate(route,time.time());
};

let method = new Method();

function _Terminal() {

}

_Terminal.prototype.input = function (data) {
    let arr = data.match(terminalReg);
    arr = arr.map(function (item, index, array) {
        return item.trim();
    });
    let command = arr[0];
    arr.shift();
    let args = "";
    arr.forEach(function (item, index, array) {
        if (index !== 0) args += ",";
        args = '"' + item + '"';
    });
    return eval("method." + command + "(" + args + ")");
};
