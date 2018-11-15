const argReg = /(?:(['"])?(.+?)?(?:(?<!\\)\1)|([^'"\s]+))/g;
const dirReg = /(?<=\/)(\w+)(?=\/)/;
const initFileIndex = [
    {
        address: "0",
        name: "home",
        path: "/",
        type: "dir",
        time: 0,
        other: "",
        contains: [
            {
                address: "1",
                name: "hello",
                path: "/home",
                type: "file",
                time: 0,
                other: "",
                contains: [],
            },
        ],
    }
];

let fileObject = {
    address: "",
    name: "",
    path: "",
    type: "file",
    time: 0,
    other: "",
    contains: [],
};
let fileIndex = [];
let fileAutoIncrement = 0;
let currentDir = "/home";

//<-- Time Functions
/**
 * @returns {string}
 * @constructor
 */
function Time() {

}

Time.prototype.time = function () {
    return new Date().getTime();
};

/**
 * @param m
 * @returns {string}
 * @constructor
 */
Time.prototype.add0 = function (m) {
    return m < 10 ? '0' + m : m
};

/**
 * @param timestamp
 * @returns {string}
 * @constructor
 */
Time.prototype.strtotime = function (timestamp) {
    var time = new Date(parseInt(timestamp) * 1000);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + "-" + this.add0(m) + "-" + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s);
};

//<-- Storage CURD
function Storage() {

}

Storage.prototype.create = function (k, v) {
    let _now = localStorage.getItem(k);
    if (_now === null || _now === undefined) {
        localStorage.setItem(k, v);
    }
};

Storage.prototype.update = function (k, v) {
    localStorage.setItem(k, v);
};

Storage.prototype.delete = function (k) {
    localStorage.removeItem(k);
};

Storage.prototype.read = function (k) {
    return localStorage.getItem(k);
};

//<-- Init Operation
function Init() {

}

Init.prototype.filesystem = function (force = 0) {
    let storage = new Storage();
    let index = storage.read("RBFS_index");
    if (force || index === undefined || index === null) {
        storage.create("RBFS_index", JSON.stringify(initFileIndex));
        fileIndex = initFileIndex;
        fileAutoIncrement = 2;
        storage.create("RBFS_auto_increment", fileAutoIncrement);
        storage.create("RBFS_file_1", "Hello World!");
    }
};

Init.prototype.program = function () {
    let storage = new Storage();
    let index = storage.read("RBFS_index");
    let auto_increment = storage.read("RBFS_auto_increment");
    if (index === undefined || index === null || auto_increment === undefined || auto_increment === null) {
        this.filesystem(0);
    } else {
        try {
            fileIndex = JSON.parse(index);
            fileAutoIncrement = auto_increment;
        } catch (e) {
            console.log(e);
            this.filesystem(1);
        }
    }
};

//<-- File OPT
function File() {

}

File.prototype.create = function (path, name, content = "") {
    let _file_index = Object.create(fileObject);
    _file_index.address = fileAutoIncrement++;
    _file_index.name = name;
    _file_index.path = path;
    _file_index.time = Date.parse(new Date());
    _file_index.type = "file";
    let storage = new Storage();
    storage.create("RBFS_file_" + _file_index.address, content);
    _dir.contains.push(_file_index);
    let save = new Save();
    save.autoIncrement();
    save.fileIndex();
    let _dir = this.getDirObject(path, 0);
    return 1;
};

File.prototype.getPathArray = function (path) {
    let arr = path.split("/");
    arr.splice(0, 1);
    return arr;
};

File.prototype.delete = function (path) {
    let _structure = this.getPathArray(path);
    let _dir = this.getDirObject(path, 1);
    let result = 0;
    let filename = _structure[_structure.length - 1];
    for (let i = 0, len = _dir.contains.length; i < len; i++) {
        if (_dir.contains[i].type === "file" && _dir.contains[i].name === filename) {
            let storage = new Storage();
            storage.delete("RBFS_file_" + _dir.contains[i].address);
            delete _dir.contains[i];
            let save = new Save();
            save.fileIndex();
            result = 1;
            break;
        }
    }
    return result;
};

File.prototype.updateContent = function (path, content) {
    let _structure = this.getPathArray(path);
    let _dir = this.getDirObject(path, 1);
    let result = 0;
    let filename = _structure[_structure.length - 1];
    for (let i = 0, len = _dir.contains.length; i < len; i++) {
        if (_dir.contains[i].type === "file" && _dir.contains[i].name === filename) {
            let storage = new Storage();
            storage.update("RBFS_file_" + _dir.contains[i].address, content);
            result = 1;
            break;
        }
    }
    return result;
};

File.prototype.read = function (path) {
    let _structure = this.getPathArray(path);
    let _dir = this.getDirObject(path, 1);
    let filename = _structure[_structure.length - 1];
    for (let i = 0, len = _dir.contains.length; i < len; i++) {
        if (_dir.contains[i].type === "file" && _dir.contains[i].name === filename) {
            let storage = new Storage();
            return storage.read("RBFS_file_" + _dir.contains[i].address);
        }
    }
    return null;
};

File.prototype.changeDate = function (path, time) {
    let _structure = this.getPathArray(path);
    let _dir = this.getDirObject(path, 1);
    let result = 0;
    let filename = _structure[_structure.length - 1];
    for (let i = 0, len = _dir.contains.length; i < len; i++) {
        if (_dir.contains[i].type === "file" && _dir.contains[i].name === filename) {
            _dir.contains[i].time = time;
            let save = new Save();
            save.fileIndex();
            result = 1;
            break;
        }
    }
    return result;
};

File.prototype.move = function (path_from, path_to) {
    let _structure = this.getPathArray(path_from);
    let _dir = this.getDirObject(path_from, 1);
    let filename = _structure[_structure.length - 1];
    let copy = null;
    let result = 0;
    for (let i = 0, len = _dir.contains.length; i < len; i++) {
        if (_dir.contains[i].type === "file" && _dir.contains[i].name === filename) {
            copy = Object.assign({}, _dir.contains[i]);
            delete _dir.contains[i];
            break;
        }
    }
    if (copy !== null) {
        _structure = this.getPathArray(path_to);
        _dir = this.getDirObject(path_to, 1);
        filename = _structure[_structure.length - 1];
        copy.name = filename;
        _dir.contains.push(copy);
    }
    let Save = new Save();
    Save.fileIndex();
    return result;
};

File.prototype.getDirObject = function (path, is_arr = 0) {
    let arr = is_arr ? path : this.getPathArray(path);
    let last_obj = fileIndex[0];
    for (let i = 0, len = arr.length; i < len; i++) {
        if (!last_obj.hasOwnProperty("contains")) break;
        for (let m = 0, dir_len = last_obj.contains.length; m < dir_len; m++) {
            if (last_obj.contains[m].type === "dir" && last_obj.contains[m].name === arr[i]) {
                last_obj = last_obj.contains[m];
                break;
            }
        }
    }
    return last_obj;
};

//<-- DIR OPT
function Directory() {

}

Directory.prototype.create = function () {

};

Directory.prototype.move = function () {

};

Directory.prototype.delete = function () {

};

Directory.prototype.changeDate = function () {

};

Directory.prototype.list = function () {

};

//<-- Save OPT
function Save() {

}

Save.prototype.autoIncrement = function () {
    let storage = new Storage();
    storage.update("RBFS_auto_increment", fileAutoIncrement);
};

Save.prototype.fileIndex = function () {
    let storage = new Storage();
    this.autoIncrement();
    storage.update("RBFS_index", JSON.stringify(fileIndex));
};
