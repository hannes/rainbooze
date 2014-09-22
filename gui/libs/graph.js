
function graph(containerId, dataSource, graphType){

    $('#'+containerId).empty();

    var margin = {top: 10, right: 20, bottom: 30, left: 0},
        width = d3.select('#'+containerId).node().offsetWidth - margin.left - margin.right,
        height = d3.select('#'+containerId).node().offsetHeight - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal().range(['#38c70b', '#dd6719', '#4a86ac', '#d1c0a6', '#aaa', '#aaa']);
    var numberOfTicks = Math.floor(width / 100);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(numberOfTicks)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(numberOfTicks)
        .orient("left");


    var baseLine = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(20110101); })
        .y(function(d) { return y(50); });

    var line = d3.svg.line()
    //    .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.saldo); });

    var svg = d3.select("#"+containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    
    loadData = function(error, data) {

      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

      data.forEach(function(d) {
          if(typeof d.date == 'string'){
                d.date = parseDate(d.date);
           }
      });

      var people = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {date: d.date, saldo: +d[name]};
          })
        };
      });

      x.domain(d3.extent(data, function(d) { return d.date; }));

      y.domain([
        d3.min(people, function(c) { return d3.min(c.values, function(v) { return v.saldo; }); }),
        d3.max(people, function(c) { return d3.max(c.values, function(v) { return v.saldo; }); })
      ]);

      // grid

        var yAxisGrid = d3.svg.axis().scale(y)
          .ticks(numberOfTicks) 
          .tickSize(width, 0)
          .tickFormat("")
          .orient("right");

        var xAxisGrid = d3.svg.axis().scale(x)
          .ticks(numberOfTicks) 
          .tickSize(-height, 0)
          .tickFormat("")
          .orient("top");

        svg.append("g")
          .classed('vertical', true)
          .classed('grid', true)
          .call(yAxisGrid);

        svg.append("g")
          .classed('horizontal', true)
          .classed('grid', true)
          .call(xAxisGrid);



      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Saldo");

      var person = svg.selectAll(".person")
          .data(people)
        .enter().append("g")
          .attr("class", function(d){ return 'person ' + d.name; });

      person.append("path")
          .attr("class", "line")
          .style("stroke", function(d) { return color(d.name); })
          .attr("d", function(d) { return line(d.values); })
          .transition()
          .duration(2000)
          .attrTween('d', function(d){ return pathTween(d); })
          .each("end", function(d, index){ if(graphType=='saldo'){ drawPoints(d, index); } } /* person.append('circle').attr('cx', d.y) */ );

      var legenda = d3.select("#"+containerId).append('div').attr('class', 'legenda');

      function drawPoints(d, index){
          for(var i in d.values){
                        
            // last point, show point change
            if(index==0 && i == d.values.length-1 && i > 0){
                d3.select(person[0][index]).append('circle')
                    .attr('class', 'point lastValue')
                    .attr('cx', function(){ return x(d.values[i].date); })
                    .attr('cy', function(){ return y(d.values[i].saldo); })
                    .attr('r', '0')
                    .attr('data-transaction-date', function() { return d.values[i].date.toISOString(); })
                    .transition()
                    .attr('r', '10');
                d3.select(person[0][index]).append('text')
                    .attr("transform", function(d) { return "translate(" + x(d.values[i].date) + "," + y(d.values[i].saldo) + ")"; })
                    .attr('x', '-8px')
                    .attr('y', '4px')
                    .attr('fill', 'white')
                    .text(function(d) { 
                        var value = Math.round(d.values[i].saldo - d.values[i-1].saldo);
                        var text = (value < 0)? value: '+' + value;                         
                        return text; 
                    });
            }else{
                
                d3.select(person[0][index]).append('circle')
                    .attr('class', 'point')
                    .attr('cx', function(){ return x(d.values[i].date); })
                    .attr('cy', function(){ return y(d.values[i].saldo); })
                    .attr('r', '0')
                    .attr('data-transaction-date', function() { return d.values[i].date.toISOString(); })
                    .attr('fill', function(){ return (index==0)? 'white': color(d.name); } )
                    .transition()
                    .attr('r', 4);
                
            }
          }

          legenda.append('span').attr('class', 'color').style('background-color', color(d.name));
          legenda.append('span').attr('class', 'name').html(d.name);
          if(index > 0){
              legenda.style('display', 'block');
          }

      }

      function pathTween(d) {
        var interpolate = d3.scale.quantile()
                .domain([0,1])
                .range(d3.range(1, d.values.length + 1));
        return function(t) {
            return line(d.values.slice(0, interpolate(t)));
        };
      }

    //  person.append("text")
    //      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
    //      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.saldo) + ")"; })
    //      .attr("x", 3)
    //      .attr("dy", ".35em")
    //      .text(function(d) { return d.name; });

    };
    
    if(typeof dataSource == 'string'){
        d3.csv("js/" + dataSource, loadData);
    }else{
        loadData(null, dataSource);
    }

};

$('#saldo').on('mouseover', '.Me .point', function(event){
    var $el = $(event.currentTarget);
    var offset = $el.offset();
    var $label = $('<div class="labelPoint">Bekijk bon</div>');
    $label.css({'top': (offset.top - 40) +'px', 'left': offset.left + 'px'});
    $('body').append($label);
});
$('#saldo').on('mouseout', '.Me .point', function(event){
    if(event.relatedTarget && event.relatedTarget.nodeName.toLowerCase() != 'text'){
        $('.labelPoint').remove();
    }
});

$('#saldo').on('click', '.Me .point', function(event){
  $('.labelPoint').remove();
  var $el = $(event.currentTarget);
  var transactionDate = $el.data('transaction-date');
  angular.element('body').scope().showTransaction(transactionDate);
  angular.element('body').scope().$apply();
});