import { createSlice } from "@reduxjs/toolkit";
import { readStoredStore } from "../utils/storeStorage";

const initialState = {
  selectedStore: readStoredStore(),
  stores: [],
  storesReady: false,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStores: (state, action) => {
      state.stores = action.payload;
      state.storesReady = true;
    },
    selectStore: (state, action) => {
      state.selectedStore = action.payload;
      if (action.payload) {
        localStorage.setItem("selectedStore", JSON.stringify(action.payload));
      }
    },
    clearStore: (state) => {
      state.selectedStore = null;
      localStorage.removeItem("selectedStore");
    },
  },
});

export const { setStores, selectStore, clearStore } = storeSlice.actions;
export default storeSlice.reducer;
