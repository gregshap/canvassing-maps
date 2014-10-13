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

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);


  var sourceFile = 'FLAT_DATA_MiniVAN_Canvasses_20140906-20140907.csv';


  var MAP_HOUR = '44';
  var rowName = 'id';
  var colName = 'hour' + MAP_HOUR;



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