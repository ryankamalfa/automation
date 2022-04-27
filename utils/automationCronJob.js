const async = require('async');
const automation = require('../utils/automation');
const arango = require('../config/database');
var cron = require('node-cron');
const shell = require('shelljs');

var shouldRun = true;
var shouldRunAirtable = true;
var cronTime;


const Job = {
	async init(){
			let cronSettings = await arango.query(`
				For o in script_settings
				Filter o.type == 'automation'
				return o
				`);
			let cronSettingsData = await cronSettings.all();


			let scriptSettings = await arango.query(`
				For o in script_settings
				Filter o.type == 'config'
				return o
				`);
			let scriptSettingsData = await scriptSettings.all();



			// console.log(cronSettingsData[0]);
			// console.log(cronSettingsData[0].cron_time);
			let setup_scripts = shell.exec('cd /root/automation/automation_scripts/autotrader && npm i  && cd /root/automation/automation_scripts/adesa && npm i && cd /root/automation/automation_scripts/airtable && npm i  && cd /root/automation/automation_scripts/manheim && npm i ', {async:true});
			setup_scripts.on('exit',function(code){

				cron.schedule('*/5 * * * *', () => {
					if(shouldRunAirtable){
						(async()=>{
							shouldRunAirtable = false;
							await automation.run_airtable_script();
							shouldRunAirtable = true;
						})();
					}
				});


				cron.schedule(cronSettingsData[0].cron_time, () => {
					if(shouldRun){
					console.log('Cron Job is initialized');
					// console.log('---------------',shouldRun);
					// return;
					shouldRun = false;
					async.series([
						function(callback){
							(async()=>{
								if(await automation.run_manheim_script()){
									callback();
								}else{
									callback(true);
								}
							})();
						},
						// function(callback){
						// 	(async()=>{
						// 		if(await automation.run_airtable_script()){
						// 			callback();
						// 		}else{
						// 			callback(true);
						// 		}
						// 	})();
						// },
						function(callback){
							(async()=>{
								if(scriptSettingsData[0].autotrader.enable){
									if(await automation.run_autotrader_script()){
										callback();
									}else{
										callback(true);
									}
								}else{
									callback();
								}
								
							})();
						},
						function(callback){
							if(scriptSettingsData[0].adesa.enable){
								(async()=>{
									if(await automation.run_adesa_script()){
										callback();
									}else{
										callback(true);
									}
								})();
							}else{
								callback();
							}	
						},
						function(callback){
							(async()=>{
								if(await automation.run_manheim_script()){
									callback();
								}else{
									callback(true);
								}
							})();
						},
						// function(callback){
						// 	(async()=>{
						// 		if(await automation.run_airtable_script()){
						// 			callback();
						// 		}else{
						// 			callback(true);
						// 		}
						// 	})();
						// },
						],function(){
							automation.sendStatusEmail(cronSettingsData[0].notification_emails);
							shouldRun = true;
						});
				}
				});
			})

			
		}
}




module.exports = Job;
	

