import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import DropdownSelection from "../components/products/DropdownSelection";
import MobileFilterDrawer from "../components/products/MobileFilterDrawer";
import { productAPI } from "../api";
import useApi from "../hooks/useApi";
import ProductCard from "../components/ProductCard";
import { useSelector } from "react-redux";
import { retry } from "../utils/storeStorage";

const AllProducts = () => {
  const { catSlug, subSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Helper to extract ID back from slug (e.g. "123-meat" → "123")
  const extractId = (slugId) => slugId?.split("-")[0];

  const catId = extractId(catSlug);
  const subId = extractId(subSlug);

  const { loading, callApi } = useApi();
  const { selectedStore } = useSelector((state) => state.store);

  // filters
  const [discountOnly, setDiscountOnly] = useState(
    searchParams.get("discount") === "true"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || catId || null
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    searchParams.get("subCategory") || subId || null
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || ""); // api supported values
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  // products + pagination
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFilteredProducts = async (reset = false) => {
    if (!selectedStore?._id) return;
    const payload = {
      discount: discountOnly || undefined,
      category: selectedCategory || undefined,
      subCategory: selectedSubCategory || undefined,
      page: reset ? 1 : page,
      limit,
      sortBy: sortBy || undefined,
      search: searchQuery || undefined,
      store: selectedStore._id,
    };
    const run = async () => {
      const res = await callApi(productAPI.getFilteredProduct(payload));
      if (!res?.success) {
        throw new Error("Failed to load products");
      }
      return res;
    };
    try {
      const res = reset
        ? await retry(run, { attempts: 5, delay: 700 })
        : await run();
      const newProducts = reset
        ? res.products
        : [...products, ...res.products];
      setProducts(newProducts);
      setTotalCount(res.totalCount);
      setHasMore((reset ? 1 : page) < res.totalPages);
      setCategory(res.categories);
      setError(null);

      const subcat = [
        ...new Map(
          (res.products || [])
            .filter((item) => item.subCategory?._id)
            .map((item) => [item.subCategory._id, item.subCategory])
        ).values(),
      ];
      setSubCategory(subcat);
    } catch (error) {
      console.error("Error getting from all Product Page. ", error);
      setError("Something went wrong");
    }
  };

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!selectedStore?._id) return;
    setPage(1);
    fetchFilteredProducts(true);
  }, [discountOnly, selectedCategory, selectedSubCategory, sortBy, searchQuery, selectedStore?._id]);

  // load more (pagination)
  useEffect(() => {
    if (page > 1) {
      fetchFilteredProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // const onToggleDiscount = () => setDiscountOnly((prev) => !prev);
  const onToggleDiscount = () => {
    const newDiscount = !discountOnly;
    setDiscountOnly(newDiscount);
    searchParams.set("discount", newDiscount);
    setSearchParams(searchParams);
  };
  // const onSelectCategory = (id) => {
  //   setSelectedCategory(id);
  //   setSelectedSubCategory(null); // reset subcategory
  // };
  const onSelectCategory = (id) => {
    setSelectedCategory(id);
    setSelectedSubCategory(null);
    searchParams.set("category", id);
    searchParams.delete("subCategory"); // clear subcategory on category change
    setSearchParams(searchParams);
  };
  // const onSelectSubCategory = (id) => setSelectedSubCategory(id);
  const onSelectSubCategory = (id) => {
    setSelectedSubCategory(id);
    searchParams.set("subCategory", id);
    setSearchParams(searchParams);
  };
  // const onSortChange = (value) => setSortBy(value);
  const onSortChange = (value) => {
    setSortBy(value);
    searchParams.set("sortBy", value);
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar - desktop only */}
        <aside className="hidden lg:block w-72">
          <div className="sticky top-20">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-semibold mb-3">Filters</h3>

              {/* Discount */}
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={onToggleDiscount}
                />
                <span>On Discount</span>
              </label>

              {/* Category list */}
              {category && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Categories</div>
                  <DropdownSelection
                    options={[
                      { label: "All", value: "" },
                      ...category.map((s) => ({
                        label: s.name,
                        value: s._id,
                      })),
                    ]}
                    selected={selectedCategory}
                    onSelect={onSelectCategory}
                  />
                </div>
              )}

              {/* Subcategories (dependent) */}
              {selectedCategory && subCategory.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Subcategories</div>
                  <DropdownSelection
                    options={[
                      { label: "All", value: "" },
                      ...subCategory.map((s) => ({
                        label: s.name,
                        value: s._id,
                      })),
                    ]}
                    selected={selectedSubCategory}
                    onSelect={onSelectSubCategory}
                  />
                </div>
              )}

              {/* Sort */}
              <div className="mb-2">
                <div className="text-sm font-medium mb-1">Sort</div>
                <DropdownSelection
                  options={[
                    { label: "Default", value: "" },
                    { label: "Price Low → High", value: "price_low_high" },
                    { label: "Price High → Low", value: "price_high_low" },
                    { label: "Discount", value: "discount" },
                    { label: "A → Z", value: "a_to_z" },
                    { label: "Z → A", value: "z_to_a" },
                  ]}
                  selected={sortBy}
                  onSelect={onSortChange}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Mobile filter bar */}
          <div className="lg:hidden mb-4 flex items-center justify-between gap-2">
            <MobileFilterDrawer
              discount={discountOnly}
              setDiscountOnly={setDiscountOnly}
              categories={category}
              subcategories={subCategory}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <div>
              <DropdownSelection
                options={[
                  { label: "Default", value: "" },
                  { label: "Price Low → High", value: "price_low_high" },
                  { label: "Price High → Low", value: "price_high_low" },
                  { label: "Discount", value: "discount" },
                  { label: "A → Z", value: "a_to_z" },
                  { label: "Z → A", value: "z_to_a" },
                ]}
                selected={sortBy}
                onSelect={setSortBy}
              />
            </div>
          </div>

          <div className="mb-2 text-gray-500">
            Total Products: {totalCount}
            {searchQuery ? ` for “${searchQuery}”` : ""}
          </div>
          <hr className="my-4 border-t border-gray-300" />

          {/* Products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.length === 0 && !loading && (
              <div className="col-span-full text-center text-neutral-600 py-12">
                No products found.
              </div>
            )}
            {products.map((p) => (
              <div key={p._id || p.id} className="w-full">
                <ProductCard
                  key={p._id}
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
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {hasMore && !loading && (
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Load More
              </button>
            )}
            {!hasMore && products.length > 0 && (
              <div className="text-neutral-600">No more products</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllProducts;
