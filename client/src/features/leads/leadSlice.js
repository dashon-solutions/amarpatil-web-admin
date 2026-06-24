import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// Async Thunks
export const createLead = createAsyncThunk(
  "leads/createLead",
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/leads", leadData);
      return response.data.lead;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/leads");
      return response.data.leads;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const updateLeadStatus = createAsyncThunk(
  "leads/updateLeadStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/leads/status/${id}`, { status });
      return response.data.lead;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/leads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

const leadSlice = createSlice({
  name: "leads",
  initialState: {
    leads: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      // Update Lead Status (Optimistic/Pessimistic)
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      // Delete Lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l._id !== action.payload);
      });
  },
});

export default leadSlice.reducer;
