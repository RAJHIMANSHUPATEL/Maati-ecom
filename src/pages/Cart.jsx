import { useEffect, useState } from "react";
import { SfButton } from "@storefront-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

import Stepper from "../components/cart/Stepper";
import CartStep1 from "../components/cart/CartStep1";
import CartStep2 from "../components/cart/CartStep2";
import CartStep3 from "../components/cart/CartStep3";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { orderAPI, couponAPI } from "../api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { apiErrorMessage } from "../utils/apiError";

const steps = ["Cart", "Delivery", "Payment"];

const Cart = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { items, cartTotalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { callApi, loading } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedStore } = useSelector((state) => state.store);

  const [checkoutDetails, setCheckoutDetails] = useState({
    orderType: "delivery",
    pickupStartDate: "",
    deliveryAddressId: null,
    paymentMethod: "cod",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [specialNotes, setSpecialNotes] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const updateCheckoutDetails = (patch) => {
    setCheckoutDetails((prev) => ({ ...prev, ...patch }));
  };

  const itemTotal = Number(cartTotalAmount || 0);
  const deliveryCharges =
    checkoutDetails.orderType === "pickup"
      ? 0
      : Number(selectedStore?.deliveryCharges || 0);
  const discount = Number(appliedCoupon?.discount || 0);
  const grandTotal = Math.max(0, itemTotal + deliveryCharges - discount);

  const getPickupEndDateISO = () => {
    if (!checkoutDetails.pickupStartDate) return null;
    const d = new Date(checkoutDetails.pickupStartDate);
    d.setDate(d.getDate() + 6);
    return d.toISOString();
  };

  useEffect(() => {
    const resume = location.state?.resumeStep;
    if (typeof resume === "number") {
      setCurrentStep(resume + 1);
    }
  }, [location.state]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = (couponCode || "").trim();
    if (!code) return;
    if (!selectedStore?._id) {
      toast.error("Please select a store first.");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await callApi(
        couponAPI.validateCoupon({
          code,
          store: selectedStore._id,
          sub_total: itemTotal,
        })
      );
      if (res.success) {
        setAppliedCoupon(res.data);
        toast.success("Coupon applied");
      } else {
        setAppliedCoupon(null);
        toast.error(res.message || "Invalid coupon");
      }
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error?.data?.message || error?.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const buildAddressString = () => {
    if (checkoutDetails.orderType === "delivery" && user?.address) {
      const addr = user.address.find(
        (a) => String(a._id) === String(checkoutDetails.deliveryAddressId)
      );
      if (!addr) return "";
      return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`;
    }

    const store = selectedStore;
    if (checkoutDetails.orderType === "pickup" && store) {
      let base = store.name || "Store";
      if (store.address) base += `, ${store.address}`;
      if (store.city) base += `, ${store.city}`;
      if (checkoutDetails.pickupStartDate) {
        const start = new Date(checkoutDetails.pickupStartDate).toLocaleDateString(
          "en-IN",
          { day: "2-digit", month: "short", year: "numeric" }
        );
        const endISO = getPickupEndDateISO();
        const end = endISO
          ? new Date(endISO).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";
        base += ` (Pickup between ${start} - ${end})`;
      }
      return base;
    }

    return "";
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }
    if (!items || items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!selectedStore?._id) {
      toast.error("Please select a store.");
      return;
    }

    const productDetailsArray = items.map((item) => ({
      product: item.product_id,
      name: item.name,
      price: Number(item.amount || 0),
      quantity: Number(item.quantity || 1),
      weight: item.weight != null ? Number(item.weight) : undefined,
      image: item.image,
      unit: item.unit,
    }));

    const address = buildAddressString();
    if (!address) {
      toast.error(
        checkoutDetails.orderType === "delivery"
          ? "Please select a delivery address."
          : "Please choose a pickup store."
      );
      return;
    }

    const payload = {
      store_id: selectedStore._id,
      payment_mode: "cash_on_delivery",
      product_details: JSON.stringify(productDetailsArray),
      address,
      sub_total: itemTotal,
      surcharge: deliveryCharges,
      delivery_charge: deliveryCharges,
      grand_total: grandTotal,
      order_type: checkoutDetails.orderType,
      order_status: "pending",
      order_platform: "web",
      payment_status: "pending",
      notes: specialNotes || "",
      store_name: selectedStore.name,
    };
    if (appliedCoupon?.coupon_code) {
      payload.couponCode = appliedCoupon.coupon_code;
    }
    if (
      checkoutDetails.orderType === "pickup" &&
      checkoutDetails.pickupStartDate
    ) {
      payload.pickup_start_date = checkoutDetails.pickupStartDate;
    }

    try {
      const res = await callApi(orderAPI.addOrder(payload));
      if (res.success) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/orders");
      } else {
        toast.error(res.message || "Failed to place order.");
      }
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Something went wrong while placing the order.")
      );
    }
  };

  const canProceedToPayment = () => {
    if (!user) return { ok: false, reason: "not_logged_in" };
    if (checkoutDetails.orderType === "delivery") {
      if (!checkoutDetails.deliveryAddressId) {
        return { ok: false, reason: "no_delivery_address" };
      }
    } else if (checkoutDetails.orderType === "pickup") {
      if (!selectedStore) return { ok: false, reason: "no_store_selected" };
      if (!checkoutDetails.pickupStartDate) {
        return { ok: false, reason: "no_pickup_date" };
      }
    }
    return { ok: true };
  };

  const goNext = async () => {
    if (currentStep === 1) {
      const check = canProceedToPayment();
      if (!check.ok) {
        if (check.reason === "not_logged_in") {
          navigate("/login", {
            state: { from: location.pathname, resumeStep: 1 },
          });
          return;
        }
        if (check.reason === "no_delivery_address") {
          toast.error("Please select a delivery address before proceeding.");
          return;
        }
        if (check.reason === "no_store_selected") {
          toast.error("Please select a pickup store before proceeding.");
          return;
        }
        if (check.reason === "no_pickup_date") {
          toast.error("Please choose a pickup start date before proceeding.");
          return;
        }
      }
    }

    if (currentStep === steps.length - 1) {
      await placeOrder();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="mx-auto my-6 max-w-screen-xl px-4 sm:my-10 sm:p-6">
      <Stepper currentStep={currentStep} steps={steps} />

      {currentStep === 0 && (
        <CartStep1
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          appliedCoupon={appliedCoupon}
          setAppliedCoupon={setAppliedCoupon}
          specialNotes={specialNotes}
          setSpecialNotes={setSpecialNotes}
          deliveryCharges={deliveryCharges}
          discount={discount}
          onApplyCoupon={handleApplyCoupon}
          couponLoading={couponLoading}
        />
      )}

      {currentStep === 1 && (
        <CartStep2
          checkoutDetails={checkoutDetails}
          updateCheckoutDetails={updateCheckoutDetails}
        />
      )}

      {currentStep === 2 && (
        <CartStep3
          checkoutDetails={checkoutDetails}
          updateCheckoutDetails={updateCheckoutDetails}
          deliveryCharges={deliveryCharges}
          discount={discount}
          grandTotal={grandTotal}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4 sm:gap-6">
        <SfButton
          color="secondary"
          variant="outline"
          disabled={currentStep === 0 || loading}
          onClick={goBack}
        >
          Back
        </SfButton>

        <SfButton color="primary" onClick={goNext} disabled={loading}>
          {currentStep === steps.length - 1 ? "Place Order" : "Next"}
        </SfButton>
      </div>
    </div>
  );
};

export default Cart;
