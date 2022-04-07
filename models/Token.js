// const db = require('../config/database');
// setTimeout(()=>{
//     db.collection('tokens');
// },5000);

// // db.query({
// //   query: "RETURN @value",
// //   bindVars: { value: new Date()}
// // })
// //   .then(function(cursor) {
// //     return cursor.next().then(function(result) {
// //       console.log(result);
// //     });
// //   })
// //   .catch(function(err) {
// //     // ...
// //   });
// // const mongoose = require("mongoose");
// // const Schema = mongoose.Schema;

// // const tokenSchema = new Schema({
// //     userId: {
// //         type: Schema.Types.ObjectId,
// //         required: true,
// //         ref: "user",
// //     },
// //     token: {
// //         type: String,
// //         required: true,
// //     },
// //     unUsed: {
// //         type: Boolean,
// //         default: true,
// //         required: true,
// //     },
// //     createdAt: {
// //         type: Date,
// //         default: Date.now,
// //         expires: 3600,
// //     },
// // });

// // module.exports = mongoose.model("token", tokenSchema);