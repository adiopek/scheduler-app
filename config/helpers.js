var path = require('path');

function absolutePath(stringPath) {
	return path.join(__dirname,'..',stringPath);
}
exports.absolutePath = absolutePath;