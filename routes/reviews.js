const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../utils/schemas');
const { validateReview, isLoggedin, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedin, validateReview, catchAsync (reviews.createReview));

router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync (reviews.deleteReview));

module.exports = router;