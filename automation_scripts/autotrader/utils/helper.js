const fs = require('fs');

function isFileExists(path) {
    return fs.existsSync(path);
}

async function blockImage(req) {
    // if(req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image'){
    if (req.resourceType() === 'image') {
        let allowedDomains = ['gstatic.com', 'google.com', 'googleapis.com']
        if (allowedDomains.some(el => req.url().includes(el))) {
            req.continue()
        } else {
            req.abort()
        }
    } else {
        req.continue()
    }
}

async function encodeStringForURI(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, escape)
}

async function asyncForEach(array, callback, paramObj) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array, paramObj);
    }
}

/**
 * @param obj withe a property that need to be monitored for change
 * @param propertyToMonitor
 * @param currentValue
 */
async function waitForPropertyValueChange(obj, propertyToMonitor, currentValue) {
    return new Promise((resolve, reject) => {
        const times = 120;
        let i = 0;
        const interval = setInterval(() => {
            if (obj[propertyToMonitor] !== currentValue) {
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
    blockImage,
    encodeStringForURI,
    asyncForEach,
    isFileExists,
    waitForPropertyValueChange
}
