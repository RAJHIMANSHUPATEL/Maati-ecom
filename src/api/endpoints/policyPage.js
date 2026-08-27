const getPolicyPagesList = () => ({
  method: "GET",
  url: "/policy-pages",
});

const getPolicyPageById = (params = null) => ({
  method: "GET",
  url: `/policy-pages/get-policypage-by-id`,
  params,
});

export default { getPolicyPagesList, getPolicyPageById };
