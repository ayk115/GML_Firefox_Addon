var Panel = {
        selectFile: function() {
                addon.port.emit("selectFile", '');
        },
        selectFolder: function(type) {
                addon.port.emit("selectFolder", type);
        },
        close: function() {
                addon.port.emit("close", '');
        }
}

addon.port.on("inputPath", function(text) {
        document.getElementById("inputPath").innerHTML = text;
});

addon.port.on("gmlzPath", function(text) {
        document.getElementById("gmlzPath").innerHTML = text;
});

addon.port.on("svgPath", function(text) {
        document.getElementById("svgPath").innerHTML = text;
});
