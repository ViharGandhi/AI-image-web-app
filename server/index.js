import  express, { response } from 'express'
import  dotenv   from 'dotenv'
import  cors  from 'cors'
import  mongoose from  'mongoose'
import  {v2 as cloudinary}  from 'cloudinary'
import { Configuration,OpenAIApi } from 'openai'
import bodyParser from 'body-parser'
import axios from 'axios'
dotenv.config()
const app = express();
app.use(cors())
app.use(express.json({limit:'50mb'}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.connect('mongodb://localhost:27017/SplitBillSignUpDB', {
 useNewUrlParser: true,
 useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error',(err)=>{
    console.log("Failed To connect");
})
db.once('open',(err)=>{
    console.log("Connected Successsfully")
})
const Post = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    prompt:{
        type:String,
        require:true
    },
    photo:{
        type:String,
        require:true
    }


})
const postmodel = mongoose.model('postmodel',Post)
const router = express.Router()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API,
  });
  
const openai = new OpenAIApi(configuration);

app.post("/api/dalle",async(req,res)=>{
    try{
        const {prompt} = req.body
        console.log(prompt)
  
        const aiResponse = await openai.createImage({
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
          });
          const image = aiResponse.data.data[0].b64_json;
        res.status(200).json({photo:image})
    }catch(err)
    {
        res.status(500).send()
    }


})
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API,
    api_secret:process.env.CLOUD_API_SEC

})
app.get("/all/post",async(req,res)=>{
    try{
        const posts = await postmodel.find({})
        res.status(200).json({sucess:true,allpost:posts})

    }catch(error){
        console.log(error.message)
        res.status(500).json({sucess:false,message:error})
    }
})
app.post("/all/post",async(req,res)=>{

    const {name,prompt,photo} = req.body
    try{
        const photourl = await cloudinary.uploader.upload(photo)
        
        const newpost =  new postmodel({
            name:name,
            prompt:prompt,
            photo:photourl.url
        }) 
        await newpost.save()
        
        res.status(201).json({sucess:true,data:newpost})

    }catch(err)
    {
        console.log(err.message)
        res.status(500).send()
    }

})


const PORT = process.env.PORT
app.listen(PORT,function(){
    console.log(`Server running at port ${PORT}`)
})