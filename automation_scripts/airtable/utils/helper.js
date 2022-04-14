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

function compareValues(key, order = 'asc') {
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




let __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};

async function sleepForSeconds(min_seconds, max_seconds) // min and max included
{
    if (!min_seconds || min_seconds < 1) {
        console.log('First parameter is required and must be grater than 0');
        return;
    }
    if (!max_seconds) max_seconds = min_seconds;

    let delay = Math.floor(Math.random() * (max_seconds - min_seconds + 1) + min_seconds);
    await sleep(delay * 1000);
}

async function sleepForMinutes(min_minutes, max_minutes) // min and max included
{
    if (!min_minutes || min_minutes < 1) {
        console.log('First parameter is required and must be grater than 0');
        return;
    }
    if (!max_minutes) max_minutes = min_minutes;

    let delay = Math.floor(Math.random() * (max_minutes - min_minutes + 1) + min_minutes);
    console.log(`Executing delay (minutes): ${delay}`);

    await sleep(delay * 60 * 1000);
}

async function sleep(milliseconds) {
    // logger.info(`Sleeping for ${milliseconds/1000} seconds`);
    return await __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    });
}

module.exports = {
    blockImage,
    encodeStringForURI,
    asyncForEach,
    isFileExists,
    waitForPropertyValueChange,
    compareValues,
    sleepForMinutes,
    sleepForSeconds
}
