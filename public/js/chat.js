"use strict";

var serverHost = window.location.protocol + "//" + window.location.host;
var socketOptions = {};
if (window.location.pathname !== "/") {
    socketOptions = {
        path: window.location.pathname + '/socket.io'
    };
}

var socket = null;
var messageElt = document.getElementById("message");
var usersElt = document.getElementById("users");
var messagesElt = document.getElementById("messages");
var chatCmp = document.getElementById("chatCmp");
var pseudoForm = document.getElementById("pseudoForm");
var pseudo = document.getElementById("pseudo");
var error = document.querySelector('.error');
var chatForm = document.getElementById("chatForm");

function addUser(id, user) {
    var pElt = document.createElement("p");
    pElt.setAttribute('id', id);
    var newUserElt = document.createElement("span");
    newUserElt.classList.add("user");
    newUserElt.textContent = user;
    pElt.appendChild(newUserElt);
    usersElt.appendChild(pElt);
}

function delUser(userid) {
    var pElt = document.getElementById(userid);
    if (pElt) {
        usersElt.removeChild(pElt);
    }
}

function addMessage(timestamp, pseudo, message) {
    var pElt = document.createElement("p");
    if (pseudo) {
        var pseudoElt = document.createElement("span");
        pseudoElt.classList.add("pseudo");
        pseudoElt.textContent = pseudo;
        pElt.appendChild(pseudoElt);
    }

    var timestampElt = document.createElement("small");
    timestampElt.classList.add("timestamp");
    timestampElt.textContent = timestamp;
    pElt.appendChild(timestampElt);
    pElt.appendChild(document.createElement("br"));

    var newmessageElt = document.createElement("span");
    newmessageElt.classList.add("message");
    newmessageElt.textContent = message;
    pElt.appendChild(newmessageElt);

    messagesElt.appendChild(pElt);
}

function socketEvents(socket) {
    socket.on('reconnect', function() {
        error.innerHTML = "Erreur serveur, veuillez vous reconnecter";
        error.className = "error active";
        pseudoForm.style.display = "flex";
        chatCmp.style.display = "none";
    });

    socket.on('connect_error', function(err) {
        error.innerHTML = "Erreur serveur, veuillez vous reconnecter";
        error.className = "error active";
        pseudoForm.style.display = "flex";
        chatCmp.style.display = "none";
    });

    socket.on("newmessage", function(message) {
        addMessage(message.timestamp, message.user, message.message);
        messagesElt.scrollTop = messagesElt.scrollHeight;
    });

    socket.on("messages", function(messages) {
        messagesElt.innerHTML = '';
        messages.forEach(function(message) {
            addMessage(message.timestamp, message.user, message.message);
        });
        messagesElt.scrollTop = messagesElt.scrollHeight;
    });

    socket.on("newuser", function(user) {
        addUser(user.id, user.user);
    });

    socket.on("deluser", function(id) {
        delUser(id);
    });

    socket.on("users", function(users) {
        usersElt.innerHTML = '';
        for (var id in users) {
            addUser(id, users[id]);
        }
    });
}

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    if (messageElt.value.trim() !== "") {
        socket.emit("newmessage", messageElt.value);
        messageElt.value = "";
        messageElt.focus();
    }
});


pseudoForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (pseudo.value.trim() === "") {
        error.innerHTML = "Veuillez saisir un pseudo";
        error.className = "error active";
        pseudo.focus();
    } else {
        socket = io.connect(serverHost, socketOptions);
        socketEvents(socket);
        socket.emit("newuser", pseudo.value);

        pseudoForm.style.display = "none";
        chatCmp.style.display = "flex";
        messageElt.focus();
    }
});

pseudo.addEventListener("keyup", function(event) {
    if (pseudo.value.trim() !== "") {
        error.innerHTML = "";
        error.className = "error";
        event.preventDefault();
    }
});