let puppeteer = require('puppeteer')
const jfile = require('jsonfile')
const cloud = require('../model/cloud');

class Browser {
    constructor(proxy) {
        this.proxy = proxy
        this.browser = null
        this.page = null
    }

    async init() {
        console.log(`Launching browser`);
        let credentials = await cloud.get_credentials();
        console.log('cloud -----------> &&',credentials.luminati.username);
        try {
            let proxyServer = ''
            if (this.proxy) {
                proxyServer = `--proxy-server=http://zproxy.lum-superproxy.io:22225`
            }
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
            })
            this.page = (await this.browser.pages())[0]
            // await this.page.setRequestInterception(true);
            // this.page.on("request", interceptedRequest => {
            //     if (interceptedRequest.resourceType() === 'image') interceptedRequest.abort()
            //     else interceptedRequest.continue()
            // });

            //Authenticate Proxy
            if (this.proxy) {
                console.log(`Authenticating proxy`)

                await this.page.authenticate({
                    username: credentials.luminati.username,
                    password: credentials.luminati.password
                })
            }

            console.log(`Setting user-agent`)
            //Set user-agent
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:75.0) Gecko/20100101 Firefox/75.0')
            return this

        } catch (e) {
            console.log(e)
            process.exit(1)
        }
    }

    async getPage() {
        if (this.page)
            return this.page
    }

    async closeBrowser() {
        if (this.browser)
            await this.browser.close()
    }

    async gotoUrl(url, forceReload = false, maxDelayInSec = null) {
        let page = this.page
        if (!maxDelayInSec || maxDelayInSec < 1) maxDelayInSec = 5 * 1000
        else maxDelayInSec = maxDelayInSec * 1000
        let currentURL = await page.url()

        console.log(`Visiting url: ${url}`)
        // console.log(`Current url ${currentURL}`)
        console.log(`maxDelayInSec: ${maxDelayInSec}`)

        let reTryCount = 0
        const maxRetry = 3
        let loaded = false
        do {
            try {
                if (currentURL === url) {
                    await page.reload({waitUntil: ['networkidle2', 'load', 'domcontentloaded'], timeout: 30000})
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
                    await page.goto(url, {
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

    async waitForAjax() {
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


    async waitForSearchResult() {
        await this.page.evaluate(() => {
            return new Promise((resolve, reject) => {
                const times = 40;
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
    };


}

module.exports = Browser
