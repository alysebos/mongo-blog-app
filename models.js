"use strict"

const mongoose = require("mongoose");

// schema representing a blog post
const postSchema = mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String, required: true},
	author: {
		firstName: {type: String, required: true},
		lastName: {type: String, required: true}
	},
	created: {type: Date, required: true}
});

// serialize the post to show the data correctly
postSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		content: this.content,
		author: `${this.author.firstName} ${this.author.lastName}`,
		created: this.created
	};
};

const Blog = mongoose.model("Posts", postSchema);

module.exports = { Blog };