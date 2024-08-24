import User from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import {errorHandler} from '../utils/error.js'
import jwt from 'jsonwebtoken'

export const signup = async (req, res, next) => {
    const {username, email, password} = req.body
    const hashedPassword = bcryptjs.hashSync(password, 10)
    const newUser = new User({username, email, password: hashedPassword})
    try{
        await newUser.save()
        res
        .status(201)
        .json("User created succesfully")
    }
    catch(error){
        next(error)
    }
}

export const signin = async (req, res, next) => {
    const {email, password} = req.body
    
    try{
        // checking whether the user is valid using email
        const validUser = await User.findOne({email:email})
        if(!validUser){
            return next(errorHandler(404, 'User Not Found!'))
        }
        // checking for password
        const validPassword = bcryptjs.compareSync(password, validUser.password)
        if(!validPassword){
            return next(errorHandler(401, 'Bad Credentials!'))
        }

        // creating a token using JWT (signing it with User's Id from MongoDB)
        const token = jwt.sign({id: validUser._id},process.env.JWT_SECRET)

        // removing password in the user information that is being sent in response
        const {password: pass, ...rest} = validUser._doc

        // sending a cookie with the above jwt token (expires : 'time in seconds')
        res
        .cookie('access_token', token, {httpOnly: true})
        .status(200)
        .json(rest)

    }
    catch(err){
        next(err)
    }
}

export const google = async (req,res,next) => {
    const {name, email, photo} = req.body

    try{
        const user = await User.findOne({email: email})
        if(!user){
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
            const username = name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4)

            const newUser = new User({username: username, email: email, password: hashedPassword, avatar: photo})
            await newUser.save()

            const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET)
            const {password: pass, ...rest} = newUser._doc
            
            res
            .cookie('access_token', token, {httpOnly: true})
            .status(200)
            .json(rest)
        }
        else{
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            const {password: pass, ...rest} = user._doc

            res
            .cookie('access_token', token, {httpOnly: true})
            .status(200)
            .json(rest)
        }
    }
    catch(err){
        next(err)
    }
}

export const signout = async (req, res, next) => {
    try{
        res.clearCookie('access_token')
        res.status(200).json("User has been logged out")
    }
    catch(err){
        next(err)
    }
}
