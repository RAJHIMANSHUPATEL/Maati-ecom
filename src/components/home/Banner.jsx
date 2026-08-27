import { Link } from "react-router";
import React from "react";
import { resolveImageUrl } from "../../utils/imageUrl";

const Banner = ({ banners }) => {
  if (!banners?.images?.length) return null;
  const img = banners.images[0];
  const to = img.link?.startsWith("/") ? img.link : "/products";

  return (
    <section className="mx-auto grid max-w-6xl border-y border-rule md:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center px-6 py-10 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">
          From the counter
        </p>
        {img.text && (
          <p className="mt-3 font-serif text-3xl leading-snug text-ink">
            {img.text}
          </p>
        )}
        <Link
          to={to}
          className="mt-6 inline-flex w-fit border-b border-ink pb-0.5 text-sm no-underline"
        >
          Take a look
        </Link>
      </div>
      <img
        src={resolveImageUrl(img.url)}
        alt={img.altText || ""}
        className="h-52 w-full object-cover md:h-full"
        loading="lazy"
      />
    </section>
  );
};

export default React.memo(Banner);
