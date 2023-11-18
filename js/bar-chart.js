function create_bar_chart(lga_code, width, height) {

    // Remove any existing SVG elements within the #bar_chart container
    d3.select("#bar_chart").select('svg').remove();

    // Get the selected year from the slider
    var year = parseInt(document.getElementById('slider').value);

    // Get the income data for the selected year
    var income_dict = eval('income_' + year + '_dict');

    // Create a copy of the income data for the specific LGA
    var dataObj = Object.assign({}, income_dict['LGA' + lga_code]);

    // Remove the LGA_CODE_2021 key from the data
    delete dataObj.LGA_CODE_2021;

    const margin = { top: 15, right: 50, bottom: 55, left: 50 };

    // Calculate the inner dimensions of the chart area
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate the horizontal and vertical centering offsets
    const xOffset = (window.innerWidth - width) / 2;
    const yOffset = (window.innerHeight - height) / 2;

    // Prepare the data for rendering
    let dataArray = Object.keys(dataObj).map((key) => {
        return { incomeRange: key, count: dataObj[key] };
    });

    // Append the svg object to the body of the page
    const svg = d3.select("#bar_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("left", xOffset + "px") // Center horizontally
        .style("top", yOffset + "px"); // Center 

    // Create a chart group within the SVG with margins
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top - 15})`);

    // Define X axis scale
    const x = d3.scaleBand()
        .range([0, innerWidth])
        .domain(dataArray.map(d => d.incomeRange))
        .padding(0.1);

    // Define Y axis scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataArray, d => d.count)])
        .range([innerHeight, 0]);
    // Add Y axis to the chart
    chart.append("g")
        .call(d3.axisLeft(y));

    // Render the bars based on the data
    chart.selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("x", d => x(d.incomeRange))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.count))
        .attr("fill", "#4895EF")

        // Show tooltip on mouseover
        .on("mouseover", function (event, d) {
            const currentRect = d3.select(this);
            currentRect.attr("fill", "orange");
            bar_tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            bar_tooltip.html(`Family Weekly Income Range(AU$): ${d.incomeRange}<br/>Family Count: ${d.count}`)
                .style("left", (event.layerX) + "px")
                .style("top", (event.layerY) + "px");
        })

        // Hide tooltip on mouseout
        .on("mouseout", function (d) {
            const currentRect = d3.select(this);
            currentRect.attr("fill", "#4895EF");
            bar_tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    // Tooltip div
    const bar_tooltip = d3.select("#bar_chart").append("div")
        .attr("class", "console_tooltip");
    // Add axis labels
    chart.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)") // Adjust translation
        .style("text-anchor", "end");

    // x axis labels
    chart.append("text")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.bottom + 10})`)
        .style("text-anchor", "middle")
        .text("Family Weekly Income Range(AU$)");

    // y axis labels
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (innerHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Family Count");
 
}


