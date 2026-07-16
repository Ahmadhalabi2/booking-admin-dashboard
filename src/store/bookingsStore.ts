import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingStatus =
  | 'pending_admin'
  | 'cancelled_by_admin'
  | 'cancelled_by_user'
  | 'accepted_waiting_payment'
  | 'paid_confirmed';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  hotelId: number;
  hotelName: string;
  country: string;
  city: string;
  checkIn: string; // yyyy-mm-dd
  checkOut: string; // yyyy-mm-dd
  guests: number;
  nights: number;
  amount: number;
  status: BookingStatus;
  createdAt: number;
  decidedAt?: number;
  paidAt?: number;
}

interface BookingsState {
  bookings: Booking[];

  createBooking: (payload: Omit<Booking, 'id' | 'createdAt' | 'status' | 'decidedAt' | 'paidAt'>) => Booking;
  cancelByUser: (bookingId: string) => { success: boolean; message: string };

  adminAccept: (bookingId: string) => { success: boolean; message: string };
  adminCancel: (bookingId: string) => { success: boolean; message: string };

  adminMarkPaid: (bookingId: string) => { success: boolean; message: string };

  deleteBookingCompletely: (bookingId: string) => { success: boolean; message: string };
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],

      createBooking: (payload) => {
        const booking: Booking = {
          ...payload,
          id: 'BK-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
          createdAt: Date.now(),
          status: 'pending_admin',
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },

      cancelByUser: (bookingId) => {
        const b = get().bookings.find((x) => x.id === bookingId);
        if (!b) return { success: false, message: 'Booking not found.' };
        if (b.status !== 'pending_admin' && b.status !== 'accepted_waiting_payment') {
          return { success: false, message: 'Cannot cancel this booking at its current status.' };
        }
        set((s) => ({
          bookings: s.bookings.map((x) =>
            x.id === bookingId
              ? { ...x, status: 'cancelled_by_user', decidedAt: Date.now() }
              : x
          ),
        }));
        return { success: true, message: 'Booking cancelled.' };
      },

      adminAccept: (bookingId) => {
        const b = get().bookings.find((x) => x.id === bookingId);
        if (!b) return { success: false, message: 'Booking not found.' };
        if (b.status !== 'pending_admin') return { success: false, message: 'Booking is not pending.' };
        set((s) => ({
          bookings: s.bookings.map((x) =>
            x.id === bookingId
              ? { ...x, status: 'accepted_waiting_payment', decidedAt: Date.now() }
              : x
          ),
        }));
        return { success: true, message: 'Booking accepted. Awaiting payment.' };
      },

      adminCancel: (bookingId) => {
        const b = get().bookings.find((x) => x.id === bookingId);
        if (!b) return { success: false, message: 'Booking not found.' };
        if (b.status !== 'pending_admin' && b.status !== 'accepted_waiting_payment') {
          return { success: false, message: 'Cannot cancel this booking at its current status.' };
        }
        set((s) => ({
          bookings: s.bookings.map((x) =>
            x.id === bookingId
              ? { ...x, status: 'cancelled_by_admin', decidedAt: Date.now() }
              : x
          ),
        }));
        return { success: true, message: 'Booking cancelled by admin.' };
      },

      adminMarkPaid: (bookingId) => {
        const b = get().bookings.find((x) => x.id === bookingId);
        if (!b) return { success: false, message: 'Booking not found.' };
        if (b.status !== 'accepted_waiting_payment') return { success: false, message: 'Payment not allowed for current status.' };
        set((s) => ({
          bookings: s.bookings.map((x) =>
            x.id === bookingId
              ? { ...x, status: 'paid_confirmed', paidAt: Date.now() }
              : x
          ),
        }));
        return { success: true, message: 'Payment received. Booking confirmed.' };
      },

      deleteBookingCompletely: (bookingId) => {
        const exists = get().bookings.some((b) => b.id === bookingId);
        if (!exists) return { success: false, message: 'Booking not found.' };
        set((s) => ({ bookings: s.bookings.filter((b) => b.id !== bookingId) }));
        return { success: true, message: 'Booking deleted.' };
      },
    }),
    { name: 'stay-bookings' }
  )
);

