#!/bin/sh

scriptHome='/var/autotrader-scraper'

ps aux | grep "[n]ode autotrader_details.js"
if [ $? -ne 0 ]
then
pwd
echo "node autotrader_details.js Starting"
cd "$scriptHome" && node autotrader_details.js > log_autotrader_details.out 2>&1
else
echo "node autotrader_details.js Already running"
fi
