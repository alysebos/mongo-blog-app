"use strict";
exports.DATABASE_URL =
	process.env.DATABASE_URL || 'mongodb://localhost/blogAppDb';
exports.TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-blogAppDb';
exports.PORT =process.env.PORT || 8080;