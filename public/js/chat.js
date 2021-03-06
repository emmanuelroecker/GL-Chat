/**
 *
 * @package   Chat
 * @author    Emmanuel ROECKER <emmanuel.roecker@glicer.com>
 * @author    Rym BOUCHAGOUR <rym.bouchagour@glicer.com>
 * @copyright GLICER
 * @license   MIT
 * @link      http://www.glicer.com
 *
 */

"use strict";

var serverHost = window.location.protocol + "//" + window.location.host;
var socketOptions = {};
var rootUrl = "";
if (window.location.pathname !== "/") {
    socketOptions = {
        path: window.location.pathname + '/socket.io'
    };
    rootUrl = window.location.pathname;
}

emojify.setConfig({ img_dir: "img/emoji/basic" });
moment.locale('fr');

var socket = null; 
var messageElt = document.getElementById("message");
var messagesElt = document.getElementById("messagesChat");
var usersElt = document.getElementById("messagesUsers");
var componentChatElt = document.getElementById("componentChat");
var formLoginElt = document.getElementById("formLogin");
var pseudoElt = document.getElementById("pseudo");
var errorElt = document.querySelector(".error");
var formChatElt = document.getElementById("formChat");
var formLoginIconElt = document.getElementById("formLoginIcon");
var panelTitleChatElt = document.getElementById("panelTitleChatText");

var settingsElt = document.getElementById("settings");
var mainContent = document.getElementById("panelChat");
var sidebar = document.getElementById("panelUsers");

function setIdentIcon(text) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(text);
    var hash = shaObj.getHash("HEX");
    var img = new Identicon(hash).toString();
    formLoginIconElt.setAttribute('src', 'data:image/png;base64,' + img);
}


function addUser(id, user) {
    var pElt = document.createElement("p");
    pElt.setAttribute('id', id);
    var newUserIconElt = document.createElement("img");
    newUserIconElt.classList.add("avatar");
    newUserIconElt.setAttribute('src', rootUrl + '/user/' + user + '/icon.png');
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

function addMessage(timestamp, user, message) {
    var divElt = document.createElement("div");
    divElt.classList.add("messagesChatContent");

    var userIconElt = document.createElement("img");
    userIconElt.classList.add("avatar");
    userIconElt.setAttribute('src', rootUrl + '/user/' + user + '/icon.png');
    divElt.appendChild(userIconElt);

    var divHeaderElt = document.createElement("div");
    divHeaderElt.classList.add('messagesChatRight');

    var divPseudoElt = document.createElement("div");
    divPseudoElt.classList.add("messagesChatHeader");

    var pseudoElt = document.createElement("span");
    pseudoElt.classList.add("pseudo");
    pseudoElt.textContent = user;
    divPseudoElt.appendChild(pseudoElt);

    var timestampElt = document.createElement("small");
    timestampElt.classList.add("timestamp");
    timestampElt.textContent = moment(timestamp).fromNow();
    divPseudoElt.appendChild(timestampElt);

    divHeaderElt.appendChild(divPseudoElt);

    var newmessageElt = document.createElement("p");
    newmessageElt.classList.add("message");
    newmessageElt.textContent = message;
    divHeaderElt.appendChild(newmessageElt);

    divElt.appendChild(divHeaderElt);

    messagesElt.appendChild(divElt);

    return divElt;
}

function socketEvents(socket) {
    socket.on('reconnect', function () {
        errorElt.innerHTML = "Erreur serveur, veuillez vous reconnecter";
        errorElt.className = "error active";
        formLoginElt.style.display = "flex";
        componentChatElt.style.display = "none";
    });

    socket.on('connect_error', function (err) {
        errorElt.innerHTML = "Erreur serveur, veuillez vous reconnecter";
        errorElt.className = "error active";
        formLoginElt.style.display = "flex";
        componentChatElt.style.display = "none";
    });

    socket.on("newmessage", function (message) {
        var elt = addMessage(message.timestamp, message.user, message.message);
        emojify.run(elt);
        messagesElt.scrollTop = messagesElt.scrollHeight;
    });

    socket.on("messages", function (messages) {
        messagesElt.innerHTML = '';
        messages.forEach(function (message) {
            addMessage(message.timestamp, message.user, message.message);
        });
        emojify.run(messagesElt);
        messagesElt.scrollTop = messagesElt.scrollHeight;
    });

    socket.on("newuser", function (user) {
        addUser(user.id, user.user);
    });

    socket.on("deluser", function (id) {
        delUser(id);
    });

    socket.on("users", function (users) {
        usersElt.innerHTML = '';
        for (var id in users) {
            addUser(id, users[id]);
        }
    });
}

formChatElt.addEventListener("submit", function (event) {
    event.preventDefault();
    if (messageElt.value.trim() !== "") {
        socket.emit("newmessage", messageElt.value);
        messageElt.value = "";
        messageElt.focus();
    }
});


formLoginElt.addEventListener("submit", function (event) {
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

pseudoElt.addEventListener("keyup", function (event) {
    if (pseudoElt.value.trim() !== "") {
        formLoginIconElt.style.display = "block";
        setIdentIcon(pseudoElt.value);
        errorElt.innerHTML = "";
        errorElt.className = "error";
        event.preventDefault();
    } else {
        formLoginIconElt.style.display = "none";
    }
});

settingsElt.addEventListener("click", function () {
    mainContent.classList.toggle("isOpen");
    sidebar.classList.toggle("isOpen");

    if (sidebar.classList.contains("isOpen")) {
        settingsElt.innerHTML = '<i class="icon-chat"></i> Accéder au chat';
    }
    else {
        settingsElt.innerHTML = '<i class="icon-users"></i><span>Utilisateurs connectés</span>';
    }
});