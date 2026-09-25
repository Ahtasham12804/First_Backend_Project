import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" // iska kaam h server se user ke browser me cookie access krna or set krna


const app = express()


// app.use krke ham middleware ko set krte hai 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))


 
app.use (express.json({limit:"16kb"})) // iska kaam h json formate me aayi request ko read krna or limit ka kaam h ki kitni badi request ko read krna h .. agar request limit se badi h to express usko reject kr dega ..

app.use(express.urlencoded({extended:true, limit:"16kb"})) // ye URL encoded formate me aayi request ko parse krta h .. extended:true ka matlab h ki agar request me nested object h to usko bhi parse kr dega ..
// eg :- name=Ahtasham&email=ahtasham%40gmail.com

app.use(express.static("public")) // iska kaam h ki public folder me jo bhi static files h usko browser se direct access krna.. jaise ki images, css, js files etc ...


app.use(cookieParser()) // iska kaam h ki server se user ke browser me cookie access krna or set krna














// routes import
import userRouter from "./routes/user.routes.js";





// routes declaration
app.use("/api/v1/users", userRouter) // iska kaam h ki jab bhi user /users ke sath koi request kare to usko userRoutes me bhej dega .. 
//eg :- http///localhost:5000/api/v1/users/register



export {app}