const express = require('express')
 
// creating an express instance

const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const connectDB = require('./config/database');
const userRoutes = require('./routes/user');
const usersRoutes = require('./routes/users');
const listingsRoutes = require('./routes/listings');
const homeRoutes = require('./routes/home');
const configRoutes = require('./routes/config');


const automation = require('./utils/automation');
const automationCronJob = require('./utils/automationCronJob');



//fire automation script
automationCronJob.init();

// getting the local authentication type



// connectDB();



const app = express();
const publicRoot = 'dist';

app.use(express.static(publicRoot))


app.use(bodyParser.json())

app.use(cookieSession({
    name: 'mysession',
    keys: ['vueauthrandomkey'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.use(passport.initialize());

app.use(passport.session());



app.get("/", (req, res, next) => {
  res.sendFile("index.html", { root: publicRoot })
})



// app.get("/api/test", (req, res, next) => {
//   // res.sendFile("index.html", { root: publicRoot })
//   console.log('Proxy is working');
//   res.send({success:true});
// });




// app.post("/api/user/login", (req, res, next) => {
//   // console.log('got login requet');
//   passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       return res.status(400).send([user, "Cannot log in", info]);
//     }

//     req.login(user, err => {
//       res.send("Logged in");
//     });
//   })(req, res, next);
// });




app.use('/api/user/', userRoutes);

app.use('/api/users/', usersRoutes);

app.use('/api/listings/', listingsRoutes);

app.use('/api/home/', homeRoutes);

app.use('/api/config/', configRoutes);

// app.get("/api/user/logout", function(req, res) {
//   req.logout();

//   console.log("logged out")

//   return res.send();
// });



// app.get("/api/user/get", authMiddleware, (req, res) => {
//   let user = users.find(user => {
//     return user.id === req.session.passport.user
//   })

//   console.log([user, req.session])

//   res.send({ user: user })
// })





app.listen(process.env.PORT || 3000, () => {
  console.log("Example app listening on port "+process.env.PORT || 3000);
})




