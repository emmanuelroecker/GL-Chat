var messagesElt = document.getElementById("messages");

function addMessage(pseudo, message) {
	var pElt = document.createElement("p");
	if (pseudo) {
		var pseudoElt = document.createElement("span");
		pseudoElt.classList.add("pseudo");
		pseudoElt.textContent = pseudo;
		pElt.appendChild(pseudoElt);
	}

	var messageElt = document.createElement("span");
	messageElt.classList.add("message");
	messageElt.textContent = message;
	pElt.appendChild(messageElt);

	messagesElt.appendChild(pElt);
}

function sendMessage(message) {
	addMessage(pseudo, messageElt.value);
	socket.emit("message", messageElt.value);
	messageElt.value = "";
}

var serverHost = "http://" + window.location.host;
console.log(serverHost);
var socket = io.connect(serverHost, { path: '/chat/socket.io'});

var envoyerElt = document.getElementById("envoyer");
var messageElt = document.getElementById("message");
envoyerElt.addEventListener("click", function(e) {
	sendMessage();
});

messageElt.addEventListener("keydown", function(e) {
	if (e.keyCode === 13) {
		sendMessage();
	}
});

socket.on("message", function(message) {
	addMessage(message.pseudo, message.message);
});

var pseudo = prompt("Quel est votre pseudo ?");
socket.emit("nouvelutilisateur", pseudo);
addMessage(null, "Bonjour " + pseudo + " !");
