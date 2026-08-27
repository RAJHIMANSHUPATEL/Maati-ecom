import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router";
import useApi from "../../hooks/useApi";
import { orderAPI } from "../../api";

const parseItems = (raw) => {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const OrderHistory = () => {
  const { callApi, loading } = useApi();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await callApi(orderAPI.getMyOrders());
        if (res.success) {
          setOrders(res.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  if (selected) {
    const items = parseItems(selected.product_details);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <button
          className="text-sm text-slate-600 mb-4 hover:underline"
          onClick={() => setSelected(null)}
        >
          Back to orders
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selected.order_number}
        </h2>
        <p className="text-sm text-gray-500 mb-6 capitalize">
          Status: {selected.order_status} ·{" "}
          {new Date(selected.createdAt).toLocaleString("en-IN")}
        </p>
        <div className="space-y-3 mb-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between border-b border-gray-100 pb-2 text-sm"
            >
              <span>
                {item.name || "Product"} × {item.quantity || 1}
              </span>
              <span>₹{Number(item.price || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Address: {selected.address}
        </p>
        {selected.notes && (
          <p className="text-sm text-gray-600 mb-2">Notes: {selected.notes}</p>
        )}
        <p className="font-semibold">
          Total: ₹{Number(selected.grand_total || 0).toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Order History</h2>
      {loading && orders.length === 0 ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start shopping to see your order history here
          </p>
          <button
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium"
            onClick={() => navigate("/products")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order._id}
              className="w-full text-left border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
              onClick={() => setSelected(order)}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {order.order_status} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹{Number(order.grand_total || 0).toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
