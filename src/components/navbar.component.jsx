import { useContext, useEffect, useState, useRef } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import axios from "axios";
import Loader from "../components/loader.component";
import { storeInSession } from "../common/session";
import { activeTabRef } from "../components/inpage-navigation.component";
import { EditorContext } from "../pages/editor.pages";
import { filterPaginationData } from "../common/filter-pagination-data";

const NavbarComponent = () => {
  // const [showUserMenu, setShowUserMenu] = useState(false);
  let [blogs, setBlog] = useState(null);
  let [pageState, setPageState] = useState("home");
  const navigate = useNavigate();

  let [activeCategory, setActiveCategory] = useState(""); // State để lưu mục được chọn

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  useEffect(() => {
    setActiveCategory(""); // Reset lại activeCategory khi component render
  }, []);

  useEffect(() => {
    if (activeCategory) {
      navigate(`/${activeCategory.toLowerCase()}`, { state: { allTags: categories } });
    }
  }, [activeCategory]);

  // const handleCategoryClick = (category) => {
  //   setActiveCategory(category); // Cập nhật state với category được click
  //   navigate(`/${category.toLowerCase()}`);
  // };

  const handleCategoryClick = (category) => {
    
    setActiveCategory(category); // Cập nhật state với category được click
  };

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

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        // console.log(data.blogs)
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });

        setBlog(formatedData);
        // console.log(blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (activeTabRef?.current) {
      activeTabRef.current.click();
    }

    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    }
  }, [pageState]);

  const [userNavPanel, setUserNavPanel] = useState(false);
  const {
    userAuth,
    userAuth: { access_token, profile_img, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);
  const handleUserNavPanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  useEffect(() => {
    if (access_token) {
      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  return (
    <>
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
            <Nav.Link
              as={Link}
              to="/"
              className={`custom-hover text-center btn-border-bottom ${
                activeCategory === "" ? "" : ""
              }`}
              onClick={() => setActiveCategory("")}
            >
              Home
            </Nav.Link>
              <NavDropdown
                title="Blog"
                id="collapsible-nav-dropdown"
                className="custom-hover text-center btn-border-bottom"
              >
                {categories.map((category) => (
                  <NavDropdown.Item
                    key={category}
                    as="button"
                    className={`custom-hover capitalize text-center btn-border-bottom ${
                      activeCategory === category ? "btn-active" : ""
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
              <Nav.Link
                className={`custom-hover capitalize text-center btn-border-bottom ${
                  activeCategory === "about me" ? "btn-active" : ""
                }`}
                onClick={() => handleCategoryClick("about me")}
              >
                About Me
              </Nav.Link>
            </Nav>

            {/* Chỉnh lại phần Sign In/Sign Up để hiển thị đẹp trên mobile */}
            <div className="d-lg-flex d-block align-items-center ms-auto text-center">
              {access_token ? (
                <></>
              ) : (
                <div className="d-flex flex-column flex-lg-row text-center w-100">
                  <Nav.Link
                    as={NavLink}
                    to="/signin"
                    className="btn btn-dark px-3 my-2 mx-lg-2"
                    style={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Sign In
                  </Nav.Link>
                  <Nav.Link
                    as={NavLink}
                    to="/signup"
                    className="btn btn-dark px-3 my-2 mx-lg-2"
                    style={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Sign Up
                  </Nav.Link>
                </div>
              )}
            </div>
          </Navbar.Collapse>
          {access_token ? (
            <>
              <div className="position-absolute top-1 end-4 d-flex align-items-center p-3 mt-md-0 me-md-5 mt-lg-1 ">
                <Nav.Link
                  as={NavLink}
                  to="/editor"
                  className="d-none d-lg-block me-3"
                >
                  <i className="fi fi-rr-file-edit me-2"></i>Write
                </Nav.Link>
                <Link to="/dashboard/notifications" className="me-3">
                  <button className=" w-10 h-10 rounded-full bg-grey relative hover:bg-black/10">
                    <i className="fi fi-rr-bell text-2xl block"></i>
                    {new_notification_available && (
                      <span className="bg-red w-3 h-3 rounded-full position-absolute top-1 right-1 "></span>
                    )}
                  </button>
                </Link>

                <div
                  className="relative"
                  onClick={handleUserNavPanel}
                  onBlur={handleBlur}
                >
                  <button className="w-10 h-10">
                    <img
                      src={profile_img}
                      className="w-full h-full object-cover rounded-full "
                    />
                  </button>
                  {userNavPanel && <UserNavigationPanel />}
                </div>
              </div>
            </>
          ) : (
            ""
          )}
        </Container>
      </Navbar>

      <Outlet />
    </>
  );
};

export default NavbarComponent;
