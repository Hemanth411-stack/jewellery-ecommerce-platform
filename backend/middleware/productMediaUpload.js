import multer from "multer";
import AppError from "../utils/appError.js";
import { uploadProductMedia } from "../services/cloudinaryService.js";

const receive = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 0, parts: 1 } }).single("file");

export const receiveProductMedia = (req, res, next) => receive(req, res, (error) => {
  if (error) return next(new AppError(error.code === "LIMIT_FILE_SIZE" ? "The file exceeds the 50 MB upload limit." : "Upload one file using the file field.", 400));
  next();
});

export const uploadProductMediaHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("Choose an image or video to upload.", 400);
    const media = await uploadProductMedia(req.file.buffer, req.file.mimetype);
    res.status(201).json({ success: true, ...media });
  } catch (error) { next(error); }
};
