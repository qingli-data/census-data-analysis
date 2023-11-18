function updateTotal () {

    let yearSlider = document.getElementById('slider').value;
    let type = document.getElementById('selectorType').value;
    let total = 0;

    d3.csv("./data/line.csv", function(error, data) {

        if (error) throw error;

        let filterDataYear = data.filter(function(d) {
            if (yearSlider == 2019) {
                if (d["year"] == 2020) {
                    return d;
                }
            } else {
                if (d["year"] == yearSlider) {
                    return d;
                }
            }
        });

        filterDataYear = filterDataYear[0];

        const keys = Object.keys(filterDataYear);
        const values = Object.values(filterDataYear);

        if (type == "All") {
            for (var i=1; i<11; ++i){
                total = total + +values[i];
            }
        } else if (type == "HighCarbon") {
            for (var i=1; i<11; ++i){
                if (keys[i] == "Coal" || keys[i] == "Gas" || keys[i] == "Oil") {
                    total = total + +values[i];
                }
            }
        } else if (type == "LowCarbon") {
            for (var i=1; i<11; ++i){
                if (keys[i] !== "Coal" && keys[i] !== "Gas" && keys[i] !== "Oil" && keys[i] !== "Interconnectors") {
                    total = total + +values[i];
                }
            }
        } else {
            for (var i=1; i<11; ++i){
                if (keys[i] == type) {
                    total = total + +values[i];
                }
            }
        }

        document.getElementById('total').innerText = parseInt(total);

    });
    
}