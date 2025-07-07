
// Interface for the information about an uploaded image.
export interface ImageInfo {
  // The base64 encoded image data.
  base64Data: string;
  // The MIME type of the image.
  mimeType: string;
  // The data URL of the image.
  previewUrl: string;
}
