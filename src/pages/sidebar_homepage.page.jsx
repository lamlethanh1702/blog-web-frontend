import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SidebarHomepage = () => {
  let [blogs, setBlog] = useState(null);
  let [trendingBlogs, setTrendingBlog] = useState(null);
  let [pageState, setPageState] = useState("home");
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const location = useLocation();
  let navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("");

  const [aboutMeBlog, setAboutMeBlog] = useState(null);

  useEffect(() => {
    if (activeCategory) {
      navigate(`/${activeCategory.toLowerCase()}`, { state: { allTags: categories } });
    }
  }, [activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category); // Cập nhật state với category được click
    
  };

  useEffect(() => {
    if (blogs?.results) {
      const foundBlog = blogs.results.find((blog) =>
        blog.tags.includes("about me")
      );
      setAboutMeBlog(foundBlog || null);
    }
  }, [blogs]);
  

  const [categories, setAllCategories] = useState([]);

  const isCategoriesSet = useRef(false); // Đảm bảo chỉ cập nhật một lần

  useEffect(() => {
    if (
      blogs?.results &&
      blogs.results.length > 0 &&
      !isCategoriesSet.current
    ) {
      let uniqueCategories = Array.from(
        new Set(blogs.results.flatMap((blog) => blog.tags)) // Loại bỏ trùng lặp
      ).sort((a, b) => a.localeCompare(b, "en", { numeric: true })); // Sắp xếp theo chữ + số

      setAllCategories(uniqueCategories);
      isCategoriesSet.current = true; // Đánh dấu rằng categories đã được thiết lập
    }
  }, [blogs]); // Chỉ chạy khi blogs thay đổi lần đầu

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });
        // console.log(blogs);
        setBlog(formatedData);
        // console.log(special_blog);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlog(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <div className="min-w-[25%]  lg:min-w-[400ox] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
      <div className="flex mb-6 border border-gray-400 focus-within:border-yellow-500 rounded-lg overflow-hidden group">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-2 w-full transition-all duration-300 focus:w-[95%] focus:outline-none"
          onKeyDown={handleSearch}
        />
        <button
          className="bg-black text-white px-4 py-2 flex items-center justify-between w-[120px] 
    transition-all duration-300 group-focus-within:w-10 group-focus-within:justify-center 
    group-focus-within:bg-yellow-500 hover:!bg-yellow-500 gap-x-2 md:w-4/8"
          onClick={() => setSearchBoxVisibility((currentVal) => !currentVal)}
        >
          <span className="group-focus-within:hidden">SEARCH</span>
          <span className="text-yellow-500 group-hover:text-white">➝</span>
        </button>
      </div>

      {/* About Me Section */}
      <div className="relative w-full max-w-lg mx-auto ">
        {/* Hộp chứa tiêu đề với nền xám */}
        <div
          className="w-full py-3 px-6 inline-block relative mb-4 text-center"
          style={{ backgroundColor: "#e5e5e5" }} // Màu xám nhạt
        >
          <span
            className="text-black text-lg font-medium uppercase "
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "16px",
            }}
          >
            ABOUT ME
          </span>
          {}
          {/* Tam giác nhỏ phía dưới */}
          <div
            className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #e5e5e5", // Màu xám nhạt giống phần trên
            }}
          ></div>
        </div>
        {aboutMeBlog && (
          <div>
            <img
              src={aboutMeBlog.banner}
              alt={aboutMeBlog.title}
              className="rounded-lg mt-4 mx-auto w-full h-80 object-cover"
            />
            <h5 className="font-bold text-lg mt-4">Blogger & Youtuber</h5>
            <p className="text-sm mt-4 mb-12">{aboutMeBlog.des}</p>
          </div>
        )}
      </div>

      <div
        className="w-full py-3 px-6 inline-block relative mb-4 text-center"
        style={{ backgroundColor: "#e5e5e5" }} // Màu xám nhạt
      >
        <span
          className="text-black text-lg font-medium uppercase "
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "16px",
          }}
        >
          ARCHIVES
        </span>

        {/* Tam giác nhỏ phía dưới */}
        <div
          className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid #e5e5e5", // Màu xám nhạt giống phần trên
          }}
        ></div>
      </div>

      <div className="flex flex-col gap-2 mt-8">
        <ul className="list-none">
          {categories.map((temp, i) => {
            // console.log(temp);
            return (
              <li key={i} className="text-black text-xl font-serif mb-3">
                <button
                  onClick={() => handleCategoryClick(temp)} // Điều hướng về trang chủ
                  className={
                    "custom-hover capitalize  " 
                  }
                >
                  {temp}
                </button>
                <span style={{ color: "#d3b062" }} className="custom-hover">
                  ({i + 1})
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SidebarHomepage;
