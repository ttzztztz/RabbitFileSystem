const terminalReg = /\s*(".+?")+(((".+?"|[^\s])+)|)|(".+?"|[^"\s])+/g;
const argsReg = /^"|"$/g;
const errMessage = ["", "Already exists", "Directory doesn't exist", "No Permission", "File doesn't exist", "Type error", "Arguments Wrong number"];
let currentDir = "/home";

function Method() {

}

Method.prototype.echo = function () {
    let terminal = new _Terminal();
    for (let i = 0, len = arguments.length; i < len; i++) {
        terminal.print(arguments[i]);
    }
};

Method.prototype.cp = function (src, dest) {
    let file = new File();
    let type_src = file.getType(src);
    let type_dest = file.getType(file.getParentPath(dest));
    if (type_dest !== "dir") return -5;
    if (type_src === "dir") {
        let directory = new Directory();
        return directory.copy(src, dest);
    } else {
        return file.copy(src, dest, 0);
    }
};

Method.prototype.rm = function () {
    let mode = "", path = "";
    if (arguments.length === 2) {
        mode = arguments[0];
        path = arguments[1];
    } else if (arguments.length === 1) {
        mode = "";
        path = arguments[0];
    } else return -6;
    let file = new File();
    let type = file.getType(path);
    if (mode === "" && type === "dir") {
        return -4;
    }
    if (type === "dir") {
        let directory = new Directory();
        return directory.delete(path);
    } else {
        return file.delete(path, 0);
    }
};

Method.prototype.ln = function () {
    let mode = "", src = "", dest = "";
    if (arguments.length === 3) {
        mode = arguments[0];
        src = arguments[1];
        dest = arguments[2];
    } else if (arguments.length === 2) {
        mode = "";
        src = arguments[0];
        dest = arguments[1];
    } else return -6;
    let file = new File();
    let type_src = file.getType(src);
    let parentPath = file.getParentPath(dest);
    let type_dest = file.getType(parentPath);
    let link = new Link();
    if (type_src !== "file" || type_dest !== "dir") return -5;
    let address = file.getAddress(src);
    let filename = file.getFileName(dest);
    if (mode === "") {//hard link
        return link.createHard(parentPath, filename, src);
    } else if (mode === "-s") {//soft link
        return link.createSoft(parentPath, filename, src);
    }
};

Method.prototype.ls = function (args) {

};

Method.prototype.cd = function (route) {

};

Method.prototype.cat = function (route) {
    let file = new File();
    let terminal = new _Terminal();
    terminal.print(file.read(route));
    return 1;
};

Method.prototype.mkdir = function (route) {
    let directory = new Directory();
    let arr = route.split("/");
    let dirname = arr[arr.length - 1];
    arr.pop();
    let path = "/" + arr.join("/");
    return directory.create(path, dirname);
};

Method.prototype.touch = function (route) {
    let file = new File();
    let time = new Time();
    return file.changeDate(route, time.time());
};

let method = new Method();

function _Terminal() {

}

_Terminal.prototype.print = function (data) {
    console.log(data);
};

_Terminal.prototype.scan = function (data) {
    let arr = data.match(terminalReg);
    arr = arr.map(function (item, index, array) {
        return item.trim();
    });
    let command = arr[0];
    arr.shift();
    let args = "";
    arr.forEach(function (item, index, array) {
        item = item.replace(argsReg, "");
        if (index !== 0) args += ",";
        args += '"' + item + '"';
    });
    let result = eval("method." + command + "(" + args + ")");
    if (result < 0) {
        let _index = result * -1;
        this.print(errMessage[_index]);
    }
};
