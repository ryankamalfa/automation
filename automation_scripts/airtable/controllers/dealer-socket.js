const Listings = require('../model/listings')
const Appraisals = require('../model/appraisals')
const {asyncForEach, waitForPropertyValueChange} = require('../utils/helper');
const browser = require('./browser')
const cloud = require('../model/cloud');
const arango = require('../model/arango');
let configs = {
    evaluation_loaded: false,
    current_listing_id: null,
    ready_to_collect_appraisal: false,
    all_appraisals: null
}

async function loginToDealerSocket(page, username, password) {
    console.log(`Login started`)
    let response = await page.goto("https://inventory.dealersocket.com/login/", {
        waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
        timeout: 30000
    });
    await page.waitForSelector('#admin_username')
    await page.type('#admin_username', username, {delay: 10})
    await page.type('#admin_password', password, {delay: 10})
    await page.click('#ecl_dealer_login_form_submit > input', {
        waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
        timeout: 30000
    })
    await page.waitForSelector('button[data-e2e="inventoryList-button"]', {timeout: 120000})
    console.log(`Login successful!`)
}

async function evaluate(listingInfo, index, array, paramObj) {
    let page = paramObj.configs.page
    try {
        console.log(`Evaluating: ${listingInfo.listing_id}`)
        paramObj.configs.current_listing_id = listingInfo.listing_id
        paramObj.configs.evaluation_loaded = false
        paramObj.configs.ready_to_collect_appraisal = false
        console.log(`Visiting appraisal page`)
        await page.goto(`https://inventory.dealersocket.com/admin/appraisal?vin=${listingInfo.vin.trim()}#basic`, {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            timeout: 30000
        })

        await page.waitFor(10000)
        await page.waitForSelector('#trade_type_purchase_radio')
        console.log(`Clicking on PURCHASE_RADIO button`)
        await page.click('#trade_type_purchase_radio')

        //Disabled because we are inserting VIN through url
        // await page.waitFor(2000)
        // await page.evaluate((vin) => {
        //     document.querySelector('#vin_input').value = vin
        //     var event = new Event('change');
        //     document.querySelector('#vin_input').dispatchEvent(event);
        // }, listingInfo.vin)


        let trimSelector = await page.$('#trim_input')
        if (trimSelector !== null) {
            let trimSelector = `#trim_input > option:contains('${listingInfo.search_trim}')`
            await page.evaluate((selector) => {
                let el = jQuery(selector)[0]
                if (el) {
                    el.selected = true
                }
            }, trimSelector)
        }

        let selectedTrim = await page.evaluate(() => {
            return jQuery("#trim_input option:selected").map(function () {
                return jQuery(this).text().trim();
            }).get()[0];
        })
        console.log(`Selected Trim: ${selectedTrim}`)


        console.log(`Updating style`)
        let interior_type = await page.$('#style_input')
        if (interior_type !== null) {
            let interiorTypeSelector = `#style_input > option:eq(1)`
            console.log(`Selector: ${interiorTypeSelector}`)
            await page.evaluate((selector) => {
                let el = jQuery(selector)[0]
                if (el) {
                    el.selected = true
                }
            }, interiorTypeSelector)
        }
        await page.waitFor(10000)

        console.log(`Entering miles value`)
        await page.type('#mileage_input', listingInfo.miles.toString(), {delay: 10})

        let transmission = await page.$(`#transmission_input`)
        if (transmission !== null) {
            console.log(`Updating transmission if needed`)
            let exteriorColorSelector = `#transmission_input > option:contains('${listingInfo.transmission}')`
            await page.evaluate((selector) => {
                let el = jQuery(selector)[0]
                if (el) {
                    el.selected = true
                }
            }, exteriorColorSelector)
        }
        let selectedTransmission = await page.evaluate(() => {
            return jQuery("#transmission_input option:selected").map(function () {
                return jQuery(this).text().trim();
            }).get()[0];
        })
        console.log(`Selected Transmission: ${selectedTransmission}`)


        console.log(`Updating colour`)
        let exteriorColor = await page.$('#generic_color_input')
        if (exteriorColor !== null) {
            let exteriorColorSelector = `#generic_color_input > option:contains('${listingInfo.exterior_colour}')`
            await page.evaluate((selector) => {
                let el = jQuery(selector)[0]
                if (el) {
                    el.selected = true
                }
            }, exteriorColorSelector)
        }

        let interiorColor = await page.$('#factory_interior_color_input')
        if (interiorColor !== null) {
            let interiorColorSelector = `#factory_interior_color_input > option:contains('${listingInfo.interior_colour}')`
            await page.evaluate((selector) => {
                let el = jQuery(selector)[0]
                if (el) {
                    el.selected = true
                }
            }, interiorColorSelector)
        }


        console.log(`Clicking Save & Next button`)
        await page.click('#workflow_footer_controls > div > span > span.smaller_text.next_appraisal_flow.ecl-button-active', {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            timeout: 60000
        })
        await page.waitFor(10000)

        console.log(`Waiting for Vehicle Values Tab`)
        await page.waitForSelector('li.step.last > span', {timeout: 60000})
        await page.waitFor(1000)
        console.log(`Clicking Vehicle Values Tab`)
        await page.evaluate(() => {
            document.querySelector('li.step.last > span').click()
        })

        console.log(`Waiting for Data Settings button`)
        await page.waitForSelector('#mview_graph_sources_showmodify > a', {timeout: 60000})

        //TODO: Check if CarFax Yellow or Red
        console.log(`Clicking Expand CarFax report`)
        await page.click('#carfax > div > h4 > a')
        await page.waitFor(1000)
        const warning = await page.$('#carfax > div > div.open li.caution, #carfax > div > div.open li.alert, #carfax > div > div.open li.warning')

        if (warning) {
            console.log(`CarFax waring`)
            await listingInfo.update({
                dealer_socket_status: 'success',
                dealer_socket_comment: 'CarFax waring'
            })
            console.log(`${listingInfo.vin} No appraisal found`)
            return
        }

        console.log(`Clicking Data Settings button`)
        await page.evaluate(() => {
            document.querySelector('#mview_graph_sources_showmodify > a').click()
        })
        console.log(`Form open`)
        await page.waitFor(10000)

        console.log(`Waiting for Distance input field`)
        await page.waitForSelector('#pt_settings_dist_local', {timeout: 30000})
        await page.evaluate(() => {
            document.querySelector('#pt_settings_dist_local').lastChild.selected = true;
        })
        await page.waitFor(1000)

        //The odometer is at the top left of this screen (in case you forgot).
        // Enter 10,000 miles lower and 10,000 higher than the current vehicles mileage.
        // If vehicle has less than 20,000 miles, use 5,000 below and above.
        console.log(`Inserting Distance`)
        let max, min = 0
        listingInfo.miles = await parseInt(listingInfo.miles)
        if (listingInfo.miles < 20000) {
            max = listingInfo.miles + 5000
            if (listingInfo.miles <= 5000) {
                min = 0
            } else {
                min = listingInfo.miles - 5000
            }
        } else {
            max = listingInfo.miles + 10000
            min = listingInfo.miles - 10000
        }
        console.log(`Transformations:`)
        console.log(`Min: ${listingInfo.miles} => ${min}`)
        console.log(`Max: ${listingInfo.miles} => ${max}`)
        await page.evaluate(() => document.getElementById("pt_settings_min_mileage_local").value = "")
        await page.type('#pt_settings_min_mileage_local', min.toString())
        await page.evaluate(() => document.getElementById("pt_settings_max_mileage_local").value = "")
        await page.type('#pt_settings_max_mileage_local', max.toString())
        console.log(`Distance inserted`)
        await page.waitFor(1000)

        console.log(`Closing form`)
        await page.click('#mview_graph_sources_modify_close', {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            timeout: 30000
        })
        console.log(`Form closed`)

        await page.waitFor(10000)
        await page.waitForSelector('#mview_graph_sources_showmodify > a')

        console.log(`Clicking Data Settings button`)
        await page.waitFor(5000)
        await page.evaluate(() => {
            document.querySelector('#mview_graph_sources_showmodify > a').click()
        })
        console.log(`Form open 2`)
        await page.waitFor(5000)


        console.log(`Unchecking any other trim except: ${selectedTrim}`)
        await page.evaluate(async (selectedTrim) => {
            let allTrimElements = document.querySelectorAll(`span[id^=Trim] > a`);
            if (allTrimElements.length < 2) {
                console.log(`Only once trim available, unchecking other trim is not a option`)
                return
            }
            selectedTrim = selectedTrim.replace(/\s+/g, '')

            let expectedTrimElements = document.querySelectorAll(`span[id=Trim${selectedTrim}] > a`);
            if (expectedTrimElements.length < 1) {
                console.log(`Expected trim is not found`)
                throw Error('Trim not found while evaluating')
            }

            let trimElements = document.querySelectorAll(`span[id^=Trim]:not([id$=${selectedTrim}]) > a`);
            [].forEach.call(trimElements, function (e) {
                e.click();
            });
        }, selectedTrim)
        console.log(`Uncheck trim done`)
        await page.waitFor(5000)

        // console.log(`Unchecking any other Transmission except: ${selectedTransmission}`)
        // await page.evaluate((selectedTransmission) => {
        //     let transmissionElements = document.querySelectorAll(`span[id^=Transmission]:not([id$=${selectedTransmission}]) > a`);
        //     [].forEach.call(transmissionElements, function (e) {
        //         e.click();
        //     }, selectedTransmission);
        // })


        //TODO: Enable/Disable Features

        //document.querySelector('.filter_feature#Automatic > a.negative').click()
        //document.querySelector('.filter_feature#Automatic > a.neutral').click()
        //document.querySelector('.filter_feature#Automatic > a.positive').click()
        await page.screenshot({path: `images/${listingInfo.vin.trim()}_trim.png`});

        console.log(`Closing form 2`)
        paramObj.configs.ready_to_collect_appraisal = true
        console.log(`Evaluation activated: ${paramObj.configs.ready_to_collect_appraisal}`)

        await page.click('#mview_graph_sources_modify_close', {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            timeout: 30000
        })
        console.log(`Form closed 2`)
        await page.waitFor(10000)
        await waitForPropertyValueChange(paramObj.configs, 'evaluation_loaded', false)
        console.log(`Data collection done\nVerification Starts...`)

        await page.waitForSelector('#pt_comparables_tab', {timeout: 30000})
        await page.waitFor(10000)
        await page.click('#pt_comparables_tab', {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            timeout: 30000
        })

        console.log(`Table is open for verification`)
        await page.waitFor(3000)

        await page.waitForSelector('#pt_comparables_price_sort', {timeout: 30000})
        await page.click('#pt_comparables_price_sort')
        await page.waitFor(3000)

        await page.screenshot({path: `images/${listingInfo.vin.trim()}_appraisals.png`});

        const resultTable = await page.$('#ComparablesTable  tr')
        if (resultTable) {
            const result = await page.$$eval('#ComparablesTable  tr', rows => {
                return Array.from(rows, row => {
                    const columns = row.querySelectorAll('td');
                    let columns_data = Array.from(columns, column => column.innerText);
                    console.log(`First column data: ${columns_data[1]}`)
                    let appraisal_vin = columns_data[1].substr(5, 17)
                    let appraisal_miles = columns_data[5].replace(/[^0-9.]/g, "")
                    let appraisal_price = columns_data[7].replace(/[^0-9.]/g, "")
                    return {
                        appraisal_vin,
                        appraisal_miles,
                        appraisal_price,
                    };
                });
            });

            let total_comparables = result.length
            result.sort(customSort('appraisal_price'))
            let data = result.slice(0, 4)

            console.log(`Total Comparables: ${total_comparables}`)
            data = data.map(function (e) {

                Object.assign(e, {"listing_id": this.id})
                return e
            }, {id: listingInfo.listing_id})

            console.log(`Result Data:`)
            console.log(data)

            await Appraisals.bulkCreate(data,
                {
                    ignoreDuplicates: true
                }
            )
            /*
                Replace into ArangoDB
            */
            await arango.query({
                query:`For listing in crawled_listings
                            Filter listing.listing_id == listing_id
                            update listing with @value in crawled_listings`,
                bindVars:{
                    listing_id: configs.current_listing_id,
                    value : {
                        total_comparables: total_comparables,
                        total_appraisals_collected: data.length,
                        appraisal_price_1: data[0] ? data[0]["appraisal_price"] : null,
                        appraisal_miles_1: data[0] ? data[0]["appraisal_miles"] : null,
                        appraisal_price_2: data[1] ? data[1]["appraisal_price"] : null,
                        appraisal_miles_2: data[1] ? data[1]["appraisal_miles"] : null,
                        appraisal_price_3: data[2] ? data[2]["appraisal_price"] : null,
                        appraisal_miles_3: data[2] ? data[2]["appraisal_miles"] : null,
                        appraisal_price_4: data[3] ? data[3]["appraisal_price"] : null,
                        appraisal_miles_4: data[3] ? data[3]["appraisal_miles"] : null,
                        dealer_socket_status: 'success',
                        dealer_socket_comment: `${data.length} appraisals collected`
                    }
                }
            })
            // await Listings.update({
            //     total_comparables: total_comparables,
            //     total_appraisals_collected: data.length,
            //     appraisal_price_1: data[0] ? data[0]["appraisal_price"] : null,
            //     appraisal_miles_1: data[0] ? data[0]["appraisal_miles"] : null,
            //     appraisal_price_2: data[1] ? data[1]["appraisal_price"] : null,
            //     appraisal_miles_2: data[1] ? data[1]["appraisal_miles"] : null,
            //     appraisal_price_3: data[2] ? data[2]["appraisal_price"] : null,
            //     appraisal_miles_3: data[2] ? data[2]["appraisal_miles"] : null,
            //     appraisal_price_4: data[3] ? data[3]["appraisal_price"] : null,
            //     appraisal_miles_4: data[3] ? data[3]["appraisal_miles"] : null,
            //     dealer_socket_status: 'success',
            //     dealer_socket_comment: `${data.length} appraisals collected`
            // }, {
            //     where: {
            //         listing_id: configs.current_listing_id
            //     }
            // })

            console.log(`${listingInfo.vin} Appraisal collected`)
            await page.waitFor(5000);
        } else {
            await listingInfo.update({
                dealer_socket_status: 'success',
                dealer_socket_comment: 'No appraisal found'
            })
            console.log(`${listingInfo.vin} No appraisal found`)
        }
    } catch (e) {
        console.log(`Error: ${e.message}`)
        await page.screenshot({path: `images/${listingInfo.vin.trim()}_error.png`});
        /*
                Replace into ArangoDB
            */
        await arango.query({
            query:`For listing in crawled_listings
                    Filter listing.listing_id == @listing_id
                    update listing with @value in crawled_listings`,
            bindVars:{
                listing_id: listingInfo.listing_id,
                value:{
                    dealer_socket_status: 'error',
                    dealer_socket_comment: `Something wen't wrong ${e.message}`
                }
            }
        })
        // await Listings.update({
        //     dealer_socket_status: 'error',
        //     dealer_socket_comment: `Something wen't wrong ${e.message}`
        // }, {
        //     where: {
        //         listing_id: listingInfo.listing_id
        //     }
        // })
    }


}

async function registerListener(configs) {
    configs.page.on('requestfinished', async req => {
        if (configs.ready_to_collect_appraisal) {
            if (req.url().indexOf('webservice/trade/edit?auction_net_include') !== -1) {
                try {
                    let response = req.response();
                    await saveAppraisals(await response.json())
                } catch (e) {
                    console.log(`Unable to read 'saveAppraisals'`)
                    console.log(e)
                }
            }
        }

    });
}

function customSort(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = (typeof a[key] === 'string')
            ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
            ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}

async function saveAppraisals(response) {
    console.log(`Evaluation start: ${configs.evaluation_loaded}`)
    configs.evaluation_loaded = true
    configs.all_appraisals = []
    return

    function formatAppraisalData(car) {
        return {
            appraisal_id: `${car.other_id}_${this.listing_id}`,
            appraisal_vin: car.vin,
            appraisal_price: car.price,
            appraisal_miles: car.odometer,
            listing_id: this.listing_id
        }
    }


    if (!(response.content && response.content.comparables && response.content.comparables.cars)) {
        /*
                Replace into ArangoDB
            */
            await arango.query({
                query:`For listing in crawled_listings
                            Filter listing.listing_id == @listing_id
                            update listing with @value in crawled_listings`,
                bindVars:{
                    listing_id: configs.current_listing_id,
                    value:{
                        dealer_socket_status: 'Done',
                        dealer_socket_comment: 'No appraisal found'
                    }
                }
            })
        // await Listings.update({
        //     dealer_socket_status: 'Done',
        //     dealer_socket_comment: 'No appraisal found'
        // }, {
        //     where: {
        //         listing_id: configs.current_listing_id
        //     }
        // })
        configs.evaluation_loaded = true
        configs.all_appraisals = []
        return
    }

    // let cars = response.content.comparables.cars.map(formatAppraisalData, {listing_id: configs.current_listing_id})
    // configs.all_appraisals = cars
    // cars.sort(customSort('appraisal_price'))
    //
    // let data = cars.slice(0, 4)
    // console.log(`${data.length} appraisals collected from ${cars.length}`)
    //
    // if (cars.length) {
    //     await Appraisals.bulkCreate(data,
    //         {
    //             ignoreDuplicates: true
    //         }
    //     )
    // } else {
    //     console.log(`No listing found in this page`)
    // }
    // await Listings.update({
    //     dealer_socket_status: 'Done',
    //     dealer_socket_comment: `${data.length} appraisals collected`
    // }, {
    //     where: {
    //         listing_id: configs.current_listing_id
    //     }
    // })
    configs.evaluation_loaded = true
    console.log(`Evaluation complete: ${configs.evaluation_loaded}`)
}

async function start(listings) {
    try {
        await browser.startBrowser({
            username: process.env.PROXY_USERNAME,
            password: process.env.PROXY_PASSWORD,
        })

        configs.page = await browser.getCurrentPage()

        await registerListener(configs)

        await loginToDealerSocket(configs.page, process.env.DEALERSOCKET_USERNAME, process.env.DEALERSOCKET_PASSWORD)

        await asyncForEach(listings, evaluate, {configs})

        console.log(`All listings evaluation done!`)
        // await configs.page.waitFor(99999999)
        await browser.closeBrowser()
    } catch (e) {
        await browser.closeBrowser()
    }

}

module.exports = start

