// Selecting various HTML elements using jQuery
const $text = $('.scrolltext');
const $padding = $('.padding');
const $map = $('#topMap');
const $mapCont = $('#map-container');
const $textCont = $('#text-container');
const $endMap = $('#end-map');
const $year = $('.year');
const $yearCont = $('#year-container');
const $barCont = $('#bar-container');
const $bar = $('#stacked-bar');

// Map column names and their corresponding legends
const legend_map = {
  'mean_income':'Income $',
  'rank':'Rank',
  'population_count':'Population Count',
  'Acom_food_scs':'Acommo & Food %',
  'Admin_sup_s':'Admin & Support %',
  'Agri_for_fish':'Agri & Fishing %',
  'ArtRecreatTot':'Arts & Recreation %',
  'Construction':'Construction %',
  'Educ_training':'Educ & training %' ,
  'El_Gas_W_W':'Utility %',
  'Fin_and_ins_s':'Finance %',
  'Hlth_care_soc':'HealthCare  %',
  'ID_NS':'Not Stated  %',
  'Infon_med_tel':'Info & Media  %',
  'Manufacturing':'Manufacturing  %',
  'Mining':'Mining  %',
  'Other_scs':'Others  %',
  'Prof_sci_tec':'Professional & Tech  %',
  'Pub_adm_sfty':'Public & Safety  %',
  'Rent_hi_re_es':'Rental & Hiring  %',
  'RetTde':'Retail & Trade  %',
  'Trans_po_wh':'Transport Warehouse  %',
  'WhlesaleTde':'WhlesaleTrade  %',
  '_cpl_fam_with_child':'Withi Child %',
  '_cpl_fam_no_child':'No Child %',
  '_One_parent_fam':'One Parent %',
  '_Other_fam':'Other Family %',

}

// Create a dictionary to store LGA summary data
const LGA_SUMMARY_DICT = {};
for (let lga of lga_summary) {
  let lga_code = lga['LGA_CODE_2021']
  LGA_SUMMARY_DICT[lga_code] = lga;
}

// Function to style a map layer based on the selected year and column
function styleLayer(year, column, map,unit) {
  if (column == "mean_income" || column == 'population_count' || column == 'rank') {
    styleLayerWithLGA(map, column, year, COLOR_WHITE, COLOR_ORANGE,unit);
  } else if (column.startsWith('_')) {
    styleLayerWithFamily(map, column, year, COLOR_WHITE, COLOR_ORANGE);
  } else {
    styleLayerWithIndustry(map, column, year, COLOR_WHITE, COLOR_ORANGE,unit);
  }
}

// Event listener for the slider input to select a year
document.getElementById('slider').addEventListener('input', function (e) {
  var year = parseInt(e.target.value);
  // update text in the UI
  document.getElementById('active-hour').innerText = year;
  // update the map
  let column = document.getElementById('selectorType').value;
  styleLayer(year, column, endMap);

});

// Event listener for the top map slider input to select a year
document.getElementById('topmap_slider').addEventListener('input', function (e) {
  var year = parseInt(e.target.value);
  // update text in the UI
  document.getElementById('topmap-year').innerText = year;
  // update the map
  styleLayerWithLGA(topMap, 'rank', year, COLOR_WHITE, COLOR_ORANGE);

});

// Event listener for the selectorType input to select a column
document.getElementById('selectorType').addEventListener('input', function (e) {
  var year = parseInt(document.getElementById('slider').value);
  // update text in the UI
  document.getElementById('active-hour').innerText = year;
  // update the map
  let column = document.getElementById('selectorType').value;
  styleLayer(year, column, endMap);
});


let hoveredFeatureId = null; // to track the currently hovered feature

const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});


const yearSections = document.querySelectorAll('.year-section');
const floatingYear = document.querySelector('.floating-year');

function setHeights() {

  // get new height and width in case different
  $height = $(window).height();
  $width = $(window).width();

  if ($width < 737) {
    // try to deal with address bar hiding when scroll down on mobile
    // resulting in gap at bottom
    $map.css("height", "50vh");
    $padding.css("height", $height * 0.6);
  } else {
    $map.css("height", $height);
    $padding.css("height", $height * 0.37);
    topMap.resize();
  }
  let endMapHeight = Math.max($height - 30,900)
  $endMap.css("height", endMapHeight);

  function getYearPadding() {
    if ($width > 736 && $width < 1281) {
      return 30;
    } else if ($width < 737) {
      return 0;
    } else {
      return 40;
    }
  };

  if ($width > 736) {
    $yearCont.css("left", function () {
      return getYearPadding() + $barCont.width();
    });
  } else if ($width < 737 && $width > 480) {
    $yearCont.css("left", function () {
      return ($width / 4 - ($yearCont.width() / 2) - 25);
    });
  } else {
    // different margin to account for
    $yearCont.css("left", function () {
      return ($width / 4 - ($yearCont.width() / 2) - 15);
    });
  };

  $bar.css("height", ($height - 80));

  // for every year, loop through the text objects with the corresponding index
  // set height of year container to be equal to this
  $year.each(function (i, obj) {
    let outerHeight = 0;
    $(".index" + i).each(function () {
      outerHeight += $(this).outerHeight();
    });
    // take away 10 to allow for the margin appearing between the year containers
    $(this).css("height", (outerHeight - 10) + "px");
  });

  // set map container height to ensure same when position becomes absolute on small screen
  // after have set other things like padding
  $mapCont.css("height", $textCont.height() + 240);

}
function fillTop5RankLGA() {
  lga_summary.sort(function (a, b) {
    return a.rank_2021 - b.rank_2021;
  });
  let top5LGAs = lga_summary.slice(0, 5);
  console.log(top5LGAs);
  var $table = $('#table_top_rank_5_lga');

  // Create the header
  var $thead = $('<thead>').append(
    $('<tr>').append(
      $('<th>').text('Rank'),
      $('<th>').text('LGA'),
      $('<th>').text('Weekly Income'),
      $('<th>').text('Population')
    )
  );

  $table.append($thead);
  var $tbody = $('<tbody>');

  // Loop over the data to create table rows
  let rank = 1;
  $.each(top5LGAs, function (i, lga) {
    var $tr = $('<tr>').append(
      $('<td>').text(rank),
      $('<td>').text(lga.LGA_NAME21),
      $('<td>').text('$' + Math.round(lga.mean_income_2021).toLocaleString('en-US')),
      $('<td>').text(lga.population_count_2021.toLocaleString('en-US'))
    );
    rank += 1;
    $tr.attr('lga_id', lga.LGA_CODE_2021);
    $tr.hover(
      function () {
        $(this).css('background-color', '#abb9cf');
        let lga_code = $(this).attr('lga_id');
        let feature = topMapFeatureIdAndLGA[lga_code];
        hover_over_map_feature(topMap, feature);
        fitBoundsToFeature(topMap, feature);
      },
      function () {
        $(this).css('background-color', '');
        hover_off_map_feature(topMap);
      }
    );
    $tbody.append($tr);
  });

  // Add the body to the table
  $table.append($tbody);
}
function playTrendMap() {
  let currentYear = 2011;
  let maxYear = 2021;
  for (var i = 0; i < 3; i++) {
    setTimeout(() => {
      document.getElementById('topmap_slider').value = currentYear;
      document.getElementById('topmap_slider').dispatchEvent(new Event('input'));

      if (currentYear > maxYear) {
        currentValue = 2011;
      }
      currentYear += 5;
    }, i * 500);
  }
}
$(document).ready(function () {
  // get new height and width in case different
  create_hbar_chart(530, 900);

// Sort the LGA summary data based on rank for the top 20 LGAs
  lga_summary.sort(function (a, b) {
    return a.rank_2021 - b.rank_2021;
  });
  let top10LGAs = lga_summary.slice(0, 20);

// Create a slope chart for the top-ranked LGAs
  create_slope_chart('#top_rank_change_chart', top10LGAs, 500, 700);

  // Define Waypoints for scrolling and map interactions
  new Waypoint({
    element: '#income_section_whole',
    handler: function (direction, e) {
      // Zoom to a specific level, update active elements, and style the map
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithLGA(topMap, 'mean_income', 2021, COLOR_WHITE, COLOR_ORANGE,'$');
    }, offset: '20%'
  });
  // Add more Waypoints for other sections and map interactions
  new Waypoint({
    element: '#income_section_inner_melbourne',
    handler: function (direction, e) {
      topMap.zoomTo(8);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithLGA(topMap, 'rank', 2021, COLOR_ORANGE, COLOR_WHITE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#income_trend_section',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithLGA(topMap, 'rank', 2021, COLOR_ORANGE, COLOR_WHITE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#income_trend_slider_section',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithLGA(topMap, 'rank', 2011, COLOR_WHITE, COLOR_ORANGE);
      playTrendMap();
    }, offset: '20%'
  });
  new Waypoint({
    element: '#ocupation_section_fishing',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithIndustry(topMap, 'Agri_for_fish', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#ocupation_section_mining',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithIndustry(topMap, 'Mining', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#ocupation_section_manufacturing',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithIndustry(topMap, 'Manufacturing', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#ocupation_section_utility',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithIndustry(topMap, 'El_Gas_W_W', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#ocupation_section_information_technology',
    handler: function (direction, e) {
      topMap.zoomTo(8);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithIndustry(topMap, 'Infon_med_tel', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });

  new Waypoint({
    element: '#family_section_chart',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithLGA(topMap, 'rank', 2021,  COLOR_ORANGE,COLOR_WHITE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#family_couple_no_child',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithFamily(topMap, '_cpl_fam_no_child', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });

  new Waypoint({
    element: '#family_couple_with_child',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithFamily(topMap, '_cpl_fam_with_child', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#family_one_parent',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithFamily(topMap, '_One_parent_fam', 2021, COLOR_WHITE, COLOR_ORANGE);
    }, offset: '20%'
  });
  new Waypoint({
    element: '#family_others',
    handler: function (direction, e) {
      topMap.zoomTo(6);
      $text.removeClass("active");
      $(this.element).addClass("active");
      styleLayerWithFamily(topMap, '_Other_fam', 2021, COLOR_WHITE, COLOR_ORANGE);
    }
    , offset: '20%'
  });

  let stickies = $('.sticky');
  Stickyfill.add(stickies);
  
 // Fill and display charts, set heights, and define resize event
  fillTop5RankLGA();
  create_family_stack_chart(600, 850);
  displaySideChart('24600');

  setHeights();

  window.onresize = setHeights;
});