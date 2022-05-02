const arango = require('./model/arango');
const async = require('async');



(async()=>{
    let listings = await arango.query(`
        For x in crawled_listings
        Sort x.created_at asc
        return x
        `);
    let listingsData = await listings.all();

    let start_id = 100000;

    console.log(listingsData.length);

    async.eachSeries(listingsData,function(listing,callback){
        (async()=>{
            await arango.query({
                query:`for listing in crawled_listings
                        filter listing._id == @_id
                        update listing with {script_id:@script_id} in crawled_listings`,
                bindVars:{
                    _id:listing._id,
                    script_id:start_id
                }
            });
            console.log('update_listing ---- ',start_id);
            start_id++;
            callback();
        })()
    },function(){
        console.log('Updated all listings');
        process.exit(0);
    });
})();

