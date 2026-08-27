// src/components/cart/CartStep1.jsx
import React from "react";
import { SfButton, SfIconRemove, SfIconAdd } from "@storefront-ui/react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { resolveImageUrl } from "../../utils/imageUrl";

export default function CartStep1({
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    specialNotes,
    setSpecialNotes,
    deliveryCharges = 0,
    discount = 0,
    onApplyCoupon,
    couponLoading,
}) {
    const {
        items,
        cartTotalAmount,
        incrementItemQuantity,
        decrementItemQuantity,
        removeItemFromCart,
        cartItemCount,
    } = useCart();

    const itemTotal = Number(cartTotalAmount || 0);
    const totalAmount = Math.max(0, itemTotal + Number(deliveryCharges || 0) - Number(discount || 0));

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (onApplyCoupon) {
            onApplyCoupon(e);
            return;
        }
        const code = (couponCode || "").trim();
        if (!code) return;
        setAppliedCoupon({ coupon_code: code });
    };

    if (!items || items.length === 0) {
        return (
            <div className="py-10 text-center">
                <h1 className="text-2xl font-semibold mb-2">Cart</h1>
                <p className="text-sm text-neutral-500">
                    Your cart is empty. Add some products to get started.
                </p>
            </div>
        );
    }

    const isWeightedUnit = (unit) =>
        ["kilogram", "gram", "liter", "millilitre"].includes(
            (unit || "").toLowerCase()
        );

    const getLineTotal = (item) => {
        const isWeighted = isWeightedUnit(item.unit);
        const unitPrice = Number(item.amount || 0);
        const qty = Number(item.quantity || 0);
        const weight = isWeighted ? Number(item.weight || 0) : 1;

        return unitPrice * qty * weight;
    };

    const { user } = useAuth();

    return (
        <div className="mt-4">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-semibold">Cart</h1>
                    <p className="text-sm text-neutral-600">
                        Basket ({cartItemCount}{" "}
                        {cartItemCount === 1 ? "item" : "items"})
                    </p>
                </div>
                <div className="text-right text-sm sm:text-base">
                    <span className="text-neutral-500 mr-2 hidden sm:inline">
                        Item Total
                    </span>
                    <span className="font-semibold">
                        ₹{itemTotal.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => {
                        const weighted = isWeightedUnit(item.unit);
                        const lineTotal = getLineTotal(item);

                        return (
                            <div
                                key={item.id}
                                className="flex gap-4 border border-neutral-200 rounded-lg p-4 shadow-sm bg-white items-center"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 rounded-md flex items-center justify-center text-xs text-neutral-500">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <p className="font-semibold text-sm sm:text-base">
                                        {item.name || "Product"}
                                    </p>

                                    <p className="text-xs text-neutral-500 mt-1">
                                        ₹{Number(item.amount).toFixed(2)} /{" "}
                                        {item.unit}
                                    </p>

                                    {/* Show weight only for weighted products */}
                                    {weighted && (
                                        <p className="text-xs text-neutral-600 mt-2">
                                            Weight:{" "}
                                            <span className="font-medium">
                                                {Number(item.weight).toFixed(1)}{" "}
                                                {item.unit}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Quantity + Total */}
                                <div className="flex flex-col items-end gap-2">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-neutral-300 rounded-full overflow-hidden h-9">
                                        <SfButton
                                            variant="tertiary"
                                            square
                                            className="!rounded-none h-9 w-9 flex items-center justify-center"
                                            aria-label="Decrease quantity"
                                            disabled={item.quantity <= 1}
                                            onClick={() =>
                                                decrementItemQuantity(
                                                    item.product_id
                                                )
                                            }
                                        >
                                            <SfIconRemove />
                                        </SfButton>

                                        <div className="h-9 min-w-[44px] px-2 flex items-center justify-center text-sm font-medium">
                                            {item.quantity}
                                        </div>

                                        <SfButton
                                            variant="tertiary"
                                            square
                                            className="!rounded-none h-9 w-9 flex items-center justify-center"
                                            aria-label="Increase quantity"
                                            onClick={() =>
                                                incrementItemQuantity(
                                                    item.product_id
                                                )
                                            }
                                        >
                                            <SfIconAdd />
                                        </SfButton>
                                    </div>

                                    {/* Line Total */}
                                    <p className="font-semibold text-sm sm:text-base">
                                        ₹{lineTotal.toFixed(2)}
                                    </p>

                                    {/* Remove */}
                                    <SfButton
                                        variant="tertiary"
                                        size="xs"
                                        className="text-red-600"
                                        onClick={() =>
                                            removeItemFromCart(item.id)
                                        }
                                    >
                                        Remove
                                    </SfButton>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="border border-neutral-200 rounded-lg p-4 shadow-sm bg-white space-y-5">
                        {/* Login */}
                        {!user ? (
                            <p className="text-xs text-neutral-600">
                                <a
                                    href="/login"
                                    className="text-red-600 font-medium"
                                >
                                    Log in
                                </a>{" "}
                                to see the best offers and cashback deals.
                            </p>
                        ) : (
                            <p className="text-xs text-neutral-600">
                                You're logged in
                            </p>
                        )}

                        {/* Coupon */}
                        <div>
                            <p className="text-sm font-semibold mb-1">
                                Apply Coupon
                            </p>
                            <form
                                onSubmit={handleApplyCoupon}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm"
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(e.target.value)
                                    }
                                />
                                <SfButton size="sm" type="submit" disabled={couponLoading}>
                                    {couponLoading ? "..." : "APPLY"}
                                </SfButton>
                            </form>
                            {appliedCoupon && (
                                <p className="mt-1 text-xs text-green-700">
                                    Applied coupon:{" "}
                                    <span className="font-semibold">
                                        {appliedCoupon.coupon_code || appliedCoupon}
                                    </span>
                                    {discount > 0 && (
                                        <span> (−₹{Number(discount).toFixed(2)})</span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Payment */}
                        <div>
                            <p className="text-sm font-semibold mb-2">
                                Payment Details
                            </p>

                            <div className="flex justify-between text-sm mb-1">
                                <span>Item Total</span>
                                <span>₹{itemTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm mb-1">
                                <span>Delivery Charges</span>
                                <span>₹{Number(deliveryCharges || 0).toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm mb-1 text-green-700">
                                    <span>Coupon Discount</span>
                                    <span>−₹{Number(discount).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="border-t border-neutral-200 mt-2 pt-2 flex justify-between text-sm font-semibold">
                                <span>Total Amount</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <p className="text-sm font-semibold mb-1">
                                Special Notes
                            </p>
                            <textarea
                                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm resize-none"
                                rows={3}
                                placeholder="Please mention your delivery date / pickup date here"
                                value={specialNotes}
                                onChange={(e) =>
                                    setSpecialNotes(e.target.value)
                                }
                            />
                        </div>

                        {/* Delivery */}
                        {/* <div>
                            <p className="text-sm font-semibold mb-2">
                                Delivery Options
                            </p>
                            <div className="space-y-2 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="delivery-option"
                                        value="home"
                                        checked={deliveryOption === "home"}
                                        onChange={() =>
                                            setDeliveryOption("home")
                                        }
                                    />
                                    <span>Home Delivery</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="delivery-option"
                                        value="pickup"
                                        checked={deliveryOption === "pickup"}
                                        onChange={() =>
                                            setDeliveryOption("pickup")
                                        }
                                    />
                                    <span>Self Pickup</span>
                                </label>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
