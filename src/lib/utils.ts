import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const YOUR_CLOUD_NAME = import.meta.env.VITE_YOUR_CLOUD_NAME

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const uploadToCloudinary = async (file:any) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "YOUR_UNSIGNED_PRESET");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${YOUR_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.secure_url;
};