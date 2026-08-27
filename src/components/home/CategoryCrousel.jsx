import React, { memo } from "react";
import { NavLink } from "react-router";
import { formatSlugId } from "../header/helpers";
import { resolveImageUrl } from "../../utils/imageUrl";

const CategoryCrousel = ({ categories = [] }) => {
  if (!categories?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <div className="mb-8 flex items-baseline justify-between border-b border-rule pb-3">
        <h2 className="font-serif text-3xl text-ink">The list</h2>
        <NavLink
          to="/products"
          className="text-sm text-ink/70 no-underline hover:text-ink"
        >
          Everything
        </NavLink>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((cat, index) => (
          <li key={cat._id} className="relative min-h-[220px] list-none">
            <NavLink
              to={`/products/cid/${formatSlugId(cat._id, cat.name)}`}
              className="group absolute inset-0 bg-paper no-underline"
            >
            <img
              src={resolveImageUrl(cat.cover)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <span className="block font-serif text-xs italic opacity-80">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 block font-serif text-2xl">{cat.name}</span>
            </span>
            </NavLink>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default memo(CategoryCrousel);
