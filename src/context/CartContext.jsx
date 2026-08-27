// src/context/CartContext.jsx
import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect,
    useRef,
} from "react";
import useApi from "../hooks/useApi";
import { cartAPI } from "../api";
import { useAuth } from "./AuthContext";
import { useSelector } from "react-redux";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Load initial cart from localStorage (same as your slice)
    const [items, setItems] = useState(() => {
        try {
            const stored = localStorage.getItem("cartItems");
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error parsing cartItems from localStorage", e);
            return [];
        }
    });

    const { callApi } = useApi();
    const { user } = useAuth();
    const selectedStoreId = useSelector((state) => state.store.selectedStore?._id);

    // ---- helpers ----
    const parseSelectedStore = () => {
        const raw = localStorage.getItem("selectedStore");
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed._id) return parsed._id;
            // if parsed looks like an id string inside quotes
            if (typeof parsed === "string" && parsed.length) return parsed;
        } catch {
            // not JSON — maybe it's a plain id string
            return raw;
        }
        return raw;
    };

    const getSelectedStoreId = () => {
        return parseSelectedStore();
    };

    const persistLocal = (nextItems) => {
        try {
            localStorage.setItem("cartItems", JSON.stringify(nextItems));
        } catch (e) {
            console.error("Failed to persist cart locally:", e);
        }
    };

    // Sync with backend according to your Cart model/controller
    const syncWithBackend = async (nextItems) => {
        // Return early if no user — typical behaviour for guest carts.
        if (!user) {
            console.debug(
                "syncWithBackend: no user, skipping backend sync (guest)."
            );
            return { skipped: true, reason: "no-user" };
        }

        const storeId = getSelectedStoreId();
        // tolerate multiple token key names (some flows use different keys)
        const token =
            localStorage.getItem("authToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("Authorization") ||
            "";

        if (!storeId) {
            console.debug(
                "syncWithBackend: missing selectedStore, skipping sync.",
                { selectedStoreRaw: localStorage.getItem("selectedStore") }
            );
            return { skipped: true, reason: "no-store" };
        }
        if (!token) {
            console.debug(
                "syncWithBackend: missing auth token, skipping sync.",
                { tokenKeys: ["authToken", "token", "Authorization"] }
            );
            return { skipped: true, reason: "no-token" };
        }

        const validItems = (nextItems || []).filter(
            (item) => item?.product_id && item?.amount != null
        );

        if (!validItems.length) {
            console.debug(
                "syncWithBackend: no valid items to sync, skipping.",
                {
                    itemsCount: nextItems?.length ?? 0,
                }
            );
            return { skipped: true, reason: "no-valid-items" };
        }

        const payload = {
            store: storeId,
            user_id: user._id,
            product_details: validItems.map((item) => {
                const isWeighted = [
                    "kilogram",
                    "gram",
                    "liter",
                    "millilitre",
                ].includes((item.unit || "").toLowerCase());

                const base = {
                    product: item.product_id,
                    price: Number(item.amount),
                    quantity: parseInt(item.quantity || 1, 10),
                };

                if (isWeighted) {
                    base.weight = Number(
                        item.weight != null ? item.weight : item.quantity
                    );
                }

                return base;
            }),
        };

        console.debug("syncWithBackend: prepared payload", { payload });

        try {
            // callApi should be a function that accepts the endpoint object returned by cartAPI.addCart
            // and returns a Promise with response
            const res = await callApi(cartAPI.addCart(payload, token));
            console.debug("syncWithBackend: backend response", { res });
            return { success: true, res };
        } catch (err) {
            console.error(
                "syncWithBackend: failed to sync cart with backend:",
                err
            );
            return { success: false, error: err };
        }
    };

    // common helper to update cart
    const updateItems = (updater) => {
        setItems((prev) => {
            const next = updater(prev) || [];
            // persist locally
            persistLocal(next);
            // attempt background sync (fire-and-log)
            syncWithBackend(next).catch((e) =>
                console.error("syncWithBackend threw or rejected:", e)
            );
            return next;
        });
    };

    // ---- actions (converted from your slice) ----

    // add or update
    const addItemToCart = (payload) => {
        updateItems((prev) => {
            const existingIndex = prev.findIndex(
                (el) => el.product_id === payload.product_id
            );

            // ensure numeric canonical fields
            const amount = Number(payload.amount || 0);
            const quantity = Number(payload.quantity ?? 1);
            const weight =
                payload.weight != null
                    ? Number(payload.weight)
                    : payload.weight ?? null;

            // compute line_total if not provided (payload may include it already)
            const computedLineTotal = Number(
                (
                    (amount || 0) *
                    (weight != null ? weight : 1) *
                    (quantity || 1)
                ).toFixed(2)
            );

            const itemToStore = {
                ...payload,
                amount,
                quantity,
                weight,
                line_total:
                    payload.line_total != null
                        ? Number(payload.line_total)
                        : computedLineTotal,
            };

            if (existingIndex !== -1) {
                const next = [...prev];
                next[existingIndex] = {
                    ...next[existingIndex],
                    ...itemToStore,
                };
                return next;
            }

            const newId = prev.length ? prev[prev.length - 1].id + 1 : 1;

            return [
                ...prev,
                {
                    ...itemToStore,
                    id: newId,
                },
            ];
        });
    };

    // remove by internal id
    const removeItemFromCart = (id) => {
        updateItems((prev) => prev.filter((item) => item.id !== id));
    };

    // set quantity directly
    const updateItemInCart = ({ id, quantity }) => {
        updateItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const newQty = Number(quantity);
                const newLine = Number(
                    (
                        Number(item.amount || 0) *
                        (item.weight != null ? Number(item.weight) : 1) *
                        newQty
                    ).toFixed(2)
                );
                return { ...item, quantity: newQty, line_total: newLine };
            })
        );
    };

    // clear all
    const clearCart = () => {
        updateItems(() => []);
        try {
            localStorage.removeItem("cartItems");
        } catch (e) {
            console.error("clearCart: failed to remove local storage key:", e);
        }
    };

    // increment by product_id
    const incrementItemQuantity = (productId) => {
        updateItems((prev) =>
            prev.map((item) => {
                if (item.product_id !== productId) return item;
                const newQ = Number((item.quantity || 0) + 1);
                const newLine = Number(
                    (
                        Number(item.amount || 0) *
                        (item.weight != null ? Number(item.weight) : 1) *
                        newQ
                    ).toFixed(2)
                );
                return { ...item, quantity: newQ, line_total: newLine };
            })
        );
    };

    const decrementItemQuantity = (productId) => {
        updateItems((prev) => {
            const target = prev.find((item) => item.product_id === productId);
            if (!target) return prev;

            if (target.quantity > 1) {
                return prev.map((item) => {
                    if (item.product_id !== productId) return item;
                    const newQ = Number((item.quantity || 0) - 1);
                    const newLine = Number(
                        (
                            Number(item.amount || 0) *
                            (item.weight != null ? Number(item.weight) : 1) *
                            newQ
                        ).toFixed(2)
                    );
                    return { ...item, quantity: newQ, line_total: newLine };
                });
            }

            // remove item when quantity goes to 0
            return prev.filter((item) => item.product_id !== productId);
        });
    };

    // helper: convert backend cart → our local item shape
    const mapServerCartToItems = (serverCart) => {
        if (!serverCart || !Array.isArray(serverCart.product_details))
            return [];

        return serverCart.product_details.map((detail, index) => {
            const product = detail.product || {};
            const productId = product._id || product;
            const amount = Number(detail.price || 0);
            const quantity = Number(detail.quantity ?? 1);
            const weight = detail.weight != null ? Number(detail.weight) : null;
            const line_total = Number(
                (
                    (amount || 0) *
                    (weight != null ? weight : 1) *
                    (quantity || 1)
                ).toFixed(2)
            );

            return {
                id: index + 1,
                product_id: productId,
                amount,
                quantity,
                weight,
                line_total,
                name: product.name,
                image: product.cover,
                unit: product.quantityUnit,
            };
        });
    };

    // helper: merge local + server by product_id
    // const mergeCarts = (localItems, serverItems) => {
    //     const map = new Map();

    //     // start with server items (server is authoritative)
    //     serverItems.forEach((item) => {
    //         map.set(item.product_id, { ...item });
    //     });

    //     // merge / add local guest items
    //     localItems.forEach((local) => {
    //         const existing = map.get(local.product_id);
    //         if (existing) {
    //             // sum quantities
    //             existing.quantity =
    //                 Number(existing.quantity || 0) +
    //                 Number(local.quantity || 0);
    //             // prefer server line_total if present, else recompute
    //             existing.line_total =
    //                 existing.line_total != null
    //                     ? Number(existing.line_total)
    //                     : Number(
    //                           (
    //                               Number(existing.amount || 0) *
    //                               (existing.weight != null
    //                                   ? Number(existing.weight)
    //                                   : 1) *
    //                               Number(existing.quantity || 1)
    //                           ).toFixed(2)
    //                       );
    //         } else {
    //             map.set(local.product_id, { ...local });
    //         }
    //     });

    //     // re-generate sequential internal ids and ensure line_total present
    //     return Array.from(map.values()).map((item, idx) => {
    //         const amount = Number(item.amount || 0);
    //         const qty = Number(item.quantity || 0) || 1;
    //         const weight = item.weight != null ? Number(item.weight) : null;
    //         const computed = Number(
    //             (amount * (weight != null ? weight : 1) * qty).toFixed(2)
    //         );
    //         return {
    //             ...item,
    //             id: idx + 1,
    //             line_total:
    //                 item.line_total != null
    //                     ? Number(item.line_total)
    //                     : computed,
    //         };
    //     });
    // };

    const mergeCarts = (localItems, serverItems) => {
    const map = new Map();

    const safeServerItems = Array.isArray(serverItems) ? serverItems : [];
    const safeLocalItems = Array.isArray(localItems) ? localItems : [];

    // 1) Start with server items (authoritative)
    safeServerItems.forEach((item) => {
        if (!item || !item.product_id) return;
        map.set(item.product_id, { ...item });
    });

    // 2) Add ONLY local items that are NOT already in server
    safeLocalItems.forEach((local) => {
        if (!local || !local.product_id) return;

        const existing = map.get(local.product_id);
        if (!existing) {
            // product not in server cart → add as-is from local
            map.set(local.product_id, { ...local });
        }
        // if it exists, we IGNORE local quantity, local line_total, etc.
        // (Flipkart-style: server wins on conflicts)
    });

    // 3) Re-generate sequential internal ids and ensure line_total is correct
    return Array.from(map.values()).map((item, idx) => {
        const amount = Number(item.amount || 0);
        const qty = Number(item.quantity || 0) || 1;
        const weight = item.weight != null ? Number(item.weight) : null;

        const computedLineTotal = Number(
            (amount * (weight != null ? weight : 1) * qty).toFixed(2)
        );

        return {
            ...item,
            id: idx + 1,
            line_total:
                item.line_total != null
                    ? Number(item.line_total)
                    : computedLineTotal,
        };
    });
};

    const fetchServerCart = async () => {
        const storeId = getSelectedStoreId();
        const token =
            localStorage.getItem("authToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("Authorization") ||
            "";

        if (!user || !storeId || !token) {
            console.debug(
                "fetchServerCart: missing user/store/token - returning null",
                {
                    user,
                    storeId,
                    tokenPresent: !!token,
                }
            );
            return null;
        }

        try {
            const res = await callApi(
                cartAPI.getCart({ store: storeId, user_id: user._id }, token)
            );
            if (!res?.data?.data) return null;
            return mapServerCartToItems(res.data.data);
        } catch (err) {
            console.error(
                "fetchServerCart: error fetching cart from server:",
                err
            );
            return null;
        }
    };

    // ✅ public function to sync cart on login or whenever
    const syncCartFromServer = async () => {
        try {
            const serverItems = await fetchServerCart();
            if (!serverItems) return;

            setItems((prevLocalItems) => {
                const merged = mergeCarts(prevLocalItems, serverItems);
                persistLocal(merged);
                // also fire one more backend sync to ensure server has any local-only items
                syncWithBackend(merged).catch((e) =>
                    console.error(
                        "syncCartFromServer: syncWithBackend failed:",
                        e
                    )
                );
                return merged;
            });
        } catch (err) {
            console.error(
                "Failed to sync cart from server:",
                err.response?.data || err
            );
        }
    };

    // force sync utility (exposed)
    const forceSync = async () => {
        try {
            const result = await syncWithBackend(items);
            return result;
        } catch (e) {
            console.error("forceSync failed:", e);
            throw e;
        }
    };

    useEffect(() => {
        if (!user) return;
        syncCartFromServer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const previousStoreId = useRef(selectedStoreId);
    useEffect(() => {
        const previous = previousStoreId.current;
        previousStoreId.current = selectedStoreId;
        if (previous && selectedStoreId && previous !== selectedStoreId) {
            setItems([]);
            persistLocal([]);
        }
    }, [selectedStoreId]);

    // ---- "selectors" as context values ----
    const cartItemCount = useMemo(() => items.length, [items]);

    const cartTotalAmount = useMemo(() => {
        const total = items.reduce((sum, item) => {
            return sum + Number(item.line_total || 0);
        }, 0);
        return total; // return number for convenience
    }, [items]);

    const itemExists = (productId) =>
        items.some((item) => item.product_id === productId);

    const getItemQuantity = (productId) => {
        const item = items.find((item) => item.product_id === productId);
        return item ? item.quantity : 0;
    };

    const value = {
        items,
        // actions
        addItemToCart,
        removeItemFromCart,
        updateItemInCart,
        clearCart,
        incrementItemQuantity,
        decrementItemQuantity,
        forceSync,
        // computed
        cartItemCount,
        cartTotalAmount,
        itemExists,
        getItemQuantity,
        mapServerCartToItems,
        mergeCarts,
        syncCartFromServer,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
