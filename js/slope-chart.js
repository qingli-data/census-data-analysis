function create_slope_chart(div, data, width, height) {
    // Define a color scale
    const colors = getRandomColors(data.length);
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.LGA_NAME21))
        .range(colors); // Provide as many colors as there are groups

    // SVG dimensions and margins
    const margin = { top: 28, right: 15, bottom: 35, left: 80 };
    // Calculate the inner dimensions of the chart area
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scalePoint()
        .domain(["2011", "2016", "2021"])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.rank_2011, d.rank_2016, d.rank_2021))])
        .range([0, innerHeight]);

    // Create SVG and append to body
    const svg = d3.select(div).append('svg')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // Tooltip div
    const tooltip = d3.select(div).append("div")
        .attr("class", "tooltip");

    // Draw the lines
    data.forEach(d => {
        // Line from Column 1 to Column 2
        svg.append("line")
            .attr("class", "slope-line")
            .attr("x1", xScale("2011"))
            .attr("y1", yScale(d.rank_2011))
            .attr("x2", xScale("2016"))
            .attr("y2", yScale(d.rank_2016))
            .attr("stroke", colorScale(d.LGA_NAME21));

        // Line from Column 2 to Column 3
        svg.append("line")
            .attr("class", "slope-line")
            .attr("x1", xScale("2016"))
            .attr("y1", yScale(d.rank_2016))
            .attr("x2", xScale("2021"))
            .attr("y2", yScale(d.rank_2021))
            .attr("stroke", colorScale(d.LGA_NAME21));
        // Draw a dot for each year's rank
        ["2011", "2016", "2021"].forEach(year => {
            const cx = xScale(year);
            const cy = yScale(d['rank_' + year]);

            // Create a group for the dot and the label for easier interaction
            const nodeGroup = svg.append("g")
                .attr("class", "node-group");

            // Draw the dot
            const dot = nodeGroup.append("circle")
                .attr("class", "rank-dot")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", 5) // Default radius
                .attr("fill", colorScale(d.LGA_NAME21))
                .attr('lga_id', d.LGA_CODE_2021)
                .attr('rank', d['rank_' + year])
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .attr("class", "rank-dot rank-dot-highlighted")
                        .attr("r", 7); // Enlarge the dot on hover
                    let lga_code = d3.select(this).attr('lga_id');
                    let rank = d3.select(this).attr('rank');
                    let feature = topMapFeatureIdAndLGA[lga_code];
                    hover_over_map_feature(topMap, feature);
                    fitBoundsToFeature(topMap, feature);
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html("Rank: " + rank)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY-30) + "px");
                            })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("class", "rank-dot")
                        .attr("r", 5); // Reset the radius
                    hover_off_map_feature(topMap);
                });

            // Draw the label
            const label = nodeGroup.append("text")
                .attr("class", "rank-label")
                .attr("x", cx)
                .attr("y", cy - 10)
                .attr("text-anchor", "middle")
                .text(d.LGA_NAME21)
                .attr("fill", colorScale(d.LGA_NAME21))
                .on("mouseover", function () {
                    d3.select(this)
                        .attr("class", "rank-label rank-label-highlighted");
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("class", "rank-label");
                });

            // Add interaction to the group to highlight both dot and label
            nodeGroup.on("mouseover", function () {
                dot.dispatch('mouseover');
                label.dispatch('mouseover');
            })
                .on("mouseout", function () {
                    dot.dispatch('mouseout');
                    label.dispatch('mouseout');
                });
        });

    });

    // Add the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x axis to svg
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .style("font-size", "12px");

    // Append y axis to svg
    svg.append("g")
        .call(yAxis);

    // Append x axis label "Year"
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 30)
        .text("Year")
        .style("text-anchor", "middle");

    // Append y axis label "Rank"
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", -innerHeight / 2)
        .attr("y", -margin.left + 20)
        .text("Rank")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle");

    // Append chart title "Top 20"
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .text("Top 20 Richest LGA Trends Over Years")
        .style("text-anchor", "middle")
        .style("font-size", "18px");
}

function getRandomColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        // Generate a random 24-bit color code and pad it to 6 characters
        colors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    }
    return colors;
}