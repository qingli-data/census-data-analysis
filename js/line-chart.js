function create_line_chart(ranks, width, height) {
    // console.log(ranks);
    // Set up the SVG canvas dimensions and margins
    d3.select("#rank_chart").select('svg').remove();
    const years = [2011, 2016, 2021];
    // Set up the SVG canvas dimensions and margins

    const margin = { top: 50, right: 50, bottom: 50, left: 50 }; // Increased margins for centering

    // Calculate the inner dimensions of the chart area
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate the horizontal and vertical centering offsets
    const xOffset = (window.innerWidth - width) / 2;
    const yOffset = (window.innerHeight - height) / 2;

    // Create an SVG element within the specified div
    const svg = d3.select("#rank_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("left", xOffset + "px") // Center horizontally
        .style("top", yOffset + "px"); // Center vertically

    // Create a group (g) element to contain the chart, with appropriate margins
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(years), d3.max(years)])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(ranks)]) // Start from 0 and adjust the domain
        .range([innerHeight, 0]); // Reverse the range to start from the top

    // Create a line generator function
    const line = d3.line()
        .x((d, i) => xScale(years[i]))
        .y(d => yScale(d));

    // Append the line to the chart
    chart.append("path")
        .datum(ranks)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        ;
    chart.selectAll(".dot")
        .data(ranks)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", (d, i) => xScale(years[i]))
        .attr("cy", d => yScale(d))
        .attr("r", 3)  // You can adjust the radius as desired
        .attr("fill", "blue")  // You can adjust the color as desired
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);

    // Add x-axis with year labels
    const customXAxisFormat = d3.format(".0f"); // display as integer eg: 2011

    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale)
            .tickValues(years)
            .tickFormat(d => customXAxisFormat(d)))
        .selectAll(".tick text")
        .attr("class", "axis-label");

    // Add y-axis with rank labels
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

    // Apply event listeners to circles
    chart.selectAll(".dot")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (width) / 2)
        .attr("y", 30)
        .style("font-size", "15px")
        .text("Rank Chart");
    // x axis lable
    chart.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 15)
        .text("Year");

    // y axis lable
    chart.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", 0 - innerHeight / 2)
        .attr("y", -margin.left + 10)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .text("Rank");

    // Tooltip div
    const tooltip = d3.select("#rank_chart").append("div")
        .attr("class", "tooltip");

    // Mouseover function
    function handleMouseOver(event, rank) {
        d3.select(this).attr("r", 7); // Increase radius
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html("Rank: " + rank)
            .style("left", (event.layerX - 10) + "px")
            .style("top", (event.layerY) + "px");
    }
    function getToolTipConent() { }
    // Mouseout function
    function handleMouseOut(d, i) {
        d3.select(this).attr("r", 5); // Reset radius to original size

        tooltip.transition().duration(500).style("opacity", 0);
    }
}



