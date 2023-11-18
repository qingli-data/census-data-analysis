// Function to create a sunburst chart
function create_sunburst_chart(lga_code, width, height) {
    // Define dimensions and radius of the sunburst chart
    const margin = 150;

    // Helper function to determine if an occupation is "Label-Related"
    function isLabelRelated(occupation) {
        // List of label-related occupations
        const labelRelatedOccupations = [
            "Agri_for_fish", "Mining", "Manufacturing", "El_Gas_W_W", "Construction", "RetTde",
            "Acom_food_scs", "Trans_po_wh", "Pub_adm_sfty"
        ];

        return labelRelatedOccupations.includes(occupation);
    }

    // Helper function to determine if an occupation is "Profession-Related"
    function isProfessionRelated(occupation) {
        // List of profession-related occupations
        const professionRelatedOccupations = [
            "Prof_sci_tec", "Admin_sup_s", "Educ_training", "Hlth_care_soc", "Other_scs",
            "ID_NS", "ArtRecreatTot", "Infon_med_tel", , "Fin_and_ins_s", , "Rent_hi_re_es"
        ];
        return professionRelatedOccupations.includes(occupation);
    }

    // Select the 'ocupation_chart' container and remove any existing SVG elements
    d3.select("#ocupation_chart").select('svg').remove();

    // Get the selected year from the slider
    var year = parseInt(document.getElementById('slider').value);

    // Retrieve occupation data for the selected year
    var ocupation_dict = eval('ocupation_' + year + '_dict');
    var data = Object.assign({}, ocupation_dict['LGA' + lga_code]);
    delete data.LGA_CODE_2021;

    // Filter and categorize data into "Labor" and "Profession"
    const laborData = dataFilter(isLabelRelated);
    const professionData = dataFilter(isProfessionRelated);

    // Reorganize data into a hierarchical structure
    data = {
        name: "Occupations",
        children: [
            {
                name: "Labor",
                //children: laborData
                children: laborData.map(d => {
                    // Replace "Agri_for_fish" with "Fishing"
                    if (d.name === "Agri_for_fish") {
                        d.name = "Agriculture & Fishing";
                    }
                    if (d.name === "El_Gas_W_W") {
                        d.name = "Utility";
                    }
                    if (d.name === "RetTde") {
                        d.name = "Retail Trade";
                    }
                    if (d.name === "Acom_food_scs") {
                        d.name = "Accommodation & Food";
                    }
                    if (d.name === "Trans_po_wh") {
                        d.name = "Transport & Warehouse";
                    }
                    if (d.name === "Pub_adm_sfty") {
                        d.name = "Public Safty";
                    }
                    return d;
                })
            },
            {
                name: "Profession",
                //children: professionData
                children: professionData.map(d => {
                    if (d.name === "Prof_sci_tec") {
                        d.name = "Scientific & technical";
                    }
                    if (d.name === "Admin_sup_s") {
                        d.name = "Support Service";
                    }
                    if (d.name === "Educ_training") {
                        d.name = "Education";
                    }
                    if (d.name === "Hlth_care_soc") {
                        d.name = "Health Care";
                    }
                    if (d.name === "Other_scs") {
                        d.name = "Other Service";
                    }
                    if (d.name === "ArtRecreatTot") {
                        d.name = "Art";
                    }
                    if (d.name === "Infon_med_tel") {
                        d.name = "IT";
                    }
                    if (d.name === "Fin_and_ins_s") {
                        d.name = "Finance & Issurance";
                    }
                    if (d.name === "Rent_hi_re_es") {
                        d.name = "Real Estate";
                    }
                    if (d.name === "ID_NS") {
                        d.name = "Others";
                    }
                    return d;
                })
            }
        ]
    };

    // Function to filter data based on the occupation type
    function dataFilter(filterFunction) {
        return Object.keys(data)
            .filter(key => filterFunction(key))
            .map(key => ({ name: key, value: data[key] }));
    }

    // Define the radius for the sunburst chart
    const radius = (width - margin) / 6;

    // Define the arc generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // Create a partition layout based on the data
    const partition = data => {
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        return d3.partition()
            .size([2 * Math.PI, root.height + 1])
            (root);
    };

    // Create the partitioned root for the sunburst chart
    const root = partition(data);
    root.each(d => d.current = d);

    // Define color scales
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
    const colorLeaves = d3.scaleOrdinal(d3.schemeCategory10); // Choose a different scheme for leaves

    // Select the 'ocupation_chart' container and append an SVG element
    const svg = d3.select('#ocupation_chart').append('svg')
        .style("width", width)
        .style("height", height)
        .attr("transform", `translate(${0}, ${10})`)
        .style("font", "10px sans-serif");

    // Create a group within the SVG for drawing
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${(height + 10) / 2})`);

    // Create path elements for the sunburst chart
    const path = g.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("fill", d => {
            if (d.children) { // If the node has children, it is not a leaf
                return color(d.data.name);
            } else { // If the node does not have children, it is a leaf
                return colorLeaves(d.data.name);
            }
        })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("d", d => arc(d.current));

    // Add titles for path elements
    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\nFamily Count: ${format(d.value)}`);

    // Define top N values for display labels
    const topNValues = 12;
    const topValues = root.descendants()
        .filter(d => !d.children) // filter out non-leaf nodes
        .map(d => d.value)
        .sort((a, b) => b - a)
        .slice(0, topNValues); // take top 8 values

    // Create labels for the chart
    const label = g.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .enter().append("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);
    // Create a parent circle for interactivity
    const parent = g.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")

    // Add a chart title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (width)/2)
        .attr("y", 12)
        .style("font-size", "15px")
        .text("Ocupation Distribution");

    // Function to determine if an arc is visible
    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    // Function to determine if a label is visible
    function labelVisible(d) {
        //return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        return d.depth <= 2 && d.value > topValues[topNValues - 1];
    }

    // Function to transform the label for display
    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    // Function to format numerical values
    function format(value) {
        return d3.format(",d")(value);
    }
}