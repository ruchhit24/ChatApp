import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { ResetToken } from "../models/resetToken.model.js";

export const isResetTokenValid  = async(req,res,next)=>{
const{token , id} = req.query;
if(!token || !id)
{
    return res.status(401).json({message : "invalid request!!"})
}
if(!isValidObjectId(id))
{
    return res.status(401).json({message : "invalid user!!"})
}
const user = await User.findById(id)
if(!user)
{
    return res.status(401).json({message : "user not found!!"})
}
const resetToken = await ResetToken.findOne({owner : user._id})
if(!resetToken)
{
    return res.status(401).json({message : "reset token not found!!"})
}

// sending token to get compare with the token saved in db
const isValid = await resetToken.compareToken(token)
if(!isValid)
{
    return res.status(401).json({message : "reset token is not valid!!"})
}
req.user = user;
next()
}