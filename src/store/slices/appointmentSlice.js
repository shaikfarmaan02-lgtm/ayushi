import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  loading: false,
  error: null,
  currentAppointment: null,
};

export const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    fetchAppointmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.loading = false;
      state.appointments = action.payload;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createAppointmentSuccess: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointmentStatus: (state, action) => {
      const index = state.appointments.findIndex(
        (appointment) => appointment.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index].status = action.payload.status;
      }
    },
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
    },
  },
});

export const {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  createAppointmentSuccess,
  updateAppointmentStatus,
  setCurrentAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;