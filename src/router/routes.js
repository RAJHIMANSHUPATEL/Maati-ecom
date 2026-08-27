import { lazy } from "react";

// Pages
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Home = lazy(() => import("../pages/Home"));
const AllProducts = lazy(() => import("../pages/AllProducts"));
const PolicyPage = lazy(() => import("../pages/PolicyPage"));
const Cart = lazy(() => import("../pages/Cart"));
const SingleProduct = lazy(() => import("../pages/SingleProduct"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const Orders = lazy(() => import("../pages/Orders"));
const Address = lazy(() => import("../pages/Address"));

const routes = [
  {
    path: "/login",
    exact: true,
    name: "login",
    protected: false,
    element: Login,
  },
  {
    path: "/register",
    exact: true,
    name: "register",
    protected: false,
    element: Register,
  },
  {
    path: "/",
    exact: true,
    name: "home",
    protected: false,
    element: Home,
  },
  {
    path: "/products",
    exact: true,
    name: "products",
    protected: false,
    element: AllProducts,
  },
  {
    path: "/products/cid/:catSlug/scid/:subSlug",
    exact: true,
    name: "products",
    protected: false,
    element: AllProducts,
  },
  {
    path: "/products/cid/:catSlug",
    exact: true,
    name: "products",
    protected: false,
    element: AllProducts,
  },
  {
    path: "/product/:slug",
    exact: true,
    name: "product",
    protected: false,
    element: SingleProduct,
  },
  {
    path: "/:name/:_id",
    exact: true,
    name: "policy_page",
    protected: false,
    element: PolicyPage,
  },
  {
    path: "/cart",
    exact: true,
    name: "cart",
    protected: false,
    element: Cart,
  },
  {
    path: "/profile",
    exact: true,
    name: "profile",
    protected: true,
    element: ProfilePage
  },
  {
    path: "/orders",
    exact: true,
    name: "orders",
    protected: true,
    element: Orders
  },
  {
    path: "/address",
    exact: true,
    name: "address",
    protected: true,
    element: Address
  }
];

export default routes;
