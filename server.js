#!/usr/bin/env node

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

'use strict';

let express = require('express');
let app = express();
let server = require('http').Server(app);
let sqlite3 = require('sqlite3');
let jsSHA = require("jssha");
let identIcon = require('identicon.js');
let databaseName = './db.sqlite';
let port = 8010;
let tablemessage = 'chat';


app.use(express.static('public'));

let iconsData = {};
let usersData = {};

app.get('/user/:user/icon.png', function(req, res, next) {

    let user = req.params.user;
    let buffer = iconsData[user];
    if (!buffer) {
        let shaObj = new jsSHA("SHA-512", "TEXT");
        shaObj.update(user);
        let hash = shaObj.getHash("HEX");
        let img = new identIcon(hash).toString();
        buffer = new Buffer(img, 'base64');
    }

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    });

    res.end(buffer);
});


let db = new sqlite3.Database(databaseName, (err) => {
    if (err) throw new Error(err);
    db.exec(`create table if not exists ${tablemessage}(timestamp TEXT, user TEXT, message TEXT)`, (err) => {
        if (err) throw new Error(err);
        server.listen(port, () => {
            webSockerServer();
            console.log(`Server started (port : ${port})`);
        });
    });

});


function webSockerServer() {
    let ws = require('socket.io')(server);

    ws.on("connection", (client) => {
        client.emit('users', usersData);

        db.all(`SELECT timestamp, user, message FROM ${tablemessage} ORDER BY timestamp`, function(err, rows) {
            if (err) console.log(err)
            else
                client.emit('messages', rows);
        });

        client.on('disconnect', function() {
            let user = usersData[client.id];

            client.broadcast.emit("deluser", client.id);
            client.broadcast.emit("newmessage", {
                timestamp: new Date().toISOString(),
                user: user,
                message: "a quitté le chat !"
            });
            delete iconsData[user];
            delete usersData[client.id];
        });

        client.on("newuser", (newuser) => {
            usersData[client.id] = newuser;

            ws.emit("newuser", { id: client.id, user: newuser });
            client.broadcast.emit("newmessage", {
                timestamp: new Date().toISOString(),
                user: newuser,
                message: "a rejoint le chat !"
            });
        });

        client.on("newmessage", (message) => {
            let user = usersData[client.id];
            let timestamp = new Date().toISOString();
            db.run(`INSERT INTO ${tablemessage} (timestamp,user,message) VALUES ("${timestamp}", "${user}", "${message}")`, function(err) {
                if (err) console.log(err)
                else {
                    ws.emit("newmessage", {
                        timestamp: timestamp,
                        user: user,
                        message: message
                    });
                }
            });
        });
    });
}