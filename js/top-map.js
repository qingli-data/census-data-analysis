// Initialize mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoicWluZ2xpbWVsIiwiYSI6ImNsbG4xbTBrbDBjcnYzcGw0N3hvZm52azIifQ.6ZfUKujHJlqbs0OPj-gtOA';

// Constants for map configuration
const DEFAULT_ZOOM_LEVEL = 6;
const MAP_CENTER_X = 144.9631;
const MAP_CENTER_Y = -37.5036;
const LEGEND_CATEGORY_NUMBER = 6;
const COLOR_ORANGE = [255, 128, 0];
const COLOR_WHITE = [255, 255, 255];
const COLOR_PURPLE = [227, 2, 247];

// Create a map instance
let topMap = new mapboxgl.Map({
  container: 'topMap',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [MAP_CENTER_X, MAP_CENTER_Y],
  zoom: DEFAULT_ZOOM_LEVEL,
  interactive: false
});

// Store a mapping of feature IDs to LGA codes
let topMapFeatureIdAndLGA = {};

// Event handler when the map loads
topMap.on('load', function () {
  // Add a GeoJSON data source for Victoria's LGAs
  topMap.addSource('vic-lga', {
    type: 'geojson',
    data: lga_geojson,
    'generateId': true
  });
    // Add a layer for Victoria's LGAs
  topMap.addLayer({
    'id': 'vic-lga-layer',
    'type': 'fill',
    'source': 'vic-lga',
    'layout': {},
    'paint': {
      'fill-color': '#888888',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.5,
        1
      ],
      'fill-outline-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#FF0000',
        '#000000'
      ] // line (outline) color of the polygon
    }
  });

  // Add a layer for the hovered LGA
  topMap.addLayer({
    'id': 'vic-lga-hover-layer',
    'type': 'fill',
    'source': 'vic-lga',
    'layout': {},
    'paint': {
      'fill-color': '#FF0000',
      'fill-opacity': 1
    }
  },'vic-lga-layer');
  topMap.on('data', function (e) {
    if (e.sourceId === 'vic-lga' && e.isSourceLoaded) {
      // Use setTimeout to ensure the source is truly ready to query
      var features = topMap.querySourceFeatures('vic-lga', {
        sourceLayer: 'vic-lga-layer' // Omit this if not a vector source
      });
      for (let feature of features) {
        topMapFeatureIdAndLGA['LGA' + feature.properties['LGA_CODE']] = feature;
      }
    }
  });

  // Style the map with data for family income
  styleLayerWithLGA(topMap, 'mean_income', 2021, COLOR_WHITE, COLOR_ORANGE, '$');
  const features = topMap.querySourceFeatures('vic-lga', {
    sourceLayer: 'vic-lga-layer'
  });

})

// Function to style a map layer with family income data
function styleLayerWithFamily(map, column, year, start_color, end_color) {
  let unit = '%';
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let column_name = column;

  for (let lga of lga_summary) {
    let totalValue = parseFloat(lga['_cpl_fam_with_child']) + parseFloat(lga['_cpl_fam_no_child']) + parseFloat(lga['_One_parent_fam']) + parseFloat(lga['_Other_fam']);
    let value = Math.round(parseFloat(lga[column_name]) / totalValue * 100);

    if (min > value) {
      min = value;
    }
    if (max < value) {
      max = value;
    }
  }
  const stops = lga_summary.map(lga => {
    const lgaCode = lga.LGA_CODE_2021;
    let totalValue = parseFloat(lga['_cpl_fam_with_child']) + parseFloat(lga['_cpl_fam_no_child']) + parseFloat(lga['_One_parent_fam']) + parseFloat(lga['_Other_fam']);
    let value = Math.round(parseFloat(lga[column_name]) / totalValue * 100);
    return [lgaCode.replace('LGA', ''), getColorForValue(start_color, end_color, value, min, max)];
  });
  if (map == topMap) {
    createLegend('top_map_legend_content', min, max, LEGEND_CATEGORY_NUMBER, start_color, end_color, legend_map[column]);
  } else {
    createLegend('end_map_legend_content', min, max, LEGEND_CATEGORY_NUMBER, start_color, end_color, legend_map[column]);
  }

  map.setPaintProperty('vic-lga-layer', 'fill-color', {
    'property': 'LGA_CODE',
    'type': 'categorical',
    'stops': stops
  });
}

// Function to style a map layer with LGA data
function styleLayerWithLGA(map, column, year, start_color, end_color, unit) {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let column_name = column + '_' + year;
  if (column.startsWith('_')) {
    column_name = column;
  }
  for (let lga of lga_summary) {
    let value = parseFloat(lga[column_name]);
    if (min > value) {
      min = value;
    }
    if (max < value) {
      max = value;
    }
  }
  const stops = lga_summary.map(item => {
    const lgaCode = item.LGA_CODE_2021;
    return [lgaCode.replace('LGA', ''), getColorForValue(start_color, end_color, item[column_name], min, max)];
  });
  if (map == topMap) {
    createLegend('top_map_legend_content', min, max, LEGEND_CATEGORY_NUMBER, start_color, end_color, legend_map[column]);
  } else {
    createLegend('end_map_legend_content', min, max, LEGEND_CATEGORY_NUMBER, start_color, end_color, legend_map[column]);
  }

  map.setPaintProperty('vic-lga-layer', 'fill-color', {
    'property': 'LGA_CODE',
    'type': 'categorical',
    'stops': stops
  });
}

// Function to style a map layer with industry data
function styleLayerWithIndustry(map, column, year, start_color, end_color, unit) {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let column_name = column;
  let data = eval('ocupation_' + year);
  const PERCENT_VALUE = 100;
  for (let lga of data) {
    if (lga.LGA_CODE_2021 == 'LGA29399' || lga.LGA_CODE_2021 == 'LGA29499' || lga.LGA_CODE_2021 == 'LGA29799') {
      continue;
    }
    let lga_item = LGA_SUMMARY_DICT[lga.LGA_CODE_2021];
    if (!lga_item) {
      console.log(lga.LGA_CODE_2021, 'is undefined')
    }
    let lga_population = eval('lga_item.population_count_' + year);
    let value = parseFloat(lga[column_name]) / lga_population * PERCENT_VALUE;
    if (min > value) {
      min = value;
    }
    if (max < value) {
      max = value;
    }
  }
  const stops = data.map(item => {
    const lgaCode = item.LGA_CODE_2021;
    // console.log(lgaCode);
    if (lgaCode == undefined) {
      console.log(item, lgaCode, 'is undefined');
    }
    let lga_item = LGA_SUMMARY_DICT[lgaCode];
    let lga_population = 1;
    if (lga_item) {
      lga_population = eval('lga_item.population_count_' + year);
    }
    let value = parseFloat(item[column_name]) / lga_population * PERCENT_VALUE;
    return [lgaCode.replace('LGA', ''), getColorForValue(start_color, end_color, value, min, max)];
  });
  if (map == topMap) {
    createLegend('top_map_legend_content', min, max, LEGEND_CATEGORY_NUMBER, start_color, end_color, legend_map[column]);
  } else {
    createLegend('end_map_legend_content', min, max, LEGEND_CATEGORY_NUMBER, start_color, end_color, legend_map[column]);
  }

  map.setPaintProperty('vic-lga-layer', 'fill-color', {
    'property': 'LGA_CODE',
    'type': 'categorical',
    'stops': stops
  });
}
// Function to interpolate color between two values
function interpolateColor(start_color, end_color, factor) {
  const r = start_color[0] + factor * (end_color[0] - start_color[0]);
  const g = start_color[1] + factor * (end_color[1] - start_color[1]);
  const b = start_color[2] + factor * (end_color[2] - start_color[2]);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Function to get color for a value within a range
function getColorForValue(startColor, endColor, current_value, min_value, max_value) {
  const factor = (current_value - min_value) / (max_value - min_value);
  const color = interpolateColor(startColor, endColor, factor);
  return color;
}
// Function to find the closest value from an array to a target
function findClosest(preferredValues, target) {
  // Initialize the closest value with the first element's value and compute its difference from the target
  let closest = preferredValues[0];
  let smallestDifference = Math.abs(target - closest);

  // Iterate over the values to find the closest
  for (let i = 1; i < preferredValues.length; i++) {
    let currentDifference = Math.abs(target - preferredValues[i]);
    // If the current difference is smaller than the smallestDifference, update closest
    if (currentDifference < smallestDifference) {
      smallestDifference = currentDifference;
      closest = preferredValues[i];
    }
  }

  // Return the closest value
  return closest;
}

let preferredSteps = [1, 2, 5, 10, 15, 20, 50, 100, 150, 200, 250, 300, 500, 1000, 1500, 2000, 3000, 5000, 10000];
const targetStepsCount = 6;

function findClosestStep(minValue, maxValue, preferredSteps, targetStepsCount) {
  // Sort the preferredSteps just in case they aren't in order
  // Calculate the approximate step value by dividing the maxValue by the targetStepsCount
  const approximateStep = (maxValue - minValue) / targetStepsCount;
  // Find the closest preferred step value
  let closestStep = preferredSteps[0];
  let minDifference = Math.abs(approximateStep - closestStep);
  for (let i = 1; i < preferredSteps.length; i++) {
    const currentDifference = Math.abs(approximateStep - preferredSteps[i]);
    if (currentDifference < minDifference) {
      closestStep = preferredSteps[i];
      minDifference = currentDifference;
    } else {
      // If the difference starts increasing, we've found the closest step
      break;
    }
  }
  // Ensure that the step we've found can divide the maxValue into at least the targetStepsCount number of steps
  while (Math.ceil((maxValue - minValue) / closestStep) > targetStepsCount) {
    // Get the index of the current closest step
    const currentIndex = preferredSteps.indexOf(closestStep);
    // Check if we can go higher in the preferred steps array
    if (currentIndex + 1 < preferredSteps.length) {
      closestStep = preferredSteps[currentIndex + 1];
    } else {
      // If we're at the end of the array, we just use the last step value
      break;
    }
  }
  return closestStep;
}

function getLegendValue(min_value, max_value) {
  let step_value = findClosestStep(min_value, max_value, preferredSteps, targetStepsCount);
  min_value = Math.floor(min_value / step_value) * step_value;
  let value_list = []
  let next_value = min_value;
  while (next_value < max_value) {
    let value = { start: next_value, end: next_value + step_value };
    next_value = next_value + step_value;
    value_list.push(value);
  }
  return value_list;
}

// Function to create a legend with color ranges and values
function createLegend(legend_div, min_value, max_value, step, startColor, endColor, legend_name) {
  if (legend_div == 'top_map_legend_content') {
    document.getElementById('legend_title').innerHTML = legend_name;
  } else {
    document.getElementById('end_legend_title').innerHTML = legend_name;
  }
  const legend = document.getElementById(legend_div);
  legend.innerHTML = '';
  let value_list = getLegendValue(min_value, max_value);
  let layers = [];
  for (let value of value_list) {
    layers.push([value.start + '-' + value.end, getColorForValue(startColor, endColor, (value.start+value.end)/2, min_value, max_value)]);
  }
  layers.forEach(function (layer, i) {
    const color = layer[1];
    const item = document.createElement('div');
    const key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    const value = document.createTextNode(layer[0]);
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  });
}
// Function to handle hovering over a map feature
function hover_over_map_feature(map, feature, event) {
  if (feature != null) {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: 'vic-lga', id: hoveredFeatureId },
        { hover: false }
      );
    }
    hoveredFeatureId = feature.id;
    map.setFeatureState(
      { source: 'vic-lga', id: hoveredFeatureId },
      { hover: true }
    );
    if (event) {
      popup.setLngLat(event.lngLat).setHTML(getMapPopupDescription(feature.properties.LGA_CODE)).addTo(map);
    } else {
      // let latlon = feature.geometry.coordinates[0][0];
      // popup.setLngLat(latlon).setHTML(getMapPopupDescription(feature.properties.LGA_CODE)).addTo(map);  
    }

  }
}
// Function to handle hovering off a map feature
function hover_off_map_feature(map) {
  map.getCanvas().style.cursor = '';
  if (hoveredFeatureId !== null) {
    map.setFeatureState(
      // { source: 'vic-lga', sourceLayer: 'vic-lga-layer', id: hoveredFeatureId },
      { source: 'vic-lga', id: hoveredFeatureId },
      { hover: false }
    );
  }
  hoveredFeatureId = null;
  popup.remove();
}

// Function to fit the map bounds to a feature
function fitBoundsToFeature(map, feature) {
  var bounds = new mapboxgl.LngLatBounds();
  feature.geometry.coordinates.forEach(function (coord) {
    bounds.extend(coord);
  });

  map.fitBounds(bounds, {
    padding: 20,
    maxZoom: 10
  });
}
