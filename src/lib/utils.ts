import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

  // store in my folder
  formData.append("folder", "benkiz_images");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_YOUR_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }

  // STORE ONLY RAW DATA (NO TRANSFORMS)
  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
};