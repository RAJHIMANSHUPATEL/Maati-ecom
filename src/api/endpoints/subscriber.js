const subscribe = (data) => ({
  method: "POST",
  url: `/subscribe`,
  data,
});

export default { subscribe };
