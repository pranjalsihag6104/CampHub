const express = require('express');
const router = express.Router();
const campgrounds=require('../controllers/campgrounds'); 
const catchAsync=require('../utils/catchAsync');
const{isLoggedIn,validateCampground,isAuthor}=require('../middleware');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload=multer({storage});

const Campground=require('../models/campground');
//const Review=require('./models/review');

router.route('/')
      .get(catchAsync(campgrounds.index))
      .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));  
      
      //  .post(upload.array('image'), catchAsync(async(req, res) => {
      //       console.log('Body:', req.body);
      //       console.log('Files:', req.files);
      //       res.send("it worked");
      //   }));
 

router.get('/new',isLoggedIn,campgrounds.renderNewForm)   
      
router.route('/:id')
      .get(catchAsync(campgrounds.showCampground))
      .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
      .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));


module.exports=router;