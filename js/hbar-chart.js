// Function to create a horizontal bar chart
function create_hbar_chart(width, height) {
    // Define margins for the chart
    const margin = { top: 40, right: 20, bottom: 60, left: 140 };
    
    // Remove any existing SVG elements within the 'hbar_chart' container
    d3.select("#hbar_chart").select('svg').remove();

    // Calculate the inner dimensions of the chart area
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate the horizontal and vertical centering offsets
    const xOffset = (window.innerWidth - width) / 2;
    const yOffset = (window.innerHeight - height) / 2;

    // Sort the data based on mean income in ascending order
    lga_summary.sort(function (a, b) {
        return a.mean_income_2021 - b.mean_income_2021;
    });


    // Set the scales for the chart
    const y = d3.scaleBand()
        .range([innerHeight, 0])
        .padding(0.1);

    const x = d3.scaleLinear()
        .range([0, innerWidth]);

    // Append the SVG object to the 'hbar_chart' container
    const svg = d3.select("#hbar_chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain([0, d3.max(lga_summary, function (d) { return d.mean_income_2021; })])
    y.domain(lga_summary.map(function (d) { return d.LGA_NAME21; }));

    // Define a tooltip div
    const tooltip = d3.select("#hbar_chart").append("div")
        .attr("class", "tooltip");

    // Append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(lga_summary)
        .enter().append("rect")
        .attr("class", "hbar")
        .attr("width", function (d) { return x(d.mean_income_2021); })
        .attr("y", function (d) { return y(d.LGA_NAME21); })
        .attr("height", y.bandwidth())
        // Handle mouseover events to show tooltips and highlight map features
        .on("mouseover", function (event, d) {
            let lga_code = d['LGA_CODE_2021'];
            hover_over_map_feature(topMap, topMapFeatureIdAndLGA[lga_code]);
        
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html("LGA Name: " + d.LGA_NAME21 + "<br>Mean Weekly Income: $" + Math.round(d.mean_income_2021))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY+10) + "px");
        })
        // Handle mouseout events to remove map feature highlights and tooltips
        .on("mouseout", function (event, d) {
            hover_off_map_feature(topMap);
            tooltip.transition().duration(500).style("opacity", 0);
        });


    // Define tick values for the x-axis
    const xTickValues = [0, 500, 1000, 1500, 2000, 2500]; // Adjust as needed
    // Replace the existing x-axis configuration
    // Set the x-axis scale with custom tick values
    const xAxis = d3.axisBottom(x)
        .tickValues(xTickValues)
        .tickFormat(d3.format(".0f"));

    // Append the x-axis to the chart
    svg.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis)
        .style("font-size", "12px");

    // Update the x-axis label text
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", innerHeight + margin.bottom / 2 + 5)
        .text("Family Weekly Income (AU$)");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -margin.left + 30)
        .text("LGA");

    // Add a chart title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2 - 80)
        .attr("y", -margin.top / 2 + 5)
        .style("font-size", "20px")
        .text("Mean Weekly Income Of Each LGA");
}
// Variable to store the ID of the map feature being hovered over by the bar chart
let bar_hover_map_feature_id;