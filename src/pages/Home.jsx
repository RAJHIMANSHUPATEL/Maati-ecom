import { useState, useEffect, useMemo } from "react";
import { bannerAPI, CategoryAPI, productAPI } from "../api";
import request from "../api/request";
import { useSelector } from "react-redux";
import HeroCrousel from "../components/home/HeroCrousel";
import CategoryCrousel from "../components/home/CategoryCrousel";
import ProductSlider from "../components/home/ProductSlider";
import Banner from "../components/home/Banner";
import CatProducts from "../components/home/CatProducts";
import TrustBar from "../components/home/TrustBar";
import WhyShop from "../components/home/WhyShop";
import { retry } from "../utils/storeStorage";

const valueOf = (result) =>
  result.status === "fulfilled" ? result.value : null;

const Home = () => {
  const storeId = useSelector((state) => state.store.selectedStore?._id);
  const [topBanner, setTopBanner] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [midBanners, setMidBanners] = useState(null);
  const [catProducts, setCatProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(storeId));

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        await retry(
          async () => {
            const results = await Promise.allSettled([
              request(bannerAPI.getBanners({ storeId, page: "home" })),
              request(CategoryAPI.getCategories({ store: storeId })),
              request(productAPI.getProductForHome({ store: storeId })),
              request(productAPI.getProductsByCategory({ store: storeId })),
            ]);

            const bannerRes = valueOf(results[0]);
            const catRes = valueOf(results[1]);
            const productRes = valueOf(results[2]);
            const aisleRes = valueOf(results[3]);
            const nextCategories = catRes?.data || [];
            const nextProducts = productRes?.data || [];

            if (!nextCategories.length && !nextProducts.length) {
              throw new Error("catalog empty");
            }

            if (cancelled) return;

            const banners = bannerRes?.data || [];
            const top = banners.find(
              (b) =>
                String(b?.position || "").toLowerCase() === "top" &&
                String(b?.status || "").toLowerCase() === "active"
            );
            setTopBanner(Array.isArray(top?.images) ? top.images : []);
            setMidBanners(banners.find((b) => b.position === "between") || null);
            setCategories(nextCategories);
            setProducts(nextProducts);
            setCatProducts(aisleRes?.data || []);
          },
          { attempts: 6, delay: 700 }
        );
      } catch (err) {
        console.error("Home load failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const deals = useMemo(
    () => (products || []).filter((p) => Number(p.discount) > 0).slice(0, 8),
    [products]
  );

  if (loading && !products.length && !categories.length) {
    return (
      <div className="bg-paper px-6 py-24 text-center font-serif text-xl text-ink/60">
        Opening the shop…
      </div>
    );
  }

  return (
    <div className="bg-paper pb-16">
      {topBanner?.length > 0 && <HeroCrousel images={topBanner} />}
      <TrustBar />
      {categories?.length > 0 && <CategoryCrousel categories={categories} />}
      {deals.length > 0 && (
        <ProductSlider products={deals} title="Marked down" kicker="For the week" />
      )}
      {products?.length > 0 && (
        <ProductSlider products={products} title="In today" kicker="From this store" />
      )}
      {midBanners && <Banner banners={midBanners} />}
      {catProducts?.length > 0 && <CatProducts products={catProducts} />}
      <WhyShop />
    </div>
  );
};

export default Home;
