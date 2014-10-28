var buttons = require("sdk/ui/button/action");
var toggleButtons = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var self = require("sdk/self");
var fileIO=require("fileOperations");
var gmlzLoad=require("newgmlzLoad");
var gmlLoad=require("gmlLoad");

var panel = panels.Panel({
        width: 600,
        height: 300,
        contentURL: self.data.url("panel.html"),
        onHide: handleHide
});

var button = toggleButtons.ToggleButton({
        id: "my-button",
        label: "my-button",
	icon: {
	        "16": "./icon-16.png",
	        "32": "./icon-32.png",
	        "64": "./icon-64.png"
	},
	onClick: function() {
                panel.show();
        }
});

var savePath = {
        gmlzPath: '',
        svgPath: ''
};

panel.port.on("selectFile", function() {
        var path = fileIO.filePicker();
        panel.port.emit("inputPath", path);
        panel.show();
});

panel.port.on("selectFolder", function(type) {
        if(type == 'gmlz')
        {
                savePath.gmlzPath = fileIO.folderSelector();
                panel.port.emit("gmlzPath", savePath.gmlzPath);
        }
        else if(type == 'svg')
        {
                savePath.svgPath = fileIO.folderSelector();
                panel.port.emit("svgPath", savePath.svgPath);
        }
        panel.show();
});

panel.port.on("close", function() {
        panel.hide();
});

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


