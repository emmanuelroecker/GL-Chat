#!/bin/bash
cp glchat.service /etc/systemd/system
cd /etc/systemd/system/multi-user.target.wants
ln -s ../glchat.service .

