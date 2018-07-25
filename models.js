"use strict"

const mongoose = require("mongoose");

// schema for the comments
const commentSchema = mongoose.Schema({
	content: 'string'
});

// schema for author
const authorSchema = mongoose.Schema({
	firstName: 'string',
	lastName: 'string',
	userName: { type: 'string', unique: true }
})

// schema representing a blog post
const postSchema = mongoose.Schema({
	title: 'string',
	content: 'string',
	created: { type: 'string', default: Date.now() },
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
	comments: [commentSchema]
});

// add virtual for author
postSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// use Mongoos middleware before findOne to populate the author
postSchema.pre('find', function(next) {
	this.populate('author');
	next();
});

postSchema.pre('findOne', function(next) {
	this.populate('author');
	next();
});

// serialize the post to show the data correctly / No comments
postSchema.methods.serialize = function() {
	return {
		title: this.title,
		content: this.content,
		author: `${this.authorName}`,
		created: this.created
	};
};

// serialize the post to show the comments, too
postSchema.methods.serializeComments = function() {
	return {
		title: this.title,
		content: this.content,
		author: `${this.authorName}`,
		created: this.created,
		comments: this.comments
	};
};

// serialize the post schema for authors
authorSchema.methods.serialize = function() {
	return {
		_id: this._id,
		name: `${this.firstName} ${this.lastName}`,
		userName: this.userName
	};
};

const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model("BlogPost", postSchema);

module.exports = { Author, BlogPost };