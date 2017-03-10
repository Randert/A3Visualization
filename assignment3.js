var width = 750;
var height = 450;
var margin = {top: 20, right: 15, bottom: 60, left: 60};
var w = width - margin.left - margin.right;
var h = height - margin.top - margin.bottom;
var dataset; //the full dataset
var patt = new RegExp("all");
var ndata;//temporary dataset
var maxArrDelay = 1000;
var minArrDelay = -100;
var maxAirTime = 500;
var minAirTime = 0;
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
var maxDelays = 9000;
var currentFilter = "all";

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
  //finding max and mins of x and y axis
  maxArrDelay = d3.max(shownVisual, function(d) { return d.ARR_DELAY; });
  minArrDelay = d3.min(shownVisual, function(d) { return d.ARR_DELAY; });
  maxAirTime = d3.max(shownVisual, function(d) { return d.AIR_TIME; });
  minAirTime = d3.min(shownVisual, function(d) { return d.AIR_TIME; });
  x.domain([-100, 1000]);
  y.domain([0, 500]);
  y2.domain([0,9000]);
  //grabbing counts of occurances for barchart
  countAirlines(dataset);
  //updating axis
  updateAxis();
  //all the data is now loaded, so draw the initial vis
  drawVis(dataset);
  //draw bar chart
  drawChart(dataset);
});

//setting the color scheme
var col = d3.scaleOrdinal(d3.schemeCategory10);

//addinf the brush to the chart
var brush = d3.brush().on("end", brushended),
    idleTimeout,
    idleDelay = 350;

//scatterplot
var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+30)
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
var brush1 = d3.select(".chart")
    .append("g")
    .attr("class", "brush")
    .call(brush);

//setting x and y scales
var x = d3.scaleLinear().range([0, w]).domain([minArrDelay,maxArrDelay]);
var y = d3.scaleLinear().range([h, 0]).domain([minAirTime,maxAirTime]);
var y2 = d3.scaleLinear().domain([0, maxDelays]).range([h, 0]);
var x2 = d3.scaleBand()
	        .rangeRound([0, w])
	        .padding(0.3)
	        .domain(airlines);

//setting x and y axis for both graphs
var xAxis;
var xAxis2 = d3.axisBottom()
	.ticks(4)
  .scale(x2);
var yAxis;
var yAxis2 = d3.axisLeft()
  .scale(y2);

//appending y axis to both charts
chart.append("g")
   .attr("class", "y-axis axis");

chart2.append("g")
   .attr("class", "y-axis2 axis")
   .call(yAxis2)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Total Delays");


//appending x axis to charts
chart.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + h + ")");

chart2.append("g")
    .attr("class", "x-axis2")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis2)
     .append("text")
      .attr("x", w)
      .attr("y", -8)
      .style("text-anchor", "end")
      .text("Airline");

//on document ready grab current filter
$( document ).ready(function() {
  document.getElementById("myselectform").onchange = function(){
    currentFilter = this.value;
    filterType(this.value);
  }
});

//plot points on scatterplot
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
        .style("opacity", 0.3)
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
  chart.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ -50 +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Air Time (minutes)");
  chart.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h + 45)+")")  // centre below axis
            .text("Arrival Delay (minutes)");
}



//drop down filter
function filterType(mytype) {
  var res = patt.test(mytype);
  //if all
  if(res){
    currentData = dataset;
    toVisualize = currentData.filter(function(d) { return isInRange(d)});
    datasetCount = toVisualize.length; 
    shownVisual = toVisualize;
    countAirlines(toVisualize);
    updateAxis();
    drawVis(toVisualize); 
    drawChart(toVisualize);
    ndata = dataset;
  }else{
    //otherwise find data that matches
    ndata = dataset.filter(function(d) {
    return d["ORIGIN"] == mytype ;
  });
    currentData = ndata;
    toVisualize = currentData.filter(function(d) { return isInRange(d)}); 
    datasetCount = toVisualize.length;
    shownVisual = toVisualize;

    countAirlines(toVisualize);
    updateAxis();
    drawVis(toVisualize); 
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
  shownVisual = toVisualize;
  countAirlines(toVisualize);
  updateAxis();
  drawVis(toVisualize); 
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
  maxDelays = 0;
  var tempCount;
  airlineObject2 = [];

  //should display nothing if nothing is there
  for (var i = 0; i < airlines.length; i++) {
     count[airlines[i]] = 0;
  }

  for (var i = 0; i < datasetCount; i++){
      //pulls line in dataset
      var item = shownVisual[i];
      if(item != null){
       airline =  item.UNIQUE_CARRIER;
        if (count.hasOwnProperty(airline)) {
          count[airline] += 1;
          tempCount = count[airline];
        }
        else {
          count[airline] = 1;
          tempCount = 1;
        }
        if(maxDelays < tempCount){
          maxDelays = tempCount;
        }
    }   
  } 
  for (var i = 0; i < airlines.length; i++) {
    var airlineObject = {carrier:airlines[i], count:count[airlines[i]]};
    airlineObject2.push(airlineObject);  
  }
  countAirlinesTotal = count;
};

//updates axis based on displayed data
function updateAxis(){

	maxArrDelay = d3.max(shownVisual, function(d) { return d.ARR_DELAY; });
	minArrDelay = d3.min(shownVisual, function(d) { return d.ARR_DELAY; });
	maxAirTime = d3.max(shownVisual, function(d) { return d.AIR_TIME; });
	minAirTime = d3.min(shownVisual, function(d) { return d.AIR_TIME; });

	x = d3.scaleLinear().range([0, w]).domain([minArrDelay,maxArrDelay]);
  y = d3.scaleLinear().range([h, 0]).domain([minAirTime,maxAirTime]);
  y2 = d3.scaleLinear().range([h, 0]).domain([0, maxDelays]);

	xAxis = d3.axisBottom()
	    .ticks(4)
	    .scale(x);
  yAxis  = d3.axisLeft()
	    .scale(y);

  yAxis2 = d3.axisLeft()
      .scale(y2);

  xAxis2 = d3.axisBottom()
      .ticks(4)
      .scale(x2);

  chart.select(".x-axis").call(xAxis);
  chart.select(".y-axis").call(yAxis);
  chart2.select(".x-axis2").call(xAxis2);
  chart2.select(".y-axis2").call(yAxis2);

}

//function that draws barchart
function drawChart(){	
  var bar = chart2.selectAll(".bar")
    .data(airlineObject2);
  bar
    .attr("class","bar")
    .attr("x", function(d) { return x2(d.carrier); })
    .attr("y", function(d){return y2(d.count); })
    .attr("height", function(d) { return h - y2(d.count); })
    .style("fill", function(d) { return col(d.carrier) });
  bar.exit().remove();  

  bar.enter().append("rect")
      .attr("class","bar")
      .attr("x", function(d) { return x2(d.carrier); })
      .attr("y", function(d){ return y2(d.count); })
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
  chart2.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ -50 +","+(h/1.75) +")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Delays");
  chart2.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h + 40)+")")  // centre below axis
            .text("Airline");

}

//zoom once brush has happened
function brushended() {   
    brush1.remove();
    if(d3.event.selection != null){
      var x0 = d3.event.selection[0][0];
      var x1 = d3.event.selection[1][0];
      var y0 = d3.event.selection[0][1];
      var y1 = d3.event.selection[1][1];

      clear.style('opacity',.9);
      toVisualize = shownVisual.filter(function(d){ 
        return (x(d.ARR_DELAY)>=x0 && x(d.ARR_DELAY)<=x1 && y(d.AIR_TIME)>=y0 && y(d.AIR_TIME)<=y1)
      });
      brush1.remove();
      shownVisual = toVisualize;
      countAirlines(toVisualize);
      updateAxis();
      drawVis(toVisualize);
      drawChart(toVisualize);
      brush1.remove();
    }
}

//reset brush
var clear = d3.select('#reset')
    .on('click', function(){
      clear.style("opacity",0);
      toVisualize = dataset;
      filterType(currentFilter);
      countAirlines(toVisualize);
      updateAxis();
      drawVis(toVisualize);
      drawChart(toVisualize);
    })




