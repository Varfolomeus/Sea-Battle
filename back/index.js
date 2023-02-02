// Dependencies
const session = require("express-session");
const express = require("express");
const fs = require("fs");
const path = require("path");

const PartyManager = require("./src/PartyManager");
const pm = new PartyManager();

// Create ExpressJS
const app = express();
const http = require("http").createServer(app);

// Socket part
const io = require("socket.io")(http);
const port = 3000;

// Sessions
const sessionMiddleware = session({
	secret: "s3Cur3",
	name: "sessionId",
});

app.set("trust proxy", 1); // trust first proxy
app.use(sessionMiddleware);

// Static content output
app.use(express.static("./../front/"));

// Default
app.use("*", (req, res) => {
	res.type("html");
	res.send(fs.readFileSync(path.join(__dirname, "./../front/index.html")));
});

// Launch
http.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

// Socket listen
io.on("connection", (socket) => {
	pm.connection(socket);
	io.emit("playerCount", io.engine.clientsCount);

	// Disconnect
	socket.on("disconnect", () => {
		pm.disconnect(socket);
		io.emit("playerCount", io.engine.clientsCount);
	});

});
