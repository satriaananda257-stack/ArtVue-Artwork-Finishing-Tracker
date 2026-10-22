import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = (
  fileBuffer: Buffer
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "posts", resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    uploadStream.end(fileBuffer)
  })
}

export const deleteFromCloudinary = (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: "image" }, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}
