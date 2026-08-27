export const apiErrorMessage = (err, fallback = "Something went wrong") => {
  const raw = err?.data?.message ?? err?.message ?? err;
  if (!raw) return fallback;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const parts = raw
      .map((item) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean);
    return parts.length ? parts.join(". ") : fallback;
  }
  return fallback;
};
