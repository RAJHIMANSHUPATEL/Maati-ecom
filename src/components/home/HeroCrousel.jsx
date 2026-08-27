import { memo } from "react";
import { Link } from "react-router";
import { resolveImageUrl } from "../../utils/imageUrl";
import { BRAND } from "../../brand";

const HeroCrousel = ({ images = [] }) => {
  const img = images[0];
  if (!img) return null;
  const to = img.link?.startsWith("/") ? img.link : "/products";

  return (
    <section className="border-b border-rule">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-12 md:px-10 md:py-16">
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink/50">
            {BRAND.name} · {BRAND.cities}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.15] text-ink md:text-5xl">
            {img.text || "Whatever the kitchen needs tonight, from plots nearby."}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/70">
            A proper mandi, packed before noon. No app gimmicks. You pay when
            the bag is at the door.
          </p>
          <Link
            to={to}
            className="mt-8 inline-flex w-fit border-b border-ink pb-0.5 text-sm no-underline"
          >
            Open the list
          </Link>
        </div>
        <div className="min-h-[280px] bg-rule/40">
          <img
            src={resolveImageUrl(img.url)}
            alt={img.altText || BRAND.name}
            className="h-full min-h-[280px] w-full object-cover md:min-h-[440px]"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
};

export default memo(HeroCrousel);
