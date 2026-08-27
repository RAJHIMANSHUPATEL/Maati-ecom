import React from "react";
import ProductCard from "../ProductCard";
import { Link } from "react-router";

const ProductSlider = ({ products, title = "In the shop today", kicker }) => {
  if (!products?.length) return null;
  const shown = products.slice(0, 8);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="mb-8 flex items-baseline justify-between border-b border-rule pb-3">
        <div>
          {kicker && (
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">
              {kicker}
            </p>
          )}
          <h2 className="font-serif text-3xl text-ink">{title}</h2>
        </div>
        <Link to="/products" className="text-sm text-ink/70 no-underline hover:text-ink">
          Full list
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => (
          <div key={p._id} className="bg-paper">
            <ProductCard
              id={p._id}
              name={p.name}
              image={p.cover}
              price={p.sellingPrice}
              originalPrice={p.onlinePrice}
              discount={p.discount}
              stockStatus={p.stockStatus}
              quantityUnit={p.quantityUnit}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(ProductSlider);
