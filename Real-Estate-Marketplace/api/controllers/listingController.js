import Listing from "../models/listingModel.js"
import { errorHandler } from "../utils/error.js"

export const createListing = async (req, res, next) => {
    try{
        const listing = await Listing.create(req.body)
        return res.status(200).json(listing)
    }
    catch(err){
        next(err)
    }
}

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id)

    if(!listing){
        return next(errorHandler(404, 'Listing not found'))
    }

    if(req.user.id !== listing.userRef){
        return next(errorHandler(401, 'You can only delete your own Listing'))
    }

    try{
        await Listing.findByIdAndDelete(req.params.id)
        res.status(200).json("Listing has been deleted")
    }
    catch(err){
        next(err)
    }
}

export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id)
    if(!listing){
        return next(errorHandler(404, 'Listing not found'))
    }

    if(req.user.id !== listing.userRef){
        return next(errorHandler(401, 'You can only update your own Listing'))
    }

    try{
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.status(200).json(updatedListing)
    }
    catch(err){
        next(err)
    }
}

export const getListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id)
    if(!listing){
        return next(errorHandler(404, 'Listing not found'))
    }

    try{
        const listing = await Listing.findById(req.params.id)
        res.status(200).json(listing)
    }
    catch(err){
        next(err)
    }
}

export const getListings = async (req, res, next) => {
    try{
        const limit = parseInt(req.query.limit) || 9
        const startIndex = parseInt(req.query.startIndex) || 0

        // both offer - false & true
        let offer = req.query.offer
        if(offer === undefined || offer === 'false'){
            // search in ($in) databse for listings with both offer = true or false
            offer = { $in: [false,true] }
        }

        // both furnished - false & true
        let furnished = req.query.furnished
        if(furnished === undefined || furnished === 'false'){
            furnished = { $in: [false,true] }
        }

        // both parking - false & true
        let parking = req.query.parking
        if(parking === undefined || parking === 'false'){
            parking = { $in: [false, true] }
        }

        // both rent and sale
        let type = req.query.type
        if(type === undefined || type === 'all'){
            type = { $in: ['sale', 'rent']}
        }

        const searchTerm = req.query.searchTerm || ''
        // if not mentioned -> latest comes first
        const sort = req.query.sort || 'createdAt'

        const order = req.query.order || 'desc'

        const listings = await Listing.find({
            // $regex is from mongodb which searches for searchTerm in whole string (a part or whole word) & options: 'i' is for anycasing
            name: { $regex: searchTerm, $options: 'i'},
            offer,
            furnished,
            parking,
            type, 
        })
        .sort( {[sort]: order} )
        .limit(limit)
        .skip(startIndex)

        return res.status(200).json(listings)

    }
    catch(err){
        next(err)
    }
}