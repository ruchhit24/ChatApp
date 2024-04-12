import { hash } from "bcrypt";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({

    name : {
        type :String,
        required : true,
    },
    username : {
        type:String,
        required : true, 
    },
    email : {
        type:String,
        required : true,
        unique : true,
    },
    password : {
        type :String,
        required : true,
        select : true,
    },
    bio : {
        type :String,
        required : true,
    },
    avatar : {
        public_id : {
            type :String,
            required : true,
        },
        url : {
            type :String,
            required : true,
        },
    },
    isVerified : {
        type : Boolean,
        default : false,
        required : true,
    },
},{ timestamps : true})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        console.log("Hashed password:", hashedPassword);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log("Candidate password:", candidatePassword);
    console.log("Stored hashed password:", this.password);
    try {
        const result = await bcrypt.compareSync(candidatePassword, this.password);
        return result; // return true or false
    } catch (error) {
        throw new Error(error.message);
    }
};

export const User = mongoose.model('User',userSchema) 