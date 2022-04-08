var arangojs = require('arangojs');

const host = '159.203.44.118'
// const host = 'localhost'
const port = '8529'
const username = 'root'
const password = '24687531'
const databasename = '_system'
// const encodedCA = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURHVENDQWdHZ0F3SUJBZ0lSQVBMK20vMERtTS8xNTJLNUwzTFZ6Mzh3RFFZSktvWklodmNOQVFFTEJRQXcKSmpFUk1BOEdBMVVFQ2hNSVFYSmhibWR2UkVJeEVUQVBCZ05WQkFNVENFRnlZVzVuYjBSQ01CNFhEVEl5TURRdwpOVEV4TVRVek5sb1hEVEkzTURRd05ERXhNVFV6Tmxvd0pqRVJNQThHQTFVRUNoTUlRWEpoYm1kdlJFSXhFVEFQCkJnTlZCQU1UQ0VGeVlXNW5iMFJDTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEKMGMrTktBaHRteFlsUkVkMUdQYmlFZzdyaXFKeXYzYUszViszUUNjZ21aZ0xjNXp6YkM4TFBOQkJJNVlVMDNUOApoN3kyVFZObDhyblFwRW9DOHJRYXp5Vmhxbmg3Ui92QTBQWklRQ2tRUVlkZ0RaVE1XdjV3dzd6TTVwc1IyWEp1CkluOTdxU0Y2cDRJZ3ZPQytYNU5pbDJMZXdFVXJUMVkyc0xOLzhnOGtYQjlKQjJ6SmJ0RGNTT0g5NGZQSVcvemMKM2ovY2hEd09mUjVuc29mb2pDM1pLZnU3N3BtMzVWdXY5OHQ0S0FRYjY5aGUxa2hLZEIxM0FzWS85bUNUQ3BaagpsRForZXFaN2o4UkhmOWdtOTgrd1pBVmFrd3BmYm5SaFc2VDd2N2d6dXIzNkVleElnb3RTMDgrMWU0eVRzd2FvCm1URnJ0Wk5kSFJHdTNydHY4YWU0YlFJREFRQUJvMEl3UURBT0JnTlZIUThCQWY4RUJBTUNBcVF3RHdZRFZSMFQKQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVVgrVDUyU2k2bHcyNXYrU1FLeUZ3cG9vTURLMHdEUVlKS29aSQpodmNOQVFFTEJRQURnZ0VCQUJlemlMRm9selRHd3JOZjVBbER6Uzl4MEw5Vzkya056NTB5REVmMEFBNTZwbDVHCmJpRVBWbW9BNWo0VmptZDcwSGFxckRxLzZiT0Vtb29IY3hqZUg3ZFBEZ2ttSGhNYmFyTG9qbXdzbWtCWDN6R2oKKzRZaUl3VEdCeGZ0UzFDSmUraGN4eVZTMWM1WDRHcWJKTXZkRW4xS3YzdEtwVTNKQjhHeFFvRU5ZY1dQbzh2SgpKbEF3d05CeSthRTFnYVJlNi9qekh5NFpLUTVQT2FRQTIxNUZDbUpZRmcvUTVJQ2hLVmpYd2hQRWVaSzB0OVhCCnFqcXhnTlNWWWNHamN0TmZFSGw0V2U2S3FvV0lFZktWMEs2anJ1ZmwvZEhtbHhjZnBSVUJsZ1c3cVhhMnoveVAKdXdtYjNTeElHeXh0aHcxWEdmNGJaaTNOZ0wyM1pGcmNQa2orb3pZPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==";



db = new arangojs.Database({
    url: `http://${username}:${password}@${host}:${port}`,
    databaseName: databasename,
    // agentOptions: {ca: Buffer.from(encodedCA, "base64")}
});
// db.useBasicAuth(username, password);










// 
// const arangojs = require("arangojs");
// const connectDB = arangojs({url: "https://590248f5d021.arangodb.cloud:18529", agentOptions: {ca: Buffer.from(encodedCA, "base64")}});
// connectDB.useBasicAuth("root", "KxR4hc9xIIBxRFXHtUf7");
// if(connectDB){
//   console.log('Connected with ArangoDB successfully');
//   setTimeout(()=>{
//     connectDB.version().then(
//       version => console.log(version),
//       error => console.error(error)
//     );
//   },5000);
// }else{
//   console.log('Cannection with ArangoDB Failed');
// }



module.exports = db;