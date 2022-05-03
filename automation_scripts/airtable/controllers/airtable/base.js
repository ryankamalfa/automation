const Airtable = require('airtable');

module.exports = class Base {
    constructor(table, view) {
        this.base = new Airtable({apiKey: 'keyI2dNHT2va6YT8j'}).base('appjlB7bfLhg0SBic');
        this.table = table;
        this.view = 'viwOH9KQFeaXE7T6S';
        this.fixView = 'viwjFr8iIcBB1vrCL';
    }

    find(id) {
        return new Promise((resolve, reject) => {
            this.base(this.table).find(id, (err, record) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(record);
            });
        });
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            this.base(this.table)
                .update(id, data, (err, record) => {
                    console.log('----------',data);
                    if (err) {
                        console.error('Update Error', err);
                        reject(err);
                        return;
                    }
                    resolve(record.id);
                })
        });
    }

    all(options,isFixView) {
        let records = [],
            params = {};

        Object.assign(params, options);
        if (this.view) {
            params.view = isFixView ? this.fixView : this.view;
        }

        return new Promise((resolve, reject) => {
            // Cache results if called already
            if (records.length > 0) {
                resolve(records);
            }

            const processPage = (partialRecords, fetchNextPage) => {
                records = [...records, ...partialRecords];
                fetchNextPage();
            };

            const processRecords = (err) => {
                if (err) {
                    console.error('ERROR:', err);
                    reject(err);
                    return;
                }

                resolve(records);
            };

            this.base(this.table).select(params).eachPage(processPage, processRecords);
        });
    }

    create(params) {
        return new Promise((resolve, reject) => {
            this.base(this.table).create(params, (err, records) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(records)
            });
        });
    }

    async findOrCreate(listing_id) {
        const listings = await this.all(
            {
                filterByFormula: `listing_id='${listing_id}'`
            }
        );
        if (listings.length) {
            return listings[0];
        }
        return this.create({listing_id});
    }




    async findListingsWithMissingData() {
        const listings = await this.all(
            {
                fields:["listing_id"],
                // filterByFormula: "{vin} = ''",
            }
        );
        console.log('lisitng with messing data -----------------------------------',listings.length);
        console.log(listings.map(x => x.fields.listing_id))
        return listings.map(x => x.fields.listing_id);
        // return listings[0];
        
    }
}



