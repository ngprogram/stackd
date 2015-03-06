#!/bin/bash
#write out current crontab
crontab -l > mycron
#echo new cron into cron file
echo "*10 * * * * /usr/bin/node ./worker/populate.js" >> mycron
#install new cron file
crontab mycron
rm mycron


