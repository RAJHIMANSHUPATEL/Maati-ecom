// ✅ Helper to create slug like: "123-meat"
import { resolveImageUrl } from "../../utils/imageUrl";

export const formatSlugId = (id, name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/[^\w-]/g, ""); // remove special chars
  return `${id}-${slug}`;
};

export const transformMenuData = (menuData) => {
  if (!menuData?.subMenu?.length) return null;

  return {
    key: "root",
    isLeaf: false,
    children: menuData.subMenu
      .filter((cat) => cat.subcategories?.length)
      .map((cat) => {
        const catSlug = formatSlugId(cat._id, cat.name);
        return {
          key: cat._id,
          value: {
            label: cat.name,
            banner: resolveImageUrl(cat.cover),
            bannerTitle: cat.name,
            link: `/products/cid/${catSlug}`,
          },
          isLeaf: false,
          children: cat.subcategories.map((sub) => {
            const subSlug = formatSlugId(sub._id, sub.name);
            return {
              key: sub._id,
              value: {
                label: sub.name,
                link: `/products/cid/${catSlug}/scid/${subSlug}`,
              },
              isLeaf: true,
            };
          }),
        };
      }),
  };
};

export const findNode = (keys, node) => {
  if (keys.length > 1) {
    const [currentKey, ...restKeys] = keys;
    return findNode(
      restKeys,
      node.children?.find((child) => child.key === currentKey) || node
    );
  }
  return node.children?.find((child) => child.key === keys[0]) || node;
};
