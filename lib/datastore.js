exports.gmlNode=gmlNode;
function gmlNode()
{
	var xs=[];
	var ys=[];
	var properties={};

	this.addProperty=function(key,value){
		properties[key]=value;
	};

	this.addCoord=function(x,y){
		xs.push(x);
		ys.push(y);
	};
	
	this.Xs=function(){
		return xs;
	};

	this.Ys=function(){
		return ys;
	};

	this.Properties=function(){
		return properties;
	};
}

exports.datastore=datastore;
function datastore()
{
	var nodes=[];
	var xmin=1000000000,xmax=0,ymin=1000000000,ymax=0;

	this.getNodes=function(){
		return nodes;
	};

	this.getMaxPoints=function(){
		return {xmax:xmax, 
			ymax:ymax};
	};

	this.getMinPoints=function(){
		return {xmin:xmin,
			ymin:ymin};
	};
	
	this.addNode=function(node){
		for(i=0;i<node.Xs().length;i++)
		{
			var x=parseFloat(node.Xs()[i]),y=parseFloat(node.Ys()[i]);
			if(xmin>x)
			{
				xmin=x;
			}
			if(xmax<x)
			{
				xmax=x;
			}
			if(ymin>x)
			{
				ymin=y;
			}
			if(ymax<y)
			{
				ymax=y;
			}
		}
		nodes.push(node);
	};
}
