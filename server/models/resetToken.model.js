import bcrypt from "bcrypt";
import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({

    owner : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    token : {
        type : String,
        required : true,
    },
    createdAt : {
        type : Date,
        expires : 3600,
        default  :Date.now()
    }
} )

resetTokenSchema.pre("save",async function( next ){
    if(!this.isModified("token")) return next();

    this.token = await bcrypt.hash(this.token,10)
    next();
}
)

resetTokenSchema.methods.compareToken = async function(token){
    const result = await bcrypt.compareSync(token,this.token);
    return result // return true or false
}

export const ResetToken = mongoose.model('ResetToken',resetTokenSchema) 