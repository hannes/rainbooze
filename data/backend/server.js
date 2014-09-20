var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var csv = require('ya-csv');
var app = express();

var dataset = {};

var readCSV = function(filename, callback, finish) {
    var reader = csv.createCsvFileReader(filename, {
        'separator': "\t",
        'quote': '',
        'escape': '',
        'comment': ''
    });
    reader.addListener('data', function(data) {
        callback(data);
    });
    reader.addListener('end', function(data) {
        if(finish !== undefined)
            finish();
    });
};

var parseContent = function(contentStr) {
    var parts = contentStr.split(/\s+/);
    var unit = parts[1].trim().toLowerCase();
    var val = parseFloat(parts[0].trim());
    switch(unit) {
        case "lt":
        case "kg":
            return val * 1000;
        case "st":
            return 0;
        default:
            return val;
    }
};

var init = function() {
    // init transactions
    var transactions = {};
    dataset.transactions = transactions;
    readCSV('transactions.tsv', function(tx) {
        var timestamp = new Date(tx[0] + " " + tx[1]);
        var txid = parseInt(tx[4]);
        var description = tx[7];
        var contents = parseContent(tx[9]);
        var assgroepnr = tx[19];
        var ean = tx[20];
        var obj = {
            //timestamp : timestamp,
            txid : txid,
            description: description,
            contents : contents,
            groupid: assgroepnr,
            ean : ean
        };
        if(transactions[txid] === undefined) {
            transactions[txid] = {
                products: []
            };
        }
        transactions[txid].products.push(obj);
    }, function() { // transactions done
        console.log('tx done');
        // init groups
        var groups = {};
        dataset.groups = groups;
        readCSV('groups.tsv', function(group) {
            var id = parseInt(group[0]);
            var obj = {
                id: id,
                name: group[1],
                score: parseInt(group[2])
            };
            groups[group[0]] = obj;
            groups[id] = obj;
        }, function() { // groups done
            console.log('groups done');
            // init nutritional values
            var nutritional = {};
            dataset.nutritional = nutritional;
            readCSV('nutritional.tsv', function(n) {
                var ean = n[0];
                var rank = parseFloat(n[1]);
                var calories =      n[2] !== 'NA' ? parseInt(n[2]) : null;
                var sugars =        n[3] !== 'NA' ? parseFloat(n[3]) : null;
                var sat_fat =       n[4] !== 'NA' ? parseFloat(n[4]) : null;
                var unsat_fat =     n[5] !== 'NA' ? parseFloat(n[5]) : null;
                var fibers =        n[6] !== 'NA' ? parseFloat(n[6]) : null;
                var carbs =         n[7] !== 'NA' ? parseFloat(n[7]) : null;
                var cholestrol =    n[8] !== 'NA' ? parseFloat(n[8]) : null;
                var protein =       n[9] !== 'NA' ? parseFloat(n[9]) : null;
                var obj = {
                    ean: ean,
                    rank: rank,
                    calories: calories,
                    sugars: sugars,
                    sat_fat: sat_fat,
                    unsat_fat: unsat_fat,
                    fibers: fibers,
                    carbs: carbs,
                    cholestrol: cholestrol,
                    protein: protein
                };
                nutritional[ean] = obj;
            }, function() {
                console.log('nutritional done');
                console.log('join everything...');
                for(var x in dataset.transactions) {
                    var tx = dataset.transactions[x];
                    for(var i=0; i<tx.products.length; i++) {
                        var product = tx.products[i];
                        if(groups[product.groupid] !== undefined) {
                            product.groupname = groups[product.groupid].name;
                            product.groupscore = groups[product.groupid].score;
                        }
                        else {
                            product.groupname = null;
                            product.groupscore = null;
                        }
                        if(nutritional[product.ean] !== undefined) {
                            product.nutrition = nutritional[product.ean];
                        }
                        else {
                            product.nutrition = null;
                        }
                    }
                }
                
                // init nutritional values
                var profiles = {};
                dataset.profiles = profiles;
                readCSV('profiles.tsv', function(p) {
                    var userid = p[1];
                    var txid = p[0];
                    var date = new Date(p[2]);
                    if(profiles[userid] === undefined) {
                        profiles[userid] = {
                            userid: userid,
                            transactions: []
                        };
                    }
                    profiles[userid].transactions.push({
                        id: txid,
                        date: date,
                        data: transactions[txid]
                    });
                }, function() {
                    console.log('all done');
                });
            });
            
        });
    });
};

init();

var getNutritionInfo = function(word, callback) {
    url = 'http://www.voedingswaardetabel.nl/voedingswaarde/?q=' + word;
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var json = {
                name: "not found",
                calories: 0,
                sugars: 0,
                sat_fat: 0,
                unsat_fat: 0,
                fibers: 0,
                carbs: 0,
                cholestrol: 0,
                protein: 0,
                emotion: 0,
                healthy: 0
            };
            
            var $rows = $('.vwRow, .vwRow1');
            if($rows.length == 0) {
                callback(json);
            }
            else {
                var result = [];
                $rows.each(function() {
                    var $row = $(this);
                    var json = {};
                    json.name = $row.children('.vwtProdName').text().trim();
                    var $c = $row.children('.vwtItem');
                    var $x = $row.children('.vwtItemExtra');
                    var parse = function(domEl) {
                        var txt = $(domEl).text();
                        txt = txt.replace(",", ".");
                        return parseFloat(txt);
                    };
                    json.calories =     parse($c[0]);
                    json.sugars =       parse($c[5]);
                    json.sat_fat =      parse($c[7]);
                    json.unsat_fat =    parse($c[8]) + parse($c[9]);
                    json.fibers =       parse($c[11]);
                    json.carbs =        parse($c[4]);
                    json.cholestrol =   parse($c[10]);
                    json.protein =      parse($c[3]);
                    json.emotion =      parse($x[0]);
                    json.healthy =      parse($x[1]);
                    result.push(json);
                });
                
                callback(result);
            }
        }
        else {
            callback(null);
        }
    });
};

var getOneProduct = function(query, callback) {
    var parts = query.split(/\s+/);
    var map = {};
    var numDone = 0;
    for(var i=0; i<parts.length; i++) {
        getNutritionInfo(parts[i], function(list) {
            var shouldDo = true;
            for(var j=0; j<list.length; j++) {
                if(list[j].name == "Aal") {
                    shouldDo = false;
                    break;
                }
            }
            if(shouldDo) {
                for(var j=0; j<list.length; j++) {
                    var product = list[j];
                    if(map[product.name] === undefined) {
                        map[product.name] = [];
                    }
                    map[product.name].push(product);
                }
            }
            if(++numDone >= parts.length) {
                // this was the last callback
                var max = 0;
                var obj = null;
                for(var x in map) {
                    var arr = map[x];
                    if(arr.length > max) {
                        max = arr.length;
                        obj = arr;
                    }
                    else if(arr.length == max && arr.length > 0 && obj.length > 0 && arr[0].name.length < obj[0].name.length) {
                        max = arr.length;
                        obj = arr;
                    }
                }
                if(obj == null) {
                    callback(null);
                    return;
                }
                callback(obj[0]);
            }
        });
    }
};

app.get('/prodinfo/', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    var query = req.query.q;
    //var query = req.params.query;
    getOneProduct(query, function(json) {
        res.end(JSON.stringify(json, null, 4));
    });
});

app.get('/transaction/:userid', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    var userid = req.params.userid;
    res.end(JSON.stringify(dataset.profiles[userid], null, 4));
    //res.end(req.params.userid);
});


app.listen(8888);
