const {Cc, Ci, Cu, components} = require("chrome");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");

exports.filePicker=filePicker;
function filePicker()
{
	var nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);

	var window = require("sdk/window/utils")
		.getMostRecentBrowserWindow();

	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	fp.appendFilter("Gml files", "*.gml; *.gmlz");

	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		var file = fp.file;
		var path = fp.file.path;
	        return path;
	}
}

exports.folderSelector = folderSelector;
function folderSelector()
{
	var nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);
        
	var window = require("sdk/window/utils")
		.getMostRecentBrowserWindow();

	fp.init(window, "Select path to save the file", nsIFilePicker.modeGetFolder);
	
        var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) 
        {
                var dir = fp.file;
                var path = dir.path;
	        return path;
	}
//	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
}
exports.initFile=initFile;
function initFile(path)
{
	var file=new FileUtils.File(path);
	return file;
}

exports.createFile=createFile;
function createFile(path)
{
	var file = initFile(path);
        if(file.exists())
        {
                file.remove(false);
        }
        file = initFile(path);
	file.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
	return file;
}

exports.createBinaryInputStream=createBinaryInputStream;
function createBinaryInputStream(file)
{
	var fileStream = Cc['@mozilla.org/network/file-input-stream;1']
		.createInstance(Ci.nsIFileInputStream);
	fileStream.init(file, 1, 0, false);

	var binaryStream = Cc['@mozilla.org/binaryinputstream;1']
		.createInstance(Ci.nsIBinaryInputStream);

	binaryStream.setInputStream(fileStream);
	return {binaryStream:binaryStream,
	       fileStream:fileStream};
}


exports.createBinaryOutputStream=createBinaryOutputStream;
function createBinaryOutputStream(file)
{
	var fileStream = Cc['@mozilla.org/network/file-output-stream;1']
		.createInstance(Ci.nsIFileOutputStream);
	fileStream.init(file, 2, 0x200, false);

	var binaryStream = Cc['@mozilla.org/binaryoutputstream;1']
		.createInstance(Ci.nsIBinaryOutputStream);
	binaryStream.setOutputStream(fileStream);

	return {binaryStream:binaryStream,
		fileStream:fileStream};
}

exports.readAsciiFile=readAsciiFile;
function readAsciiFile(path)
{
	var file=initFile(path);	

	var fileStream = Cc['@mozilla.org/network/file-input-stream;1']
		.createInstance(Ci.nsIFileInputStream);
	fileStream.init(file, 1, 0, false);

	var converterStream = Cc['@mozilla.org/intl/converter-input-stream;1']
		.createInstance(Ci.nsIConverterInputStream);

	converterStream.init(fileStream, null, fileStream.available(),
			converterStream.DEFAULT_REPLACEMENT_CHARACTER);

	var out = {};
	converterStream.readString(fileStream.available(), out);
	var fileContents = out.value;
	fileStream.close();
	return fileContents;
}

exports.createTempFile=createTempFile;
function createTempFile(filename)
{
        console.log(filename);
	var file = FileUtils.getFile("TmpD", [filename]);
	file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
	return file;
}

var d;
var dat = require("sdk/self").data;
var tab = require("sdk/tabs");	
var self = require("sdk/self");
exports.writeDataToFile=writeDataToFile;
function writeDataToFile(file,data)
{
        //d = data;
	var ostream = FileUtils.openSafeFileOutputStream(file);

	var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Ci.nsIScriptableUnicodeConverter);

	converter.charset = "UTF-8";
	var istream = converter.convertToInputStream(data);

	// The last argument (the callback) is optional.
	NetUtil.asyncCopy(istream, ostream, function(status) 
        {
		if(components.isSuccessCode(status))
                {
		       	if(file.path.split(".").pop()=="svg")
                        {
                                tab.open("file://"+file.path);
		        	/*tab.open({
                                        url: self.data.url("../data/canvas.html"),
                                        onReady: attachScript
                                });*/
			}
		}
	});
}

function attachScript(tab){
        var worker = tab.attach({
                contentScriptFile: [dat.url("jquery.min.js"), dat.url("OpenLayers.js"), dat.url("canvas.js")]
        });
        worker.port.emit("sending-data", d.getNodes());
};

