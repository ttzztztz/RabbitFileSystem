const PROMISE_PENDING = 0;
const PROMISE_RESOLVED = 1;
const PROMISE_REJECTED = 2;
function nullFunction(par){}

function RabbitPromise(func) {
    this.value = null;
    this._resolve_callback = [];
    this._reject_callback = [];
    this.status = PROMISE_PENDING;
    try {
        let rtn = func(this.resolve.bind(this), this.reject.bind(this));
        this.resolve(rtn);
    } catch(e) {
        this.reject(e);
    }
}

RabbitPromise.prototype.resolve = function (val) {
    if (this.status === PROMISE_PENDING) {
        this.status = PROMISE_RESOLVED;
        this.value = val;
        for (let i = 0; i < this._resolve_callback.length; i++) {
            this._resolve_callback[i](this.value);
        }
    }
};
RabbitPromise.prototype.reject = function (val) {
    if (this.status === PROMISE_PENDING) {
        this.status = PROMISE_REJECTED;
        this.value = val;
        for (let i = 0; i < this._reject_callback.length; i++) {
            this._reject_callback[i](val);
        }
    }
};
RabbitPromise.prototype.then = function (__resolve, __reject) {
    if(__resolve === __reject) this.status = PROMISE_REJECTED;
    if (typeof __resolve !== "function") __resolve = nullFunction;
    if (typeof __reject !== "function") __reject = nullFunction;
    if (this.status === PROMISE_RESOLVED) {
        return new RabbitPromise(function (resolve, reject) {
            try {
                let x = __resolve(this.value);
                if (x instanceof RabbitPromise) {
                    x.then(resolve, reject);
                } else {
                    resolve(x);
                }
            } catch (e) {
                reject(e);
            }
        });
    } else if (this.status === PROMISE_REJECTED) {
        return new RabbitPromise(function (resolve, reject) {
            try {
                let x = __reject(this.value);
                if (x instanceof RabbitPromise) {
                    x.then(resolve, reject);
                } else {
                    reject(x);
                }
            } catch (e) {
                reject(e);
            }
        });
    } else if (this.status === PROMISE_PENDING) {
        let that = this;
        return new RabbitPromise(function (resolve, reject) {
            that._resolve_callback.push(function (value) {
                try {
                    let x = __resolve(that.value);
                    if (x instanceof RabbitPromise) {
                        x.then(resolve, reject);
                    }
                } catch (e) {
                    reject(e);
                }
            });
            that._reject_callback.push(function (reason) {
                try {
                    let x = __reject(that.value);
                    if (x instanceof RabbitPromise) {
                        x.then(resolve, reject);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
};