export async function uploadMedia(files) {
  const uploadedMedia = [];

  try {
    const formData = new FormData();
    formData.append("upload_preset", "doulitsa");
    formData.append("cloud_name", "ddejhvzbf");
    formData.append("api_key", "552113138292579");
    formData.append("timestamp", (Date.now() / 1000) | 0);

    for (const file of files) {
      formData.append("file", file);

      const requestOptions = {
        method: "POST",
        body: formData,
      };

      const uploadResponse = await fetch(
        "https://api.cloudinary.com/v1_1/ddejhvzbf/image/upload",
        requestOptions
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          `Failed to upload file ${file.name}: ${errorData.error.message}`
        );
      }

      const data = await uploadResponse.json();
      uploadedMedia.push(data.secure_url);
    }

    console.log("Media uploaded successfully");
    return uploadedMedia;
  } catch (error) {
    console.error("Error uploading media:", error);
    throw new Error("Failed to upload media");
  }
}
