// array tail-recursive binary search with customizable comparator
Array.prototype.search = function(value, fn, low, high, mid){
    if (high < low) return ((low === 0) ? -0.1 : -1 * low);
    var comparator = fn || function(x){return value - x;};
    if (arguments.length < 5) return this.search(value, fn, 0, this.length - 1, Math.floor((this.length -  1) / 2));
    var potential = comparator(this[mid]);
    if (potential > 0) return this.search(value, comparator, mid + 1, high, Math.floor((mid + 1 + high) / 2));
    if (potential < 0) return this.search(value, comparator, low, mid - 1, Math.floor((low + mid - 1) / 2))
    return mid;
};

// array map
if (!('map' in Array.prototype)){
    Array.prototype.map = function(fn){
        if (typeof fn !== 'function') throw {name: 'MapError', message: 'No function was passed into map.'};
        var length = this.length, result = [];
        for (var index = 0; index < length; index += 1) result.push(fn(this[index], index));
        return result;
    };
};

// array filter
if (!('filter' in Array.prototype)){
    Array.prototype.filter = function(fn){
        if (typeof fn !== 'function') throw {name: 'FilterError', message: 'No function was passed into filter.'};
        var length = this.length, result = [];
        for (var index = 0; index < length; index += 1) if (fn(this[index], index)) result.push(this[index]);
        return result;
    };
};

// array reduce
if (!('reduce' in Array.prototype)){
    Array.prototype.reduce = function(fn, acc){
        if (typeof fn !== 'function') throw {name: 'ReduceError', message: 'No function was passed into reduce.'};
        if (typeof acc === 'undefined') throw {name: 'ReduceError', message: 'No accumulator was passed into reduce.'};
        var length = this.length, result = acc;
        for (var index = 0; index < length; index += 1) result = fn(result, this[index]);
        return result;
    };
};

// array max
if (!('max' in Array.prototype))
    Array.prototype.max = function(){return this.reduce(function(a, b){return a > b ? a : b;}, this[0]);};


// array min
if (!('min' in Array.prototype))
    Array.prototype.min = function(){return this.reduce(function(a, b){return a < b ? a : b;}, this[0]);};