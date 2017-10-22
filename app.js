 String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
};

 // Layers
  var layers = [
    new ol.layer.Tile({
      name: "Natural Earth", 
      minResolution: 306,
        source: new ol.source.XYZ(
      { url: 'https://{a-d}.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy/{z}/{x}/{y}.png',
        attributions: [new ol.Attribution({ html: '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' })] 
        })
    })
  ];

  // The map
  var map = new ol.Map
    ({  target: 'map',
      view: new ol.View
      ({  zoom: 5,
        center: [261720, 5951081]
      }),
      controls: ol.control.defaults({ "attribution": false }),
      layers: layers
    });

  // Style
  function getStyle(feature)
  {
    return [ new ol.style.Style(
      { image: new ol.style.RegularShape({
          fill: new ol.style.Fill({color: [0,0,255,0.4]}),
          stroke: new ol.style.Stroke({color: [0,0,255,1],width: 1}),
          radius: 10,
          points: 3,
          angle: feature.get('angle')||0
        }),
        fill: new ol.style.Fill({color: [0,0,255,0.4]}),
        stroke: new ol.style.Stroke({color: [0,0,255,1],width: 1})
      })];
  }
  
  // New vector layer
  var vector = new ol.layer.Vector(
  { name: 'Vecteur',
    source: new ol.source.Vector(),
    style: getStyle
  });

  map.addLayer(vector);
  //vector.getSource().addFeature(new ol.Feature(new ol.geom.Polygon([[[34243, 6305749], [-288626, 5757848], [210354, 5576845], [34243, 6305749]]])));
  
  var point_a = [5.9559111595,45.8179931641];
  var point_b = [10.4920501709,45.8179931641];
  var point_c = [10.4920501709,47.808380127];
  var point_d = [5.9559111595,47.808380127];

  var point_a_p = ol.proj.transform(point_a, 'EPSG:4326','EPSG:3857');
  var point_b_p = ol.proj.transform(point_b, 'EPSG:4326','EPSG:3857');
  var point_c_p = ol.proj.transform(point_c, 'EPSG:4326','EPSG:3857');
  var point_d_p = ol.proj.transform(point_d, 'EPSG:4326','EPSG:3857');

  var the_feature = new ol.Feature(new ol.geom.Polygon([[point_a_p,point_b_p,point_c_p,point_d_p,point_a_p]]));
  vector.getSource().addFeature(the_feature);
  var geometry = the_feature.getGeometry();
  console.log(the_feature);
  log_change(the_feature.O.geometry.A);

  var style = false;
  /** Style the transform handles for the current interaction
  */
  function setHandleStyle()
  { 
    if (!interaction instanceof ol.interaction.Transform){
      return;
    }
    if (!style)
    { // Style the rotate handle
      var circle = new ol.style.RegularShape({
              fill: new ol.style.Fill({color:[255,255,255,0.01]}),
              stroke: new ol.style.Stroke({width:1, color:[0,0,0,0.01]}),
              radius: 8,
              points: 10
            });
      interaction.setStyle ('rotate',
          new ol.style.Style(
          { text: new ol.style.Text (
              { text:'\uf0e2', 
                font:"16px Fontawesome",
                textAlign: "left",
                fill:new ol.style.Fill({color:'red'})
              }),
            image: circle
          }));
      // Center of rotation
      interaction.setStyle ('rotate0',
          new ol.style.Style(
          { text: new ol.style.Text (
              { text:'\uf0e2', 
                font:"20px Fontawesome",
                fill: new ol.style.Fill({ color:[255,255,255,0.8] }),
                stroke: new ol.style.Stroke({ width:2, color:'red' })
              }),
          }));
      // Style the move handle
      interaction.setStyle('translate',
          new ol.style.Style(
          { text: new ol.style.Text (
              { text:'\uf047', 
                font:"20px Fontawesome", 
                fill: new ol.style.Fill({ color:[255,255,255,0.8] }),
                stroke: new ol.style.Stroke({ width:2, color:'red' })
              })
          }));
      // Style the strech handles
      /* uncomment to style * /
     
      /**/
       interaction.setStyle ('scaleh1', 
          new ol.style.Style(
          { text: new ol.style.Text (
              { text:'\uf07d', 
                font:"bold 20px Fontawesome", 
                fill: new ol.style.Fill({ color:[255,255,255,0.8] }),
                stroke: new ol.style.Stroke({ width:2, color:'red' })
              })
          }));
      interaction.style.scaleh3 = interaction.style.scaleh1;
      interaction.setStyle('scalev',
          new ol.style.Style(
          { text: new ol.style.Text (
              { text:'\uf07e', 
                font:"bold 20px Fontawesome", 
                fill: new ol.style.Fill({ color:[255,255,255,0.8] }),
                stroke: new ol.style.Stroke({ width:2, color:'red' })
              })
          }));
      interaction.style.scalev2 = interaction.style.scalev;
      style = true;
    }
    else
    { interaction.setDefaultStyle ();
    }
    // Refresh
    interaction.set('translate', interaction.get('translate'));
  };

  /** Set properties
  */
  function setPropertie (p)
  { 
    interaction.set(p, $("#"+p).prop('checked'));
    if (!$("#scale").prop("checked")) $("#stretch").prop('disabled', true);
    else $("#stretch").prop('disabled', false);
  }

  function setAspectRatio (p)
  { if ($("#"+p).prop('checked')) interaction.set("keepAspectRatio", ol.events.condition.always);
    else interaction.set("keepAspectRatio", function(e){ return e.originalEvent.shiftKey });
  }

  function log_change(A)
  {
      var geomString = get_json_string(A); 
      var csv = convert_gjson_to_csv(A);
      var geomString_2 =get_csv_string(csv);

      $("#pol_coords").text(geomString);
      $("#pol_coords_2").text(geomString_2);
  }

  function get_csv_string(csv){
    var geomString="";
    var index;
    var x;
    var y;
    for (index = 0; index < csv.length; index++) {
      var point = csv[index];
      point = project_point(point);
      x = point[0];
      y = point[1];
      geomString= geomString + x + ", " + y + ", ";
    }
    geomString = geomString.substring(0, geomString.length-2);
    return geomString;
  }

  function get_json_string(A){
    var geomString="";
    var x;
    var y;
    var step;
    for (step = 0; step < A.length; step=step+2) {
        // Runs 5 times, with values of step 0 through 4.
        x = A[step];
        y = A[step+1];
        var point = [x,y];
        point = project_point(point);
        geomString=geomString + "[" + point[0] + ", " + point[1] + "],";
      }
    geomString = geomString.substring(0, geomString.length-1);
    return geomString;
  }

  function convert_gjson_to_csv(A)
  {
    var result = [];
    var step;
    for (step=0; step <5; step=step+4){
      var x = A[step];
      var y = A[step+1];
      var point = [];
      point.push(x);
      point.push(y);
      result.push(point);
    }
    return result;
  }

  function project_point(point){
    var proj=$('#coord_drop').val();
    if (proj !== "3857"){
      return ol.proj.transform(point, 'EPSG:3857', 'EPSG:{0}'.format(proj));
    }else{
      return point;
    }
  }

  function convert_csv_to_gjson(C)
  {
    var result = [];
    var point_1 = C[0];
    var point_2 = C[1];

    var x_1 = point_1[0];
    var y_1 = point_1[1];
    var x_2 = point_2[0];
    var y_2 = point_2[1];

    var g_point_1 = [x_1,y_1];
    var g_point_2 = [x_2, y_1];   
    var g_point_3 = [x_2,y_2];
    var g_point_4 = [x_1, y_2];

    result.push(g_point_1[0]);
    result.push(g_point_1[1]);
    result.push(g_point_2[0]);
    result.push(g_point_2[1]);
    result.push(g_point_3[0]);
    result.push(g_point_3[1]);
    result.push(g_point_4[0]);
    result.push(g_point_4[1]);
    result.push(g_point_1[0]);
    result.push(g_point_1[1]);
    return result;
  }
  function geometryChanged(evt){
    console.log("geometry changed!!!");
    console.log(evt);
    log_change(evt.target.A);
  }
  geometry.on('change', geometryChanged, this);

  var interaction = new ol.interaction.Transform (
    { translateFeature: $("#translateFeature").prop('checked'),
      scale: $("#scale").prop('checked'),
      rotate: $("#rotate").prop('checked'),
      keepAspectRatio: $("#keepAspectRatio").prop('checked') ? ol.events.condition.always : undefined,
      translate: $("#translate").prop('checked'),
      stretch: $("#stretch").prop('checked'),
    });
  map.addInteraction(interaction);
  // Style handles
  // Events handlers
  var startangle = 0;
  var d=[0,0];
  /*interaction.on (['rotatestart','translatestart'], function(e)
    { // Rotation
      startangle = e.feature.get('angle')||0;
      // Translation
      d=[0,0];
    });
  interaction.on('rotating', function (e)
    { $('#info').text("rotate: "+((e.angle*180/Math.PI -180)%360+180).toFixed(2)); 
      // Set angle attribute to be used on style !
      e.feature.set('angle', startangle - e.angle);
    });
  interaction.on('translating', function (e)
    { 
      d[0]+=e.delta[0];
      d[1]+=e.delta[1];
    });
  interaction.on('scaling', function (e)
    { 
      console.log(e);
    });*/
  interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
    e.oldgeom.un("change", geometryChanged);
    geometry = e.feature.O.geometry; 
    geometry.on('change', geometryChanged);
    if (e.type==='rotateend' || e.type==='scaleend'){
      log_change(e.feature.O.geometry.A);
    }
    console.log(e);
  });

  $( "#coord_drop" ).change(function() {
    log_change(geometry.A);
  });

  setPropertie("rotate");

  function csvstringtoarray(csv_string){
    var result=[];
    var values = csv_string.split(",").map(function(item) {
      return item.trim();
    });
    var index;
    for (index=0;index<3;index=index+2){
      var x = values[index];
      var y = values[index+1];
      var point = [x,y];
      result.push(point);
    }
    return result;
  }

  $("#change_geom").click(function(){
     var my_string = $("#pol_coords_2").text();
     console.log(my_string);
     var csv = csvstringtoarray(my_string);
     console.log(csv);
     var gjson = convert_csv_to_gjson(csv);
     console.log(gjson);
     var coords=[];
     var index;
     for (index=0;index<9;index=index+2){
      var coord=[];
      var x=gjson[index];
      var y=gjson[index+1];
      coord.push(x);
      coord.push(y);
      var proj=$('#coord_drop').val();
      if (proj !== "3857"){
        coord=ol.proj.transform(coord, 'EPSG:{0}'.format(proj),'EPSG:3857');
      }     
      coords.push(coord);
     }
    console.log(coords);
     geometry.setCoordinates([coords]);
  });

  