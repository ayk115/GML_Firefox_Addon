const {Cc,Cu,Ci,components} = require("chrome");
var fileIO=require("fileOperations");
var datastore=require("datastore");
var imaging=require("imaging");

exports.gmlzMain=gmlzMain;
function gmlzMain(path)
{
	var file=fileIO.initFile(path);
	
	var fs=fileIO.createBinaryInputStream(file);

	var xs=loadCoordinates(fs.binaryStream);
	var ys=loadCoordinates(fs.binaryStream);
	var data=loadGmlData(fs.binaryStream,xs,ys);

	var g=data.getMaxPoints();
	console.log(g.xmax+","+g.ymax);
/*	var t=data.getNodes();
	for(i=0;i<1;i++)
	{
		xs=t[i].Ys();
		for(j=0;j<xs.length;j++)
		{
			console.log(xs[j]);
		}
	}
*/	fs.binaryStream.close();
	fs.fileStream.close();

	imaging.createImage(data,path);
}

function loadCoordinates(binaryStream)
{
	var coordMap={};
	var numString=[];
	var nodeCount=binaryStream.read32();
	for(i=0;i<nodeCount;i++)
	{
		var curr=0;
		while(curr<6)
		{		
			curr=binaryStream.read8();
			numString[curr]=binaryStream.read8();
		}

		var coordinate="";
		for(j=0;j<numString.length;j++)
		{
			coordinate+=numString[j];
			if(j==0)
			{
				coordinate+='.';
			}
		}
		
		var indexCount=binaryStream.read8();
		for(j=0;j<indexCount;j++)
		{
			var modCount=binaryStream.read8();
			var factor=1;
			var currIndex=0;
			for(k=0;k<modCount;k++)
			{
				currIndex+=binaryStream.read8()*factor;
				factor*=128;
			}
			if(!(coordinate in coordMap))
			{
				var vec=[];
				coordMap[coordinate]=vec;
			}
			coordMap[coordinate].push(currIndex);
		}
	}
	
	keys=Object.keys(coordMap);
	indexedCoords=[];
	for(i=0;i<keys.length;i++)
	{
		for(j=0;j<coordMap[keys[i]].length;j++)
		{
			indexedCoords[coordMap[keys[i]][j]]=keys[i];
		}
	}
	return indexedCoords;

}

function loadGmlData(binaryStream,xs,ys)
{
	var data=new datastore.datastore();
	var nodeCount=binaryStream.read32();
	for(i=0;i<nodeCount;i++)
	{
		var node=new datastore.gmlNode();

		var propCount=binaryStream.read8();
		for(j=0;j<propCount;j++)
		{
			var str="",value="",key="";
		
			while(1)
			{
				var c=String.fromCharCode(binaryStream.read8());
				if(c=='\n')
				{
					value=str;
					break;
				}
				else if(c==':')
				{
					key=str;
					str="";
				}
				else
					str+=c;
			}
			node.addProperty(key,value);
		}

		var indexCount=binaryStream.read8();
		for(j=0;j<indexCount;j++)
		{
			var start=binaryStream.read32();
			var end=binaryStream.read32();
			var coordSetX=[],coordSetY=[];

			for(k=start;k<end;k++)
			{
				coordSetX.push(xs[k]);
				coordSetY.push(ys[k]);
			}
			node.addCoord(coordSetX,coordSetY);
		}
		
		data.addNode(node);
	}
	return data;
}
