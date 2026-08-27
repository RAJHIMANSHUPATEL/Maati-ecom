// src/hooks/useApi.js
import { useState } from "react";
import request from "../api/request";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiConfig) => {
    setLoading(true);
    setError(null);

    try {
      const response = await request(apiConfig);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading, error };
};

export default useApi;
