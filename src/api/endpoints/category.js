const getCategories = (params) => ({
  method: "GET",
  url: "/category",
  params,
});

export default { getCategories };
