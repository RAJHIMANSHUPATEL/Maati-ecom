export const BRAND = {
  name: "Maati",
  tagline: "The daily mandi",
  cities: "Noida & Delhi",
};

export const productPath = (name, id) =>
  `/product/${encodeURIComponent(String(name || "item"))}-${id}`;

export const productIdFromSlug = (slug = "") => {
  const decoded = decodeURIComponent(slug);
  return decoded.match(/([a-f0-9]{24})$/i)?.[1] || "";
};
