import api from "./api.js";

export const uploadMedia = async (file) => {
  const limit = file.type.startsWith("image/") ? 10 : 50;
  if (file.size > limit * 1024 * 1024) throw new Error(`${file.name} exceeds the ${limit} MB upload limit.`);
  const form = new FormData();
  form.append("file", file);
  try {
    const { data } = await api.post("/products/media", form, {
      headers: { "Content-Type": undefined },
      timeout: 150000,
    });
    return data.url;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Media upload failed. Please try again.");
  }
};
