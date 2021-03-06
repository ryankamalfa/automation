const shell = require('shelljs');
const arango = require('../config/database');
const async = require('async');
const sendAutomationStatusEmail = require('./sendAutomationStatusEmail');


const automation = {
	run_autotrader_script(){
		//Function to fire autotrader script
		return new Promise(resolve=>{
			// console.log('command is running');
			(async()=>{
				await resetLastRun();
				await update_last_run('autotrader',null);
				async.series([
					function(callback){
						let command = shell.exec('node ./automation_scripts/autotrader/autotrader.js ', {async:true});
						command.on('exit',async function(code){
							if(code == 0){
								// console.log('finished with success');
								callback();
								
							}else{
								// console.log('finished with fail');
								callback(true);
							}
						})
					},
					// function(callback){
					// 	let command = shell.exec('node ./automation_scripts/autotrader/autotrader_details.js ', {async:true});
					// 	command.on('exit',async function(code){
					// 		if(code == 0){
					// 			// console.log('finished with success');
					// 			callback();
					// 		}else{
					// 			// console.log('finished with fail');
					// 			callback(true);
					// 		}
					// 	})
					// },
					],async function(err){
					if(err){
						//
						await update_last_run('autotrader','failed');
						resolve(false);
					}else{
						await update_last_run('autotrader','success');
						resolve(true);
					}
				});
				
			})();
		});
	},

	run_autotrader2_script(){
		//Function to fire adesa script
		return new Promise((resolve)=>{
			(async()=>{
				let command = shell.exec('node ./automation_scripts/autotrader/autotrader_details.js  ', {async:true});
				command.on('exit',async function(code){
					if(code == 0){
						// console.log('finished with success');
						resolve(true);
					}else{
						// console.log('finished with fail');
						
						resolve(false);
					}
				})
			})();
		});
	},


	run_adesa_script(){
		//Function to fire adesa script
		return new Promise((resolve)=>{
			(async()=>{
				await update_last_run('adesa',null);
				let command = shell.exec('node ./automation_scripts/adesa/adesa-saved-search.js  ', {async:true});
				command.on('exit',async function(code){
					if(code == 0){
						// console.log('finished with success');
						await update_last_run('adesa','success');
						resolve(true);
					}else{
						// console.log('finished with fail');
						await update_last_run('adesa','failed');
						
						resolve(false);
					}
				})
			})();
		});
	},

	run_manheim_script(){
		//Function to fire manheim script
		return new Promise((resolve)=>{
			(async()=>{
				// await update_last_run('manheim',null);
				let command = shell.exec('node ./automation_scripts/manheim/start.js  ', {async:true});
				command.on('exit',async function(code){
					if(code == 0){
						// console.log('finished with success');
						// await update_last_run('manheim','success');
						resolve(true);
					}else{
						// console.log('finished with fail');
						// await update_last_run('manheim','failed');
						
						resolve(false);
					}
				})
			})();
		});
	},


	run_airtable_script(){
		//Function to fire airtable script
		return new Promise((resolve)=>{
			(async()=>{
				// await update_last_run('airtable',null);
				let command = shell.exec('node ./automation_scripts/airtable/airtable.js > ./logs/airtable-logs.txt ', {async:true});
				command.on('exit',async function(code){
					if(code == 0){
						// console.log('finished with success');
						// await update_last_run('airtable','success');
						resolve(true);
					}else{
						// console.log('finished with fail');
						// await update_last_run('airtable','failed');
						resolve(false);
					}
				})
			})();
		});
	},

	async sendStatusEmail(toEmail){
		let smtp_config = await arango.query(`
		      For x in script_settings
		      Filter x.type == 'config'
		      return x.smtp
		    `);
	  	let smtp_config_data = await smtp_config.all();

	  	let last_run = await arango.query(`
		      For x in script_settings
		      Filter x.type == 'last_run'
		      return x
		    `);
	  	let last_run_data = await last_run.all();


		const body = {
	      from: `"Vechiele Automation Script" ${smtp_config_data[0].username}`,
	      to: toEmail,
	      subject: 'Vechiele Automation Script Status Report',
	      html: `
	      <style>
	      	.text-success{
	      		color:green;
	      	}
	      	.text-error{
	      		color:red;
	      	}
	      </style>
			    <h2>Hi</h2>
			<p>Here's the last upadate of script status after last run</p>

			<table class="table table-sm table-bordered" style="width:300px;text-align:left">
			  <thead>
			    <tr>
			      <th>Script name</th>
			      <th>Status</th>
			    </tr>
			  </thead>
			  <tbody>
			    <tr>
			      <td>Autotrader</td>
			      <td>
			        <b style=" ${last_run_data[0].autotrader.status === 'success' ? 'color:green' : 'color:red'}">
			          ${last_run_data[0].autotrader.status === 'success' ? 'Success' : 'Failed'}
			        </b>
			      </td>
			    </tr>
			    <tr>
			      <td>Adesa</td>
			      <td>
			        <b style=" ${last_run_data[0].adesa.status === 'success' ? 'color:green' : 'color:red'}">
			          ${last_run_data[0].adesa.status === 'success' ? 'Success' : 'Failed'}
			        </b>

			      </td>
			    </tr>
			  </tbody>
			</table>
				       

			<p style="margin-bottom:0px;">Thank you</p>
			<strong>Vechiele Automation Script Team</strong>
			  
	      
	      
	      
	             `,
	    };


	    sendAutomationStatusEmail(body);
	}

}




function update_last_run(name,status){
	return new Promise((resolve)=>{
		(async()=>{
			await arango.query({
					query:`
						upsert {type:"last_run"}
						insert {type:"last_run","${name}":@value}
						update {"${name}":@value}
						in script_settings
					`,
					bindVars:{
						value:{
							time:new Date(),
							status:status
						}
					}
				});


			if(status === 'failed' || name === 'airtable'){
				await arango.query(`
					For x in script_settings
					Filter x.type == 'last_run'
					update x with {status:'${status}'}  in script_settings 
					`)
			}


			resolve(true);
		})();
	});

}



function resetLastRun(){
	return new Promise((resolve)=>{
		(async()=>{
			await arango.query({
				query:`
					upsert {type:"last_run"}
					insert @value
					update @value
					in script_settings
				`,
				bindVars:{
					value:{
						type:'last_run',
						time:new Date(),
						status:null,
						autotrader:{
							time:null,
							status:null,
						},
						adesa:{
							time:null,
							status:null,
						},
						manheim:{
							time:null,
							status:null,
						},
						airtable:{
							time:null,
							status:null
						}
					}
				}
				});
			resolve(true);
		})();
	});
}




module.exports = automation;





