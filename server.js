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
let tablename = 'chat';

app.use(express.static('public'));

let db = new sqlite3.Database(databaseName, (err) => {
    if (err) throw new Error(err);
    db.exec(`create table if not exists ${tablename}(timestamp DATE DEFAULT CURRENT_TIMESTAMP, user, message)`, (err) => {
        if (err) throw new Error(err);
        server.listen(port, () => {
            webSockerServer();
            console.log(`Server started (port : ${port})`);
        });
    })
});

function webSockerServer() {
    let ws = require('socket.io')(server);

    ws.on("connection", (client) => {
        db.all(`SELECT timestamp, user, message FROM ${tablename} ORDER BY timestamp`, function(err, rows) {
            if (err) console.log(err)
            else
                client.emit('messages', rows);
        });

        client.on("newuser", (newuser) => {
            client.broadcast.emit("newmessage", {
                timestamp: new Date().toLocaleString(),
                user: newuser,
                message: " a rejoint le Chat !"
            });
            client.user = newuser;
        });

        client.on("newmessage", (message) => {
            db.run(`INSERT INTO ${tablename} (user,message) VALUES ("${client.user}", "${message}")`, function(err) {
                if (err) console.log(err)
                else {
                    client.broadcast.emit("newmessage", {
                        timestamp: new Date().toLocaleString(),
                        user: client.user,
                        message: message
                    });
                }
            });
        });
    });
}