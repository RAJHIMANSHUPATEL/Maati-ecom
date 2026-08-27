import React, { useEffect, useState } from "react";
import { SfModal, SfButton } from "@storefront-ui/react";
import { StoreAPI } from "../api";
import request from "../api/request";
import { useDispatch, useSelector } from "react-redux";
import { clearStore, selectStore, setStores } from "../redux/storeSlice";
import { useLocation } from "react-router";
import LoadingSpinner from "./LoadingSpinner";
import { resolveImageUrl } from "../utils/imageUrl";
import { readStoredStore, wait } from "../utils/storeStorage";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export default React.memo(function StoreSelectorModal() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedStore, stores } = useSelector((state) => state.store);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hideOnAuth = AUTH_PATHS.some((path) =>
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setLoading(true);
      setError("");
      let list = [];
      for (let attempt = 1; attempt <= 6; attempt += 1) {
        try {
          const response = await request(StoreAPI.getStore());
          list = response?.data || [];
          break;
        } catch (err) {
          if (attempt === 6) {
            if (!cancelled) {
              setError("The shop is still waking up. Try again in a moment.");
              setLoading(false);
            }
            return;
          }
          await wait(700 * attempt);
        }
      }
      if (cancelled) return;

      dispatch(setStores(list));
      const saved = readStoredStore();
      const match = saved
        ? list.find((store) => store._id === saved._id)
        : null;
      if (match) {
        dispatch(selectStore(match));
      } else if (saved && !list.length) {
        dispatch(selectStore(saved));
      } else if (list.length === 1) {
        dispatch(selectStore(list[0]));
      } else if (saved && !match) {
        dispatch(clearStore());
      }
      setLoading(false);
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const retry = () => window.location.reload();

  if (hideOnAuth) return null;

  const open = !selectedStore;

  return (
    <SfModal open={open} onClose={() => {}} className="max-w-lg w-full sm:max-w-2xl">
      <div className="bg-paper p-5">
        <h2 className="font-serif text-2xl text-ink">Which store are you near?</h2>
        <p className="mt-1 text-sm text-ink/60">
          Prices, stock and delivery follow the counter you pick.
        </p>

        {loading ? (
          <div className="py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-5 max-h-80 space-y-2 overflow-y-auto">
            {stores.length > 0 ? (
              stores.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => dispatch(selectStore(s))}
                  className="flex w-full items-center gap-4 border border-rule bg-paper p-3 text-left hover:bg-white"
                >
                  <img
                    src={resolveImageUrl(s.cover)}
                    alt=""
                    className="h-16 w-16 object-cover"
                  />
                  <span>
                    <span className="block font-serif text-lg">{s.name}</span>
                    <span className="block text-sm text-ink/60">{s.address}</span>
                    <span className="block text-sm text-ink/50">{s.city}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-ink/60">
                {error || "No stores available yet."}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <SfButton variant="tertiary" className="!text-ink" onClick={retry}>
            Refresh
          </SfButton>
        </div>
      </div>
    </SfModal>
  );
});
