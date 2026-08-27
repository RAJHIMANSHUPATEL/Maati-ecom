import React from "react";
import { NavLink } from "react-router";
import ProductCard from "../ProductCard";
import { formatSlugId } from "../header/helpers";

const CatProducts = ({ products }) => {
  const aisles = (products || [])
    .filter((cat) => cat.products?.length)
    .slice(0, 3);

  if (!aisles.length) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 md:px-8">
      {aisles.map((cat) => (
        <section key={cat.category}>
          <div className="mb-6 flex items-baseline justify-between border-b border-rule pb-3">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">{cat.category}</h2>
            {cat.products[0]?.category && (
              <NavLink
                to={`/products/cid/${formatSlugId(
                  String(cat.products[0].category._id || cat.products[0].category),
                  cat.category
                )}`}
                className="max-w-[45%] truncate text-sm text-ink/70 no-underline hover:text-ink"
              >
                The rest of {cat.category.toLowerCase()}
              </NavLink>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {cat.products.slice(0, 4).map((product) => (
              <div key={product._id} className="min-w-0 bg-paper">
                <ProductCard
                  id={product._id}
                  name={product.name}
                  image={product.cover}
                  price={product.sellingPrice}
                  originalPrice={product.onlinePrice}
                  discount={product.discount}
                  stockStatus={product.stockStatus}
                  quantityUnit={product.quantityUnit}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default React.memo(CatProducts);
