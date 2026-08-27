const addCart = (data, AuthToken = "") => ({
    method: "POST",
    url: "/cart",
    data,
    headers: { AuthToken },
});

const getCart = (params, token) => ({
    method: "GET",
    url: "/cart",
    params,
    headers: {
        AuthToken: token,
    },
});

export default { addCart, getCart };
