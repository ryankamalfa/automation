require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');




const editUser = async (req,res,next) =>{
	const {_key,first_name,last_name,email} = req.body;
		await db.query({
			query : `update '${req.body._key}' WITH {
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


const deleteUser = async (req,res,next) =>{
		await db.query(`
	    	REMOVE '${req.body.userId}' IN users
	    `);
	  
	  res.send({ success:true });
	  
};



const getUsers = async (req,res,done) =>{
	const users = await db.query(`
	    FOR user IN users sort user.createdAt asc RETURN user 
	    `);
	  let users_data = await users.all();
	  // console.log('users ------> ',users_data);
	  
	  res.send({ users: users_data })
	  
};





const addUser = async (req, res) => {
	console.log('should insert new user');

  const { first_name,last_name, email } = req.body;
  const user = await db.query(`
    FOR user IN users FILTER user.email == '${email}' limit 1 RETURN user
    `);
  let user_exist = await user.all();


  // const isAdded = await User.findOne({ email: email });

  if (user_exist[0]) {
    console.log('account already exist');
    return res.status(401).send({
      name: user_exist[0].name,
      email: user_exist[0].email,
      message: 'Email Already Exist!',
    });
  }


        const newUser = {
          first_name,
          last_name,
          name:first_name+' '+last_name,
          email,
          password: bcrypt.hashSync('12345678'),
          last_login:null,
          createdAt:new Date()
        };


        db.query({
	      query:'insert @value into users',
	      bindVars:{value : newUser}
	    })



        console.log('account created',newUser);
        res.send({success:true});

};





module.exports = {
  addUser,
  editUser,
  getUsers,
  deleteUser
};
