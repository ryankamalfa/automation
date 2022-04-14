#!/bin/sh

scriptHome='/var/autotrader-scraper'

ps aux | grep "[n]ode autotrader.js"
if [ $? -ne 0 ]
then
pwd
echo "node autotrader.js Starting"
cd "$scriptHome" && node autotrader.js > log_autotrader.out 2>&1
else
echo "node autotrader.js Already running"
fi
