const express = require('express');
const postsRouter = express.Router();

const { Author, BlogPost } = require('./models');

// GET to /posts should get all posts
postsRouter.get("/", (req, res) => {
	BlogPost.find()
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
postsRouter.get("/:id", (req, res) => {
	BlogPost.findById(req.params.id)
		.then(post =>  res.json(post.serializeComments()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

// POST to /posts should post
postsRouter.post("/", (req, res) => {
	// check if the required keys are in the req body
	const requiredFields = ["title", "content", "author_id"];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).json({ message: message });
		};
	};

	// Find the author and if there is one, post the post
	Author
		.findById(req.body.author_id)
		.then(author => {
			if (author) {
				BlogPost
					.create({
						title: req.body.title,
						content: req.body.content,
						author: req.body.author_id,
						created: Date.now()
					})
					.then(post => res.status(201).json(post.serializeComments()))
					.catch(err => {
						console.log(err);
						res.status(500).json({ message: "Internal server error" });
					});
			}
			else {
				// There is no author so error
				const message = `There is no author with ID \`${req.body.author_id}\``;
				console.error(message);
				return res.status(400).json({ message: message });
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "What?" });
		});

});

// PUT to /posts/:id should update
postsRouter.put("/:id", (req, res) => {
	// id in req path and body match
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = `Request path ID \`${req.params.id}\` and request body id \`${req.body.id}\` must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}

	// Only certain fields may be updated
	const toUpdate = {};
	const updateableFields = ["title", "content"];

	// this adds the updates to the toUpdate object
	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPost
		.findByIdAndUpdate(req.params.id, { $set: toUpdate }, {new: true})
		.then(post => res.status(200).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" })
		});
});

// DELETE to /posts/:id should delete
postsRouter.delete("/:id", (req, res) => {
	BlogPost.findByIdAndRemove(req.params.id)
	.then(post => res.status(204).end())
	.catch(err => {
		console.log(err);
		res.status(500).json({ message: "Internal server error" });
	});
});

module.exports = postsRouter;