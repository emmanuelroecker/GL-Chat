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
var messagesElt = document.getElementById("messagesChat");
var usersElt = document.getElementById("messagesUsers");
var componentChatElt = document.getElementById("componentChat");
var formLoginElt = document.getElementById("formLogin");
var pseudoElt = document.getElementById("pseudo");
var errorElt = document.querySelector('.error');
var formChatElt = document.getElementById("formChat");
var panelTitleChatElt = document.getElementById("panelTitleChatText");

function addUser(id, user) {
    var pElt = document.createElement("p");
    pElt.setAttribute('id', id);
    var newUserIconElt = document.createElement("span");
    newUserIconElt.classList.add("icon-user-circle");
    var newUserElt = document.createElement("span");
    newUserElt.classList.add("user");
    newUserElt.textContent = user;
    pElt.appendChild(newUserIconElt);
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
    var divElt = document.createElement("div");

    var pseudoIconElt = document.createElement("span");
    pseudoIconElt.classList.add("icon-user-circle");

    var pseudoElt = document.createElement("span");
    pseudoElt.classList.add("pseudo");
    pseudoElt.textContent = pseudo;
    divElt.appendChild(pseudoIconElt);
    divElt.appendChild(pseudoElt);

    var timestampElt = document.createElement("small");
    timestampElt.classList.add("timestamp");
    timestampElt.textContent = new Date(timestamp).toLocaleString();
    divElt.appendChild(timestampElt);

    var newmessageElt = document.createElement("p");
    newmessageElt.classList.add("message");
    newmessageElt.textContent = message;
    divElt.appendChild(newmessageElt);

    messagesElt.appendChild(divElt);
}

function socketEvents(socket) {
    socket.on('reconnect', function() {
        errorElt.innerHTML = "Erreur serveur, veuillez vous reconnecter";
        errorElt.className = "error active";
        formLoginElt.style.display = "flex";
        componentChatElt.style.display = "none";
    });

    socket.on('connect_error', function(err) {
        errorElt.innerHTML = "Erreur serveur, veuillez vous reconnecter";
        errorElt.className = "error active";
        formLoginElt.style.display = "flex";
        componentChatElt.style.display = "none";
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

formChatElt.addEventListener("submit", function(event) {
    event.preventDefault();
    if (messageElt.value.trim() !== "") {
        socket.emit("newmessage", messageElt.value);
        messageElt.value = "";
        messageElt.focus();
    }
});


formLoginElt.addEventListener("submit", function(event) {
    event.preventDefault();

    if (pseudoElt.value.trim() === "") {
        errorElt.innerHTML = "Veuillez saisir un pseudo";
        errorElt.className = "error active";
        pseudoElt.focus();
    } else {
        socket = io.connect(serverHost, socketOptions);
        socketEvents(socket);
        socket.emit("newuser", pseudoElt.value);
        panelTitleChatElt.textContent = "Bienvenue " + pseudoElt.value + " !";

        formLoginElt.style.display = "none";
        componentChatElt.style.display = "flex";
        messageElt.focus();
    }
});

pseudoElt.addEventListener("keyup", function(event) {
    if (pseudoElt.value.trim() !== "") {
        errorElt.innerHTML = "";
        errorElt.className = "error";
        event.preventDefault();
    }
});