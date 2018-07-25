"use strict";
const express = require("express");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const { PORT, DATABASE_URL } = require("./config");
const postsRouter = require("./posts-router");
const authorsRouter = require("./authors-router");

const app = express();
app.use(express.json());
app.use("/posts", postsRouter);
app.use("/authors", authorsRouter);



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