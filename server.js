"use strict";
const express = require("express");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const { PORT, DATABASE_URL } = require("./config");
const { Blog } = require("./models");

const app = express();
app.use(express.json());

// GET to /posts should get all posts
app.get("/posts", (req, res) => {
	Blog.find()
		.then(posts => {
			res.json({
				posts: posts.map(post => post.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

// GET to /posts/:id should get that id only
app.get("/posts/:id", (req, res) => {
	Blog.findById(req.params.id)
		.then(post =>  res.json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

// POST to /posts should post
app.post("/posts", (req, res) => {
	// check if the required keys are in the req body
	const requiredFields = ["title", "content", "author"];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).json({ message: message });
		}
	}

	Blog.create({
		title: req.body.title,
		content: req.body.content,
		author: {
			firstName: req.body.author.firstName,
			lastName: req.body.author.lastName
		},
		created: req.body.created || new Date()
	})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.log(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

// PUT to /posts/:id should update
app.put("/posts/:id", (req, res) => {
	// id in req path and body match
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = `Request path ID \`${req.params.id}\` and request body id \`${req.body.id}\` must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}

	// Only certain fields may be updated
	const toUpdate = {};
	const updateableFields = ["title", "content", "author"];

	// this adds the updates to the toUpdate object
	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Blog
		.findByIdAndUpdate(req.params.id, { $set: toUpdate }, {new: true})
		.then(post => res.status(200).json(post.serialize()))
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

// DELETE to /posts/:id should delete
app.delete("/posts/:id", (req, res) => {
	Blog.findByIdAndRemove(req.params.id)
	.then(post => res.status(204).end())
	.catch(err => {
		console.log(err);
		res.status(500).json({ message: "Internal server error" });
	});
});

// 404 error if used a nonexistent endpoint
app.use("*", (req, res) => {
	res.status(404).json({ message: "Not Found" });
});

// initializes server so closeServer can use it
let server;

// runServer connects to the DB
function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(
			databaseUrl,
			err => {
				if (err) {
					return reject(err);
				}
				server = app
					.listen(port, () => {
						console.log(`Your app is listening on port ${port}`);
						resolve();
					})
					.on("error", err => {
						mongoose.disconnect();
						reject(err);
					});
				}
			);
	});
}

// closeServer
function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log("Closing server");
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer };