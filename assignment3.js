var width = 750;
var height = 450;
var margin = {top: 20, right: 15, bottom: 30, left: 40};
var w = width - margin.left - margin.right;
var h = height - margin.top - margin.bottom;
var dataset; //the full dataset
var patt = new RegExp("all");
var ndata;
var maxArrDelay;
var minArrDelay;
var maxAirTime;
var minAirTime;
var maxDepDelay;
var minDepDelay;
var currentData;
var datasetCount = 0;
var shownVisual; 
var attributes = ["ARR_DELAY", "DEP_DELAY", "AIR_TIME" ]; //Filter attributes with more possible filters for later on
var ranges = [[minArrDelay, maxArrDelay], [minDepDelay, maxDepDelay], [0,maxAirTime]]; 
var airlines = ["AA","AS","B6","DL","F9","HA","OO","UA","VX","WN"]; //All airlines in bar chart
var countAirlinesTotal;
var airlineObject2;


d3.csv("flightinfo.csv", function(error, flights) {
//read in the data
  if (error) return console.warn(error);
  flights.forEach(function(d) {
    d.ARR_DELAY = +d.ARR_DELAY;
    d.DEP_DELAY = +d.DEP_DELAY;
    d.AIR_TIME = +d.AIR_TIME;
    datasetCount = datasetCount + 1;
  });
//dataset is the full dataset
  dataset = flights;
  currentData = dataset;
  shownVisual = dataset;

//all the data is now loaded, so draw the initial vis
  drawVis(dataset);
//grabbing counts of occurances for barchart
  countAirlines(dataset);
//draw bar chart
  drawChart(dataset);
  maxArrDelay = d3.max(dataset, function(d) { return d.ARR_DELAY; });
  maxDepDelay = d3.max(dataset, function(d) { return d.DEP_DELAY; });
  minDepDelay = d3.min(dataset, function(d) { return d.DEP_DELAY; });
  minArrDelay = d3.min(dataset, function(d) { return d.ARR_DELAY; });
  maxAirTime = d3.max(dataset, function(d) { return d.AIR_TIME; });
  minAirTime = d3.min(dataset, function(d) { return d.AIR_TIME; });
});

var col = d3.scaleOrdinal(d3.schemeCategory10);

//scatterplot
var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//chart for bar chart
var chart2 = d3.select(".chart2")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//adding tool tip for mouse over
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var x = d3.scaleLinear()
        .domain([-100, 1000])
        .range([0, w]);


var y = d3.scaleLinear()
        .domain([0, 500])
        .range([h, 0]);

var y2 = d3.scaleLinear()
        .domain([0, 9000])
        .rangeRound([h, 0]);

var x2 = d3.scaleBand()
        .rangeRound([0, w])
        .padding(0.3)
        .domain(airlines);

var xAxis = d3.axisBottom()
    .ticks(4)
    .scale(x);

var xAxis2 = d3.axisBottom()
    .ticks(4)
    .scale(x2);


var yAxis = d3.axisLeft()
    .scale(y);
var yAxis2 = d3.axisLeft()
    .scale(y2);

chart.append("g")
   .attr("class", "axis")
   .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Air Time");

chart2.append("g")
   .attr("class", "axis")
   .call(yAxis2)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Total Delays");


//add xaxis onto scatter
chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
     .append("text")
      .attr("x", w)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Arrival Delay");

chart2.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis2)
     .append("text")
      .attr("x", w)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Airline");



function drawVis(data) { //draw the circiles initially and on each interaction with a control
  var circle = chart.selectAll("circle")
     .data(data);

  circle
        .attr("cx", function(d) { return x(d.ARR_DELAY);  })
        .attr("cy", function(d) { return y(d.AIR_TIME);  })
        .style("fill", function(d) { return col(d.UNIQUE_CARRIER) });

  circle.exit().remove();

  circle.enter().append("circle")
        .attr("cx", function(d) { return x(d.ARR_DELAY);  })
        .attr("cy", function(d) { return y(d.AIR_TIME);  })
        .attr("r", 4)
        .style("stroke", "black")
        .style("fill", function(d) { return col(d.UNIQUE_CARRIER); })
        .style("opacity", 0.5)
        .on("mouseover", function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html( "Carrier: "+d.UNIQUE_CARRIER+", Origin: " + d.ORIGIN + ", Dest: " + d.DEST)
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          })
        .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        });
}

$( document ).ready(function() {
  document.getElementById("myselectform").onchange = function(){
    filterType(this.value);
  }
});

//drop down filter
function filterType(mytype) {
  var res = patt.test(mytype);
  //if all
  if(res){
    currentData = dataset;
    toVisualize = currentData.filter(function(d) { return isInRange(d)});
    datasetCount = toVisualize.length; 
    shownVisual = drawVis(toVisualize); 
    countAirlines(toVisualize);
    drawChart(toVisualize);
    ndata = dataset;
  }else{
    //otherwise find data that matches
    ndata = dataset.filter(function(d) {
    return d["ORIGIN"] == mytype ;
  });
    currentData = ndata;
    toVisualize = currentData.filter(function(d) { return isInRange(d)}); 
    shownVisual = drawVis(toVisualize); 
        
    datasetCount = toVisualize.length; 
    countAirlines(toVisualize);
    drawChart(toVisualize);
  }

}

//Departure Delay slider
$(function() {
 $( "#departureDelay" ).slider({
  range: true, 
  min:  -100, 
  max: 1000, 
  values: [ -100, 1000 ], 
  slide: function( event, ui ) { 
    $( "#departuredelayamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    tempValues = ui.values;
     filterData("DEP_DELAY", ui.values); }  }); 
 $( "#departuredelayamount" ).val($( "#departureDelay" ).slider( "values", 0 ) + 
  " - " + $( "#departureDelay" ).slider( "values", 1 ) );   });

//Filters on slider values
function filterData(attr, values){
  for (i = 0; i < attributes.length; i++){
    if (attr == attributes[i]){
     ranges[i] = values;
    } 
  } 
  var toVisualize = currentData.filter(function(d) { return isInRange(d)}); 
  shownVisual =drawVis(toVisualize); 
  countAirlines(toVisualize);
  drawChart(toVisualize);
}

//checks if values are in range and then shows them if they are
function isInRange(datum){
 for (i = 0; i < attributes.length; i++){
  if (datum[attributes[i]] < ranges[i][0] || datum[attributes[i]] > ranges[i][1]){
   return false;
  } 
} 
return true; 
}

//grabs counts of airlines delays 
function countAirlines(input) {
  var count = {};
  var airlineCounts =[];
  var airlineCountTemp;
  airlineObject2 = [];
  //should display nothing if nothing is there
  for (var i = 0; i < airlines.length; i++) {
     count[airlines[i]] = 0;
  }


  for (var i = 0; i < datasetCount; i++){
      //pulls line in dataset
      var item = dataset[i];
      if(item != null){
       airline =  item.UNIQUE_CARRIER;


    if (count.hasOwnProperty(airline)) {
      count[airline] += 1;

    }
    else {
      count[airline] = 1;
    }
  }

    
  }
  
  for (var i = 0; i < airlines.length; i++) {
    var airlineObject = {carrier:airlines[i], count:count[airlines[i]]};
    airlineObject2.push(airlineObject);  
  }
  console.log(airlineObject2);
  countAirlinesTotal = count;
  console.log(count);
};


function drawChart(){
  console.log("y-scale of zero: " + y2(0));
  console.log("y-scale of zero: " + y(0));

  var bar = chart2.selectAll(".bar")
    .data(airlineObject2);

  bar
    .attr("class","bar")
    .attr("x", function(d) { return x2(d.carrier); })
    .attr("y", function(d){return y2(d.count); })
    .style("fill", function(d) { return col(d.carrier) });

  bar.exit().remove();  

  bar.enter().append("rect")
      .attr("class","bar")
      .attr("x", function(d) { return x2(d.carrier); })
      .attr("y", function(d){return y2(d.count); })
      .attr("width", x2.bandwidth())
      .attr("height", function(d) { return h - y2(d.count); })
      .style("fill", function(d) { return col(d.carrier) })
      .on("mouseover", function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html( "Carrier: "+d.carrier+", Delays " + d.count)
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          })
        .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        });
}


