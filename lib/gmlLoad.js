const {Cc,Cu,Ci,components} = require("chrome");
var fileIO=require("fileOperations");
var datastore=require("datastore");
var imaging=require("imaging");

exports.gmlMain=gmlMain;
function gmlMain(path)
{
	var features=[];
	var coordinates=[];
	var data=new datastore.datastore();

	var text=fileIO.readAsciiFile(path);

	var parser = Cc["@mozilla.org/xmlextras/domparser;1"]
		.createInstance(Ci.nsIDOMParser);
	var xml=parser.parseFromString(text,"text/xml");

	features=xml.getElementsByTagName("dataFeatures")[0]
		.getElementsByTagName("gml:featureMember");

	for(i=0;i<features.length;i++)
	{
		var node=new datastore.gmlNode();

		var prop=features[i].getElementsByTagName("property");
		for(var j=0;j<prop.length;j++)
		{
			node.addProperty(prop[j].getAttribute("name")
					,prop[j].innerHTML);
		}

		var coord=features[i].getElementsByTagName
			("gml:coordinates");
		var re=new RegExp("([-+]?[0-9.]+),([0-9.]+)","g");
		var match;
		for(var j=0;j<coord.length;j++)
		{
			var coordSetX=[],coordSetY=[];
			while((match=re.exec(coord[j].innerHTML))!==null)
			{
				coordSetX.push(match[1]);
				coordSetY.push(match[2]);
			}
			node.addCoord(coordSetX,coordSetY);
		}
		data.addNode(node);
	}

	imaging.createImage(data,path);
	saveGmlz(data,path);
}

function saveGmlz(data,path)
{
	var nodes=data.getNodes();
	var startInds=[],endInds=[];
	var allPointsX=[],allPointsY=[];

	for(i=0;i<nodes.length;i++)
	{
		var xs=nodes[i].Xs();
		var ys=nodes[i].Ys();
		var start=[],end=[];
	
		for(j=0;j<xs.length;j++)
		{
			var coordSetX=xs[j];
			var coordSetY=ys[j];
		
			start.push(allPointsX.length);
			for(k=0;k<coordSetX.length;k++)
			{
				allPointsX.push(coordSetX[k]);
				allPointsY.push(coordSetY[k]);
			}
			end.push(allPointsX.length);
		}
		startInds.push(start);
		endInds.push(end);
	}

	var indicesX={};
	var indicesY={};
	for(i=0;i<allPointsX.length;i++)
	{
		var x=allPointsX[i];
		var y=allPointsY[i];

		var dot=x.indexOf('.');
		while((x.length-dot)<=6)
		{
			x+='0';
		}

		var dot=y.indexOf('.');
		while((y.length-dot)<=6)
		{
			y+='0';
		}

		if(!(x in indicesX))
		{
			var list=[];
			indicesX[x]=list;
		}
		indicesX[x].push(i);

		if(!(y in indicesY))
		{
			var list=[];
			indicesY[y]=list;
		}
		indicesY[y].push(i);
	}

	var file=fileIO.createFile(path+"z");
	var fs=fileIO.createBinaryOutputStream(file);
	
	saveCoords(fs.binaryStream,indicesX);
	saveCoords(fs.binaryStream,indicesY);
	saveProps(fs.binaryStream,nodes,startInds,endInds);

	fs.binaryStream.close();
	fs.fileStream.close();
}

function saveCoords(binaryStream,indices)
{
	var keys=Object.keys(indices);
	var previous=[];
	var prev="";
	var fileData="";
	
	binaryStream.write32(keys.length);
	for(i=0;i<keys.length;i++)
	{
		var curr=keys[i];
		var current=[];
		
		var re=new RegExp("([-+]?[0-9]+).([0-9])([0-9])([0-9])([0-9])([0-9])([0-9])");
		if(re.test(curr))
		{
			var captures=re.exec(curr);
			for(j=1;j<captures.length;j++)
			{
				current.push(captures[j]);
			}
		}
		var index=0;
		while(index<current.length && index<previous.length)
		{
			if(current[index]!=previous[index])
			{
				break;
			}
			index++;
		}
		if(index == current.length)
		{
			index--;
		}
		while(index<current.length)
		{
			binaryStream.write8(index);
			binaryStream.write8(current[index]);
			index++;
		}

		binaryStream.write8(indices[curr].length);
		
		for(j=0;j<indices[curr].length;j++)
		{
			var val=indices[curr][j];
			var printval=[];
			while(val>0)
			{
				printval.push(parseInt(val%128));
				val=parseInt(val/128);
			}
			binaryStream.write8(printval.length);
			binaryStream.writeByteArray(printval,printval.length);
		}
		prev=curr;
		previous=current;
	}
}

function saveProps(binaryStream, nodes, startInds, endInds)
{
	binaryStream.write32(nodes.length);

	for(i=0;i<nodes.length;i++)
	{
		var node=nodes[i];
		var start=startInds[i];
		var end=endInds[i];
		var prop=node.Properties();
		var propKeys=Object.keys(prop);
		
		binaryStream.write8(propKeys.length);

		for(j=0;j<propKeys.length;j++)
		{
			var codeArray=getAsciiCode(propKeys[j]+":"+prop[propKeys[j]]+"\n");
			binaryStream.writeByteArray(codeArray,codeArray.length);
		}

		binaryStream.write8(start.length);
		for(j=0;j<start.length;j++)
		{
			binaryStream.write32(start[j]);
			binaryStream.write32(end[j]);
		}
	}
}

function getAsciiCode(string)
{
	var codeArray=[];
	for(k=0;k<string.length;k++)
	{
		codeArray[k]=string[k].charCodeAt();
	}
	return codeArray;
}
