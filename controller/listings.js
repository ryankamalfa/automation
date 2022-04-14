require('dotenv').config();
const db = require('../config/database');


const getAllMakes = async (req,res,done) =>{
	// console.log('sssssssssssssss');
	const makes = await db.query(`
	    FOR list IN listing_dataset collect brand = list.make with COUNT INTO count  RETURN {"make":brand,"value":brand, count:count}
	    `);
	  let makes_data = await makes.all();
	  // console.log('makes ------> ',makes_data);
	  res.send({ makes: makes_data });
};




const getAllModels = async (req,res,done) =>{
	// console.log('sssssssssssssss');
	let make = req.body.make;
	// console.log('makeeeeeeeeeeee -------->',make);
	const models = await db.query(`
	    FOR list IN listing_dataset 
			filter list.make == '${make}'
			collect modelName = list.model with COUNT INTO count  RETURN {"model":modelName,"value":modelName, count:count}
	    `);
	  let models_data = await models.all();
	  // console.log('models ------> ',models_data);
	  res.send({ models: models_data });
};



const getModelYearsList = async (req,res,done) =>{
	// console.log('sssssssssssssss');
	let {make,model} = req.body;
	// console.log('makeeeeeeeeeeee -------->',make);
	// console.log('model -------->',model);
	// return;
	const years = await db.query(`
	    FOR list IN listing_dataset 
			filter list.make == '${make}' and list.model == '${model}'
			collect yearName = list.year with COUNT INTO count  RETURN {"year":yearName,"value":yearName, count:count}
	    `);
	  let modelYearsList = await years.all();
	  // console.log('modelYearsList ------> ',modelYearsList);
	  res.send({ modelYearsList: modelYearsList });
};





const getmodelTrimList = async (req,res,done) =>{
	// console.log('sssssssssssssss');
	let {make,model,year} = req.body;
	// console.log('makeeeeeeeeeeee -------->',make);
	// console.log('model -------->',model);
	// console.log('year -------->',year);
	// return;
	const trims = await db.query(`
	    FOR list IN listing_dataset 
			filter list.make == '${make}' and list.model == '${model}' and list.year == '${year}'
			RETURN {"trim":list.trim,"value":list.trim}
	    `);
	  let modelTrimList = await trims.all();
	  // console.log('modelTrimList ------> ',modelTrimList);
	  res.send({ modelTrimList: modelTrimList });
};





const addNewListing = async (req, res) => {
	// console.log('should insert new listing');

  const { make,model,year,trim,userId } = req.body;


        const newListing = {
          make,
          model,
          year,
          trim,
          userId,
          createdAt:new Date(),
        };


        db.query({
	      query:'insert @value into listings',
	      bindVars:{value : newListing}
	    })



        // console.log('listing added',newListing);
        res.send({success:true});

};





const getActiveListings = async (req,res,done) =>{
	// console.log('sssssssssssssss');
	const listings = await db.query(`
	    For list in listings 
			For user in users
			Filter list.userId == user._key RETURN merge(list, {createdBy: user.name})
	    `);
	  let listings_data = await listings.all();
	  // console.log('makes ------> ',listings_data);
	  res.send({ listings: listings_data });
};



const deleteListing = async (req,res,next) =>{
		await db.query(`
	    	REMOVE '${req.body.listingId}' IN listings
	    `);
	  
	  res.send({ success:true });
	  
};



module.exports = {
  getAllMakes,
  getAllModels,
  getModelYearsList,
  getmodelTrimList,
  addNewListing,
  getActiveListings,
  deleteListing
};
