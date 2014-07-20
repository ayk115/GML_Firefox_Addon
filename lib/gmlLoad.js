const {Cc,Cu,Ci,components} = require("chrome");
var fileIO=require("fileOperations");
var datastore=require("datastore");

exports.gmlMain=gmlMain;
function gmlMain(path)
{
	var text=fileIO.readAsciiFile(path);
	var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
	var features=[];
	var coordinates=[];
	var xml=parser.parseFromString(text,"text/xml");
	features=xml.getElementsByTagName("dataFeatures")[0].getElementsByTagName("gml:featureMember");
	var data=new datastore.datastore();
	for(i=0;i<features.length;i++)
	{
		var node=new datastore.gmlNode();
		
		var prop=features[i].getElementsByTagName("property");
		for(i=0;i<prop.length;i++)
		{
			node.addProperty(prop[i].getAttribute("name"),prop[i],prop[i].innerHTML);
			console.log(prop[i].innerHTML);
		}

		var coord=features[i].getElementsByTagName("gml:coordinates");
		if(i==0)
		{
			console.log(coord[i].innerHTML);
		}

	}

}

