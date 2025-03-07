import { useState, useContext, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { UserContext } from "../App";
import axios from "axios";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

const BlogEditor = () => {
  const [loading, setLoading] = useState(false);

  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holderId: "textEditor",
          data: content,
          tools: tools,
          placeholder: "Let's write an awsome story ",
        })
      );
    }
  }, []);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    let loadingToast = toast.loading("Uploading...");
    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "blogging-website");
    data.append("cloud_name", "dju6xy8hl");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dju6xy8hl/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const uploadedImageURL = await res.json();
    if (uploadedImageURL.url) {
      toast.dismiss(loadingToast);
      toast.success("Uploaded");
      setBlog({ ...blog, banner: uploadedImageURL.url });
    } else {
      toast.dismiss(loadingToast);
      return toString.error("Can not uploaded. Please try again");
    }

    setLoading(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a blog banner to publish it");
    }
    if (!title.length) {
      return toast.error("Write blog title to publish it");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    let loadingToast = toast.loading("Saving Draft...");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .then(() => {
            e.target.classList.remove("disable");

            toast.dismiss(loadingToast);
            toast.success("Published");

            setTimeout(() => {
              navigate("/");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
          });
      });
    }
  };
  let categories = [
    "programming",
    "hollywood",
    "film-making",
    "social media",
    "cooking",
    "technology",
    "finance",
    "travel",
  ];

  return (
    <>
      {/* <nav className="navbar">
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav> */}
      <Navbar
        collapseOnSelect
        expand="lg"
        className="navbar-color"
        variant="light"
      >
        <Container>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <p className="max-md:hidden text-black line-clamp-1 w-full">
                {title.length ? title : "New Blog"}
              </p>
            </Nav>

            {/* Chỉnh lại phần Sign In/Sign Up để hiển thị đẹp trên mobile */}
            <div className="d-lg-flex d-block align-items-center ms-auto text-center">
              <div className="d-flex flex-column flex-lg-row text-center w-100">
                <Nav.Link
                  className="btn btn-dark px-3 my-2 mx-lg-2"
                  onClick={handlePublishEvent}
                >
                  Publish
                </Nav.Link>
                <Nav.Link
                  className="btn btn-dark px-3 my-2 mx-lg-2"
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Nav.Link>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={banner} className="x-20" onError={handleError} />

                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
