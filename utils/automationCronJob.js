const async = require('async');
const automation = require('../utils/automation');
const arango = require('../config/database');
var cron = require('node-cron');
const shell = require('shelljs');

var shouldRun = true;
var cronTime;


const Job = {
	async init(){
			let cronSettings = await arango.query(`
				For o in script_settings
				Filter o.type == 'automation'
				return o
				`);
			let cronSettingsData = await cronSettings.all();
			// console.log(cronSettingsData[0]);
			// console.log(cronSettingsData[0].cron_time);
			let setup_scripts = shell.exec('cd /root/automation/automation_scripts/autotrader && npm i  && cd /root/automation/automation_scripts/adesa && npm i && cd /root/automation/automation_scripts/airtable && npm i ', {async:true});
			setup_scripts.on('exit',function(code){
				cron.schedule(cronSettingsData[0].cron_time, () => {
					if(shouldRun){
					console.log('Cron Job is initialized');
					// console.log('---------------',shouldRun);
					// return;
					shouldRun = false;
					async.series([
						function(callback){
							(async()=>{
								await automation.run_autotrader_script(cronSettingsData[0].notification_emails);
								callback();
							})();
						},
						function(callback){
							(async()=>{
								await automation.run_adesa_script(cronSettingsData[0].notification_emails);
								callback();
							})();
						},
						function(callback){
							(async()=>{
								await automation.run_airtable_script(cronSettingsData[0].notification_emails);
								callback();
							})();
						},
						],function(){
							shouldRun = true;
						});
				}
				});
			})

			
		}
}




module.exports = Job;
	

