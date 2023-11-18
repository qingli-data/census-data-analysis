// Initialize the 'endMap' using Mapbox GL
let endMap = new mapboxgl.Map({
  container: 'end-map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [142.8631, MAP_CENTER_Y],// Set the initial map center coordinates
  zoom: 7, // Set the initial zoom level
});

// When the 'endMap' is loaded, add the source and layers
endMap.on('load', function () {

  // Add the 'vic-lga' source using GeoJSON data
  endMap.addSource('vic-lga', {
    type: 'geojson',
    data: lga_geojson,
    'generateId': true
  });

 // Add a layer for displaying LGA polygons on the map
  endMap.addLayer({
    'id': 'vic-lga-layer',
    'type': 'fill',
    'source': 'vic-lga',
    'layout': {},
    'paint': {
      'fill-color': '#888888',// Fill color of the polygons
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.5,
        1
      ],
      'fill-outline-color': '#000000' // line (outline) color of the polygon
    }
  });
  endMap.addLayer({
    'id': 'vic-lga-hover-layer',
    'type': 'fill',
    'source': 'vic-lga',
    'layout': {},
    'paint': {
      'fill-color': '#FF0000',
      'fill-opacity': 1
    }
  },'vic-lga-layer');
  // Style the layers with LGA data
  styleLayerWithLGA(endMap, 'mean_income', 2021,COLOR_WHITE,COLOR_ORANGE);
});

  // Handle mousemove events over the 'vic-lga-layer' layer
endMap.on('mousemove', 'vic-lga-layer', function (e) {
  // Change the cursor style as a UI indicator.
  endMap.getCanvas().style.cursor = 'pointer';

  // If the feature has changed, trigger hover functions
  if (e.features.length > 0) {
    hover_over_map_feature(endMap,e.features[0],e);
  }
});

// Handle click events on the map
endMap.on('click', function (e) {
  var features = endMap.queryRenderedFeatures(e.point, { layers: ['vic-lga-layer'] });
  let lga_code = features[0].properties.LGA_CODE;
  document.getElementById('lga_name_panel').innerHTML = features[0].properties.LGA_NAME21
  displaySideChart(lga_code);
});

// Function to display side charts based on the selected LGA code
function displaySideChart(lga_code){
  let ranks = getRankList(lga_code);
  const width = 400;
  const height = 200;

  // Create line chart, bar chart, and sunburst chart
  create_line_chart(ranks, width, 150);
  create_bar_chart(lga_code, width, height);
  create_sunburst_chart(lga_code, width, 270);
}

// Handle mouseleave events over the 'vic-lga-layer' layer
endMap.on('mouseleave', 'vic-lga-layer', function () {
  hover_off_map_feature(endMap);
});

// Function to get a list of ranks for a specific LGA code
function getRankList(lga_code) {
  lga_code = 'LGA' + lga_code
  let lga = LGA_SUMMARY_DICT[lga_code];
  return [lga['rank_2011'], lga['rank_2016'], lga['rank_2021']]
}

// Function for handling hover events
function hoverLGA() {}

// Function to generate a map popup description based on LGA code and selected year
function getMapPopupDescription(lga_code) {
  var year = parseInt(document.getElementById('slider').value);
  let lga_code1 = 'LGA' + lga_code
  let lga = LGA_SUMMARY_DICT[lga_code1];
  let house_price = lga_house_prices_dict[lga_code];
  let desc = '';
  desc += 'LGA: '+lga.LGA_NAME21;
  desc += '<br>';
  desc += 'Year:' + year;
  desc += '<br>';
  desc += 'Average Income:' + Math.round(lga['mean_income_' + year]);
  desc += '<br>';
  desc += 'Rank of Income:' + lga['rank_' + year];
  desc += '<br>';
  desc += 'House Price: $' + Math.round(house_price).toLocaleString('en-US');
  return desc;
}