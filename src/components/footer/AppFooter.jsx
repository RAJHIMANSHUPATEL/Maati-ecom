import { useSelector } from "react-redux";
import Subscribe from "./Subscribe";
import UsefulLinks from "./UsefulLinks";
import React, { useEffect, useState } from "react";
import { settingsAPI } from "../../api";
import useApi from "../../hooks/useApi";
import Wordmark from "../Wordmark";
import { BRAND } from "../../brand";
import { Link } from "react-router";

const AppFooter = () => {
  const { selectedStore } = useSelector((state) => state.store);
  const { callApi } = useApi();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await callApi(settingsAPI.getSettings());
        if (res.success) setSettings(res.data);
      } catch {
        // keep store fallbacks
      }
    };
    load();
  }, []);

  const supportEmail = settings?.supportEmail || selectedStore?.email || "";
  const supportPhone = settings?.supportPhone || selectedStore?.mobile || "";

  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl min-w-0 gap-10 px-4 py-10 md:grid-cols-4 md:px-8 md:py-14">
        <div className="min-w-0 md:col-span-2">
          <Wordmark className="text-3xl sm:text-4xl" />
          <p className="mt-3 max-w-sm font-serif text-lg italic text-ink/70">
            {BRAND.tagline}. Two stores, one list, cash at the door.
          </p>
          <p className="mt-4 text-sm text-ink/60">
            {selectedStore?.name}
            {selectedStore?.address ? ` · ${selectedStore.address}` : ""}
          </p>
          <Subscribe />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">Visit</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="text-ink no-underline hover:italic">Home</Link></li>
            <li><Link to="/products" className="text-ink no-underline hover:italic">The list</Link></li>
            <li><Link to="/orders" className="text-ink no-underline hover:italic">Orders</Link></li>
            <li><Link to="/cart" className="text-ink no-underline hover:italic">Bag</Link></li>
            <li><Link to="/profile" className="text-ink no-underline hover:italic">Account</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">The shop</p>
          <UsefulLinks />
          <p className="mt-4 text-sm text-ink/70">
            {supportPhone && (
              <a href={`tel:${supportPhone}`} className="block text-ink no-underline">
                {supportPhone}
              </a>
            )}
            {supportEmail && (
              <a href={`mailto:${supportEmail}`} className="block text-ink no-underline">
                {supportEmail}
              </a>
            )}
          </p>
        </div>
      </div>
      <p className="border-t border-rule px-6 py-4 text-center text-[11px] uppercase tracking-[0.18em] text-ink/45">
        © {new Date().getFullYear()} {BRAND.name} · cash on delivery
      </p>
    </footer>
  );
};

export default React.memo(AppFooter);
