require("dotenv").config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const cors=require("cors");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");


app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("connected to db"))
    .catch(err => console.log("db connection error", err));

const userschema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,enum:["viewer","analyst","admin"],default:"viewer"},
    status: { type: String, enum: ["active", "inactive"], default: "active" }}, 
{timestamps: true });

const user=mongoose.model("user",userschema);

const recordschema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  notes: String}, 
{ timestamps: true });

const Record=mongoose.model("Record",recordschema);

//middleware
const auth=(req,res,next)=>{
    const token=req.headers.authorization;
    if(!token){
        return res.status(401).json({message:"no token provided"});

    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(401).json({message:"invalid token"});
    }
}

const authorize=(...roles)=>(req,res,next)=>{
if(!roles.includes(req.user.role)) {
    return res.status(403).json({message:"forbidden"});
}
next();
}

const validaterecord=({amount,type,category,date})=>{
    if(!amount || amount<=0) return "amount must be a positive number";
    if(!["income","expense"].includes(type)) return "type must be income or expense";
    if(!category) return "category is required";
    if(!date || isNaN(Date.parse(date))) return "invalid date";
    return null;

}

//routes
app.get("/",(req,res)=>{
    res.send("finance system is running can check with different endpoints ");
});
app.post("/api/auth/register",async(req,res)=>{
    try{
        const{name,email,password,role}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({message:"name,email and password are required"});
        }
        const hashed=await bcrypt.hash(password,10);
        const newuser=new user({name,email,password:hashed,role})
        await newuser.save();
        res.json(newuser);
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
})

app.post("/api/auth/login",async(req,res)=>{
    try{
        const{email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:"email and password are required"});
        }
        const existing=await user.findOne({email});
        if(!existing) return res.status(404).json({message:"user not found"});

        if(existing.status==="inactive") return res.status(403).json({message:"account is inactive"});

        const match=await bcrypt.compare(password,existing.password);
        if(!match) return res.status(400).json({message:"invalid credentials"});

        const token=jwt.sign({id:existing._id,role:existing.role},process.env.JWT_SECRET,{expiresIn:"1h"});
        res.json({token});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//user management routes
app.get("/api/users",auth,authorize("admin"),async(req,res)=>{
    const users=await user.find().select("-password");
    res.json(users);
})

app.patch("/api/users/:id",auth,authorize("admin"),async(req,res)=>{
    const {role,status}=req.body;

    
    if(role && !["viewer","analyst","admin"].includes(role)){
        return res.status(400).json({message:"invalid role"});
    }
    if(status && !["active","inactive"].includes(status)){
        return res.status(400).json({message:"invalid status"});
    }
    const updated=await user.findByIdAndUpdate(req.params.id,
        {role,status},
        {new:true}).select("-password");
        res.json(updated);
})

//record routes
app.post("/api/record",auth,authorize("admin"),async(req,res)=>{
const error=validaterecord(req.body);
if(error) return res.status(400).json({message:error});
const record=await Record.create({...req.body,userId:req.user.id});
res.json(record);
})

app.get("/api/record",auth,authorize("admin","analyst"),async(req,res)=>{
const {type,category,page=1,limit=10}=req.query;
let filter={userId:req.user.id};
if(type) filter.type=type;
if(category) filter.category=category;
const records=await Record.find(filter).skip((page-1)*limit).limit(Number(limit));
res.json(records);
})

//updating record
app.put("/api/record/:id",auth,authorize("admin"),async(req,res)=>{
    const updated=await Record.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.json(updated);
})
app.delete("/api/record/:id",auth,authorize("admin"),async(req,res)=>{
    await Record.findByIdAndDelete(req.params.id);
    res.json({message:"record deleted"});
});

//dashboard route
app.get("/api/dashboard/summary",auth,async(req,res)=>{
 const record=await Record.find({userId:req.user.id});
 const totalincome=record.filter(r=>r.type==="income").reduce((sum,r)=>sum+r.amount,0);
 const totalexpense=record.filter(r=>r.type==="expense").reduce((sum,r)=>sum+r.amount,0);
 res.json({totalincome,totalexpense,netbalance:totalincome-totalexpense});
})

//category wise su,mary
app.get("/api/dashboard/category",auth,async(req,res)=>{
    const record=await Record.find({userId:req.user.id});
     const result = {};
  record.forEach(r => {
    result[r.category] = (result[r.category] || 0) + r.amount;
  });
    res.json(result);

})

//monthly summary
app.get("/api/dashboard/monthly",auth,async(req,res)=>{
    const record=await Record.find({userId:req.user.id});
     const trends = {};

  record.forEach(r => {
    const month = new Date(r.date).toISOString().slice(0, 7);

    if (!trends[month]) {
      trends[month] = { income: 0, expense: 0 };
    }

    if (r.type === "income") trends[month].income += r.amount;
    else trends[month].expense += r.amount;
  });

  res.json(trends);
})

//server 
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
});
