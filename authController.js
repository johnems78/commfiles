const User = require('../models/User');
const Institution = require("../models/Institution");
const Iron = require("../models/Iron");
const Iron_dep = require("../models/Iron_dep");
const Iron_withdr = require("../models/Iron_withdr");
const Bronze_dep = require("../models/Bronze_dep");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", password: "", username: ""}; //firstname: "", lastname: "", phone: ""};
  
     // incorrect email
     if (err.message === 'incorrect email') {
       errors.email = 'that email is not registered';
     }

     // incorrect password
     if (err.message === 'incorrect password') {
      errors.password = 'that password is incorrect';
    }

     // incorrect username
     //if (err.message === "incorrect username") {
       //errors.username = "That usernme is not registered";
    //}


     //duplicate error code
     if (err.code === 11000) {
       errors.email = 'that email is already registered';
       return errors;
     }

     // duplicate username error
     if (err.code === 11000) {
       errors.username = "that username is already registered";
      return errors;
    }


    // validation errors
    if (err.message.includes('user validation failed')) {
      Object.values(err.errors).forEach(({properties}) => {
        errors[properties.path] = properties.message;
      })   
     }

     return errors;
  }

  const maxAge = 3 * 24 * 60 * 60;
  const createToken = (id) => {
    return jwt.sign({ id }, "net ninja secret", {
      expiresIn: maxAge
    });  
  }

module.exports.signup_get = (req, res) => {
    res.render("signup");
  };
  
  module.exports.login_get = (req, res) => {
    res.render("login");
  };
  
  module.exports.signup_post = async (req, res) => {
     const { email, password, username, firstname, lastname, address, city, postal, country, gender, phone } = req.body;
     
     try {
       const user = await User.create({ email, password, username, firstname, lastname, address, city, postal, country, gender, phone});
       const token = createToken(user._id);
       res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
       res.status(201).json({ user: user._id });
      }
     catch (err) {
       const errors = handleErrors(err);
       res.status(400).json({ errors });
     };
  };  

  module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.login(email, password);
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id })
    }
    catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  }  

  module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }

  module.exports.users_get = (req, res) => {
    //const customers = customers;
    //const customer = Customer.findAll();
    User.find({}, function (err, users) {
      res.render("users", {
        //tittl "All customers",
        userList: users,
      });
    });
  };

  module.exports.institutions_get = (req, res) => {
    Institution.find({}, function (err, institutions) {
      res.render("institutions", {
        //tittl "All customers",
        institutionList: institutions,
      });
    });
  };
  
  module.exports.institutions_post = async (req, res) => {
    const { instName, security, initialTransfer, capital } = req.body;
  
    try {
      const institution = await Institution.create({
        instName,
        security,
        initialTransfer,
        capital,
      });
      console.log(instName, security, initialTransfer, capital);
      res.status(201).json(institution);
    } catch (err) {
      console.log(err);
      res.status(400).send("error, institution not created");
    }
  };

  module.exports.irons_get = (req, res) => {
    Iron.find({}, function (err, irons) {
      res.render("irons", {
        //tittl "All irons",
        ironList: irons,
      });
    });
  };
  
  module.exports.irons_post = async (req, res) => {
    const { level, depositAmount, withdrawalAmount, income, giveBack } = req.body;
  
    try {
      const iron = await Iron.create({
        level,
        depositAmount,
        withdrawalAmount,
        income,
        giveBack,
      });
      console.log(level, depositAmount, withdrawalAmount, income, giveBack);
      res.status(201).json(iron);
    } catch (err) {
      console.log(err);
      res.status(400).send("error, iron not created");
    }
  };
  
  // for iron deposit request
  module.exports.iron_deps_get = (req, res) => {
    Iron_dep.find({}, function (err, iron_deps) {
      res.render("iron_deps", {
        //tittl "All irons",
        iron_depList: iron_deps,
      });
    });
  };
  
    // for iron deposit request
  module.exports.iron_deps_post = async (req, res) => {
    const { username, level, depAmount, income, giveBack, depReqDate } = req.body;
  
    try {
      const iron_dep = await Iron_dep.create({
        username,
        level,
        depAmount,
        income,
        giveBack,
        depReqDate,
      });
      console.log(username, level, depAmount, income, giveBack, depReqDate);
      res.status(201).json(iron_dep);
    } catch (err) {
      console.log(err);
      res.status(400).send("error, iron deposit request not created");
    }
  };
  
     // for displaying lists in iron deposit 
  module.exports.iron_dep_get = (req, res) => {
    Iron_dep.find({}, function (err, iron_dep) {
      res.render("iron_dep", {
        //tittl "All irons",
        iron_depList: iron_dep,
      });
    });
  };

  module.exports.iron_withdrs_get = (req, res) => {
    Iron_withdr.find({}, function (err, iron_withdrs) {
      res.render("iron_withdrs", {
        //tittl "All irons",
        iron_withdrList: iron_withdrs,
      });
    });
  };
  
  module.exports.iron_withdrs_post = async (req, res) => {
    const { username, level, withdrAmount, withdrDate } = req.body;
  
    try {
      const iron_withdr = await Iron_withdr.create({
        username,
        level,
        withdrAmount,
        withdrDate,
      });
      console.log(username, level, withdrAmount, withdrDate);
      res.status(201).json(iron_withdr);
    } catch (err) {
      console.log(err);
      res.status(400).send("error, iron withdrawal request not created");
    }
  };

  module.exports.iron_withdr_get = (req, res) => {
    Iron_withdr.find({}, function (err, iron_withdr) {
      res.render("iron_withdr", {
        //tittl "All irons",
        iron_withdrList: iron_withdr,
      });
    });
  };

  module.exports.iron_show_get = (req, res) => {
    //console.log(req.params.id);
    Iron_withdr.findById(req.params.id, function(err, iron_withdr) {
      //if (err) {
          //console.log(err);
      //} else {
          //console.log(iron_withdr);
          res.render("iron_show", {
            //tittl "All irons",
            iron_withdr: iron_withdr,
          });
      //}
    });
  };

  module.exports.bronze_deps_get = (req, res) => {
    //Iron_dep.find({}, function (err, iron_deps) {
      res.render('bronze_deps');
        //tittl "All irons",
        //iron_depList: iron_deps,
      //});
    //});
  }
  
  module.exports.bronze_deps_post = async (req, res) => {
    const { username, level } = req.body;
  
    try {
      const bronze_dep = await Bronze_dep.create({username, level });
      //console.log(username, level, depAmount, income, giveBack);
      res.status(201).json(bronze_dep);
    } 
    catch (err) {
      const errors = handleErrors(err);
      //console.log(err);
      res.status(400).json({ errors });
      //res.status(400).send("error, iron deposit request not created");
    }
  }