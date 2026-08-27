const getMenu = (params = null) => ({
  method: "GET",
  url: `/menu`,
  params,
});

export default { getMenu };
