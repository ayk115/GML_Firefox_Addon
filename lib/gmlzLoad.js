var fileIO=require("fileOperations");

exports.gmlzMain=gmlzMain;
function gmlzMain(path)
{
	//text array is the content of the file.
	var text=fileIO.readBinaryFile(path);

	//The index of the arrays xs and ys contain the x coordinates and y coordinates respectively in the same order they were present in the original GML file.
	var coord=loadCoordinates(text,0);
	var xs=coord[0];
	var x_min=coord[2],x_max=coord[3];
	var coord=loadCoordinates(text,coord[1]);
	var ys=coord[0];
	var y_min=coord[2],y_max=coord[3];

	var indices=loadIndices(text,coord[1]);

	//Filename for temp file.
	var filename=path.split("/").pop();
	var firstname=filename.split(".");
	var first="";
	for(i=0;i<firstname.length-1;i++)
	{
		first+=firstname[i]+".";
	}
	tempFile=fileIO.createTempFile(first+"svg");
	var ret=createFileData(tempFile,xs,ys,indices,x_min,y_min,x_max,y_max);
	/*      if(tempFile.exists())
		{
		tempFile.remove();
		}
	 */
}

function loadCoordinates(text,start)
{
	var coordMap={};
	var curr_char="",key="";
	var numString=[];
	var token="string";
	var max_index=0,factor=1,curr_index=0;
	for(i=start;i<text.length;i++)
	{
		var c=text[i];
		if(c==254)
		{
			break;
		}
		else 
		{
			if(token=="string")
			{
				curr_char=c;
				token="level";
			}
			else if(token=="level")
			{
				numString[c]=curr_char;
				if(c<6)
				{
					token="string";
				}
				else
				{
					var curr_str="";
					for(j=0;j<numString.length;j++)
					{
						curr_str+=numString[j].toString();
						if(j==0)
						{
							curr_str+=".";
						}
					}
					var ind=[];
					coordMap[curr_str]=ind;
					key=curr_str;
					token="index";
				}
			}
			else if(token=="index")
			{
				if(c==252)
				{
					coordMap[key].push(curr_index);
					curr_index=0;
					factor=1;
				}
				else if(c==253)
				{
					token="string";
					curr_index=0;
					factor=1;
				}
				else
				{
					curr_index+=c*factor;
					factor*=128;
					if(curr_index>max_index)
					{
						max_index=curr_index;
					}
				}
			}
		}
	}
	var end=i+1;
	var output=[max_index+1];
	var min=1000000000;
	var max=0;
	keys=Object.keys(coordMap);
	for(i=0;i<keys.length;i++)
	{
		for(j=0;j<coordMap[keys[i]].length;j++)
		{
			output[coordMap[keys[i]][j]]=keys[i];
			if(parseInt(keys[i])<min)
			{
				min=parseInt(keys[i]);
			}
			if(parseInt(keys[i])>max)
			{
				max=parseInt(keys[i]);
			}
		}
	}
	return [output,end,min,max];
}

function loadIndices(text, start)
{
	var ch="";
	var line=[];
	var num=[];
	var indices=[];
	for(i=start;i<text.length;i++)
		ch+=String.fromCharCode(text[i]);

	line=ch.split("\n");
	for(i=0,j=0;i<line.length;i++)
	{
		if(line[i][0]>='0' && line[i][0]<='9')
		{
			num=line[i].split(" ");
			indices[j]=[parseInt(num[0]),parseInt(num[1])];
			j++;
		}
	}
	return indices;
}

function createFileData(file,xs,ys,indices,x_min,y_min,x_max,y_max)
{
	var initial_tags="<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' height='1000' width='2000' transform='translate(0,"+y_max+") scale(1,-1) scale(80) translate(-"+x_min+",-"+(y_max+1)+")'>\n";
	var final_tags="</svg>";
	var intermediate="";
	var g_tag_start="<g>\n<polygon points=\"";
	var g_tag_end="\"/>\n</g>"

		for(i=0;i<indices.length;i++)
		{
			intermediate+=g_tag_start;
			for(j=indices[i][0];j<=indices[i][1];j++)
			{
				x=xs[j];
				y=ys[j];
				intermediate+=x+','+y+'\n';
			}
			intermediate+=g_tag_end;
		}

	var data=initial_tags+intermediate+final_tags;
	return fileIO.writeDataToFile(file,data);
}

