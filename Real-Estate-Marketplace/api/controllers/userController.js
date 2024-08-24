import User from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js'
import Listing from '../models/listingModel.js'

export const updateUser = async (req,res,next) => {
    // checking whether user's id from params and previous middleware(i.e verifyUser) is same or not
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can only update yourn own account!'))
    }

    try{
        console.log("updating")
        if(req.body.password){
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        console.log(req.body)
        // {new: true} is for returning the updated info into 'updatedUser' instead of previous info
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set:{
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar,
            }
        }, {new: true})
        const {password, ...rest} = updatedUser._doc
        res.status(200).json(rest)
    }
    catch(err){
        next(err)
    }
}

export const deleteUser = async (req, res, next) => {
    // checking whether user's id from params and previous middleware(i.e verifyUser || cookie) is same or not
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can only delete your own account!'))
    }

    try{
        await User.findByIdAndDelete(req.params.id)

        res.clearCookie('access_token')
        res.status(200).json("User has been deleted")
    }
    catch(err){
        next(err)
    }
}

export const getUserListings = async (req, res, next) => {
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can only view your own Listings!'))
    }

    try{
        const listings = await Listing.find({userRef: req.params.id})
        res.status(200).json(listings)
    }
    catch(err){
        next(err)
    }
}

export const getUser = async(req, res, next) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user) return next(errorHandler(404, 'User not Found'))
    
        const {password: pass, ...rest} = user._doc
    
        res.status(200).json(rest)
    }
    catch(err){
        next(err)
    }   
}