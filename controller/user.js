require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const sendResetEmail = require('../utils/sendResetEmail');
const crypto = require("crypto");
// const Token = require("../models/Token");
const validateToken = require('../utils/validateToken');


const loginUser = async (req, res, next) => {
  // try {
    console.log('user login');
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send({message:'Email or password is wrong, Try again'});
      }

      req.login(user, err => {
        res.send(user);
      });
    })(req, res, next);

};





// const registerUser = async (req, res) => {

//   const { first_name,last_name, email, password,country } = req.body;

//   const isAdded = await User.findOne({ email: email });

//   if (isAdded) {
//     console.log('account already exist');
//     return res.status(401).send({
//       name: isAdded.name,
//       email: isAdded.email,
//       message: 'Email Already Verified!',
//     });
//   }


//         const newUser = new User({
//           first_name,
//           last_name,
//           country,
//           name:first_name+' '+last_name,
//           email,
//           password: bcrypt.hashSync(password),
//         });
//         newUser.save();

//         console.log('account created',newUser);
//         res.send({

//           _id: newUser._key,
//           first_name:newUser.first_name,
//           last_name:newUser.last_name,
//           country:newUser.country,
//           name: newUser.name,
//           email: newUser.email,
//           message: 'Email Verified, Please Login Now!',
//         });

// };






const getUserData = async (req, res, next) => {
          console.log('get user data');
          const user = await db.query(`
            FOR user IN users 
            Filter user._key == '${req.session.passport.user}'
            RETURN user 
            `);
          let user_data = await user.all();
          
          if (
            user_data[0]
          ) {
          let user_object = {
              _id: user_data[0]._key,
              first_name:user_data[0].first_name,
              last_name:user_data[0].last_name,
              name: user_data[0].name,
              email: user_data[0].email
            };

            console.log([user_data[0], req.session]);
            res.send({ user: user_object });
          }else{
            res.status(401).send({message:'You are not authorized, Please login'});
          }

};



const logoutUser = async (req, res, next) => {
  req.logout();

  console.log("logged out")

  return res.send();

};


passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },

    async (username, password, done) => {
      try{
        console.log('--------->')
        const user = await db.query(`
          FOR user IN users FILTER user.email == '${username}' limit 1 RETURN user
          `);
        let user_data = await user.all();
          console.log('user ---> ',user_data[0]);
           if (
              user_data[0] &&
              user_data[0].password && 
              bcrypt.compareSync(password, user_data[0].password)
            ) {
            let user_object = {
                // token,
                id: user_data[0]._key,
                first_name:user_data[0].first_name,
                email: user_data[0].email
              };
              console.log(`update '${user_data[0]._key}' WITH {
                  last_login: '${new Date()}'
                } in users`);
              //update user last login field
              await db.query(`update '${user_data[0]._key}' WITH {
                  last_login: '${new Date()}'
                } in users`);
              console.log('user_object',user_object);
              done(null, user_object)
            } else {
              console.log('Wrong credentials');
              done(null, false, { message: 'Incorrect username or password'})
            }
          // const user = await User.findOne({ email: username });
          
        } catch (err) {
          done(null, false, { message: 'Server error'})
      }
    }
  )
)



passport.serializeUser((user, done) => {
  done(null, user.id)
})


passport.deserializeUser(async (id, done) => {
  // const user = await User.findOne({_id:id});
  const user = await db.query(`
    FOR user IN users FILTER user._key == '${id}' limit 1 RETURN user
    `);
  let user_data = await user.all();
  if (
    user_data[0]
  ) {
    done(null, user_data[0])
  }

  
})








const forgetPassword = async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  const user = await db.query(`
    FOR user IN users FILTER user.email == '${req.body.email}' limit 1 RETURN user
    `);
  let user_data = await user.all();
  console.log('--------->',user_data);
  if (!user_data[0]) {
    console.log('email not exist');
    return res.status(404).send({
      message: 'User Not found with this email!',
    });
  } else {
    let token = {
            userId: user_data[0]._key,
            token: crypto.randomBytes(16).toString("hex"),
            unUsed:true,
            createdAt: new Date()
        }
        console.log(token);
        // return;
    db.query({
      query:'insert @value into tokens',
      bindVars:{value : token}
    })
    // let token = await new Token().save();
    

    const body = {
      from: `"Vechiele Automation Script" ${process.env.EMAIL_USER}`,
      to: `${req.body.email}`,
      subject: 'Vechiele Automation Script Password Reset',
      html: `<h2>Hi ${user_data[0].name}</h2>
      <p>A request has been received to change the password for your <strong>Vechiele Automation Script</strong> account </p>

        <p>This link will expire in <strong> ${process.env.TOKEN_EXPIRY_AFTER} minutes</strong>.</p>

        <p style="margin-bottom:20px;">Click this link to reset your password</p>

        <a href=${process.env.STORE_URL}/auth/reset?uid=${user_data[0]._key}&token=${token.token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>

        <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@tripnas.com</p>

        <p style="margin-bottom:0px;">Thank you</p>
        <strong>Vechiele Automation Script Team</strong>
             `,
    };

    const message = 'Please check your email to reset password!';
    sendResetEmail(body, res, message);
  }
};





const resetPassword = async (req, res) => {
  const token = req.body.token;
  const userId = req.body.userId;
  if (await validateToken(userId,token)) {

        // const user = await User.findById(userId);

        // user.password = bcrypt.hashSync(req.body.password);
        // user.save();
        await db.query(`update '${userId}' WITH {
            password:'${bcrypt.hashSync(req.body.password)}'
        } in users`);
        res.send({
          message: 'Your password change successful, you can login now!',
        });

  }else{
    console.log('token not valid');
    return res.status(500).send({
          message: 'Token not valid, please try again!',
        });
  }
};




const updateUserAccount = async (req,res,next) =>{
  const {_id,first_name,last_name,email} = req.body;
    await db.query({
      query : `update '${_id}' WITH {
        first_name: @first_name,
        last_name: @last_name,
        name:@name,
        email:@email
      } in users`,
      bindVars:{
        first_name:first_name,
        last_name:last_name,
        name:first_name+' '+last_name,
        email:email
      }
    });
    res.send({ success:true });
    
};


const updateUserPassword = async (req,res,next) =>{
  const {_id, password} = req.body;
    await db.query({
      query : `update '${_id}' WITH {
        password: @password
      } in users`,
      bindVars:{
        password:bcrypt.hashSync(password)
      }
    });
    res.send({ success:true });
    
};



module.exports = {
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  getUserData,
  updateUserAccount,
  updateUserPassword
};
