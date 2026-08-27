const getBanners = (data) => ({
  method: "POST",
  url: `/banner/by-store`,
  data,
});

export default { getBanners };
