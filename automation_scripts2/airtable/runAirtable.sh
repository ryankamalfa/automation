#!/bin/sh

scriptHome='/var/dealer-socket'

ps aux | grep "[n]ode airtable.js"
if [ $? -ne 0 ]
then
pwd
echo "node airtable.js Starting"
cd "$scriptHome" && node airtable.js > log_airtable.out 2>&1
else
echo "node airtable.js Already running"
fi
