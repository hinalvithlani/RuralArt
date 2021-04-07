var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Cart=require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);
var Product=require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/user/profile', isLoggedIn, function (req, res, next) {
  Order.find({user: req.user}, function(err,orders){
    if(err){
      return res.write("Error!");
    }
    var cart;
    orders.forEach(function(order){
      cart=new Cart(order.cart);
      order.items=cart.generateArray();
    });
    res.render('user/profile',{orders:orders})
  });
});
router.get('/', function(req, res, next) {
  var successMsg=req.flash('success')[0];
  Product.find(function(err,docs){
    var productChunks=[];
    var chunkSize=3;
    for(var i=0;i<docs.length;i+=chunkSize){
      productChunks.push(docs.slice(i,i+chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products:productChunks, successMsg:successMsg, noMessages:!successMsg});
  });
  
});

router.get('/about',function(req,res,next){
  res.render('shop/about');
});

router.get('/contact',function(req,res,next){
  res.render('shop/contact');
});

router.get('/user/signup', function (req, res, next) {
var messages = req.flash('error');
res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signup', passport.authenticate('local.signup', {
failureRedirect: '/user/signup',
failureFlash: true
}), function (req, res, next) {
if (req.session.oldUrl) {
  var oldUrl = req.session.oldUrl;
  req.session.oldUrl = null;
  res.redirect(oldUrl);
} else {
  res.redirect('/user/profile');
}
});

router.get('/user/signin', function (req, res, next) {
var messages = req.flash('error');
res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signin', passport.authenticate('local.signin', {
failureRedirect: '/user/signin',
failureFlash: true
}), function (req, res, next) {
if (req.session.oldUrl) {
  var oldUrl = req.session.oldUrl;
  req.session.oldUrl = null;
  res.redirect(oldUrl);
} else {
  res.redirect('/user/profile');
}
});

router.get('/user/logout', isLoggedIn, function(req,res,next){
  req.logout();
  res.redirect('/');
});

router.get('/add-to-cart/:id',function(req,res,next){
  var productId=req.params.id;
  var cart=new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function(err,product){
    if (err){
      return res.redirect('/');
    }
    cart.add(product,product.id);
    req.session.cart=cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/reduce/:id',function(req,res,next){
  var productId=req.params.id;
  var cart=new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart=cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id',function(req,res,next){
  var productId=req.params.id;
  var cart=new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart=cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart',function(req,res,next){
  if (!req.session.cart){
    return res.render('shop/shopping-cart',{products:null});
  }
  var cart=new Cart(req.session.cart);
  res.render('shop/shopping-cart',{products:cart.generateArray(),totalPrice:cart.totalPrice});
});

router.get('/checkout',function(req,res,next){
  if (!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart=new Cart(req.session.cart);
  var errMsg=req.flash('error')[0];
  res.render('shop/checkout',{total:cart.totalPrice, errMsg:errMsg, noError:!errMsg, csrfToken: req.csrfToken()});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
      return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  
  var stripe = require("stripe")(
      "sk_test_51Hfj1yJFHRaGvD9HwHZ1mm3x1j5VxtKjGj0tAhspzVPr9vDOS5LWBt7gbH9MvgW0G6lrhnykuUU49RYbgoils2z700WkkLR0TV"
  );

  stripe.charges.create({
      amount: cart.totalPrice * 100,
      currency: "inr",
      source: "tok_mastercard", // obtained with Stripe.js
      description: "Test Charge"
  }, function(err, charge) {
      if (err) {
          req.flash('error', err.message);
          return res.redirect('/checkout');
      }
      var order = new Order({
          user: req.user,
          cart: cart,
          address: req.body.address,
          name: req.body.name,
          paymentId: charge.id
      });
      order.save(function(err, result) {
          req.flash('success', 'Successfully bought product!');
          req.session.cart = null;
          res.redirect('/');
      });
  }); 
});


module.exports = router;
function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
function notLoggedIn(req,res,next){
  if (!req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl=req.url;
  res.redirect('/user/signin');
}