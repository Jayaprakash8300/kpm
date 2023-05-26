const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Stripe = require('stripe')
const jwt = require("jsonwebtoken")
const paypal = require("paypal-rest-sdk");
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8000;

//mongodb connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to Databse"))

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});
generateAuthToken = (result)=>{
  const token = jwt.sign({_id:result._id},process.env.secretkey);
  return token
};
//
const userModel = mongoose.model("user", userSchema);

//api
app.get("/", (req, res) => {
  res.send("Server is running");
});

//sign up
app.post("/signup", async (req, res) => {
  // console.log(req.body);
  const { email } = req.body;

  const user = userModel.findOne({ email: email })
    if(user){
      res.send({ message: "Email id is already register", alert: false });
    }
    const data = userModel(req.body).save
    
      res.status(202).json({ message: "Successfully sign up", alert: true });
    }
)
//api login
app.post("/login",async (req, res) => {
  // console.log(req.body);
  const { email } = req.body;
  userModel.findOne({ email: email }, (err, result) => {
    if (result) {
      const dataSend = {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        image: result.image,
      };
      
      res.send({
        message: "Login is successfully",
        alert: true,
        data: dataSend,
        token:generateAuthToken(result)
      });
    } else {
      res.send({
        message: "Email is not available, please sign up",
        alert: false,
      });
    }
  });
});

//product section

const schemaProduct = mongoose.Schema({
  name: String,
  category:String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product",schemaProduct)



//save product in data 
//api
app.post("/uploadProduct",async(req,res)=>{
    // console.log(req.body)
    const data = await productModel(req.body)
    const datasave = await data.save()
    res.send({message : "Upload successfully"})
})

//
app.get("/product",async(req,res)=>{
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})
 

//paypal payment

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AXXDUHnaCj6rLyi1qN9Gg5K2JQ-k_ICFbhmIE-rDTiEwzAs-0kpukX3TA0GWUr8ndrn8VRvjhqIU-rm3',
  'client_secret': 'EFBiBA5H2jef6zRExxHXFVRMrVlW1CcCH6QLD0cN_qiyOzPKJd2NTCU6CWb4kKvBWykykLaLAZ76SOql'
});
app.post("/pay",async(req,res)=>{
const data = req.body;

  var create_payment_json = {

    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": data.name,
                "sku": "001",
                "price": data.price,
                "currency": "USD",
                "quantity": data.qty
            }]
        },
        "amount": {
            "currency": "USD",
            "total": data.price
        },
        "description": data.description
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i=0; i< payment.links.lenth;i++){
        if(payment/links[i].rel==="approval_url"){
          res.redirect(payment.links[i].href)
        }
      }
  }
});
})
//server is ruuning
app.listen(PORT, () => console.log("server is running at port : " + PORT));
