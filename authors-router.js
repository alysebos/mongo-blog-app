const express = require('express');
const authorsRouter = express.Router()

const { Author, BlogPost } = require('./models');

// POST
authorsRouter.post("/", (req, res) => {
	// check that the required fields are in the body
	const requiredFields = ["firstName", "lastName", "userName"];
	for (let i = 0; i < requiredFields.length; i++) {
		let field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).json({ message: message });
		};
	};

	// verify that the author userName is unique
	Author
		.findOne({ userName: req.body.userName })
		.then(author => {
			if (author) {
				const message = `The username \`${req.body.userName}\` is taken`;
				console.error(message);
				return res.status(400).send(message);
			}
			else {
				Author
					.create({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						userName: req.body.userName
					})
					.then(author => res.status(201).json(author.serialize()))
					.catch(err => {
						console.log(err);
						res.status(500).json({ message: "Internal server error" });
					});
			}
		})		
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "What?" });
		});
});

// PUT updates authors
authorsRouter.put("/:id", (req, res) => {
	// id in req body and path must match
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = `Request path ID \`${req.params.id}\` and request body id \`${req.body.id}\` must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}

	// set updates for the object
	const toUpdate = {};
	const updateableFields = ["firstName", "lastName", "userName"];

	// adds the updates to the update object
	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	// find if the user ID exists
	Author
		.findById(req.body.id)
		.then(author => {
			if (author) {
				// find whether the user is changing their userName
				if ("userName" in req.body) {
					Author
						.findOne({userName: req.body.userName})
						.then(author => {
							if (author) {
								const message = `The username \`${req.body.userName}\` is taken`;
								console.error(message);
								return res.status(400).json({ message: message });
							} else {
								Author
									.findByIdAndUpdate(req.body.id, { $set: toUpdate }, { new: true })
									.then(author => res.status(200).json(author.serialize()))
									.catch(err => res.status(500).json({ message: "Internal server error" }));
							}
						})
						.catch(err => {
							res.status(500).json({ message: "What? "})
						});
				} else {
					Author
						.findByIdAndUpdate(req.body.id, { $set: toUpdate }, { new: true})
						.then(author => res.status(200).json(author.serialize()))
						.catch(err => res.status(500).json({ message: "Internal serverr error" }));
				}
			} else {
				const message = `There is no author with ID \`${req.body.id}\``;
				console.error(message);
				return res.status(400).json({ message: message });
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "What?" });
		});
});

// DELETE deletes them
authorsRouter.delete("/:id", (req, res) => {
	// delete all blog posts by author
	BlogPost
		.remove({ author: req.params.id })
		.then(() => {
			Author
				.findByIdAndRemove(req.params.id)
				.then(() => {
					console.log(`Deleted author \`${ req.params.id }\` and all posts by them`);
					res.status(204).end();
				})
				.catch(err => {
					console.error(err);
					res.status(500).json({ message: "Internal server error" });
				})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

module.exports = authorsRouter;