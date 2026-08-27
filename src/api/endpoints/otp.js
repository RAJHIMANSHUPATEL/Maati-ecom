const sendOTP = (data) => ({ method: "POST", url: "/otp/send", data });

const verifyOTP = (data) => ({ method: "POST", url: "/otp/verify", data });

export default { sendOTP, verifyOTP };
