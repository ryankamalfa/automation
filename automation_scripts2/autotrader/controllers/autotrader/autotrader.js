const Listings = require('../../model/listings')
const listing = new Listings()
const {waitForPropertyValueChange} = require('../../utils/helper')

let config = {}

class AutoTrader {
    constructor(browser) {
        this.browser = browser
        this.page = browser.page
    }

    async waitForSearchResult(page) {
        return await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                const times = 60;
                let i = 0;
                const interval = setInterval(() => {
                    let vehicles = null
                    try {
                        vehicles = gtmManager._dataLayer[0].lists[0].vehicles;
                    } catch (e) {
                        console.log(`[gtmManager] not loaded yet`)
                    }
                    if (vehicles) {
                        clearInterval(interval);
                        resolve();
                    } else if (i === times) {
                        reject('Wait for gtmManager._dataLayer[0].lists[0].vehicles timeout')
                    }
                    i++;
                }, 1000)
            })
        });
    }


    async search(search_url) {
        await this.page.goto(search_url, {timeout: 60000}).catch(e => e)
        await this.waitForSearchResult(this.page).catch(e => e)

        let status = await this.page.waitForFunction(() => typeof searchResultsDataJson === 'string').then(() => true).catch(() => false);
        return status


    }

    async getListingURLsAndIds(searchResultsDataJson) {
        await this.page.waitFor(1000)

        let number_of_results = await this.page.$eval('#sbCount', el => el.innerText)
        if(number_of_results == '0') {
            console.log(`No result found`)
            return null
        }

        const divsCounts = await this.page.$$eval('div.listing-details.organic a', e => e.map((a) => {
            return {
                platform: 'autotrader',
                listing_url: a.href,
                listing_id: a.href.match(/\/\d+_\d+.*?\/\?/)[0].replace(/[\/\?]+/g, '')
            }
        }));
        return divsCounts
        // console.log(divsCounts)

        // let ad_ids = await this.page.evaluate(() => {
        //     return gtmManager._dataLayer[0].lists[0].vehicles.filter(e => e.listingPosition == "organic").map(e => e.adID.replace('-', '_'))
        // })
        //
        // // let listingURLs = await searchResultsDataJson.compositeIdUrls.map(e => "https://www.autotrader.ca" + e).filter(value => row_urls.filter(e => e.listingPosition == "organic").map(e => e.adID.replace('-', '_')).some(element => value.includes(element)));
        // let listingURLs = await searchResultsDataJson.compositeIdUrls.map(e => "https://www.autotrader.ca" + e).filter(value => ad_ids.some(element => value.includes(element)));
        // if (listingURLs) return ad_ids.map(a1 => {
        //     return {
        //         platform: 'autotrader',
        //         listing_id: a1 + '_organic',
        //         listing_url: listingURLs.find((a2) => a2.indexOf(a1) > -1)
        //     }
        // })
        // else
        //     return []
    }

    async getSearchResult() {
        return this.page.evaluate(() => {
            try {
                let listingURLs = JSON.parse(searchResultsDataJson);
                if (listingURLs)
                    return listingURLs
            } catch (e) {
                console.log(`Unable to parse search result`)
            }

        })
    }
}

module.exports = AutoTrader
