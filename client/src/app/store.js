import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import leadReducer from "../features/leads/leadSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
  },
});
