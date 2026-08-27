const getSubCategories = (params = null) => ({
  method: "GET",
  url: `/sub-category/subcategory-by-category`,
  params,
});

export default { getSubCategories };
