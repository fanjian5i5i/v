// console.log(mayoral);
var precinctLayer;
init();
function initMap(){
  require([
"esri/Map",
"esri/views/MapView",
"esri/layers/FeatureLayer",
"esri/layers/GraphicsLayer",
"esri/layers/MapImageLayer",
"esri/PopupTemplate",
"esri/renderers/SimpleRenderer",
"esri/symbols/SimpleFillSymbol",
"esri/tasks/QueryTask",
"esri/tasks/support/Query",


"esri/Graphic",
"esri/geometry/Point",
"esri/geometry/Polyline",
"esri/geometry/Polygon",
"esri/symbols/SimpleMarkerSymbol",
"esri/symbols/SimpleLineSymbol",
"esri/symbols/SimpleFillSymbol",
"esri/symbols/TextSymbol",
"esri/layers/support/LabelClass",
"dojo/dom",
"dojo/on",
"dojo/domReady!"
], function(Map, MapView, FeatureLayer,GraphicsLayer,MapImageLayer,PopupTemplate,SimpleRenderer,SimpleFillSymbol,QueryTask,Query,
Graphic, Point, Polyline, Polygon,
  SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,TextSymbol,LabelClass,dom,on) {
var features = [];
var year=[2013];
var map = new Map({
  basemap: "dark-gray"
});

var view = new MapView({
  container: "viewDiv",
  map: map,
  zoom: 12,
  center: [-71.0589, 42.31]
});
var queryCitiesTask = new QueryTask({
  url: "http://gis.cityofboston.gov/arcgis/rest/services/Planning/OpenData/MapServer/7",  // URL of a feature layer representing U.S. cities
  // outFields: ["*"]
});

var queryCencus = new QueryTask({
  url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",  // URL of a feature layer representing U.S. cities
  // outFields: ["*"]
});

var queryPrecinctsEduction = new QueryTask({
  url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Tracts_ACS2014_5yr_stats/mapserver/1",  // URL of a feature layer representing U.S. cities
  // outFields: ["*"]
});

view.on("click", function(evt){
  // console.log(evt);
  view.graphics.removeAll();
  var query = new Query();
  query.geometry = evt.mapPoint;
  query.distance = 1;
  query.outFields = ["*"];
  query.units = "feet";
  query.spatialRelationship = "intersects";
  query.returnGeometry = true;
  // query.where = "PRECINCT = '01'";
  console.log(year);
  queryCitiesTask.execute(query).then(function(result){
      // Returns all U.S. cities as a FeatureSet within 100 miles of view-click
      console.log(result.features);
      if(result.features.length>0){
        view.goTo({
          center:evt.mapPoint,
          zoom: 15
        });
        var fillSymbol = new SimpleFillSymbol({
        color: [227, 139, 79, 0],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [0,255,255,1],
          width: 2
        }
        });

        var polygonGraphic = new Graphic({
          geometry: result.features[0].geometry,
          symbol: fillSymbol
        });
        view.graphics.add(polygonGraphic);
      }

      // view.popup.open({
      //     // Set the popup's title to the coordinates of the clicked location
      //     title: "Ward-Precinct: " + result.features[0].attributes.WARD_PRECINCT,
      //     content:"<div id='popupContent'>Loading...</div>",
      //     location: evt.mapPoint // Set the location of the popup to the clicked location
      // });
      document.getElementById("wardprinct").innerHTML = "Ward " + result.features[0].attributes.WARD_PRECINCT.substring(0,2) + " Precint " + result.features[0].attributes.WARD_PRECINCT.substring(2,4);

      QueryElection(result.features[0].attributes.WARD_PRECINCT);
      $("#chart").show();

  });
  queryCencus.execute(query).then(function(result){
    console.log(result.features);
    drawChartAge(result.features[0].attributes);
    drawChartRace(result.features[0].attributes);
  });
  queryPrecinctsEduction.execute(query).then(function(result){
      // Returns all U.S. cities as a FeatureSet within 100 miles of view-click
      console.log(result.features);
      drawChartEduction(result.features[0].attributes);
      // QueryTRVMayoral(result.features[0].attributes.WARD_PRECINCT);

  });

});

function QueryTRV(WARD_PRECINCT){
  var ward = parseInt(WARD_PRECINCT.substring(0,2)).toString();
  var precinct = parseInt(WARD_PRECINCT.substring(2,4)).toString();
  trv.forEach(function(obj){
    // console.log(ward);
    // console.log(obj.Ward);
    if(ward === obj.Ward && precinct === obj.Precinct ){
      console.log(obj);
      // $(".esri-title")[0].innerHTML = "Ward " + obj.Ward + " Precinct " + obj.Precinct;
      // return obj;
      // console.log(document.getElementsByClassName("esri-popup-renderer-container"))
      // var popupContentDiv = document.getElementById("popupContent");
      // popupContentDiv.innerHTML=obj["TRV 2014"]
      drawChart(obj);
    }
  });
};
  function QueryTRVMayoral(WARD_PRECINCT){
    var ward = parseInt(WARD_PRECINCT.substring(0,2));
    var precinct = parseInt(WARD_PRECINCT.substring(2,4));
    var data = [];
    // console.log(ward);
    // console.log(precinct);
    mayoral.forEach(function(obj){
      // console.log(ward);
      // console.log(obj);
      if(ward === obj.Ward && precinct === obj.Precinct ){
        // console.log(obj);
        // drawChart(obj);
        data.push(obj)
      }
    });
    drawChart(data);
  };


  function QueryElection(WARD_PRECINCT){
    var ward = parseInt(WARD_PRECINCT.substring(0,2));
    var precinct = parseInt(WARD_PRECINCT.substring(2,4));
    var data = [];
    console.log(ward);
    console.log(precinct);

    registry[year[0]].forEach(function(obj){
      // console.log(ward);
      // console.log(obj);
      if(ward === parseInt(obj.Ward) && precinct === parseInt(obj.Precinct) ){
        // console.log(obj);
        // drawChart(obj);
        data.push(obj);
        // console.log(data);
      }
    });
    // console.log(data);
    drawChart(data);
  };
  function drawChartEduction(precinct) {
    console.log(precinct);
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ["High School and Lower", parseInt(precinct.less_hs)],
      ["High School", parseInt(precinct.hs)],
      ["Some College", parseInt(precinct.somecoll)],
      ["Bachealer and Higher", parseInt(precinct.baplus)]
    ]);

            // Set chart options
            var options = {'title':'Education',
                           'width':350,
                           'height':220,
                          //  legend: 'none',
              pieSliceText: 'label',
              is3D: true,
              sliceVisibilityThreshold: .02
            };

    var chart = new google.visualization.PieChart(document.getElementById("education"));
    console.log(data);
    chart.draw(data, options);
  };
  function drawChart(precinct) {
    console.log(precinct);
  var data = new google.visualization.DataTable();

  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  var rows = [];
  for(var obj in precinct[0]){
    console.log(obj);
    console.log(precinct[0][obj]);
    if(obj != "Ward" && obj != "Precinct"){
      rows.push([obj,parseInt(precinct[0][obj])]);
    }

  }
  data.addRows(rows);

          // Set chart options
  var options = {'title':year + ' Election Turnout',
                 'width':350,
                 'height':250,
                //  legend: 'none',
    pieSliceText: 'value',
    is3D: true,
    sliceVisibilityThreshold: .02,
    // pieSliceTextStyle:{"text-shadow": "1px 1px 2px black, 0 0 2px black, 0 0 2px black"},
    slices: {
      0: { color: '#B40E00' },
      1: { color: '#00a6b4' },
      2: { color: '#A9A9A9', offset: 0.3 }
    }};

  var chart = new google.visualization.PieChart(document.getElementById("charts"));
  console.log(data);
  chart.draw(data, options);
  $('.expand').addClass("hidden");
  $('.minimize').removeClass("hidden");
  $("#charts").show();
};


function drawChartAge(precinct) {
  // console.log(precinct);
  var data = new google.visualization.DataTable();

  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ["0 - 5", parseInt(precinct.Age_0_5)],
    ["5 - 9", parseInt(precinct.Age_5_9)],
    ["10 - 14", parseInt(precinct.Age_10_14)],
    ["15 - 17", parseInt(precinct.Age_10_17)],
    ["18 - 24", parseInt(precinct.Age_18_24)],
    ["25 - 34", parseInt(precinct.Age_25_34)],
    ["35 - 64", parseInt(precinct.Age_35_64)],
    ["65+ ", parseInt(precinct.Age_65plus)]
  ]);

          // Set chart options
          var options = {'title':'Age',
                         'width':350,
                         'height':220,
                        //  legend: 'none',
            pieSliceText: 'label',
            is3D: true,
            sliceVisibilityThreshold: .02};


  var chart = new google.visualization.PieChart(document.getElementById("age"));
  console.log(data);
  chart.draw(data, options);
};
function drawChartRace(precinct) {
    console.log(precinct);
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ["American Indian", parseInt(precinct.AmerInd_alone)],
      ["Asian", parseInt(precinct.Asian_alone)],
      ["African American", parseInt(precinct.Black_alone)],
      ["Hispanic Latino", parseInt(precinct.Hisp_Latino)],
      ["White American", parseInt(precinct.White_alone)],
      ["Other", parseInt(precinct.SomeOtrher_alone)]
    ]);

            // Set chart options
            var options = {'title':'Race',
                           'width':350,
                           'height':220,
                          //  legend: 'none',
              pieSliceText: 'label',
              is3D: true,
              sliceVisibilityThreshold: .02
            };

    var chart = new google.visualization.PieChart(document.getElementById("race"));
    console.log(data);
    chart.draw(data, options);
};
var tpl ={
  title:"WARD_PRECINCT: {WARD_PRECINCT}"
};

var fl = new FeatureLayer({
  url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",
  // popupTemplate: pTemplate,
  outFields: ["*"],
  // popupTemplate: tpl
});

var defaultSym = new SimpleFillSymbol({
    outline: {
      color: "lightgray",
      width: 0.5
    }
  });
var rendererblack = new SimpleRenderer({
    symbol: defaultSym,
    visualVariables: [{
      type: "color",
      field: "Black_alone",
      normalizationField: "Population",
      stops: [
      {
        value: 0.01,
        color: "#FFFCD4",
        label: "<1%"
      },
      {
        value: 0.8,
        color: "#350242",
        label: ">80%"
      }]
    }]
  });

  var rendererwhite = new SimpleRenderer({
      symbol: defaultSym,
      visualVariables: [{
        type: "color",
        field: "White_alone",
        normalizationField: "Population",
        stops: [
        {
          value: 0.01,
          color: "#FFFCD4",
          label: "<1%"
        },
        {
          value: 0.8,
          color: "#350242",
          label: ">80%"
        }]
      }]
    });

var black = new FeatureLayer({
      id:"black",
      url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",
      outFields: ["*"],
      renderer: rendererblack,
    });
var white = new FeatureLayer({
      id:"white",
      url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",
      renderer: rendererwhite,
    });
var labelRender = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    style: "none",
    outline: {
      width: 0,
      color: "white"
    }
  })
});

var labelLayer = new MapImageLayer({
  url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/pricinct2016_label/MapServer",
  sublayers: [{
    id: 0,
    renderer: labelRender,
    opacity: 0.5,
    labelsVisible: true,
    // labelingInfo autocasts to an array of LabelClass objects
    labelingInfo: [{
      labelExpression: "[WARD_PRECI]",
      labelPlacement: "always-horizontal",
      minScale: 52500,
      // maxScale: 2400000,
      symbol: new TextSymbol({
        color: [255, 255, 255, 0.7],
        haloColor: [0, 0, 0, 0.7],
        haloSize: 1,
        font: {
          size: 11
        }
      })
    }]
  }]
});

var labelRegionLayer = new MapImageLayer({
  url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Regions/MapServer",
  sublayers: [{
    id: 0,
    renderer: labelRender,
    opacity: 0.5,
    labelsVisible: true,
    // labelingInfo autocasts to an array of LabelClass objects
    labelingInfo: [{
      labelExpression: "[region]",
      labelPlacement: "always-horizontal",
      // minScale: 52500,
      // maxScale: 2400000,
      symbol: new TextSymbol({
        color: [255, 255, 255, 0.7],
        haloColor: [0, 0, 0, 0.7],
        haloSize: 1,
        font: {
          size: 11
        }
      })
    }]
  }]
});


var fl2 = new FeatureLayer({
  url: "http://maps.cityofboston.gov/ArcGIS/rest/services/CityServices/OPEN_DATA/MapServer/7",
  // popupTemplate: pTemplate,
  outFields: ["*"],
});
// console.log(fl);

var gl = new GraphicsLayer({
  // graphics: [graphicA]
});


//precincts
fl.renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [ 51,51, 204, 0 ],
    style: "solid",
    outline: {  // autocasts as esri/symbols/SimpleLineSymbol
      color: "darkgrey",
      width: 0.7
    }
  })
});

//wards
fl2.renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [ 241, 194, 50, 0 ],
    style: "solid",
    outline: {  // autocasts as esri/symbols/SimpleLineSymbol
      color: [241, 194, 50, 0.9],
      width: 2
    }
  })
});

map.add(fl);
map.add(fl2);
map.add(gl);
map.add(labelLayer);

// var slider = document.getElementById('slider');
view.whenLayerView(fl).then(function(lyrView) {
    lyrView.watch("updating", function(val) {
      if (!val) { // wait for the layer view to finish updating


        // query all the features available for drawing.
        lyrView.queryFeatures().then(function(results) {
          results.forEach(function(result, index) {
            features.push(result);
            // console.log(features);
            // var trueSlider = document.getElementById('slider');
            // trueSlider.noUiSlider.set(2016);
            var ward = parseInt(result.attributes.WARD_PRECINCT.substring(0,2)).toString();
            var precinct = parseInt(result.attributes.WARD_PRECINCT.substring(2,4)).toString();
            // console.log(result.attributes);
            registry[year[0]].forEach(function(obj){

              if(ward === obj.Ward && precinct === obj.Precinct){
                if(year[0] == 2009){
                  var candidate1 = parseInt(obj.Menino);
                  var candidate2 = parseInt(obj.Flaherty);
                }else if(year[0] == 2013){
                  var candidate1 = parseInt(obj.Walsh);
                  var candidate2 = parseInt(obj.Connolly);
                }
                // console.log((candidate2)/(candidate1+candidate2));
                if(candidate1 < candidate2){
                  if((candidate2)/(candidate1+candidate2) >=0.7){
                    var fillSymbol = new SimpleFillSymbol({
                      color:[223, 73, 72],
                      outline: { // autocasts as new SimpleLineSymbol()
                        color: "darkgrey",
                        width: 0.7
                      }
                    });
                  }
                  else if ((candidate2)/(candidate1+candidate2) >=0.6){
                    var fillSymbol = new SimpleFillSymbol({
                      color:[246,146,139],
                      outline: { // autocasts as new SimpleLineSymbol()
                        color: "darkgrey",
                        width: 0.7
                      }
                    });

                  } else {
                    var fillSymbol = new SimpleFillSymbol({
                      color:[246,228,221],
                      outline: { // autocasts as new SimpleLineSymbol()
                        color: "darkgrey",
                        width: 0.7
                      }
                    });
                  }

                }else{
                  if((candidate1)/(candidate1+candidate2) >=0.7){
                    var fillSymbol = new SimpleFillSymbol({
                      color:[69,117,180],
                      outline: { // autocasts as new SimpleLineSymbol()
                        color: "darkgrey",
                        width: 0.7
                      }
                    });
                  }
                  else if ((candidate1)/(candidate1+candidate2) >=0.6){
                    var fillSymbol = new SimpleFillSymbol({
                      color:[145,191,219],
                      outline: { // autocasts as new SimpleLineSymbol()
                        color: "darkgrey",
                        width: 0.7
                      }
                    });

                  } else {
                    var fillSymbol = new SimpleFillSymbol({
                      color:[203,235,243],
                      outline: { // autocasts as new SimpleLineSymbol()
                        color: "darkgrey",
                        width: 0.7
                      }
                    });
                  }
                }
                var polygonGraphic = new Graphic({
                  geometry: result.geometry,
                  symbol: fillSymbol
                });
                gl.graphics.add(polygonGraphic);
                map.reorder(gl,0);

              }
            });
          });
        });
      }
    });
  });
  var wardsCtrl = dom.byId("wards");
  on(wardsCtrl, "change", function() {
          fl2.visible = wardsCtrl.checked;
          // console.log("changed");
  });

  var mayorYear = 2013;
  var mayor2005Ctrl = $("#mayor2005");
  var mayor2009Ctrl = $("#mayor2009");

  var mayor2013Ctrl = $("#mayor2013");
  var raceBlackCtrl = $("#race_black");
  var raceWhiteCtrl = $("#race_white");
  var raceHispanicCtrl = $("#race_hispanic");
  var raceAsianCtrl = $("#race_asian");
  var white2013 = $("#white2013");
var black2013 = $("#black2013");
var hispanic2013 = $("#hispanic2013");
var asian2013 = $("#asian2013");
var regionsCtrl = $("#regions");
// var regionLayer = new GraphicsLayer({id:"regions"});
var regionLayer = new FeatureLayer({
          id:"regions",
          url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Regions/MapServer/0",
          opacity:0.8
        });
regionsCtrl.on("click",function(e){
  e.preventDefault();
  // console.log(regions);
  // var count = 0
  // features.forEach(function(precinct1){
  //   // console.log(precinct1.attributes.WARD_PRECINCT);
  //   regions.forEach(function(precinct2){
  //     if(precinct1.attributes.WARD_PRECINCT == precinct2.WardPrecinct){
  //       // count += 1;
  //       // console.log(count)
  //       switch (precinct2.Region) {
  //         case 1:
  //         var fillSymbol = new SimpleFillSymbol({
  //             color:"red",
  //             outline: {
  //               color: "red",
  //               width: 0.5
  //             }
  //           });
  //         break;
  //         case 2:
  //         var fillSymbol = new SimpleFillSymbol({
  //           color: "green",
  //             outline: {
  //               color: "green",
  //               width: 0.5
  //             }
  //           });
  //         break;
  //         case 3:
  //         var fillSymbol = new SimpleFillSymbol({
  //             color: "blue",
  //             outline: {
  //               color: "blue",
  //               width: 0.5
  //             }
  //           });
  //         break;
  //         case 4:
  //         var fillSymbol = new SimpleFillSymbol({
  //             color: "orange",
  //             outline: {
  //               color: "orange",
  //               width: 0.5
  //             }
  //           });
  //         break;
  //         case 5:
  //         var fillSymbol = new SimpleFillSymbol({
  //           color: "purple",
  //             outline: {
  //               color: "purple",
  //               width: 0.5
  //             }
  //           });
  //         break;
  //         default:
  //
  //       }
  //       var graphic = new Graphic({
  //         geometry: precinct1.geometry,
  //         symbol: fillSymbol
  //       });
  //
  //       regionLayer.graphics.add(graphic);
  //
  //
  //     }
  //
  //   });



  // });
  if(map.findLayerById("regions")){
    map.remove(regionLayer);
    map.remove(labelRegionLayer);
    regionsCtrl.removeClass("active");
  }else{
    map.add(regionLayer);
    map.add(labelRegionLayer);
    regionsCtrl.addClass("active");
  }

});

  $('#rightNavBtn').on("click",function(e){
    $('.button-collapse-right').sideNav('show');
  });
  $('#leftNavBtn').on("click",function(e){
    $('.button-collapse').sideNav('show');
  });
  // on(mayor2005Ctrl, "click", function() {
  //   console.log(mayor2005Ctrl.hasClass("activejavasc"));
  //   console.log("clicked");
  // });
  var raceBlackCtrl = $("#race_black");
  // var raceWhiteCtrl = $("#race_white");
  // var raceHispanicCtrl = $("#race_hispanic");
  // var raceAsianCtrl = $("#race_asian");
  raceBlackCtrl.on("click",function(e){
    e.preventDefault();
    console.log(map.findLayerById("black"));
    if(map.findLayerById("black")){
      raceBlackCtrl.removeClass("active");
      map.remove(map.findLayerById("black"));

    }
    else{
      raceBlackCtrl.addClass("active");
      // var defaultSym = new SimpleFillSymbol({
      //     outline: {
      //       color: "lightgray",
      //       width: 0.5
      //     }
      //   });
      // var renderer = new SimpleRenderer({
      //     symbol: defaultSym,
      //     visualVariables: [{
      //       type: "color",
      //       field: "Black_alone",
      //       normalizationField: "Population",
      //       stops: [
      //       {
      //         value: 0.01,
      //         color: "#FFFCD4",
      //         label: "<1%"
      //       },
      //       {
      //         value: 0.8,
      //         color: "#350242",
      //         label: ">80%"
      //       }]
      //     }]
      //   });
      //
      // var featureLayer = new FeatureLayer({
      //       id:"black",
      //       url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",
      //       outFields: ["*"],
      //       renderer: renderer,
      //     });

          map.add(black);
    }

  });
  raceWhiteCtrl.on("click",function(e){
    e.preventDefault();
    console.log(map.findLayerById("white"));
    if(map.findLayerById("white")){
      raceWhiteCtrl.removeClass("active");
      map.remove(map.findLayerById("white"));

    }
    else{
      raceWhiteCtrl.addClass("active");



          map.add(white);
    }

  });
  raceHispanicCtrl.on("click",function(e){
    e.preventDefault();
    console.log(map.findLayerById("hispanic"));
    if(map.findLayerById("hispanic")){
      raceHispanicCtrl.removeClass("active");
      map.remove(map.findLayerById("hispanic"));

    }
    else{
      raceHispanicCtrl.addClass("active");
      var defaultSym = new SimpleFillSymbol({
          outline: {
            color: "lightgray",
            width: 0.5
          }
        });
      var renderer = new SimpleRenderer({
          symbol: defaultSym,
          visualVariables: [{
            type: "color",
            field: "Hisp_Latino",
            normalizationField: "Population",
            stops: [
            {
              value: 0.01,
              color: "#FFFCD4",
              label: "<1%"
            },
            {
              value: 0.8,
              color: "#350242",
              label: ">80%"
            }]
          }]
        });

      var featureLayer = new FeatureLayer({
            id:"hispanic",
            url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",
            outFields: ["*"],
            renderer: renderer,
          });

          map.add(featureLayer);
    }

  });
  raceAsianCtrl.on("click",function(e){
    e.preventDefault();
    console.log(map.findLayerById("asian"));
    if(map.findLayerById("asian")){
      raceAsianCtrl.removeClass("active");
      map.remove(map.findLayerById("asian"));

    }
    else{
      raceAsianCtrl.addClass("active");
      var defaultSym = new SimpleFillSymbol({
          outline: {
            color: "lightgray",
            width: 0.5
          }
        });
      var renderer = new SimpleRenderer({
          symbol: defaultSym,
          visualVariables: [{
            type: "color",
            field: "Asian_alone",
            normalizationField: "Population",
            stops: [
            {
              value: 0.01,
              color: "#FFFCD4",
              label: "<1%"
            },
            {
              value: 0.8,
              color: "#350242",
              label: ">80%"
            }]
          }]
        });

      var featureLayer = new FeatureLayer({
            id:"asian",
            url: "http://mapservices.bostonredevelopmentauthority.org/arcproxy/arcgis/rest/services/Maps/Precincts_census2010/MapServer/0",
            outFields: ["*"],
            renderer: renderer,
          });

          map.add(featureLayer);
    }

  });
  white2013.on("click",function(){
    console.log("white")
    if(white2013.hasClass("active")){
      white2013.removeClass("active");
    }else{
      white2013.addClass("active");
      mayor2009Ctrl.removeClass("active");
      mayor2005Ctrl.removeClass("active");
      mayor2013Ctrl.removeClass("active");
      black2013.removeClass("active");
      asian2013.removeClass("active");
      hispanic2013.removeClass("active");
      mayorYear = 2013;
      year = [];
      race = "white";
      year.push(2013);
      // changeMayorYear(mayorYear);
      changeElectionYear(year,race);
      $("#legendTitle").text("Mayoral Election Turnout 2013");
      $(".brand-logo")[0].text="Mayoral Election Turnout 2013";
      $("#candidate1").text("Walsh");
      $("#candidate2").text("Connolly");
      $('.expand').removeClass("hidden");
      $('.minimize').addClass("hidden");
      $("#charts").hide();
    }
  });
  black2013.on("click",function(){
    if(black2013.hasClass("active")){
      black2013.removeClass("active");
    }else{
      black2013.addClass("active");
      mayor2009Ctrl.removeClass("active");
      mayor2005Ctrl.removeClass("active");
      mayor2013Ctrl.removeClass("active");
      white2013.removeClass("active");
      asian2013.removeClass("active");
      hispanic2013.removeClass("active");
      mayorYear = 2013;
      year = [];
      race = "black";
      year.push(2013);
      // changeMayorYear(mayorYear);
      changeElectionYear(year,race);
      $("#legendTitle").text("Mayoral Election Turnout 2013");
      $(".brand-logo")[0].text="Mayoral Election Turnout 2013";
      $("#candidate1").text("Walsh");
      $("#candidate2").text("Connolly");
      $('.expand').removeClass("hidden");
      $('.minimize').addClass("hidden");
      $("#charts").hide();
    }
  });
  hispanic2013.on("click",function(){
    if(hispanic2013.hasClass("active")){
      hispanic2013.removeClass("active");
    }else{
      hispanic2013.addClass("active");
      white2013.removeClass("active");
      asian2013.removeClass("active");
      black2013.removeClass("active");
      mayor2009Ctrl.removeClass("active");
      mayor2005Ctrl.removeClass("active");
      mayor2013Ctrl.removeClass("active");
      mayorYear = 2013;
      year = [];
      race = "hispanic";
      year.push(2013);
      // changeMayorYear(mayorYear);
      changeElectionYear(year,race);
      $("#legendTitle").text("Mayoral Election Turnout 2013");
      $(".brand-logo")[0].text="Mayoral Election Turnout 2013";
      $("#candidate1").text("Walsh");
      $("#candidate2").text("Connolly");
      $('.expand').removeClass("hidden");
      $('.minimize').addClass("hidden");
      $("#charts").hide();
    }
  });
  asian2013.on("click",function(){
    if(asian2013.hasClass("active")){
      asian2013.removeClass("active");
    }else{
      asian2013.addClass("active");
      white2013.removeClass("active");
      hispanic2013.removeClass("active");
      black2013.removeClass("active");
      mayor2009Ctrl.removeClass("active");
      mayor2005Ctrl.removeClass("active");
      mayor2013Ctrl.removeClass("active");
      mayorYear = 2013;
      year = [];
      race = "asian";
      year.push(2013);
      // changeMayorYear(mayorYear);
      changeElectionYear(year,race);
      $("#legendTitle").text("Mayoral Election Turnout 2013");
      $(".brand-logo")[0].text="Mayoral Election Turnout 2013";
      $("#candidate1").text("Walsh");
      $("#candidate2").text("Connolly");
      $('.expand').removeClass("hidden");
      $('.minimize').addClass("hidden");
      $("#charts").hide();
    }
  });
  mayor2005Ctrl.on("click",function(e){
    e.preventDefault();
    // if(mayor2005Ctrl.hasClass("active")){
    //
    // }else{
    //   mayor2005Ctrl.addClass("active");
    //   mayor2009Ctrl.removeClass("active");
    //   mayor2013Ctrl.removeClass("active");
    //   mayorYear = 2010;
    //   year = [];
    //   year.push(2005);
    //   changeMayorYear(mayorYear);
    //   changeElectionYear(year);
    //   $("#legendTitle").text("Mayoral Election 2005");
    //
    //
    // }
  });
  mayor2009Ctrl.on("click",function(){
    if(mayor2009Ctrl.hasClass("active")){

    }else{
      mayor2009Ctrl.addClass("active");
      mayor2005Ctrl.removeClass("active");
      mayor2013Ctrl.removeClass("active");
      year = [];
      year.push(2009);
      changeElectionYear(year);
      $("#legendTitle").text("Mayoral Election Turnout 2009");
      $(".brand-logo")[0].text="Mayoral Election Turnout 2009";
      $("#candidate2").text("Flaherty");
      $("#candidate1").text("Menino");
      $('.expand').removeClass("hidden");
      $('.minimize').addClass("hidden");
      $("#charts").hide();
    }
  });
  mayor2013Ctrl.on("click",function(){
    if(mayor2013Ctrl.hasClass("active")){

    }else{
      mayor2013Ctrl.addClass("active");
      mayor2009Ctrl.removeClass("active");
      mayor2005Ctrl.removeClass("active");
      mayorYear = 2013;
      year = [];
      year.push(2013);
      // changeMayorYear(mayorYear);
      changeElectionYear(year);
      $("#legendTitle").text("Mayoral Election Turnout 2013");
      $(".brand-logo")[0].text="Mayoral Election Turnout 2013";
      $("#candidate1").text("Walsh");
      $("#candidate2").text("Connolly");
      $('.expand').removeClass("hidden");
      $('.minimize').addClass("hidden");
      $("#charts").hide();
    }
  });
  function changeElectionYear(year,race){
    // console.log(123);
    gl.removeAll();
    features.forEach(function(result, index) {
        // console.log(result);
        var ward = parseInt(result.attributes.WARD_PRECINCT.substring(0,2)).toString();
        var precinct = parseInt(result.attributes.WARD_PRECINCT.substring(2,4)).toString();
        // console.log(registry[year[0]]);
        registry[year[0]].forEach(function(obj){

          if(ward === obj.Ward && precinct === obj.Precinct){
            if(year[0] == 2009){
              var candidate1 = parseInt(obj.Menino);
              var candidate2 = parseInt(obj.Flaherty);

            }else if(year[0] == 2013){
              var candidate1 = parseInt(obj.Walsh);
              var candidate2 = parseInt(obj.Connolly);
            }
            // console.log(candidate1, candidate2);
            if(candidate1 < candidate2){
              if((candidate2)/(candidate1+candidate2) >=0.7){
                var fillSymbol = new SimpleFillSymbol({
                  color:[223, 73, 72],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });
              }
              else if ((candidate2)/(candidate1+candidate2) >=0.6){
                var fillSymbol = new SimpleFillSymbol({
                  color:[246,146,139],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });

              } else {
                var fillSymbol = new SimpleFillSymbol({
                  color:[246,228,221],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });
              }

            }else{
              if((candidate1)/(candidate1+candidate2) >=0.7){
                var fillSymbol = new SimpleFillSymbol({
                  color:[69,117,180],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });
              }
              else if ((candidate1)/(candidate1+candidate2) >=0.6){
                var fillSymbol = new SimpleFillSymbol({
                  color:[145,191,219],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });

              } else {
                var fillSymbol = new SimpleFillSymbol({
                  color:[224,243,248],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });
              }
            }
            switch (race) {
              case "white":
              if(result.attributes.White_alone/result.attributes.Population<0.5)
              var fillSymbol = new SimpleFillSymbol({
                color:[125,125,125],
                outline: { // autocasts as new SimpleLineSymbol()
                  color: "darkgrey",
                  width: 0.7
                }
              });
                break;
              case "black":
              if(result.attributes.Black_alone/result.attributes.Population<0.5)
              var fillSymbol = new SimpleFillSymbol({
                color:[125,125,125],
                outline: { // autocasts as new SimpleLineSymbol()
                  color: "darkgrey",
                  width: 0.7
                }
              });
                break;
                case "hispanic":
                if(result.attributes.Hisp_Latino/result.attributes.Population<0.5)
                var fillSymbol = new SimpleFillSymbol({
                  color:[125,125,125],
                  outline: { // autocasts as new SimpleLineSymbol()
                    color: "darkgrey",
                    width: 0.7
                  }
                });
                  break;
                  case "asian":
                  if(result.attributes.Asian_alone/result.attributes.Population<0.5)
                  var fillSymbol = new SimpleFillSymbol({
                    color:[125,125,125],
                    outline: { // autocasts as new SimpleLineSymbol()
                      color: "darkgrey",
                      width: 0.7
                    }
                  });
                    break;
              default:

            }
            var polygonGraphic = new Graphic({
              geometry: result.geometry,
              symbol: fillSymbol
            });
            gl.graphics.add(polygonGraphic);
            map.reorder(gl,0);

          }
        });
        // console.log(registry[year]);
      });
  }

  function changeMayorYear(year){
    year = "Turnout "+year;
    gl.removeAll();
    features.forEach(function(result, index) {
        // console.log(result);
        var ward = parseInt(result.attributes.WARD_PRECINCT.substring(0,2)).toString();
        var precinct = parseInt(result.attributes.WARD_PRECINCT.substring(2,4)).toString();
        trv.forEach(function(obj){
          if(ward === obj.Ward && precinct === obj.Precinct){

            // console.log(year);
            var candidate1 = parseInt(obj[year].substring(0,obj[year].length-1));

            if(candidate1 <= 35 && candidate1 >30 || candidate1 >= 40){
              var fillSymbol = new SimpleFillSymbol({
                color:[180, 14, 0, 0.9],
                outline: { // autocasts as new SimpleLineSymbol()
                  color: "darkgrey",
                  width: 0.7
                }
              });
            }
            else{
              var fillSymbol = new SimpleFillSymbol({
                color:[0,166,180, 0.9],
                outline: { // autocasts as new SimpleLineSymbol()
                  color: "darkgrey",
                  width: 0.7
                }
              });
            }
            var polygonGraphic = new Graphic({
              geometry: result.geometry,
              symbol: fillSymbol
            });
            gl.graphics.add(polygonGraphic);
            map.reorder(gl,0);
          }
        });
      });
  }
  // var precinctsCtrl = dom.byId("precincts");
  // on(precinctsCtrl, "change", function() {
  //         gl.visible = gl.checked;
  //         fl.visible = precinctsCtrl.checked;
  //         // console.log("changed");
  // });
  // console.log(features);
});


}

function init(){
  google.charts.load('current', {'packages':['corechart']});
  $('.button-collapse').sideNav({
      menuWidth: 300, // Default is 240
      edge: 'left', // Choose the horizontal origin
      // closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
  );
  $('.button-collapse-right').sideNav({
      menuWidth: 400, // Default is 240
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
  );
  // $.ajax({
  //      url:"localhost:3000/api/workbook",
  //      dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
  //      success:function(json){
  //          // do stuff with json (in this case an array)
  //         //  alert("Success");
  //         console.log(json);
  //      },
  //      error:function(){
  //          alert("Error");
  //      }
  // });
  // var slider = document.getElementById('slider');
  // noUiSlider.create(slider, {
  //   start: [ 2016 ],
  //   step: 1,
  //   range: {
  //     'min': [  2007 ],
  //     'max': [ 2016 ]
  //   },
  //   pips: { // Show a scale with the slider
  //     mode: 'steps',
  //     density: 10
  //   }
  // });

  $('.minimize').on("click",function(e){
    console.log(e);
    $('.minimize').addClass("hidden");
    $('.expand').removeClass("hidden");
    $("#charts").hide();
  });
  $('.expand').on("click",function(e){
    console.log(e);
    $('.expand').addClass("hidden");
    $('.minimize').removeClass("hidden");
    $("#charts").show();
  });
  initMap();
};
