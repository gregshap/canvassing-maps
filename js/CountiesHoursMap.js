var canvassMap;
(function() {

  var width = 960,
      height = 600;

  var valueById = {};

  var quantize = d3.scale.quantize()
      .domain([0, 9])
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

  var thresholdize = d3.scale.threshold()
      .domain([1,5,10,20,50,150,400,1000,3000,8000])
      .range(d3.range(9).map(function(i) {return "q" + i + "-9"; }))

  var projection = d3.geo.albersUsa()
      .scale(1280)
      .translate([width / 2, height / 2]);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#canvass-map").append("svg")
      .attr("width", width)
      .attr("height", height);


  var SOURCE_FILE = 'CanvassingMapData_20141017-20141019.csv';


  function getQueryVariable(queryStringParamTarget) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
          
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]).toUpperCase() === queryStringParamTarget.toUpperCase()) {
              console.log('Query variable: %s=%s',queryStringParamTarget,decodeURIComponent(pair[1]));
              return decodeURIComponent(pair[1]);
          }
      }
      console.log('Query variable %s not found', queryStringParamTarget);
  }



  
  //Get the hour from query string, default to Total
  var mapHour = getQueryVariable("hour") || "Total"; 
  
  var rowName = 'id';
  var colName = 'Hour' + mapHour;


  //This represents 'Hour 0'
  var MAP_START_TIME = "2014-10-17 17:00:00";
  var MAP_START_TIME_PARSE_FORMAT = "YYYY-MM-DD HH:mm:ss";
  var mapStartMoment = moment(MAP_START_TIME, MAP_START_TIME_PARSE_FORMAT);

  //Initialze the end moment to the weekend hour 0, and we'll add hours appropriately
  var mapEndMoment = moment(MAP_START_TIME, MAP_START_TIME_PARSE_FORMAT);


  //Add hours to start and end dates based on which time segment of data we're showing
  //For the 'total' view, it's the whole weekend from hour 0 til the end of the weekend
  if (mapHour.toUpperCase() == "total".toUpperCase()) {

    var NUM_HOURS_IN_WEEKEND = 54
    mapStartMoment.add(0,'hours'); //unbreak this for Total
    mapEndMoment.add(NUM_HOURS_IN_WEEKEND,'hours');
  
  } else{
  
    mapStartMoment.add(parseInt(mapHour),'hours'); 
    mapEndMoment.add(parseInt(mapHour) + 1,'hours');
  
  }

  //How do we want to display dates?
  var DISPLAY_DATE_FULL_FORMAT = "dddd, MMMM Do YYYY, h:mm:ss a"; //Day of wk, Full date and time
  var DISPLAY_DATE_MEDIUM_FORMAT = "dddd, MMMM Do, h:mm:ss a"; //Day of wk, date, time
  var DISPLAY_DATE_SHORT_FORMAT = "dddd h:mma"; //Day of wk and time

  //Set the current time segment
  var hourDisplayDiv = d3.select("#time-segment")
                          .text(mapStartMoment.format(DISPLAY_DATE_SHORT_FORMAT) 
                            + " to " + 
                            mapEndMoment.format(DISPLAY_DATE_SHORT_FORMAT));


  queue()
      .defer(d3.json, "../data/us.json")
      .defer(d3.csv, "../data/" + SOURCE_FILE, function(d) { 
                                              var rateLog = Math.log(d[colName]);
                                              valueById[d[rowName]] = +d[colName]; })
      .await(ready);

  function ready(error, us) {

    console.log(valueById);

    svg.append("g")
        .attr("class", "counties")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("class", function(d) {
                            return thresholdize(valueById[d[rowName]]);
                          })
        .attr("d", path);


    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return true; }))
        .attr("class", "states")
        .attr("d", path);
  }

  d3.select(self.frameElement).style("height", height + "px");
  
})(canvassMap || (canvassMap = {}));