const puppeteer = require('puppeteer');
const {PendingXHR} = require('pending-xhr-puppeteer');
const tabletojson = require('tabletojson').Tabletojson;
const cloud = require('./model/cloud');
const arango = require('./model/arango');
	async function startBrowser(){
		// try {
			let credentials = await cloud.get_credentials();
        	console.log('cloud -----------> &&',credentials.luminati.username);
        	let proxyServer = `--proxy-server=http://zproxy.lum-superproxy.io:22225`;
			this.PendingXHR = null;
			console.log('Try launching browser');
			this.browser = await puppeteer.launch({
		        executablePath: '/usr/bin/google-chrome',
		        headless: true,
		        ignoreHTTPSErrors: true,
		        args: [
		            '--no-sandbox',
		            '--enable-features=NetworkService',
		            '--disable-setuid-sandbox',
		            `--window-size=1280,960`,
		            proxyServer
		        ],
		        ignoreHTTPSErrors: true,
		        slowMo: 50
		    });

		    this.page = (await this.browser.pages())[0];

		    console.log(`Authenticating proxy`)

            await this.page.authenticate({
                username: credentials.luminati.username,
                password: credentials.luminati.password
            })


		    this.pendingXHR = new PendingXHR(this.page);

		    console.log('Setting user-agent');
		    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:75.0) Gecko/20100101 Firefox/75.0');

		// }catch(e){

		// 	console.log('err launching browser, gonna exit...',e);
	 //        process.exit(1);

		// }
	}



	async function closeBrowser() {
        if (this.browser)
            await this.browser.close()
    }



	async function gotoUrl(url, forceReload = false, maxDelayInSec = null) {
        let page = this.page
        if (!maxDelayInSec || maxDelayInSec < 1) maxDelayInSec = 5 * 1000
        else maxDelayInSec = maxDelayInSec * 1000
        let currentURL = await this.page.url()

        console.log(`Visiting url: ${url}`)
        // console.log(`Current url ${currentURL}`)
        console.log(`maxDelayInSec: ${maxDelayInSec}`)

        let reTryCount = 0
        const maxRetry = 3
        let loaded = false
        do {
            try {
                if (currentURL === url) {
                    await this.page.reload({waitUntil: ['networkidle2', 'load', 'domcontentloaded'], timeout: 30000})
                        .catch(e => {
                            console.log(`URL reload counter_1: ${reTryCount}`)
                            reTryCount += 1
                        })
                        .then(async () => {
                            await this.waitForAjax(this.page)
                            console.log(`Reloaded successfully`)
                            loaded = true
                        })
                } else {
                    console.log(`Executing goto function`)
                    await this.page.goto(url, {
                            waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
                            timeout: maxDelayInSec
                        }
                    ).then(async () => {
                        console.log(`Page loaded successfully`)
                        loaded = true
                    }).catch(e => {
                        console.log(`URL reload counter_2: ${reTryCount}`)
                        reTryCount += 1
                    })

                }

            } catch (e) {
                console.log(`Got URL loading exception: ${e.message}`)
            }
            if (reTryCount > maxRetry) break

        } while (!loaded)

        if (loaded) return true

        console.log(`The page ${url} didn't load after max try of ${maxRetry}`)
    }

    async function waitForAjax() {
        await this.page.evaluate(() => {
            return new Promise((resolve, reject) => {
                const times = 40;
                let i = 0;
                const interval = setInterval(() => {
                    const ajaxCalls = jQuery.active;
                    if (ajaxCalls === 0) {
                        clearInterval(interval);
                        resolve();
                    } else if (i === times) {
                        reject('Wait for Ajax function timeout')
                    }
                    i++;
                }, 500)
            })
        });
    };


    /*
		LOGIN TO MANHIM MMR ACCOUNT
    */

    function loginToManheim(username, password) {
	    return new Promise(async (resolve)=>{
	    	console.log(`Login started`)
		    //go to main mmr page
		    await this.page.goto("https://mmr.manheim.com/", {
		        waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
		        timeout: 120000
		    });
		    // wait until we are redirected to login page and detcect login form

		    console.log(`Waiting for username field`)
		    await this.page.waitForSelector('#user_username', {timeout: 120000})
		    await this.page.type('#user_username', "")
		    await this.page.waitFor(100)
		    await this.page.type('#user_username', username)
		    await this.page.evaluate((username) => {
		        document.getElementById('user_username').value = username;
		    }, username)
		    await this.page.type('#user_password', "")
		    await this.page.type('#user_password', password)
		    await this.page.waitFor(1000)
		    await this.page.evaluate((password) => {
		        document.getElementById('user_password').value = password
		    }, password)
		    console.log(`Password entered`)
		    await this.page.waitFor(5000);
		    console.log(`Clicking submit button`)
		    await this.page.click('#submit', {waitUntil: ['networkidle0', 'load', 'domcontentloaded']})
		    console.log(`Waiting for login confirm`)
		    // await this.page.waitForFunction("window.location.host == 'mmr.manheim.com'",{waitUntil: ['networkidle0', 'load', 'domcontentloaded']})
		    // await this.page.goto("https://mmr.manheim.com/", {
		    //     waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
		    //     timeout: 120000
		    // });
		    // await this.page.waitFor(5000);
		    await this.page.waitForSelector('#accountMenu', {timeout: 120000})
		    console.log(`Login successful!`)
		    resolve(true);
	    })
	}



	/*
		SEARCH FOR VIN
	*/
	function searchForVin(item){
		return new Promise(async (resolve)=>{
			let self = this;
			let trimArray = item.trim.split(' ');
			let itemTrim = trimArray[0].toLowerCase();
			await this.page.goto("https://mmr.manheim.com/", {
		        waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
		        timeout: 120000
		    });
			console.log('itemmmmmmm---->',item);
			console.log('itemTrim---->',itemTrim);
			//enter vin 
			let vin = item.vin;
			await this.page.waitForSelector('#vinText', {timeout: 10000});
			// await this.page.evaluate(() => {
		 //        document.getElementById('vinText').value = "";
		 //    });
			
		    await this.page.type('#vinText', "");
		    await this.page.waitFor(1000);
		    await this.page.type('#vinText', vin);
		    await this.page.evaluate((vin) => {
		        document.getElementById('vinText').value = vin;
		    }, vin);
		    await this.page.click('.icon-search', {waitUntil: ['networkidle0', 'load', 'domcontentloaded']});
		    await this.page.waitFor(2000);
	    	await this.pendingXHR.waitForAllXhrFinished();

	    	//check if engine popup is open
	    	if(!await checkForEnginePopup(itemTrim,this.page)){
	    		console.log('this item has no valid engine or style');
	    		resolve(false);
	    		return;
	    	}
		    //enter miles
		    // return;
		    let miles = `${item.miles}`;
		    console.log(miles);
		    await this.page.waitForSelector('#Odometer', {timeout: 10000});
		    // await this.page.evaluate(() => {
		    //     document.getElementById('Odometer').value = '';
		    // });
		    await this.page.type('#Odometer', "");
		    await this.page.waitFor(1000);
		    console.log('111111111');
		    await this.page.type('#Odometer', miles);
		    await this.page.evaluate((miles) => {
		        document.getElementById('Odometer').value = miles;
		    }, miles);
		    console.log('222222');
		    await this.page.waitFor(3000);
		    await this.page.click('.styles__button__rqYJE', {waitUntil: ['networkidle0', 'load', 'domcontentloaded']});
		    // await this.page.click('.styles__button__rqYJE', {waitUntil: ['networkidle0', 'load', 'domcontentloaded']});
		    console.log('Vin data loaded');
		    //wait for getting data
		    let data = null;

		    try{
		    	const adjustedDetails = await self.page.waitForResponse('https://gapiprod.awsmlogic.manheim.com/gateway')

				// the NEXT line will extract the json response
				let jsonResponse = await adjustedDetails.json();
				let obj = jsonResponse.responses[0].body.items[0];
				data = obj;
		    	// let table_element = await this.page.$('.mui-table');
		    	let table_of_transactions = await self.page.evaluate(() => document.querySelector('.mui-table').innerHTML);
		    	let html_table_of_transactions = `<table>${table_of_transactions}</table>`;
		    	html_table_of_transactions = html_table_of_transactions.replaceAll('Odo (mi)','Odometer');
		    	html_table_of_transactions = html_table_of_transactions.replaceAll('Eng/T','Engine');
		    	html_table_of_transactions = html_table_of_transactions.replaceAll('Ext Color','Ext_color');
		    	html_table_of_transactions = html_table_of_transactions.replaceAll('$','');
		    	html_table_of_transactions = html_table_of_transactions.replaceAll(',','');
		    	// console.log('table_of_transactions++++++++++++++',html_table_of_transactions);
		    	let json_table_of_transactions = tabletojson.convert(html_table_of_transactions);
		    	console.log('table of transactions -------> ',json_table_of_transactions);
		    	data.transactions = json_table_of_transactions[0];
		    	console.log('Dataa ------------->',data);
		    	resolve(data);
		    }catch(e){
		    	resolve(false);
		    }
			// console.log( obj )	;
			// cosnol


			return;

		    // this.page.on("response", async function (request) {
		    // 	console.log('-------',request.url());

		    //     if (request.url() && request.url().indexOf('gapiprod.awsmlogic.manheim.com/gateway') !== -1) {
		    //         let recieved_data = await request.json();
		    //         if(isValidResponse(recieved_data.responses)){
			   //          let obj = recieved_data.responses.find(x => x.body.href.indexOf('api.manheim.com/valuations') !== -1);
			   //          if(obj){
			   //          	// console.log(`recieved data!`,obj.body.items);
			            	
			   //          	return;
			   //          }else{
			   //          	console.log('No data available');
			   //          	resolve(null);
			   //          	return;
			   //          }
		    //         }
		            
		            
		    //     }
		    // });
		    
		    
		});

	}




	function checkForEnginePopup(itemTrim,page){
		let self = this;
		return new Promise(async (resolve)=>{
			let is_engine_popup_open = (await page.$('.styles__modalContainer__2phk2')) || "";
	    	if(is_engine_popup_open){
	    		console.log('popup exist, item has multiple options');
	    		let result = await page.evaluate((itemTrim) => {
					let elements = document.getElementsByTagName('td');
		    		let elementsArray = [...elements];
		    		let elementExist = elementsArray.find(y => y.textContent.toLowerCase().includes(itemTrim));
		    		if(elementExist) elementExist.click();
		    		if(elementExist) return true;
		    		else return false;
	    		},itemTrim);

	    		if(result) resolve(true);
	    		else resolve(false);
	    		
	    	}else{
	    		resolve(true);
	    	}
		})	
	}


	/*
		UPDATE VEHICLE DATA
	*/
	async function updateVehicle(item,data){
		// console.log('Should update vehicle data on arango',data);
		//should build item object 
		let obj = {};
		/*
			{
				base_mmr:null,
				adjusted_mmr:null,
				estimated_retail_value:null,
				transactions:[],

			}
		*/
		obj._id = item._id;
		obj.manheim = true;
		obj.base_mmr = data.wholesale.average;
		obj.adjusted_mmr = data.adjustedPricing.wholesale.average;
		obj.estimated_retail_value = data.adjustedPricing.retail.average;
		obj.updated_at = new Date();
		// obj.mmr_sales = data.transactions.splice(-1);
		console.log('Final obj ------------------ ============ ',obj);
		// console.log(obj.mmr_sales.length);

		//update item data
		await arango.query({
					query:`for x in crawled_listings 
							filter x._id == @_id
							update x with @value in crawled_listings`,
					bindVars:{
						_id:obj._id,
						value:obj
					}
				});
		console.log('data updated in arango');


		//should insert transactions in mmr_sales
		await arango.query({
					query:`for x in @value 
							insert x in mmr_sales`,
					bindVars:{
						value:data.transactions
					}
				});
		console.log('mmr_sales inserted in arango');



	}                      



	function isValidResponse(data){
		// console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',data);
		// let obj = data.find(x => x.body.href.indexOf('api.manheim.com/valuations') !== -1);
		
		if(data[0].body.href && data[0].body.href.indexOf('api.manheim.com/valuations') !== -1){
			// console.log('objjjjjjjjjjjjjjjj',data);
			return true;
		}else{
			return false;
		}
	}







module.exports = {
    startBrowser,
    closeBrowser,
    gotoUrl,
    waitForAjax,
    loginToManheim,
    searchForVin,
    updateVehicle
}
