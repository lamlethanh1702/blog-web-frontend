/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author }) => {
  let {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes } = {}, 
    blog_id: id,
  } = content;

  let { fullname = "Unknown Author", profile_img = "", username = "" } = author || {};
  return (
    <Link to={`/blog/${id}`}>
      <div className="bg-white shadow-md p-4 rounded-lg flex flex-col h-[435px]">
        <h4 className="text-2xl font-bold uppercase text-center mb-2 break-words">
          {title}
        </h4>

        {publishedAt && (
          <p className="text-base !text-gray-200 text-center mb-4">
            {getDay(publishedAt)} <span className="mx-2"></span> Reading time
          </p>
        )}

        <img
          src={banner}
          alt={title}
          className="rounded-lg mb-4 w-full h-[150px] object-cover"
        />

        {/* <p className="flex-grow">
          {des && des.split(" ").length > 50
            ? des.split(" ").slice(0, 50).join(" ") + " [...]"
            : des || ""}
        </p> */}

        <p className="flex-grow line-clamp-3 overflow-hidden text-ellipsis">
          {des}
        </p>

        <button className="text-black font-medium px-4 py-2 rounded-md mt-auto flex items-center justify-center gap-2 btn-hover">
          READ MORE
          <span className="text-lg">→</span>
        </button>
      </div>
    </Link>
  );
};

export default BlogPostCard;
