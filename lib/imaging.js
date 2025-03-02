var fileIO=require("fileOperations");
var utils = require('sdk/window/utils');

exports.createImage=createImage;
function createImage(data,path)
{
        var width = (data.getMaxPoints().xmax - data.getMinPoints().xmin);
        var height = (data.getMaxPoints().ymax - data.getMinPoints().ymin);
        var active = utils.getMostRecentBrowserWindow();
        var scale = active.innerWidth/width;
        width *= scale;
        height *= scale;
	var initial_tags="<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' height='"+height+"' width='"+width+"' transform='scale("+scale+",-"+scale+") translate(-"+data.getMinPoints().xmin+",-"+(data.getMaxPoints().ymax)+")'>\n";
	var final_tags="</svg>";
	var intermediate="";
	var g_tag_start="<g>\n<polygon id=\"";
        var points=" points=\"";
	var g_tag_end="\"/>\n</g>";

	nodes=data.getNodes();
	for(i=0;i<nodes.length;i++)
	{
		xs=nodes[i].Xs();
		ys=nodes[i].Ys();
                prop = nodes[i].Properties()["DIST"];
		for(j=0;j<xs.length;j++)
		{
			intermediate += g_tag_start;
                        intermediate += prop + "\"" + points;
			for(k=0;k<xs[j].length;k++)
			{
				intermediate+=xs[j][k]+','+ys[j][k]+'\n';
			}
			intermediate+=g_tag_end;
		}
	}

	var fileData=initial_tags+intermediate+final_tags;
	var filename=getFileName(path)+"svg";
	var file=fileIO.createTempFile(filename);
	fileIO.writeDataToFile(file,fileData);
        return file.path;
}

function getFileName(path)
{
	var filename=path.split("/").pop();
	var firstname=filename.split(".");
	var first="";
	for(i=0;i<firstname.length-1;i++)
	{
		first+=firstname[i]+".";
	}
	return first;
}

