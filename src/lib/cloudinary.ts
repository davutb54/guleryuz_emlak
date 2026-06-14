import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
  secure: true,
});

export default cloudinary;

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function getCloudinaryThumbnailUrl(url: string): string {
  return url.replace("/upload/", "/upload/c_fill,w_480,h_360/");
}

export function getCloudinaryPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : "";
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resourceType?: "image" | "video" } = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options.folder ?? "guleryuz/uploads",
          resource_type: options.resourceType ?? "image",
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
          else resolve(result);
        }
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(
  url: string,
  resourceType: "image" | "video" = "image"
): Promise<void> {
  const publicId = getCloudinaryPublicId(url);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
