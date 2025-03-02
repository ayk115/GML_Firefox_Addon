$('#stage').text("changed");

self.port.on("sending-data", handleData);

function handleData(data)
{
	console.log(data.nodes.length);
       drawLayer(data.nodes);
}

function drawLayer(nodeList)
{
    var map = new OpenLayers.Map('map');
    var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'} );
    map.addLayer(layer);
    map.zoomToExtent(new OpenLayers.Bounds(-3.922119,44.335327,4.866943,49.553833));
    
/*    var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer");

    var points = [
        new OpenLayers.Geometry.Point(78.467761,17.307301),
        new OpenLayers.Geometry.Point(-78.467761,17.307301),
        new OpenLayers.Geometry.Point(-78.467761,117.307301),
        new OpenLayers.Geometry.Point(78.467761,117.307301)
    ];
    var ring = new OpenLayers.Geometry.LinearRing(points);
    var polygon = new OpenLayers.Geometry.Polygon([ring]);

    // create some attributes for the feature
    var attributes = {name: "my name", bar: "foo"};

    var feature = new OpenLayers.Feature.Vector(polygon, attributes);
 //   var layer = new OpenLayers.Layer.Vector("Test");
    polygonLayer.addFeatures([feature]);
    map.addLayer(polygonLayer);
	
*/	var nodes = nodeList.getNodes();
    var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer");
    var features = [];
    for(i=0; i<nodes.length; i++)
    {
    	var xs = nodes[i].Xs();
    	var ys = nodes[i].Ys();
    	var rings = [];
    	for(j=0; j<xs.length; j++)
    	{
    		var points = [];
    		for(k=0; k<xs[j].length; k++)
    		{
    			var point = new OpenLayers.Geometry.Point(xs[j][k], ys[j][k]);
    			points.push(point);
    		}
	        rings.push(new OpenLayers.Geometry.LinearRing(points));
    	}
        var polygon = new OpenLayers.Geometry.Polygon(rings);
        var attributes = nodes[i].Properties();

        features.push(new OpenLayers.Feature.Vector(polygon, attributes));
    }

	polygonLayer.addFeatures(features);
    map.addLayer(polygonLayer);
}
