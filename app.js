#!/usr/bin/env nodejs

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

io.on("connection", function(socket) {
	socket.on("nouvelutilisateur", function(pseudo) {
		socket.broadcast.emit("message", {
			pseudo: pseudo,
			message: " a rejoint le Chat !"
		});
		socket.pseudo = pseudo;
	});

	socket.on("message", function(message) {
		socket.broadcast.emit("message", {
			pseudo: socket.pseudo,
			message: message
		});
	});
});


var serverport = 8010;
server.listen(serverport, function() {
	console.log("server chat started on port : " + serverport);
});
