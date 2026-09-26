import mongoose from "mongoose";

const senderAddressSchema = new mongoose.Schema({
  _id: { type: String, enum: ["DTDC", "Postman"] },
  fullName: { type: String, required: true, trim: true, maxlength: 150 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  addressLine1: { type: String, required: true, trim: true, maxlength: 250 },
  addressLine2: { type: String, trim: true, maxlength: 250, default: "" },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
}, { timestamps: true });

export default mongoose.model("SenderAddress", senderAddressSchema);
