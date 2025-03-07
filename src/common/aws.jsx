import {Toaster, toast} from "react-hot-toast"
import {useState} from "react"


const uploadImage = async (file) => {
    if (!file) return;

    let loadingToast = toast.loading("Uploading...");

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "blogging-website");
    data.append("cloud_name", "dju6xy8hl");

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dju6xy8hl/image/upload", {
            method: "POST",
            body: data,
        });

        const uploadedImageURL = await res.json();

        if (uploadedImageURL.url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded");
            return uploadedImageURL.url; 
        } else {
            throw new Error("Upload failed");
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Can not upload. Please try again");
        return null;
    }
};

export default uploadImage;