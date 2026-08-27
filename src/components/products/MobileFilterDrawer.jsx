import {
  SfDrawer,
  SfButton,
  SfIconClose,
  useTrapFocus,
} from "@storefront-ui/react";
import { useState, useRef, memo } from "react";
import { Transition } from "react-transition-group";
import classNames from "classnames";
import DropdownSelection from "./DropdownSelection";

export default memo(function MobileFilterDrawer({
  discount,
  setDiscountOnly,
  categories,
  subcategories,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  sortBy,
  setSortBy,
}) {
  const [open, setOpen] = useState(false);
  const nodeRef = useRef(null);
  const drawerRef = useRef(null);

  useTrapFocus(drawerRef, { activeState: open });

  const onToggleDiscount = () => setDiscountOnly((prev) => !prev);

  return (
    <>
      {/* Open button visible only on mobile */}
      <div className="block lg:hidden">
        <SfButton size="sm" onClick={() => setOpen(true)}>
          Filters
        </SfButton>
      </div>

      <Transition ref={nodeRef} in={open} timeout={300} unmountOnExit>
        {(state) => (
          <SfDrawer
            ref={drawerRef}
            open
            placement="left"
            onClose={() => setOpen(false)}
            className={classNames(
              "z-20 h-full w-[min(300px,calc(100vw-1.5rem))] border-r border-gray-200 bg-white px-2 duration-500 transition ease-in-out",
              {
                "translate-x-0": state === "entered",
                "-translate-x-full": state === "entering" || state === "exited",
              }
            )}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-medium">Filters</h3>
              <SfButton
                square
                variant="tertiary"
                onClick={() => setOpen(false)}
              >
                <SfIconClose />
              </SfButton>
            </header>
            {/* Discount */}
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={discount}
                onChange={onToggleDiscount}
              />
              <span>On Discount</span>
            </label>

            {/* Category list */}
            <div className="mb-3">
              <div className="text-sm font-medium mb-2">Categories</div>
              <DropdownSelection
                options={[
                  { label: "All", value: "" },
                  ...categories.map((c) => ({
                    label: c.name,
                    value: c._id,
                  })),
                ]}
                selected={selectedCategory}
                onSelect={(val) => {
                  setSelectedCategory(val || null);
                  setSelectedSubCategory(null);
                }}
              />
            </div>

            {/* Subcategories (dependent) */}
            {selectedCategory && subcategories.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Subcategories</div>
                <DropdownSelection
                  options={[
                    { label: "All", value: "" },
                    ...subcategories.map((s) => ({
                      label: s.name,
                      value: s._id,
                    })),
                  ]}
                  selected={selectedSubCategory}
                  onSelect={(val) => setSelectedSubCategory(val || null)}
                />
              </div>
            )}
          </SfDrawer>
        )}
      </Transition>
    </>
  );
});
