const validateCoupon = (data) => ({
  method: "POST",
  url: "/coupon/validate",
  data,
});

export default { validateCoupon };
