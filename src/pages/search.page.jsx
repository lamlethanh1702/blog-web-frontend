import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { activeTabRef } from "../components/inpage-navigation.component";
import SidebarHomepage from "./sidebar_homepage.page";


const Header = () => {
  return (
    <div className="header-page text-center py-6">
      <h1 className="text-4xl font-bold font-playfair">Mai Vo</h1>
    </div>
  );
};

const SearchPage = () => {
  let { query } = useParams();
  let [pageState, setPageState] = useState("home");
  let [trendingBlogs, setTrendingBlog] = useState(null);
  let [blogs, setBlog] = useState(null);
  let [users, setUsers] = useState(null);
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [categories, setAllCategories] = useState([]);

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlog(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
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

  const isCategoriesSet = useRef(false);
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
  }, [blogs]);

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };
  let navigate = useNavigate();
  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });

        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
      .then(({ data: { users } }) => {
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlog(null);
    setUsers(null);
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No user found" />
        )}
      </>
    );
  };

  return (
    <AnimationWrapper>
       <div>
        <Header />
      </div>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[`Search Results from "${query}"`, "Accounts Matched"]}
            defaultHidden={["Accounts Matched"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                      }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No blogs published" />
              )}
              <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
            </>

            <UserCardWrapper />
          </InPageNavigation>
        </div>

        <SidebarHomepage />
      </section>
    </AnimationWrapper>
  );
};

export default SearchPage;
