const puppeteer = require("puppeteer");
let browser = null;
let page = null;
const cloud = require('../model/cloud');

async function startBrowser(proxy) {
    let credentials = await cloud.get_credentials();
        console.log('cloud -----------> &&',credentials.luminati.username);
    let proxyServer = ''
    if (proxy) {
        proxyServer = `--proxy-server=http://zproxy.lum-superproxy.io:22225`
    }
    browser = await puppeteer.launch({
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

    page = (await browser.pages())[0]

    //Authenticate Proxy
    if (proxy) {
        console.log(`Authenticating proxy`)
        await page.authenticate({
            username: credentials.luminati.username,
            password: credentials.luminati.password
        })
    }

    //Set user-agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:75.0) Gecko/20100101 Firefox/75.0')
}

function blockImagesOnRequest(interceptedRequest) {
    if (interceptedRequest.resourceType() === 'image') interceptedRequest.abort()
    else interceptedRequest.continue()
}

async function registerImageBlocker(interceptedRequest){
    await page.setRequestInterception(true);
    page.on('request', blockImagesOnRequest);
}

async function deRegisterImageBlocker(){
    page.removeListener('request', blockImagesOnRequest);
}

async function getCurrentPage() {
    return page;
}

async function getBrowserCookies() {
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

module.exports = {
    startBrowser,
    getCurrentPage,
    getBrowserCookies,
    clearCache,
    closeBrowser,
    clickSelector,
    registerImageBlocker,
    deRegisterImageBlocker
}
