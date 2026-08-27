const addOrder = (data) => ({
  method: "POST",
  url: "/order/addorder",
  data,
});

const getMyOrders = () => ({
  method: "GET",
  url: "/order",
});

const getOrderById = (id) => ({
  method: "GET",
  url: "/order/by-id",
  params: { id },
});

export default {
  addOrder,
  getMyOrders,
  getOrderById,
};
