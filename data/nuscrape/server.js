var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var app = express();

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
            for(var j=0; j<list.length; j++) {
                var product = list[j];
                if(map[product.name] === undefined) {
                    map[product.name] = [];
                }
                map[product.name].push(product);
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

app.get('/', function(req, res) {
    var query = req.query.q;
    getOneProduct(query, function(json) {
        res.end(JSON.stringify(json, null, 4));
    });
});

app.listen(8888);
