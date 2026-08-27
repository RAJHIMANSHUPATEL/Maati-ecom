// src/components/cart/CartStep3.jsx
import React, { useMemo } from "react";
import { SfButton } from "@storefront-ui/react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { resolveImageUrl } from "../../utils/imageUrl";

export default function CartStep3({ checkoutDetails, updateCheckoutDetails, deliveryCharges = 0, discount = 0, grandTotal: grandTotalProp }) {
  const { items, cartTotalAmount } = useCart();
  const { user } = useAuth();

  const itemTotal = Number(cartTotalAmount || 0);
  const grandTotal =
    grandTotalProp != null
      ? Number(grandTotalProp)
      : itemTotal + Number(deliveryCharges || 0) - Number(discount || 0);

  const { orderType, pickupStartDate, deliveryAddressId, paymentMethod } =
    checkoutDetails || {};

  // pickup end date (same logic as Step 2)
  const pickupEndDate = useMemo(() => {
    if (!pickupStartDate) return "";
    const d = new Date(pickupStartDate);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }, [pickupStartDate]);

  const formatDisplayDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // delivery address object from user.address
  const deliveryAddress = useMemo(() => {
    if (!user?.address || !deliveryAddressId) return null;
    return user.address.find((addr) => String(addr._id) === String(deliveryAddressId)) || null;
  }, [user, deliveryAddressId]);

  // selected store from localStorage (for pickup summary)
  const selectedStore = useMemo(() => {
    const raw = localStorage.getItem("selectedStore");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-xl font-semibold">No items to pay for</h2>
        <p className="text-sm text-neutral-500">
          Your cart is empty. Please add products first.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: ORDER ITEMS */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex min-w-0 gap-3 border border-neutral-200 rounded-lg p-3 sm:gap-4 sm:p-4 bg-white"
          >
            {/* Image */}
            <div className="w-16 h-16 flex-shrink-0">
              {item.image ? (
                <img
                  src={resolveImageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 rounded flex items-center justify-center text-xs text-neutral-500">
                  No image
                </div>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="break-words font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-neutral-600">
                ₹{Number(item.amount).toFixed(2)} × {item.quantity}
              </p>

              {item.weight && (
                <p className="text-xs text-neutral-600">
                  Weight: {item.weight} {item.unit}
                </p>
              )}
            </div>

            {/* Line Total */}
            <div className="shrink-0 font-semibold text-sm">
              ₹{Number(item.line_total).toFixed(2)}
            </div>
          </div>
        ))}

        {/* Delivery/Pickup Summary */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-3">
          <h3 className="text-sm font-semibold">Delivery / Pickup Details</h3>

          {orderType === "pickup" ? (
            <div className="text-xs space-y-1">
              <p>
                <span className="font-medium">Mode:</span> Self Pickup
              </p>
              {pickupStartDate ? (
                <p>
                  <span className="font-medium">Pickup window:</span>{" "}
                  {formatDisplayDate(pickupStartDate)}{" "}
                  <span className="font-semibold">to</span>{" "}
                  {formatDisplayDate(pickupEndDate)}
                </p>
              ) : (
                <p className="text-neutral-500">
                  Pickup dates not selected in previous step.
                </p>
              )}

              {selectedStore ? (
                <div className="mt-2">
                  <p className="font-medium">Pickup Store:</p>
                  <p>{selectedStore.name}</p>
                  {selectedStore.address && <p>{selectedStore.address}</p>}
                  {selectedStore.city && <p>{selectedStore.city}</p>}
                </div>
              ) : (
                <p className="text-neutral-500">
                  No store selected. Please go back and select a store.
                </p>
              )}
            </div>
          ) : (
            <div className="text-xs space-y-1">
              <p>
                <span className="font-medium">Mode:</span> Home Delivery
              </p>
              {deliveryAddress ? (
                <div className="mt-1">
                  <p className="font-medium">Deliver to:</p>
                  <p>{deliveryAddress.street}</p>
                  <p>
                    {deliveryAddress.city}, {deliveryAddress.state}{" "}
                    {deliveryAddress.zip}
                  </p>
                  <p>{deliveryAddress.country}</p>
                </div>
              ) : (
                <p className="text-neutral-500">
                  No delivery address selected. Please go back and select one.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: PAYMENT + TOTAL */}
      <div className="lg:col-span-1 space-y-4">
        {/* Payment Method */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-white">
          <h3 className="text-sm font-semibold mb-3">Payment Method</h3>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() =>
                  updateCheckoutDetails({ paymentMethod: "cod" })
                }
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Price Summary */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-2">
          <h3 className="text-sm font-semibold mb-2">Price Details</h3>

          <div className="flex justify-between text-sm">
            <span>Items Total</span>
            <span>₹{itemTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Charges</span>
            <span>₹{Number(deliveryCharges || 0).toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Coupon Discount</span>
              <span>−₹{Number(discount).toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between font-semibold text-sm">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* ⚠️ No custom button here – main Cart button will place the order */}
        <p className="text-[11px] text-neutral-500 text-center">
          Click <span className="font-medium">"Place Order"</span> below to
          confirm your order.
        </p>
      </div>
    </div>
  );
}
