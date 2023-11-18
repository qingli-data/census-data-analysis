// Function to create a normalized stacked bar chart for family composition
function create_family_stack_chart(width, height) {
    var margin = { top: 40, right: 60, bottom: 80, left: 170 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Remove any existing SVG elements within the 'family_stack_chart' div
    d3.select("#family_stack_chart").select('svg').remove();

    // Sort 'lga_summary' data based on mean income in descending order
    lga_summary.sort(function (a, b) {
        return (a.mean_income_2021 - b.mean_income_2021) * -1;
    });

    // Normalize the data to calculate percentages
    let data = lga_summary;
    data = normalizeData(data);

    // Define a color scale for different family composition categories
    var color = d3.scaleOrdinal(d3.schemeTableau10);

    // Append SVG object to the body of the page
    var svg = d3.select("#family_stack_chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set scales for x and y axes
    var x = d3.scaleLinear().range([0, innerWidth]);
    var y = d3.scaleBand().rangeRound([0, innerHeight]).padding(0.2);

    // Define the stack
    var stack = d3.stack()
        .keys(["_cpl_fam_with_child", "_cpl_fam_no_child", "_One_parent_fam", "_Other_fam"]);

    // Stack the data
    var layers = stack(data);

    // Set domains for x and y axes
    x.domain([0, d3.max(layers[layers.length - 1], d => d[1])]).nice();
    y.domain(data.map(d => d.LGA_NAME21));

    // Define the axis
    var xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")); // Customize x-axis
    var yAxis = d3.axisLeft(y);

    const tooltip = d3.select("#family_stack_chart").append("div").attr("class", "tooltip");

    // Draw bars
    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) { return color(i); });

    layer.selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.data.LGA_NAME21))
        .attr("x", d => x(d[0]))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d[1]) - x(d[0]))
        .on("mouseover", function (event, d) {
            // Trigger a map feature hover event
            let lga_code = d.data['LGA_CODE_2021'];
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                tooltip.html(`Percentage: ${Math.round((d[1]-d[0])*10000)/100}%`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
            hover_over_map_feature(topMap, topMapFeatureIdAndLGA[lga_code]);
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            hover_off_map_feature(topMap);
        });

     // Draw the xAxis
    svg.append("g")
        .attr("class", "x axis") // Define x-axis class
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis)
        .style("font-size", "12px");
    // Append x-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom -40) // Adjust y-coordinate for x-axis label
        .text("Family Composition Percentage");

    // Draw the yAxis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .style("font-size", "11px");
    // Append y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -margin.left + 30) // Adjust y-coordinate for y-axis label
        .text("Ordered LGA by Mean Income");

     // Add a chart title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2-20)
        .attr("y", -margin.top / 2+10)
        .style("font-size", "20px")
        .text("Family Normalized Stacked Bar Chart by Family Type");

    // Define legend properties
    var legendProperties = {
        rectWidth: 18,
        rectHeight: 18,
        spacing: 4,
        textXOffset: 24,
        textYOffset: 13,
        rowSpacing: 20
    };

    // Define categories for the legend
    var categories = ["With child", "No child", "One parent", "Other"];

    // Create a group for the legend
    var legend = svg.selectAll(".legend")
        .data(categories)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            let x = (i * (legendProperties.rectWidth + 100))-50;
            return "translate(" + x + "," + (innerHeight) + ")";
        });

    // Draw legend colored rectangles
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 60)
        .attr("width", legendProperties.rectWidth)
        .attr("height", legendProperties.rectHeight)
        .style("fill", function (d, i) { return color(i); });

    // Draw legend text
    legend.append("text")
        .attr("x", legendProperties.textXOffset)
        .attr("y", legendProperties.textYOffset+60)
        .text(function (d) { return d; })
        .attr("text-anchor", "start")
        .style("alignment-baseline", "middle");
}
// Function to normalize the data by calculating percentages for family composition categories
function normalizeData(data) {
    data.forEach(d => {
        var total = d._cpl_fam_with_child + d._cpl_fam_no_child + d._One_parent_fam + d._Other_fam;
        d._cpl_fam_with_child = d._cpl_fam_with_child / total;
        d._cpl_fam_no_child = d._cpl_fam_no_child / total;
        d._One_parent_fam = d._One_parent_fam / total;
        d._Other_fam = d._Other_fam / total;
    });
    return data;
}