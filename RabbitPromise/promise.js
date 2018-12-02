const PROMISE_PENDING = 0;
const PROMISE_RESOLVED = 1;
const PROMISE_REJECTED = 2;
const nullFunction = function (par){};

RobbitPromise.resolve = function (val) {

};

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
RabbitPromise.prototype.then = function (resolve_old, reject_old) {
    if(resolve_old === reject_old) this.status = PROMISE_REJECTED;
    if (typeof resolve_old !== "function") resolve_old = nullFunction;
    if (typeof reject_old !== "function") reject_old = nullFunction;
    if (this.status === PROMISE_RESOLVED) {
        return new RabbitPromise(function (resolve_new, reject_new) {
            try {
                let x = resolve_old(this.value);
                if (x instanceof RabbitPromise) {
                    x.then(resolve_new, reject_new);
                } else {
                    resolve_new(x);
                }
            } catch (e) {
                reject_new(e);
            }
        });
    } else if (this.status === PROMISE_REJECTED) {
        return new RabbitPromise(function (resolve_new, reject_new) {
            try {
                let x = reject_old(this.value);
                if (x instanceof RabbitPromise) {
                    x.then(resolve_new, reject_new);
                } else {
                    reject_new(x);
                }
            } catch (e) {
                reject_new(e);
            }
        });
    } else if (this.status === PROMISE_PENDING) {
        let that = this;
        return new RabbitPromise(function (resolve_new, reject_new) {
            that._resolve_callback.push(function (value) {
                try {
                    let x = resolve_old(that.value);
                    if (x instanceof RabbitPromise) {
                        x.then(resolve_new, reject_new);
                    }
                } catch (e) {
                    reject_new(e);
                }
            });
            that._reject_callback.push(function (reason) {
                try {
                    let x = reject_old(that.value);
                    if (x instanceof RabbitPromise) {
                        x.then(resolve_new, reject_new);
                    }
                } catch (e) {
                    reject_new(e);
                }
            });
        });
    }
};