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

var express = require('express');
var app = express();
var server = require('http').Server(app);
let sqlite3 = require('sqlite3');
let databaseName = './db.sqlite';
let port = 8010;
let tablemessage = 'chat';

app.use(express.static('public'));

let usersData = {};

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
            client.broadcast.emit("deluser", client.id);
            client.broadcast.emit("newmessage", {
                timestamp: new Date().toISOString(),
                user: usersData[client.id],
                message: "a quitté le chat !"
            });
            delete usersData[client.id];
        });

        client.on("newuser", (newuser) => {
            usersData[client.id] = newuser;
            client.broadcast.emit("newuser", { id: client.id, user: newuser });
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