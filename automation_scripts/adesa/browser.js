const puppeteer = require("puppeteer");
const {PendingXHR} = require('pending-xhr-puppeteer');
const Listings = require('./model/listings');
const cloud = require('./model/cloud');
const arango = require('./model/arango');

let browser = null;
let page = null;
let searchPageLoaded = null
let maxPages = null
let result_per_page = null
let pendingXHR


async function startBrowser(proxy) {
    let credentials = await cloud.get_credentials();
        console.log('cloud -----------> &&',credentials.luminati.username);
    let proxyServer = ''
    if (proxy) {
        proxyServer = `--proxy-server=http://zproxy.lum-superproxy.io:22225`
    }
    browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        // defaultViewport: null,
        // devtools: true,
        args: [
            "--enable-features=NetworkService",
            "--ignore-certificate-errors",
            "--no-sandbox",
            '--window-size=1920,1170',
            '--window-position=0,0',
            proxyServer
        ],
        ignoreHTTPSErrors: true,
        headless: true,
        slowMo: 50
    });
    page = (await browser.pages())[0];
    pendingXHR = new PendingXHR(page);
    //Authenticate Proxy
    if (proxy) {
        console.log(`Authenticating proxy`)
        await page.authenticate({
            username: credentials.luminati.username,
            password: credentials.luminati.password
        })
    }
    console.log(`Setting user-agent`)
    //Set user-agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
}

async function registerListeners() {
    await page.setRequestInterception(true);

    page.on("request", request => {
        if (request.resourceType() === 'image') request.abort()
        else request.continue()
    });
    page.on("response", async function (request) {
        if (request.url().indexOf('execute-api.us-east-2.amazonaws.com/prod/api/search/index?') !== -1 && (await request.headers())["content-length"] > 0) {
            console.log(`Listing found in response!`)
            await saveSearchResults(await request.json())
        }
    })

    // page.on('requestfinished', async req => {
    //     if (req.url().indexOf('execute-api.us-east-2.amazonaws.com/prod/api/search/index?page=results') !== -1) {
    //         try {
    //             let response = await req.response();
    //             await saveSearchResults(await response.json())
    //         } catch (e) {
    //             console.log(`Unable to read 'saveSearchResults'`)
    //             console.log(e)
    //         }
    //     }
    // });
}

async function saveSearchResults(response) {
    if (maxPages === null) {
        result_per_page = response.vehicles.length

        if (response.totalVehicles > response.vehicles.length)
            maxPages = Math.ceil(response.totalVehicles / response.vehicles.length)
        else
            maxPages = 1
    }

    let data = response.vehicles.map(v => {
        let transmission = v.origTransmission ? v.origTransmission.toLowerCase() : null
        if (!transmission) {
            transmission = 'Unspecified'
        } else if (transmission.indexOf('automatic') !== -1) {
            transmission = 'Automatic'
        } else if (transmission.indexOf('manual') !== -1) {
            transmission = 'Manual'
        } else if (transmission.indexOf('power') !== -1) {
            transmission = 'Power Shift'
        } else if (transmission.indexOf('direct') !== -1) {
            transmission = 'Direct Drive'
        } else if (transmission.indexOf('other') !== -1) {
            transmission = 'Other'
        }

        let trim_label = v.trim ? v.trim : '';

        let price = v.hasOwnProperty("buyNowPrice") ? v.buyNowPrice: null;
        let start_price = v.hasOwnProperty("startPrice") ? v.startPrice : null;
        let drivetrain = v.hasOwnProperty("origDriveTrain") ? v.origDriveTrain.replace('Wheel Drive', 'WD').replace(/\s+/g, '') : null;

        return {
            platform: 'adesa',
            listing_url: `https://openauctionca.prod.nw.adesa.com/mfe/vdp?vehicleId=${v.nwVehicleId}`,
            listing_id: v.nwVehicleId,
            year: v.year,
            make: v.make,
            model: v.model,
            trim: trim_label,
            search_trim: trim_label,
            engine: v.origEngineName,
            miles: Math.round(v.origOdometer * 0.621371),
            kilometres: v.origOdometer,
            auto_grade: v.autoGradeValue,
            vin: v.vin,
            interior_colour: v.origInteriorColor,
            exterior_colour: v.origExteriorColor,
            location: v.origProcessingLocation,
            transmission: transmission,
            drivetrain,
            dealer: v.origSellerOrganizationName,
            province: v.stateAbbreviation,
            price,
            start_price,
            status: 'Used',
            details_collection_status: true,
            details_collection_status_message: 'success',
        }
    })
    console.log({data})
    if (data.length) {

        arango.query({
                    query: `FOR listing IN @value INSERT listing in crawled_listings`,
                    bindVars: { value: data }
                  })
                    .then(function(cursor) {
                      return cursor.next().then(function(result) {
                        // ...
                        console.log('successfully updated listings into arangodb');
                        searchPageLoaded = true;
                      });
                    })
                    .catch(function(err) {
                      // ...
                      console.log('error inserted into arangodb',err);
                    });

        // await Listings.bulkCreate(data,
        //     {
        //         ignoreDuplicates: true
        //     }
        // ).then(() => {
        //     console.log(`Data was updated`)
        //     searchPageLoaded = true
        // })
    } else {
        console.log(`No listing found in this page`)
    }
}

async function loginToAdesa(username, password) {
    console.log(`Login started`)
    let response = await page.goto("https://buy.adesa.ca/openauctionca/home.html?utm_campaign=login&utm_source=adesa.ca&utm_medium=header&utm_content=button", {
        waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
        timeout: 120000
    });
    console.log(`Waiting for username field`)
    await page.waitForSelector('#accountName', {timeout: 60000})
    await page.type('#accountName', "")
    await page.waitFor(100)
    await page.type('#accountName', username)
    await page.evaluate((username) => {
        document.getElementById('accountName').value = username;
    }, username)
    await page.type('#password', "")
    await page.type('#password', password)
    await page.waitFor(1000)
    await page.evaluate((password) => {
        document.getElementById('password').value = password
    }, password)
    console.log(`Password entered`)
    await page.waitFor(5000);
    console.log(`Clicking submit button`)
    await page.click('#loginSubmit', {waitUntil: ['networkidle0', 'load', 'domcontentloaded']})
    console.log(`Waiting for login confirm`)
    await page.waitForSelector('.user-config', {timeout: 120000})
    console.log(`Login successful!`)
}

async function getSavedSearchURLAdesa() {
    console.log(`Visiting saved search page`)
    let response = await page.goto('https://openauctionca.prod.nw.adesa.com/mfe/search?page=savedsearchlist', {
        waitUntil: ['networkidle2'],
        timeout: 240000
    })
    await page.waitFor(2000)
    console.log(`Waiting for the first save search button`)
    await page.waitForSelector('.run', {timeout: 240000})
    await page.click('.run', {waitUntil: ['networkidle2', 'load', 'domcontentloaded'], timeout: 240000})
    return await page.url()
}

async function searchAdesa(url, currentMaxPage) {
    console.log(`Visiting result page: ${url}`)
    if (currentMaxPage === 0) maxPages = null
    searchPageLoaded = null
    let response = await page.goto(url, {waitUntil: ['networkidle2', 'load', 'domcontentloaded'], timeout: 240000});
    await page.waitFor(2000)
    await pendingXHR.waitForAllXhrFinished();
    return await waitForSearchLoad().then(() => {
        return {
            maxPages,
            result_per_page
        }
    }).catch(() => false)
}

async function getPage() {
    return page;
}

async function getBrowserSession() {
    return await page.cookies();
}

async function clearCache() {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
    }
}

async function getElementByXpath(path) {
    const elements = await page.$x(path);
    if (elements.length > 0) {
        return elements[0];
    } else {
        return null;
    }
}

async function clickSelector(selector) {
    let searchByPath = false;
    let path = '';
    if (selector.includes('//')) {
        searchByPath = true;
        path = selector;
    }

    try {
        if (searchByPath) {
            const button = await getElementByXpath(path);
            if (button) {
                await button.click();
                return true;
            }
        } else {
            const selectorButton = await page.$(selector);
            await selectorButton.hover();
            await selectorButton.click();
            return true;
        }
    } catch (e) {
        console.log('Unable to click button', {error: e});
    }
}

async function waitForSearchLoad() {
    return new Promise((resolve, reject) => {
        const times = 120;
        let i = 0;
        const interval = setInterval(() => {
            if (searchPageLoaded !== null) {
                clearInterval(interval);
                resolve();
            } else if (i === times) {
                reject('Wait for searchPageLoaded timeout')
            }
            i++;
        }, 1000)
    })
}

module.exports = {
    startBrowser,
    loginToAdesa,
    registerListeners,
    getSavedSearchURLAdesa,
    searchAdesa,
    getPage,
    getBrowserSession,
    clearCache,
    closeBrowser,
    clickSelector
}
