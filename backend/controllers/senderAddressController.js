import SenderAddress from "../models/SenderAddress.js";
import AppError from "../utils/appError.js";

const fields = ["fullName", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode", "country"];

export const getSenderAddresses = async (req, res, next) => {
  try {
    res.json({ addresses: await SenderAddress.find().lean() });
  } catch (error) { next(error); }
};

export const saveSenderAddress = async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (!["DTDC", "Postman"].includes(provider)) throw new AppError("Choose DTDC or Postman", 400);
    const address = Object.fromEntries(fields.map((field) => [field, typeof req.body?.[field] === "string" ? req.body[field].trim() : ""]));
    const candidate = new SenderAddress({ _id: provider, ...address });
    const validation = candidate.validateSync();
    if (validation) throw new AppError("Complete all sender address fields and keep each field within its length limit.", 400);
    const saved = await SenderAddress.findByIdAndUpdate(provider, { $set: address }, { upsert: true, new: true, runValidators: true });
    res.json({ address: saved, message: `${provider} sender address saved` });
  } catch (error) { next(error); }
};
