// Set up our chart
var svgWidth = 960;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 50
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// add a chart class for d3sytle
var chart = d3.select("#scatter")
    .append("div")
    .classed("chart", true);

// need to add a svg group to the chart and shift
var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import the data
d3.csv("assets/data/data.csv").then(function (censusData) {

    //console.log(censusData);
    // Parse the data for Healthcare vs Poverty
    censusData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        //console.log(data.poverty);
        //console.log(data.healthcare);
    });

    // scale functions
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d.poverty)-1, d3.max(censusData, d => d.poverty) + 2])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d.healthcare) * 0.8, d3.max(censusData, d => d.healthcare) + 2])
        .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "15")
    .attr("opacity", ".5")
    .attr("font-size", "10px")

    // Add state abbr to circle
    chartGroup.selectAll("stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("dy", "4")
        .attr("font-size", "12px")
        .text(function(d){
            return d.abbr;
        })

    // Initialize tool tip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -80])
      .html(function(d) {
        return (`State: ${d.abbr}<br>Lacks HealthCare: ${d.healthcare}%<br>In Poverty: ${d.poverty}%`);
      });
    
    // create tooltip on chart
    chartGroup.call(toolTip);

    // Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

     // Create axes labels
     chartGroup.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - margin.left)
     .attr("x", 0 - (height / 2))
     .classed("aText", true)
     .classed("active", true)
     .attr("dy", "1em")
     .text("Lacks HealthCare (%)");

   chartGroup.append("text")
     .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
     .classed("aText", true)
     .classed("active", true)
     .text("In Poverty (%)");

}).catch(function(error) {
  console.log(error);
});
