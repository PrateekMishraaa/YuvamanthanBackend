import express from "express"
const app = express()
import dotenv from "dotenv"
dotenv.config()
const PORT=process.env.PORT||4000
import cors from "cors"
import mongoose from "mongoose"
import User from "./routes/Users.js"

app.use(express.json())
app.use(cors())
app.use('/api',User)
app.get('/',(req,res)=>{
    console.log('baba')
    res.send("pandit")
})
mongoose.connect(process.env.MONGOURI)
.then(()=>console.log('Db connected'))
.catch((error)=>{
    console.log("disconnected",error)
})
app.listen(PORT,()=>console.log(`Server is ${PORT} running`))