var fileIO=require("fileOperations");
var gmlzLoad=require("gmlzLoad");
var gmlLoad=require("gmlLoad");

function main()
{
	var buttons = require('sdk/ui/button/action');

	var button = buttons.ActionButton({
	id: "mozilla-link",
	label: "Visit Mozilla",
	icon: {
	"16": "./icon-16.png",
	"32": "./icon-32.png",
	"64": "./icon-64.png"
	},
	onClick: loadFile
	});
}
main();


function loadFile(state)
{
	var path=fileIO.filePicker();
        
	var filename=path.split("/").pop();

	var fileExt=filename.split(".").pop();

	if(fileExt=="gmlz")
	{
		gmlzLoad.gmlzMain(path);
	}
	else if(fileExt=="gml")
	{
		gmlLoad.gmlMain(path);
	}
	else
	{
		console.log("error reading file!");
	}
}

exports.newTab=newTab;
function newTab(path)
{
	var tabs = require("sdk/tabs");
	tabs.open(path);
}
