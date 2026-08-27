import { SfSelect } from "@storefront-ui/react";

const StoreSelector = ({ stores, selectedStore, onChange, className }) => {
  const options = [...(stores || [])];
  if (
    selectedStore?._id &&
    !options.some((store) => store._id === selectedStore._id)
  ) {
    options.unshift(selectedStore);
  }

  return (
    <SfSelect
      value={selectedStore?._id || ""}
      onChange={onChange}
      size="sm"
      className={className}
    >
      {!selectedStore?._id && (
        <option value="" className="text-black">
          Choose store
        </option>
      )}
      {options.map((store) => (
        <option key={store._id} value={store._id} className="text-black">
          {store.name}
        </option>
      ))}
    </SfSelect>
  );
};

export default StoreSelector;
