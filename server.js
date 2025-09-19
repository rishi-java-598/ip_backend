import express from "express";
import mongoose from "mongoose";

import cors from 'cors';
// import router from "./Routes/Router.js";
import dotenv from 'dotenv';
import path from 'path';
import { router } from "./Routes/router.js";
import { connectDB } from "./config/db.config.js";

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();
app.use(express.json());  
app.use(express.urlencoded({extended:false}));       
app.use(cors()); 

app.use('/api',router);

// const __dirname = path.resolve();
// console.log(__dirname);


// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/client/dist")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
  
//   );
// }

// app.use(express.static(path.join(__dirname, 'client', 'public')));

// POST method to create a transaction, update account balance, and update balance history
console.log(process.env.PORT);
console.log(process.env.DBURL);

import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js"; // adjust path if needed

dotenv.config();

const seedUsers = async () => {
  try {

    const hashedPassword = await bcrypt.hash("123456", 10); // default password

    const admin = {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      phone: "9999999999",
      role: "admin",
      status: "registered",
      createdAt: new Date()
    };

    const manager = {
      name: "Manager User",
      email: "manager@example.com",
      password: hashedPassword,
      phone: "8888888888",
      role: "manager",
      status: "registered",
      createdAt: new Date()
    };

    await User.insertMany([admin, manager]);

    console.log("✅ Admin & Manager created successfully.");
    console.log("📧 Admin Email: admin@example.com | 🔑 Password: 123456");
    console.log("📧 Manager Email: manager@example.com | 🔑 Password: 123456");

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    mongoose.disconnect();
  }
};



// mongoose.connect(process.env.DBURL)
// .then(()=>console.log("db connected")
// )

// checkingController.js
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString()
  });
};
// checkingController.js
const healthCheck2 = (req, res) => {
  res.status(200).send('Server is up and running!');
};

app.get('/health',(req,res)=>{
  
  healthCheck()});
app.get('/health2',healthCheck2);



// app.listen(PORT, () => {
//   console.log("Server is running on port 3000");
// });


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // seedUsers();
    });
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });