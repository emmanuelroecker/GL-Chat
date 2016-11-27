"use strict";

var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var toDoList = [];

app.use(express.static("public"));

io.on("connection", function(socket) {
	console.log("connection");
	socket.emit("taches", toDoList);

	socket.on("ajouterTache", function(tache) {
		if (toDoList.indexOf(tache) >= 0) {
			socket.emit("erreur", "La tâche '" + tache + "' existe déjà !");
		} else {
			toDoList.push(tache);
			socket.broadcast.emit("taches", toDoList);
			socket.emit("taches", toDoList);
		}
	});

	socket.on("supprimerTache", function(tache) {
		var index = toDoList.indexOf(tache);
		if (index < 0) {
			socket.emit("erreur", "La tâche '" + tache + "' n'existe pas !");
		} else {
			toDoList.splice(index, 1);
			socket.broadcast.emit("taches", toDoList);
			socket.emit("taches", toDoList);
		}
	});
});

server.listen(8080);
