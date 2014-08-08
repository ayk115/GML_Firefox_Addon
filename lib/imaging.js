var fileIO=require("fileOperations");

exports.createImage=createImage;
function createImage(data,path)
{
	var initial_tags="<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' height='1000' width='1000' transform='translate(0,"+data.getMaxPoints().ymax+") scale(1,-1) scale(80) translate(-"+data.getMinPoints().xmin+",-"+(data.getMaxPoints().ymax+1)+")'>\n";
	var final_tags="</svg>";
	var intermediate="";
	var g_tag_start="<g>\n<polygon points=\"";
	var g_tag_end="\"/>\n</g>";

	nodes=data.getNodes();
	for(i=0;i<nodes.length;i++)
	{
		xs=nodes[i].Xs();
		ys=nodes[i].Ys();
		for(j=0;j<xs.length;j++)
		{
			intermediate+=g_tag_start;
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

