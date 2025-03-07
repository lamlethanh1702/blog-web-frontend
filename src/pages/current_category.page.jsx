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
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import SidebarHomepage from "./sidebar_homepage.page";

const Header = () => {
  return (
    <div className="header-page text-center py-6">
      <h1 className="text-4xl font-bold">The Hygge Explorer</h1>
      
    </div>
  );
};

const CurrentCategory = () => {
  let [blogs, setBlog] = useState(null);
  let [trendingBlogs, setTrendingBlog] = useState(null);
  let [pageState, setPageState] = useState("home");
  const { category } = useParams(); // Lấy category từ URL
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  let navigate = useNavigate();

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  const [aboutMeBlog, setAboutMeBlog] = useState(null);

  useEffect(() => {
    if (blogs?.results) {
      const foundBlog = blogs.results.find((blog) =>
        blog.tags.includes("about me")
      );
      setAboutMeBlog(foundBlog || null);
    }
  }, [blogs]);

  const location = useLocation();
  const allTags = location.state?.allTags || []; // Lấy allTags từ state

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

        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: category, // Dùng category lấy từ URL
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: null,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: category },
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

  const fetchAllBlogs = ({ page = 1 }) => {
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

  useEffect(() => {
    setBlog(null);
    fetchBlogsByCategory({ page: 1 });

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [category]); // Gọi API khi category thay đổi

  return (
    <AnimationWrapper>
      <div>
        <Header />
      </div>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.results.length ? (
                // <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                  {blogs.results.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        {/* {console.log(blog)} */}
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    );
                  })}
                </div>
              ) : (
                <NoDataMessage message="No blogs published" />
              )}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                    }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="No trending blogs" />
            )}
          </InPageNavigation>
        </div>

        <SidebarHomepage />
      </section>
    </AnimationWrapper>
  );
};

export default CurrentCategory;
