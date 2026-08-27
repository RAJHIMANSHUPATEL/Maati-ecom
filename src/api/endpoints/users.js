const loginUser = (data) => ({ method: "POST", url: "/user/login", data });

const verifyUser = (AuthToken) => ({
  method: "GET",
  url: "/user/auth/verify",
  headers: { AuthToken },
});

const registerUser = (data) => ({
  method: "POST",
  url: `/user/register`,
  data,
});

const updateUserInfo = (data, AuthToken) => ({
  method: "PUT",
  url: "/user/update-info",
  data,
  headers: { AuthToken },
});

const updateUserPassword = (data, AuthToken) => ({
  method: "PUT",
  url: "/user/update-password",
  data,
  headers: { AuthToken },
});

const updateUserAddress = (data, AuthToken) => ({
  method: "PUT",
  url: "/user/update-address",
  data,
  headers: { AuthToken },
});

const deleteUserAddress = (data, AuthToken) => ({
  method: "DELETE",
  url: "/user/delete-address",
  data,
  headers: { AuthToken },
});

const resetPassword = (data) => ({
  method: "POST",
  url: "/user/reset-password",
  data,
});

export default {
  updateUserAddress,
  deleteUserAddress,
  updateUserInfo,
  updateUserPassword,
  loginUser,
  verifyUser,
  registerUser,
  resetPassword,
};
