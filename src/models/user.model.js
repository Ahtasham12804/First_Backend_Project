import mongoose , { Schema } from 'mongoose'; // yaha mongoose ke saath schema ko bhi import kiya hai 
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // trim lagane se username ke aage aur peeche ke space remove ho jate hai
            index: true // index lagane se search fast ho jata hai database me
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },

        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, // cloudinary url 
            required: true
        },

        coverImage:{
            type: String, // cloudinary url
        },


        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true , 'Password is required'] 
        },

        refreshToken: { // refresh token se hum user ko baar baar login karne se bachate hai 
            type: String, 
        },

    }, {timestamps: true}

)


userSchema.pre('save', async function(next) { // ye pre save hook hai jo user save hone se pehle run hota hai
    if(!this.isModified('password')) return next(); // agar password modify nahi hua hai to next() call karenge

    this.password = await bcrypt.hash(this.password, 10); // password ko hash karenge 10 rounds ke saath
    next();
})



userSchema.methods.isPasswordCorrect = async function(password) { // ye method password ko compare karne ke liye hai
    return await bcrypt.compare(password, this.password); // bcrypt ke compare method se password ko compare karenge
}




userSchema.methods.generateAccessToken = function() { // ye method access token generate karne ke liye hai
    return jwt.sign(
        { 
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {  
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES
        }
    ); // jwt ke sign method se access token generate karenge
}




userSchema.methods.generateRefreshToken = function() { // ye method refresh token generate karne ke liye hai
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        }
    ); // jwt ke sign method se refresh token generate karenge
}




export const User = mongoose.model('User', userSchema)