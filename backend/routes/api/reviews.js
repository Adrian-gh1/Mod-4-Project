// backend/routes/api/spots.js
const express = require('express')

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, SpotImage, Review, User, ReviewImage } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


const router = express.Router();

const validateReviews = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .isFloat({min: 1, max: 5})
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

const checkReviewExists = async (req, res, next) =>{
    const reviewId = req.params.reviewId;
        let review = await Spot.findByPk(reviewId);

        if (!review) {
            res.status(404).json({
                "message": "Review couldn't be found"
              })
        }  
    next();
}



//Get all Reviews of the Current User
router.get('/current',
    requireAuth,
    async (req, res, next) => {
    const userId = req.user.id;

    const reviews = await Review.findAll({
        where: {userId: userId},
        include:[
            {
                model: User,
                attributes:['id', 'firstName', 'lastName']
            },
            {
                model: Spot,
                attributes:['id', 'ownerId', 'address', 'city', 'state', 'country', 
                    'lat', 'lng', 'name', 'price'],
                include:{
                    model: SpotImage,
                    attributes:['url']
                } 
            },
            {
                model: ReviewImage,
                attributes:['id', 'url']
            }

        ]
    })

    let formattedReviews = reviews.map(review => {
               
        review = review.toJSON();
        if (review.Spot.SpotImages && review.Spot.SpotImages.length > 0){
            review.Spot.previewImage = review.Spot.SpotImages[0].url;
            delete review.Spot.SpotImages; 
        } else{
            review.Spot.previewImage = null;
        }
                
        return review;        
    })

    res.status(200).json({
        Reviews: formattedReviews
    })
    
})


// Edit a Review

router.put('/:reviewId',
    requireAuth,
    checkReviewExists,
    validateReviews,
    async (req, res, next) => {
    const reviewId = req.params.reviewId;

    let review = await Review.findByPk(reviewId);

    if (review.userId === req.user.id){
        review.set({
            "review": "This was an awesome spot!",
            "stars": 5,
        })
        await review.save();

        res.status(200).json(review);
    } else{
        const err = new Error('Review must belong to the current user');
        err.status = 403;
        return next(err);
     }
    
})


module.exports = router;