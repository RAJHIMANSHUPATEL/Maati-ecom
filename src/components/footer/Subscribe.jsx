import { useState } from "react";
import { toast } from "react-toastify";
import useApi from "../../hooks/useApi";
import { subscribeAPI } from "../../api";

export default function Subscribe() {
  const [inputValue, setInputValue] = useState("");
  const { callApi, loading } = useApi();

  const subscribeNewsletter = async (event, email) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      const response = await callApi(subscribeAPI.subscribe({ email }));
      if (response?.success) {
        toast.success("Subscribed successfully!");
        setInputValue("");
      }
    } catch (err) {
      const status = err?.response?.status || err?.status;
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        "Subscription failed. Please try again.";

      if (status === 409) {
        toast.info("This email is already subscribed.");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <form
      className="mt-6 max-w-sm"
      onSubmit={(event) => subscribeNewsletter(event, inputValue)}
    >
      <label
        htmlFor="footer-subscribe"
        className="text-[11px] uppercase tracking-[0.2em] text-ink/50"
      >
        The list, by email
      </label>
      <div className="mt-2 flex items-end gap-3">
        <input
          id="footer-subscribe"
          value={inputValue}
          type="email"
          placeholder="Your email"
          onChange={(event) => setInputValue(event.target.value)}
          disabled={loading}
          className="min-w-0 flex-1 border-0 border-b border-rule bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-ink/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="border-b border-ink pb-1.5 text-sm text-ink disabled:text-ink/40"
        >
          {loading ? "…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
