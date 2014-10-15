var canvassMap;
(function() {

  var width = 960,
      height = 600;

  var rateById = d3.map();

  var quantize = d3.scale.quantize()
      .domain([0, 9])
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

  var projection = d3.geo.albersUsa()
      .scale(1280)
      .translate([width / 2, height / 2]);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#canvass-map").append("svg")
      .attr("width", width)
      .attr("height", height);


  var sourceFile = 'CanvassingMapData_20141010-20141012.csv';


  function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) == variable) {
              console.log('Query variable: %s=%s',variable,decodeURIComponent(pair[1]));
              return decodeURIComponent(pair[1]);
          }
      }
      console.log('Query variable %s not found', variable);
  }

  

  var MAP_HOUR = getQueryVariable("hour");
  var rowName = 'id';
  var colName = 'Hour' + MAP_HOUR;



  queue()
      .defer(d3.json, "../data/us.json")
      .defer(d3.csv, "../data/" + sourceFile, function(d) { 
                                              var rateLog = Math.log(d[colName]);
                                              rateById.set(d[rowName], +rateLog); })
      .await(ready);

  function ready(error, us) {

    console.log(rateById);

    svg.append("g")
        .attr("class", "counties")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("class", function(d) {
                            return quantize(rateById.get(d[rowName]));
                          })
        .attr("d", path);


    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return true; }))
        .attr("class", "states")
        .attr("d", path);
  }

  d3.select(self.frameElement).style("height", height + "px");
  
})(canvassMap || (canvassMap = {}));