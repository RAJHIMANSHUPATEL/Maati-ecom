import {
  SfButton,
  SfIconRemove,
  SfIconAdd,
} from "@storefront-ui/react";
import React, { useEffect, useId, useState } from "react";
import { NavLink } from "react-router";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../utils/imageUrl";
import { productPath } from "../brand";

const ProductCard = ({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  stockStatus,
  quantityUnit,
}) => {
  const inputId = useId();
  const { addItemToCart, itemExists, items } = useCart();
  const navigate = useNavigate();
  const inCart = itemExists(id);
  const isWeighted = ["kilogram", "gram", "liter", "millilitre"].includes(
    (quantityUnit || "").toLowerCase()
  );
  const min = isWeighted ? 0.5 : 1;
  const max = isWeighted ? 15 : 99;
  const step = isWeighted ? 0.5 : 1;
  const unitLabel = quantityUnit
    ? ` / ${quantityUnit.replace("kilogram", "kg")}`
    : "";
  const [value, setValue] = useState(min);

  useEffect(() => {
    const cartItem = items?.find((it) => it.product_id === id);
    if (!cartItem) return;
    if (isWeighted) {
      setValue(Number(cartItem.weight ?? cartItem.quantity ?? min));
    } else {
      setValue(Number(cartItem.quantity ?? min));
    }
  }, [id, items, isWeighted, min]);

  const clamp = (next) => {
    let val = next;
    if (val < min) val = min;
    if (val > max) val = max;
    return step < 1 ? Number(val.toFixed(1)) : Math.round(val);
  };

  const handleAddToCart = () => {
    if (!stockStatus) return;
    const unitPrice = Number(price ?? originalPrice ?? 0);
    if (isWeighted) {
      const weightValue = Number(value);
      addItemToCart({
        product_id: id,
        amount: unitPrice,
        name,
        image,
        unit: quantityUnit,
        quantity: 1,
        weight: weightValue,
        line_total: Number((unitPrice * weightValue).toFixed(2)),
      });
    } else {
      addItemToCart({
        product_id: id,
        amount: unitPrice,
        name,
        image,
        unit: quantityUnit,
        quantity: Number(value),
        line_total: Number((unitPrice * Number(value)).toFixed(2)),
      });
    }
    if (inCart) navigate("/cart");
  };

  return (
    <article className="flex h-full min-w-0 flex-col border border-rule bg-paper">
      <NavLink to={productPath(name, id)} className="relative block bg-rule/30">
        {discount > 0 && (
          <span className="absolute left-0 top-0 z-10 bg-chilli px-2 py-0.5 text-[11px] uppercase tracking-wide text-white">
            {discount}% off
          </span>
        )}
        {!stockStatus && (
          <span className="absolute right-0 top-0 z-10 bg-ink/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
        <img
          src={resolveImageUrl(image)}
          alt={name}
          className="aspect-square w-full object-cover"
          width="400"
          height="400"
          loading="lazy"
        />
      </NavLink>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <NavLink
          to={productPath(name, id)}
          className="break-words font-serif text-[1.05rem] leading-snug text-ink no-underline hover:italic"
        >
          {name}
        </NavLink>

        <div className="mt-auto">
          <p className="text-sm">
            <span className="font-medium text-chilli">₹{price}</span>
            {originalPrice > price && (
              <s className="ml-2 text-ink/40">₹{originalPrice}</s>
            )}
            <span className="text-ink/50">{unitLabel}</span>
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex h-8 w-fit items-center border border-rule">
              <SfButton
                variant="tertiary"
                square
                className="!rounded-none !text-ink"
                disabled={value <= min}
                aria-controls={inputId}
                aria-label="Decrease quantity"
                onClick={() => setValue((v) => clamp(v - step))}
              >
                <SfIconRemove />
              </SfButton>
              <input
                id={inputId}
                type="number"
                className="w-9 appearance-none bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setValue(clamp(parseFloat(e.target.value) || min))}
              />
              <SfButton
                variant="tertiary"
                square
                className="!rounded-none !text-ink"
                disabled={value >= max}
                aria-controls={inputId}
                aria-label="Increase quantity"
                onClick={() => setValue((v) => clamp(v + step))}
              >
                <SfIconAdd />
              </SfButton>
            </div>
            <button
              type="button"
              disabled={!stockStatus}
              onClick={handleAddToCart}
              className="w-fit border-b border-ink pb-0.5 text-left text-sm disabled:border-ink/30 disabled:text-ink/40"
            >
              {stockStatus ? (inCart ? "Update bag" : "Add to bag") : "Sold out"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);
