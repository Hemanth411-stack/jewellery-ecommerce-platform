import { beginOperation } from "../services/operationActivity.js";

export const readUpload = (file) => {
  const finish = beginOperation();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please try again.`));
    reader.onabort = () => reject(new Error("File upload was cancelled."));
    reader.readAsDataURL(file);
  }).finally(finish);
};
