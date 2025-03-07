import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Image from "@editorjs/image"
import Header from "@editorjs/header"
import Marker from "@editorjs/marker"
import Quote from "@editorjs/quote"
import InlineCode from "@editorjs/inline-code"
import uploadImage from "../common/aws" // not aws

const uploadImageByFile = async (file) => {
    const url = await uploadImage(file);
    if (url) {
        return {
            success: 1,
            file: { url },
        };
    } else {
        return {
            success: 0,
            file: null,
        };
    }
};

const uploadImageByURL = (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch(err) {
            reject(err)
        }
    })
    return link.then(url=> {
        return {
            success: 1,
            file: {url}
        }
    })
}

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [2,3,4,5],
            defaultLevel: 2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlinecode: InlineCode
}