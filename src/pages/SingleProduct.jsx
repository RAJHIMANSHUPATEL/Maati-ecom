import { useEffect, useState, useId, useMemo } from "react";
import { useParams } from "react-router";
import ProductGallery from "../components/singleProduct/ProductGallery";
import useApi from "../hooks/useApi";
import { cartAPI, productAPI } from "../api";
import {
  SfButton,
  SfIconShoppingCart,
  SfIconRemove,
  SfIconAdd,
} from "@storefront-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import { Navigation, Scrollbar } from "swiper/modules";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import { useCart } from "../context/CartContext";
import { productIdFromSlug } from "../brand";


const SingleProduct = () => {
  const id = useId();
  const { slug } = useParams();
  const extractId = (slugId) => productIdFromSlug(slugId);
  const productId = extractId(slug);
  const { selectedStore, stores } = useSelector((state) => state.store);
  const { user, logout } = useAuth();

  const { callApi, loading: apiLoading } = useApi();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Quantity state & logic (reuse same rules as ProductCard)
  const isSliderUnit = useMemo(() => {
    const unit = product?.quantityUnit || "";
    return ["kilogram", "gram", "liter", "millilitre"].includes(
      unit?.toLowerCase()
    );
  }, [product]);

  const min = isSliderUnit ? 0.5 : 1;
  const max = isSliderUnit ? 15 : 99;
  const step = isSliderUnit ? 0.1 : 1;
  const [qty, setQty] = useState(isSliderUnit ? 0.5 : 1);

  useEffect(() => {
    // reset qty when product loads or unit changes
    setQty(isSliderUnit ? 0.5 : 1);
  }, [isSliderUnit, productId]);

  const handleQtyChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = min;
    if (val < min) val = min;
    if (val > max) val = max;
    setQty(isSliderUnit ? parseFloat(val.toFixed(1)) : Math.round(val));
  };

  const inc = () => {
    setQty((prev) => {
      let next = isSliderUnit ? prev + step : prev + step;
      if (isSliderUnit) next = parseFloat(next.toFixed(1));
      return next > max ? max : next;
    });
  };

  const dec = () => {
    setQty((prev) => {
      let next = isSliderUnit ? prev - step : prev - step;
      if (isSliderUnit) next = parseFloat(next.toFixed(1));
      return next < min ? min : next;
    });
  };

  const fetchProductById = async () => {
    try {
      const res = await callApi(productAPI.getProductById({ _id: productId }));
      //   console.log(res);
      if (res?.data) {
        setProduct(res.data);
      } else {
        setProduct(null);
      }
    } catch (err) {
      setProduct(null);
      console.error("fetch product error", err);
    }
  };

  // Fetch similar products by category and exclude current
  const fetchSimilarProducts = async (categoryId) => {
    if (!categoryId) return;
    try {
      setLoadingSimilar(true);
      const res = await callApi(
        productAPI.getProductsByCategoryId({ category: product.category })
      );
      //   console.log(res);
      // Expecting res.data = array
      const products = Array.isArray(res.data) ? res.data : [];
      const filtered = products.filter((p) => p._id !== productId);
      setSimilarProducts(filtered);
    } catch (err) {
      console.error("fetch similar error", err);
      setSimilarProducts([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    fetchProductById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // when product loads, fetch similar using product.category
  useEffect(() => {
    if (product?.category) {
      fetchSimilarProducts(product.category);
    }
  }, [product]);

  // Short description for right column (150 chars)
  const shortDescription = product?.description
    ? product.description.length > 150
      ? product.description.slice(0, 150) + "..."
      : product.description
    : "";

  // Full description toggle (for below-the-fold section)
  const [descExpanded, setDescExpanded] = useState(false);

    // ---- CART CONTEXT ----
  const { addItemToCart, itemExists, getItemQuantity } = useCart();
  const isInCart = itemExists(productId);

  // Track the cart's existing quantity separately
  const [initialQty, setInitialQty] = useState(isSliderUnit ? 0.5 : 1);

  // Sync against cart when page loads / product changes
  useEffect(() => {
    if (isInCart) {
      const existingQty = getItemQuantity(productId);
      if (existingQty) {
        setInitialQty(existingQty);
        setQty(existingQty);
      }
    } else {
      setInitialQty(isSliderUnit ? 0.5 : 1);
      setQty(isSliderUnit ? 0.5 : 1);
    }
  }, [isInCart, productId, isSliderUnit]);

  // Check if changed
  const isDirty = qty !== initialQty;

  // BUTTON ACTION
  // inside SingleProduct component — replace existing handleCartClick with this
const handleCartClick = () => {
  if (!product?.stockStatus) return;

  const unitPrice = Number(product.sellingPrice ?? product.onlinePrice ?? 0);

  if (isSliderUnit) {
    // weighted product: quantity fixed to 1, weight = selected qty
    const weightValue = Number(qty); // qty is slider value (e.g. 2.5)
    const quantityValue = 1;
    const lineTotal = Number((unitPrice * weightValue * quantityValue).toFixed(2));

    addItemToCart({
      product_id: product._id,
      amount: unitPrice,
      name: product.name,
      image: product.cover,
      unit: product.quantityUnit,
      quantity: quantityValue,
      weight: weightValue,
      line_total: lineTotal,
    });

    // mark synced in UI
    setInitialQty(weightValue); // keep initialQty representing selected "weight" for slider
    setQty(weightValue);
  } else {
    // normal product: quantity = qty
    const quantityValue = Number(qty);
    const lineTotal = Number((unitPrice * quantityValue).toFixed(2));

    addItemToCart({
      product_id: product._id,
      amount: unitPrice,
      name: product.name,
      image: product.cover,
      unit: product.quantityUnit,
      quantity: quantityValue,
      line_total: lineTotal,
    });

    // mark synced in UI
    setInitialQty(quantityValue);
    setQty(quantityValue);
  }

  // Optionally: show a toast
  toast.success("Cart updated");
};



  if (!product && apiLoading) {
    return <div className="py-10 text-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="py-10 text-center">Product not found</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl overflow-x-clip px-4 py-6">
      {/* Top: gallery + details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery: full width on mobile (col-span all), left on desktop (col-span 7) */}
        <div className="lg:col-span-7 col-span-1">
          <ProductGallery images={[product.cover, ...(product.images || [])]} />
        </div>

        {/* Details: right side on desktop (col-span 5) */}
        <div className="lg:col-span-5 col-span-1">
  <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-md sm:p-6">
    {/* Title */}
    <h1 className="mb-3 break-words text-xl font-semibold text-neutral-900 sm:text-2xl">
      {product.name}
    </h1>

    {/* Price row */}
    <div className="flex items-end gap-4 mb-4">
      <div>
        <div className="text-sm text-neutral-500 line-through">
          ₹{product.onlinePrice?.toFixed(2)}
        </div>
        <div className="text-3xl font-bold text-neutral-900">
          ₹{product.sellingPrice?.toFixed(2)}
        </div>
      </div>

      {product.discount > 0 && (
        <div className="ml-auto">
          <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
            {product.discount}% OFF
          </span>
        </div>
      )}
    </div>

    {/* Stock */}
    <div className="text-sm font-medium mb-4">
      {product.stockStatus ? (
        <span className="text-green-600">In stock</span>
      ) : (
        <span className="text-red-600">Out of stock</span>
      )}
    </div>

    {/* Short description */}
    {shortDescription && (
      <p
        className="text-base text-neutral-700 mb-5 leading-relaxed"
        title={product.description}
      >
        {shortDescription}
      </p>
    )}

    {/* Quantity selector */}
    <div className="mb-5">
      {isSliderUnit ? (
        <div className="w-full overflow-x-clip">
          <div className="relative w-full px-4">
            {/* Floating value */}
            <div
              className="absolute -top-6 max-w-full -translate-x-1/2 rounded bg-neutral-800 px-2 py-1 text-xs text-white"
              style={{
                left: `${((qty - min) / (max - min)) * 100}%`,
              }}
            >
              {qty.toFixed(1)}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={qty}
              onChange={handleQtyChange}
              className="w-full accent-green-600 cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-xs text-neutral-600 mt-2">
            <span>{min}</span>
            <span>Quantity ({product.quantityUnit})</span>
            <span>{max}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-start">
          <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
            <SfButton
              variant="tertiary"
              square
              className="!rounded-none hover:bg-neutral-100"
              disabled={qty <= min}
              aria-label="Decrease value"
              onClick={dec}
            >
              <SfIconRemove />
            </SfButton>
            <input
              id={id}
              type="number"
              role="spinbutton"
              className="appearance-none mx-3 w-20 text-center bg-transparent font-medium text-neutral-800
                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
                [-moz-appearance:textfield]
                focus-visible:outline-none"
              min={min}
              max={max}
              value={qty}
              onChange={handleQtyChange}
            />
            <SfButton
              variant="tertiary"
              square
              className="!rounded-none hover:bg-neutral-100"
              disabled={qty >= max}
              aria-label="Increase value"
              onClick={inc}
            >
              <SfIconAdd />
            </SfButton>
          </div>
        </div>
      )}
    </div>

    {/* Add to cart */}
    <div>
      <SfButton
        size="md"
        slotPrefix={<SfIconShoppingCart size="sm" />}
        onClick={handleCartClick}
        disabled={!product.stockStatus || (isInCart && !isDirty)}
        className="w-full font-medium text-base py-3"
      >
        {isInCart ? (isDirty ? "Update Cart" : "In Cart") : "Add to Cart"}
      </SfButton>

    </div>
  </div>
</div>

      </div>

      {/* Below fold: Full Product Description section */}
      <div className="mt-6 bg-white p-4 rounded-md shadow-sm border">
        <h2 className="text-lg font-semibold mb-3">Product Description</h2>

        {/* If description is short, just show it */}
        {product.description ? (
          <>
            <p className="text-neutral-700">
              {descExpanded || product.description.length <= 150
                ? product.description
                : product.description.slice(0, 150) + "..."}
            </p>

            {product.description.length > 150 && (
              <button
                className="mt-3 text-sm text-blue-600 underline"
                onClick={() => setDescExpanded((s) => !s)}
              >
                {descExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </>
        ) : (
          <p className="text-neutral-500">No description available.</p>
        )}
      </div>

      {/* Similar Products (Swiper slider) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Similar Products</h3>

        {loadingSimilar ? (
          <div>Loading similar products...</div>
        ) : similarProducts.length === 0 ? (
          <div className="text-neutral-500">No similar products available.</div>
        ) : (
          <div className="overflow-hidden">
          <Swiper
            modules={[Scrollbar, Navigation]}
            scrollbar={{ draggable: true }}
            navigation
            loop={true}
            spaceBetween={12}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
            }}
            onTouchStart={(swiper, e) => {
              // if interacting with range inside slide, disable swipe
              if (e.target && e.target.type === "range") {
                swiper.allowTouchMove = false;
              }
            }}
            onTouchEnd={(swiper, e) => {
              swiper.allowTouchMove = true;
            }}
          >
            {similarProducts.map((p) => (
              <SwiperSlide key={p._id}>
                <ProductCard
                  id={p._id}
                  name={p.name}
                  image={p.cover}
                  price={p.sellingPrice}
                  originalPrice={p.onlinePrice}
                  discount={p.discount}
                  stockStatus={p.stockStatus}
                  description={p.description}
                  quantityUnit={p.quantityUnit}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;
