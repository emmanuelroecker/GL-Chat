#!/bin/bash
service glchat stop
rm /etc/systemd/system/glchat.service
cp glchat.service /etc/systemd/system
rm /etc/systemd/system/multi-user.target.wants/glchat.service
cd /etc/systemd/system/multi-user.target.wants
ln -s ../glchat.service .
systemctl daemon-reload
service glchat start
systemctl status glchat

