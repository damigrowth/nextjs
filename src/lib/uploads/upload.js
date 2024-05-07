import { postData, postMedia } from "../api";

const convertToBlob = async (url) => {
  try {
    // console.log("BLOB URL", url);
    const response = await fetch(url);
    const blob = await response.blob();
    // console.log("BLOB", blob);

    return blob;
  } catch (error) {
    console.error("Error converting to Blob:", error);
    throw new Error("Failed to convert to Blob");
  }
};

// Upload media to Strapi
export async function uploadMedia(files) {
  const formData = new FormData();
  const uploadedMedia = [];

  for (const file of files) {
    formData.append("files", file, file.name);
  }

  const response = await postMedia("upload", formData);

  const mediaIds = response.map((media) => media.id);
  uploadedMedia.push(...mediaIds);

  console.log("response", uploadedMedia);

  return uploadedMedia;
}

// Upload media straight to Cloudinary
// export async function uploadMedia(files) {
//   const uploadedMedia = [];

//   try {
//     const formData = new FormData();
//     formData.append("upload_preset", "doulitsa");
//     formData.append("cloud_name", "ddejhvzbf");
//     formData.append("api_key", "552113138292579");
//     formData.append("timestamp", (Date.now() / 1000) | 0);

//     for (const file of files) {
//       formData.append("file", file);

//       const requestOptions = {
//         method: "POST",
//         body: formData,
//       };

//       const uploadResponse = await fetch(
//         "https://api.cloudinary.com/v1_1/ddejhvzbf/image/upload",
//         requestOptions
//       );

//       if (!uploadResponse.ok) {
//         const errorData = await uploadResponse.json();
//         throw new Error(
//           `Failed to upload file ${file.name}: ${errorData.error.message}`
//         );
//       }

//       const data = await uploadResponse.json();
//       uploadedMedia.push(data.secure_url);
//     }

//     console.log("Media uploaded successfully");
//     return uploadedMedia;
//   } catch (error) {
//     console.error("Error uploading media:", error);
//     throw new Error("Failed to upload media");
//   }
// }
