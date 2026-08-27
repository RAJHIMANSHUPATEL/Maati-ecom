const getStore = (params = null) => ({
  method: "GET",
  url: `/store`,
  params,
});

export default { getStore };
