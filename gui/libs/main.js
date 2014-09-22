

jQuery('document').ready(function(){

//    addUserData(1, 'Me', function(data){
//        console.log(data);
//    });


});

function removeUserData(name){
    currentUsers.splice(currentUsers.indexOf(name), 1);
    for(var i in saldo){
        delete saldo[i][name];
    }
    if(waitingForAnswers == 0){
        graph('saldo', saldo, 'saldo');
    }
}

var saldo = [];
var deltas = [];
var currentUsers = [];
var waitingForAnswers = 0;

function addUserData(id, name, callback){
    waitingForAnswers++;
    currentUsers.push(name);
    $.getJSON('http://do.u0d.de:8888/transaction/'+id, function(data){
         
        var calories = 0;
        var sugar = 0;
        var sat_fat = 0;
        var unsat_fat = 0;
        var fibers = 0;
        var carbs = 0;
        var cholestrol = 0;
        var protein = 0;
        
        for(var i in data.transactions){
            var transaction = data.transactions[i];
            
            var strdate = transaction.date;
            
            try{
                var date = new Date(Date.parse(strdate));
                var d = '' + date.getFullYear() + 
                  ("0" + (date.getMonth()+1)).slice(-2) + 
                  ("0" + date.getDate()).slice(-2);
            }catch(e){
                continue; // can't process date, skip this transaction
            }

            if(! transaction.data || ! transaction.data.products){
                continue;
            }
            
            var s = transaction.data.avg_rank;
            if(name == 'Me'){
                var prod = transaction.data.products;
                for(var p in prod){
                    var w;
                    if(w = prod[p].contents){
                        calories += (prod[p].nutrition.calories)? prod[p].nutrition.calories * prod[p].contents/100: 0;
                        sugar += (prod[p].nutrition.sugar)? prod[p].nutrition.sugar * prod[p].contents/100: 0;
                        sat_fat += (prod[p].nutrition.sat_fat)? prod[p].nutrition.sat_fat * prod[p].contents/100: 0;
                        unsat_fat += (prod[p].nutrition.unsat_fat)? prod[p].nutrition.unsat_fat * prod[p].contents/100: 0;
                        fibers += (prod[p].nutrition.fiber)? prod[p].nutrition.fiber * prod[p].contents/100: 0;
                        carbs += (prod[p].nutrition.carbs)? prod[p].nutrition.carbs * prod[p].contents/100: 0;
                        cholestrol += (prod[p].nutrition.cholestrol)? prod[p].nutrition.cholestrol * prod[p].contents/100: 0;
                        protein += (prod[p].nutrition.protein)? prod[p].nutrition.protein * prod[p].contents/100: 0;
                    }

                }
            }
           
            // merging multiple transactions on the same date together
            var push = true;
            for(var t in deltas){
                if(deltas[t].date == d){
//                    for(var n in currentUsers){
//                        saldo[t][currentUsers[n]] = saldo[t][currentUsers[n]] || 0;
//                    }
                    if(! deltas[t][name]){ deltas[t][name] = 0; }
                    deltas[t][name] += s;
                    var push = false;
                }
            }
            
            if(push){
                var datapoint = {date: d};
//                for(var n in currentUsers){
//                    datapoint[currentUsers[n]] = 0;
//                }
                datapoint[name] = s;
                deltas.push(datapoint);
            }
            
        }
        
        var byProperty = function(prop) {
            return function(a,b) {
                if (typeof a[prop] == "number") {
                    return (a[prop] - b[prop]);
                } else {
                    return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
                }
            };
        };

        deltas.sort(byProperty("date"));
       
        // make it cumalitive
        var total = 0;
        saldo = [{date: deltas[0].date}];
        for(var n in currentUsers){
            saldo[0][currentUsers[n]] = 0;
        }

        for(var i = 1; i < deltas.length; i++){
//            total += saldo[i][name];
//            saldo[i][name] = total;
            var obj = {date: deltas[i].date};
            for(var n in currentUsers){
                var d = deltas[i][currentUsers[n]];
                if(! d){ d = 0; }
                obj[currentUsers[n]] = saldo[i-1][currentUsers[n]] + d;
            }
            saldo.push(obj);
        }
        
        
       
        waitingForAnswers--;
        if(waitingForAnswers == 0){
            graph('saldo', saldo, 'saldo');
        }
        
        var specs = {
            total: Math.round(saldo[saldo.length-1][name]),
            last: Math.round(deltas[deltas.length-1][name]),
            status: (deltas[deltas.length-1][name]>0)? 'goed': 'slecht',
            specs: {
                calories: Math.round(calories),
                sugar: Math.round(sugar),
                sat_fat: Math.round(sat_fat),
                unsat_fat: Math.round(unsat_fat),
                fibers: Math.round(fibers),
                carbs: Math.round(carbs),
                cholestrol: Math.round(cholestrol),
                protein: Math.round(protein)
            }
        };
        
        callback(specs);
        
        
    });
    
}


