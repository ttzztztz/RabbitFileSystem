function RabbitPromise(func){
    this.value = null;
    this._resolve_callback = [];
    this._reject_callback = [];
    this.status = "Pending";
    let that = this;
    func(this.resolve.bind(this),this.reject.bind(this));
}
RabbitPromise.prototype.resolve = function(val){
    let that = this;
    if(this.status==="Pending"){
        this.status = "Resolved";
        this.value = val;
        for(let i=0;i<that._resolve_callback.length;i++){
            that._resolve_callback[i](that.value);
        }
    }
};
RabbitPromise.prototype.reject = function(val){
    let that = this;
    if(this.status==="Pending"){
        this.status = "Rejected";
        this.value = val;
        for(let i=0;i<that._reject_callback.length;i++){
            that._reject_callback[i](val);
        }
    }
};
RabbitPromise.prototype.then = function(__resolve,__reject){
    let that = this;
    if(typeof __resolve !=="function") __resolve = function(value){};
    if(typeof __reject !=="function") __reject = function(value){};
    if(that.status==="Resolved"){
        return new RabbitPromise(function(resolve,reject){
            try {
                let x = __resolve(that.value);
                if(x instanceof RabbitPromise){
                    x.then(resolve,reject);
                }
                resolve(x.value);
            } catch(e) {
                reject(e);
            }
        });
    } else if(that.status==="Rejected"){
        return new RabbitPromise(function(resolve,reject){
            try {
                let x = __reject(that.value);
                if(x instanceof RabbitPromise){
                    x.then(resolve,reject);
                }
            } catch(e) {
                reject(e);
            }
        });
    } else if(that.status==="Pending") {
        return new RabbitPromise(function(resolve,reject){
            that._resolve_callback.push(function(value){
                try{
                    let x = __resolve(that.value);
                    if(x instanceof RabbitPromise){
                        x.then(resolve,reject);
                    }
                } catch(e){
                    reject(e);
                }
            });
            that._reject_callback.push(function(reason){
                try {
                    let x = __reject(that.value);
                    if(x instanceof RabbitPromise){
                        x.then(resolve,reject);
                    }
                } catch(e) {
                    reject(e);
                }
            });
        });
    }
};