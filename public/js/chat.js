"use strict";

var messageElt = document.getElementById("message");
var messagesElt = document.getElementById("messages");

function addMessage(pseudo, message) {
    var date = new Date();

    var pElt = document.createElement("p");
    if (pseudo) {
        var pseudoElt = document.createElement("span");
        pseudoElt.classList.add("pseudo");
        pseudoElt.textContent = pseudo;
        pElt.appendChild(pseudoElt);
        var timeElt = document.createElement("small");
        timeElt.textContent = " " + date.toLocaleTimeString();
        pElt.appendChild(timeElt);
        pElt.appendChild(document.createElement("br"));
    }

    var messageElt = document.createElement("span");
    messageElt.classList.add("message");
    messageElt.textContent = message;
    pElt.appendChild(messageElt);

    messagesElt.appendChild(pElt);
}

function sendMessage(message) {
    addMessage(pseudo.value, messageElt.value);
    socket.emit("message", messageElt.value);
    messageElt.value = "";
}

var serverHost = window.location.protocol + "//" + window.location.host;
var socketOptions = {};
if (window.location.pathname !== "/") {
    socketOptions = { path: window.location.pathname + '/socket.io'};
}
var socket = io.connect(serverHost, socketOptions);

var chatForm = document.getElementById("chatForm");
chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (messageElt.value.trim() !== "") {
        sendMessage();
        messageElt.focus();
    }
});

socket.on("message", function (message) {
    addMessage(message.pseudo, message.message);
});

var chatCmp = document.getElementById("chatCmp");
var pseudoForm = document.getElementById("pseudoForm");
var pseudo = document.getElementById("pseudo");
var error = document.querySelector('.error');

pseudoForm.addEventListener("submit", function (event) {
    event.preventDefault();
    
    if (pseudo.value.trim() === "") {
        error.innerHTML = "Veuillez saisir un pesudo";
        error.className = "error active";
        pseudo.focus();
    }
    else {
        socket.emit("nouvelutilisateur", pseudo.value);

        var chatTitle = document.getElementById("chatTitle");
        chatTitle.textContent = "Bonjour " + pseudo.value + " !";

        pseudoForm.style.display = "none";
        chatCmp.style.display = "flex";
        messageElt.focus();
    }
});


pseudo.addEventListener("keyup", function (event) {
    if (pseudo.value.trim() !== "") {
        error.innerHTML = "";
        error.className = "error";
        event.preventDefault();
    }
});