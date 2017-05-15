"use strict";

var messagesElt = document.getElementById("messages");

function addMessage(timestamp, pseudo, message) {
    var pElt = document.createElement("p");
    if (pseudo) {
        var pseudoElt = document.createElement("span");
        pseudoElt.classList.add("pseudo");
        pseudoElt.textContent = pseudo;
        pElt.appendChild(pseudoElt);
    }

    var timestampElt = document.createElement("span");
    timestampElt.classList.add("timestamp");
    timestampElt.textContent = timestamp;
    pElt.appendChild(timestampElt);
    var messageElt = document.createElement("span");
    messageElt.classList.add("message");
    messageElt.textContent = message;
    pElt.appendChild(messageElt);

    messagesElt.appendChild(pElt);
}

function sendMessage(message) {
    addMessage(new Date().toLocaleString(), pseudo, messageElt.value);
    socket.emit("newmessage", messageElt.value);
    messageElt.value = "";
}

var serverHost = window.location.protocol + "//" + window.location.host;
var socketOptions = {};
if (window.location.pathname !== "/") {
    socketOptions = { path: window.location.pathname + '/socket.io' };
}
var socket = io.connect(serverHost, socketOptions);

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

socket.on("newmessage", function(message) {
    addMessage(message.timestamp, message.user, message.message);
});

socket.on("messages", function(messages) {
    messages.forEach(function(message) {
        addMessage(message.timestamp, message.user, message.message);
    });
});

var pseudo = prompt("Quel est votre pseudo ?");
socket.emit("newuser", pseudo);
addMessage(new Date().toLocaleString(), null, "Bonjour " + pseudo + " !");