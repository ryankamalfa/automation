#!/bin/sh

scriptHome='/var/dealer-socket'

ps aux | grep "[n]ode dealer-socket.js"
if [ $? -ne 0 ]
then
pwd
echo "node dealer-socket.js Starting"
cd "$scriptHome" && node dealer-socket.js > log_dealerSocket.out 2>&1
else
echo "node dealer-socket.js Already running"
fi
