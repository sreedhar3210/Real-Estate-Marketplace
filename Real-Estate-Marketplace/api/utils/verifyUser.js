import jwt from 'jsonwebtoken'
import {errorHandler} from './error.js'

export const verifyToken = (req, res, next) => {
    console.log("verifyUSer")
    console.log(req.body)
    const token = req.cookies.access_token

    // if no token present (not logged in)
    if(!token){
        console.log("no token")
        return next(errorHandler(401, 'Unauthorized'))
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log("verifyToken")
        // Invalid User
        if(err){
            return next(errorHandler(403, 'Forbidden'))
        }

        // we are sending the info about user from token(cookie) to the next middleware
        req.user = user
        next()
    })
}