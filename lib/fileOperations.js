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
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		var file = fp.file;
		var path = fp.file.path;
	}
	return path;
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
	var file=initFile(path);
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

	var file = FileUtils.getFile("TmpD", [filename]);
	file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
	return file;
}


exports.writeDataToFile=writeDataToFile;
function writeDataToFile(file,data)
{
	var newTabFunc=require("main");
	
	var ostream = FileUtils.openSafeFileOutputStream(file);

	var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Ci.nsIScriptableUnicodeConverter);

	converter.charset = "UTF-8";
	var istream = converter.convertToInputStream(data);

	// The last argument (the callback) is optional.
	NetUtil.asyncCopy(istream, ostream, function(status) {
			if(components.isSuccessCode(status)){
			if(file.path.split(".").pop()=="svg"){
			newTabFunc.newTab(file.path);
			}
			}
			});
}

