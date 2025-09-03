// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
function connectDB() {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      .then(conn => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        resolve(conn);
      })
      .catch(err => {
        console.error(`❌ Error: ${err.message}`);
        reject(err);
      });
  });
}

export {connectDB};
