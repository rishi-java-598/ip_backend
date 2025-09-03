import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },

  role: { 
    type: String, 
    enum: ["admin", "manager", "member"], 
    required: true 
  },

  // Member-specific
  membership: {
    type: {
      type: String, // Gold, Silver, Platinum
      default: null
    },
    validity: {
      startDate: Date,
      endDate: Date
    },
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "inactive" 
    }
  },

  uniqueIdCard: { type: String, unique: true }, // QR/barcode ID

  status: { 
    type: String, 
    enum: ["registered", "pending"], 
    default: "registered" 
  },

  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
