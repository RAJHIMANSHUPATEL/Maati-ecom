import { NavLink } from "react-router";
import { BRAND } from "../../brand";

const WhyShop = () => (
  <section className="border-y border-rule">
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      <p className="text-[11px] uppercase tracking-[0.28em] text-ink/50">
        A note from the shop
      </p>
      <h2 className="mt-4 font-serif text-3xl leading-snug text-ink md:text-4xl">
        We buy like a household, not a warehouse.
      </h2>
      <div className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-ink/80">
        <p>
          {BRAND.name} is a daily mandi for two neighbourhoods. The list is short
          on purpose: vegetables that still smell of the field, fruit that will
          ripen on your counter, dairy that needs the fridge tonight.
        </p>
        <p>
          There is no membership and nothing to tap for payment. You choose a
          store, fill a bag, and settle in cash when it arrives.
        </p>
      </div>
      <p className="mt-8 font-serif italic text-ink/60">
        — the counter at {BRAND.name}
      </p>
      <NavLink
        to="/products"
        className="mt-8 inline-flex border-b border-ink pb-0.5 text-sm no-underline"
      >
        See what’s in today
      </NavLink>
    </div>
  </section>
);

export default WhyShop;
