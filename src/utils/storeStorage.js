export const readStoredStore = () => {
  try {
    const raw = localStorage.getItem("selectedStore");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?._id ? parsed : null;
  } catch {
    return null;
  }
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retry(fn, { attempts = 6, delay = 700 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw lastError;
      await wait(delay * attempt);
    }
  }
  throw lastError;
}
