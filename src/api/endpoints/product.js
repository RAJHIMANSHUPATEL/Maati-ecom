const getProductForHome = (data) => ({
  method: "POST",
  url: "/product/homepage-products",
  data,
});

const getProductsByCategory = (data) => ({
  method: "POST",
  url: "/product/category-products",
  data,
});

const getFilteredProduct = (data) => ({
  method: "POST",
  url: "/product/filter-products",
  data,
});

const getProductById = (params) => ({
  method: "GET",
  url: "/product",
  params,
});

const getProductsByCategoryId = (params) => ({
  method: "GET",
  url: "/product/category-id",
  params,
});

// const updateUser = (data, AuthToken) => ({
//   method: "POST",
//   url: `/user/update`,
//   data,
//   headers: { AuthToken },
// });

export default {
  getProductForHome,
  getProductsByCategory,
  getFilteredProduct,
  getProductById,
  getProductsByCategoryId,
};
