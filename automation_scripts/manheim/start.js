const browser = require('./browser');
const cloud = require('./model/cloud');
const arango = require('./model/arango');
const async = require('async');

const retry = require('async-retry');

(async function startScript(){
	//open browser;
	let credentials = await cloud.get_credentials();
	console.log(credentials);
	await retry(async (bail) => {
        let startBrowser = await browser.startBrowser();
    },
    {
        retries: 3,
        onRetry(e){
            console.log('can not launch manheim browser, lets retry',e);
        }
    });

	await retry(async (bail) => {
        let login = await browser.loginToManheim(credentials.manheim.username,credentials.manheim.password);
    },
    {
        retries: 3,
        onRetry(e){
            console.log('can not load manheim login, lets retry',e);
        }
    });

	/*

	*/
	
	//should get all items from arangodb
	//should loop over each item in arango db
	console.log('Checking items to loop over');
	let items = await arango.query(`
			for x in crawled_listings 
			filter !x.manheim and x.vin and x.trim and x.miles
			limit 1000 
			return {
			_id:x._id,
			vin:x.vin,
			trim:x.trim,
			miles:x.miles
			}
		`);

	let items_data = await items.all();
	console.log(`we have around ${items_data.length} to loop over`);
	// let items_data = [{
	//   _id: 'crawled_listings/732364',
	//   vin: '1FTEW1E59KFB54852',
	//   trim: 'XLT, Sport, Nav, 5.0L, Upgraded Wheels!!',
	//   miles: 44637
	// }];
	if(items_data.length > 0){
		async.eachSeries(items_data,function(item,callback){
			(async()=>{
				await browser.searchForVin(item);
				// if(data){
				// 	await browser.updateVehicle(item,data);
				// }
				callback();
			})();
		},function(){
			setTimeout(async()=>{
				console.log('Finished, Gonna exit');
				await browser.closeBrowser();
				process.exit(0);
			},10000);
		});
	}else{
		console.log('There`s no items to loop over, Gonna exit');
		process.exit(0);
	}
	
	
	
	
})();