// src/components/cart/CartStep2.jsx
import React, { useMemo, useState, useEffect } from "react";
import { SfButton } from "@storefront-ui/react";
import { useAuth } from "../../context/AuthContext";
import useApi from "../../hooks/useApi";
import { userAPI } from "../../api";
import { toast } from "react-toastify";

const ORDER_TYPES = {
  PICKUP: "pickup",
  DELIVERY: "delivery",
};

export default function CartStep2({ checkoutDetails, updateCheckoutDetails }) {
  const { user, login } = useAuth();
  const { callApi, loading } = useApi();

  const token = localStorage.getItem("authToken") || "";

  const { orderType, pickupStartDate, deliveryAddressId } =
    checkoutDetails || {};

  // 📅 pickup end date = start + 6 days
  const pickupEndDate = useMemo(() => {
    if (!pickupStartDate) return "";
    const d = new Date(pickupStartDate);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }, [pickupStartDate]);

  const todayStr = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const formatDisplayDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 🏬 selected store from localStorage
  const [selectedStore, setSelectedStore] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem("selectedStore");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setSelectedStore(parsed);
    } catch {
      setSelectedStore(null);
    }
  }, []);

  // delivery addresses from backend
  const savedAddresses = user?.address || [];

  // auto-select first address if none selected
  useEffect(() => {
    if (savedAddresses.length && !deliveryAddressId) {
      updateCheckoutDetails({
        deliveryAddressId: String(savedAddresses[0]._id),
      });
    }
  }, [savedAddresses, deliveryAddressId, updateCheckoutDetails]);

  // inline add-address form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleNewAddressChange = (field, value) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateNewAddress = () => {
    const { street, city, state, zip, country } = newAddress;
    return (
      street.trim() &&
      city.trim() &&
      state.trim() &&
      zip.trim() &&
      country.trim()
    );
  };

  const handleSaveNewAddress = async () => {
    const { street, city, state, zip, country } = newAddress;

    if (!validateNewAddress()) {
      toast.error("Please fill all required address fields.");
      return;
    }

    if (!token) {
      toast.error("Please log in to save an address.");
      return;
    }

    try {
      const payload = {
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
          country: country.trim(),
        },
      };

      const res = await callApi(userAPI.updateUserAddress(payload, token));

      if (res.success) {
        toast.success("Address added successfully!");

        const updatedUser = res.data;
        login(updatedUser, token);

        const updatedAddresses = updatedUser.address || [];
        const lastAddress = updatedAddresses[updatedAddresses.length - 1];

        if (lastAddress?._id) {
          updateCheckoutDetails({ deliveryAddressId: lastAddress._id });
        }

        setNewAddress({
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        });
        setShowNewAddressForm(false);
      } else {
        toast.error(res.message || "Failed to add address.");
      }
    } catch (error) {
      console.error("updateUserAddress error:", error);
      toast.error("Failed to add address. Please try again.");
    }
  };

  return (
    <div className="mt-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Delivery / Pickup Details
      </h2>

      {/* Order type toggle */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">
          How would you like to get your order?
        </p>
        <div className="inline-flex border border-neutral-300 rounded-full overflow-hidden text-sm">
          <button
            type="button"
            className={`px-4 py-2 ${
              orderType === ORDER_TYPES.DELIVERY
                ? "bg-red-500 text-white"
                : "bg-white text-neutral-800"
            }`}
            onClick={() =>
              updateCheckoutDetails({ orderType: ORDER_TYPES.DELIVERY })
            }
          >
            Delivery
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${
              orderType === ORDER_TYPES.PICKUP
                ? "bg-red-500 text-white"
                : "bg-white text-neutral-800"
            }`}
            onClick={() =>
              updateCheckoutDetails({ orderType: ORDER_TYPES.PICKUP })
            }
          >
            Self Pickup
          </button>
        </div>
      </div>

      {/* 🧾 PICKUP SECTION */}
      {orderType === ORDER_TYPES.PICKUP && (
        <div className="mb-8 border border-neutral-200 rounded-lg p-4 bg-white space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Select pickup date range
            </h3>
            <p className="text-xs text-neutral-600 mb-3">
              Choose a start date. Your pickup window will be for{" "}
              <span className="font-medium">7 days</span> starting from that
              date.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-col text-xs">
                <label className="mb-1 font-medium">Pickup start date</label>
                <input
                  type="date"
                  className="border border-neutral-300 rounded px-3 py-2 text-sm"
                  min={todayStr}
                  value={pickupStartDate || ""}
                  onChange={(e) =>
                    updateCheckoutDetails({
                      pickupStartDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col text-xs sm:mt-4">
                <span className="mb-1 font-medium">Pickup window</span>
                {pickupStartDate ? (
                  <span className="text-neutral-700">
                    {formatDisplayDate(pickupStartDate)}{" "}
                    <span className="font-semibold">to</span>{" "}
                    {formatDisplayDate(pickupEndDate)}
                  </span>
                ) : (
                  <span className="text-neutral-500">
                    Please select a start date
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 🏬 Pickup address = selected store */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Pickup Address</h3>
            {selectedStore ? (
              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50 text-xs space-y-1">
                <p className="font-semibold text-sm">
                  {selectedStore.name || "Selected Store"}
                </p>

                {selectedStore.address && <p>{selectedStore.address}</p>}

                {selectedStore.city && <p>{selectedStore.city}</p>}

                {(selectedStore.open_time || selectedStore.close_time) && (
                  <p className="text-neutral-700">
                    Pickup timing:{" "}
                    {selectedStore.open_time && (
                      <span>from {selectedStore.open_time}</span>
                    )}
                    {selectedStore.close_time && (
                      <span> to {selectedStore.close_time}</span>
                    )}
                  </p>
                )}

                {selectedStore.mobile && (
                  <p className="text-neutral-700">
                    Contact: {selectedStore.mobile}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-600">
                Pickup address will be the{" "}
                <span className="font-medium">selected store</span>. Please make
                sure a store is selected before placing the order.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 🚚 DELIVERY SECTION */}
      {orderType === ORDER_TYPES.DELIVERY && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3">
            Select delivery address
          </h3>

          {(!savedAddresses || savedAddresses.length === 0) && (
            <p className="text-xs text-neutral-600 mb-3">
              You don't have any saved addresses yet. Add one to continue.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Saved addresses */}
            {savedAddresses.map((addr) => {
              const isSelected = addr._id === deliveryAddressId;
              return (
                <div
                  key={addr._id}
                  className={`border rounded-lg p-3 cursor-pointer transition shadow-sm ${
                    isSelected
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 bg-white hover:shadow-md"
                  }`}
                  onClick={() =>
                    updateCheckoutDetails({ deliveryAddressId: addr._id })
                  }
                >
                  <p className="font-semibold text-sm mb-1">
                    {addr.street}
                  </p>
                  <p className="text-xs text-neutral-700 mb-1">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {addr.country}
                  </p>
                  {isSelected && (
                    <p className="mt-2 text-[11px] text-green-700 font-medium">
                      Selected
                    </p>
                  )}
                </div>
              );
            })}

            {/* Add new address card */}
            <button
              type="button"
              className="border border-dashed border-neutral-300 rounded-lg p-3 flex flex-col items-center justify-center text-sm text-neutral-600 bg-white hover:border-red-500 hover:text-red-600"
              onClick={() => setShowNewAddressForm(true)}
            >
              <span className="text-2xl leading-none mb-1">＋</span>
              <span>Add new address</span>
            </button>
          </div>

          {/* New address form */}
          {showNewAddressForm && (
            <div className="mt-6 border border-neutral-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Add New Address</h4>
                <button
                  type="button"
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                  onClick={() => setShowNewAddressForm(false)}
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-medium">Street *</label>
                  <input
                    type="text"
                    className="w-full border border-neutral-300 rounded px-2 py-2"
                    value={newAddress.street}
                    onChange={(e) =>
                      handleNewAddressChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">City *</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-300 rounded px-2 py-2"
                      value={newAddress.city}
                      onChange={(e) =>
                        handleNewAddressChange("city", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">State *</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-300 rounded px-2 py-2"
                      value={newAddress.state}
                      onChange={(e) =>
                        handleNewAddressChange("state", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-neutral-300 rounded px-2 py-2"
                      value={newAddress.zip}
                      onChange={(e) =>
                        handleNewAddressChange("zip", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Country *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-neutral-300 rounded px-2 py-2"
                      value={newAddress.country}
                      onChange={(e) =>
                        handleNewAddressChange("country", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <SfButton
                  size="sm"
                  onClick={handleSaveNewAddress}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Address"}
                </SfButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
