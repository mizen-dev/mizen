const rootConfig = require("../../babel.config.js");

module.exports = {
	plugins: rootConfig.plugins,
	presets: ["next/babel"],
};
