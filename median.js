// class distrib
var distrib = function(){
    var slaves = [];
    this.slaves = function(){
        return slaves;
    };
    this.master = new function(){
        this.output = function(separator){
            var total = 0;
            return slaves.map(function(slave){
                total += slave.length();
                return '<strong>slave #' + slave.id() + ':</strong>   ' + slave.output() + ' with length: ' + slave.length();
            }).concat(['<strong>total distributed data length:</strong> ' + total]).join(separator || '\n');
        };
        this.median = function(n){
            slaves.map(function(slave){slave.sort();}); // sort each slave's data
            var is_median = function(candidate){
                var more = 0, less = 0, equal = 0;
                slaves.map(function(slave){
                    var stats = slave.stats(candidate);
                    more += stats.more;
                    less += stats.less;
                    equal += stats.equal;
                });
                if (equal){
                    if (more === less) return 0;
                    if (equal > 1){
                        var offset = equal - 1;
                        var lower_bound = [more, less].min();
                        var upper_bound = [more, less].max();
                        if (lower_bound + offset >= upper_bound) return 0;
                    };
                    return more > less ? 1 : -1;
                };
                return more > less ? 1 : -1;
            };
            var result = null;
            var matches = slaves.map(function(slave){
                var match = slave.search(null, is_median);
                if (match >= 0)
                    result = slave.point(match);
                return match;
            });
            if (result !== null)
                return result;
            var points = matches.map(function(match, index){
                return slaves[index].point(Math.floor(-1 * match)) || null;
            });
            var bound = points.filter(function(item){return item !== null;}).min();
            var more = 0, less = 0, equal = 0;
            var stats = slaves.map(function(slave){
                var stats = slave.stats(bound);
                more += stats.more;
                less += stats.less;
                equal += stats.equal;
            });
            result = [bound];
            var temp;
            if (more + equal < less){ // we need the next bigger item
                temp = matches.map(function(match, slave){
                    var index = Math.floor(-1 * match);
                    var next = slaves[slave].next(index);
                    if (next < slaves[slave].length())
                        return slaves[slave].point(next);
                    else
                        return null;
                }).filter(function(item){return item !== null;}).min();
                result.push(temp);
            }else{ // we need the next smaller item
                temp = matches.map(function(match, slave){
                    var index = Math.floor(-1 * match);
                    var previous = slaves[slave].previous(index);
                    if (previous >= 0)
                        return slaves[slave].point(previous);
                    else
                        return null;
                }).filter(function(item){return item !== null;}).max();
                result.unshift(temp);
            };
            return result;
        };
    };
    var slave_id = 0;
    // class slave
    this.slave = function(arr){
        if (arr.constructor !== Array){
            throw {name: 'SlaveError', message: 'The data passed to a distrib.slave constructor must be an array.'};
            return null;
        };
        var data = arr;
        var length = data.length;
        var id = slave_id++;
        var self = this;
        this.id = function(){
            return id;
        };
        this.length = function(){
            return length;
        };
        this.map = function(fn){
            return data.map(fn);
        };
        this.next = function(index){
            var value = data[index];
            var lcv = index;
            while (data[lcv] === data[index] && lcv < length){
                lcv += 1;
            };
            return (lcv === length) ? -1 : lcv;
        };
        this.output = function(){
            return '[' + data.join(', ') + ']';
        };
        this.point = function(index){
            return data[index];
        };
        this.previous = function(index){
            var value = data[index];
            var lcv = index;
            while (data[lcv] === data[index] && lcv > -1){
                lcv -= 1;
            };
            return lcv;
        };
        this.reduce = function(fn, acc){
            return data.reduce(fn, acc);
        };
        this.reshape = function(fn){
            data = fn(data);
        };
        this.search = function(value, fn){
            return data.search(value, fn)
        };
        this.sort = function(){
            data = data.sort(function(a, b){return a - b;});
        };
        this.stats = function(candidate){
            var more = 0, less = 0, equal = 0;
            var index = self.search(candidate);
            if (index < 0){ // if the candidate was not found
                less += Math.floor(-1 * index);
                more += length - Math.floor(-1 * index);
            };
            if (index >= 0){ // if the candidate was found
                var flag = true;
                var traversal = index;
                while (flag){
                    if (traversal < length && data[traversal] === candidate)
                        equal += 1;
                    else
                        flag = false
                    traversal += 1;
                };
                if (traversal <= length) more += length - (traversal - 1);
                traversal = index - 1;
                flag = true;
                while (flag){
                    if (traversal > -1 && data[traversal] === candidate)
                        equal += 1;
                    else
                        flag = false;
                    traversal -= 1;
                };
                if (traversal > -2) less += traversal + 2;
            };
            return {more: more, less: less, equal: equal};
        };
        slaves.push(self);
    };
};