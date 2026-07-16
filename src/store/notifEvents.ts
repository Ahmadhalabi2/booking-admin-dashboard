import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingEventType =
  | 'booking_created'
  | 'booking_accepted'
  | 'booking_cancelled'
  | 'booking_paid'
  | 'booking_deleted';

export interface BookingEvent {
  id: string;
  type: BookingEventType;
  bookingId: string;
  createdByUserId: string;
  createdByName: string;
  targetRole: 'superadmin'; // now we only notify superadmin
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

function nowTimeLabel() {
  return 'just now';
}

interface NotifEventsState {
  events: BookingEvent[];

  addEvent: (payload: Omit<BookingEvent, 'id' | 'time' | 'unread'>) => BookingEvent;

  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  unreadCount: () => number;
}

export const useNotifEventsStore = create<NotifEventsState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (payload) => {
        const ev: BookingEvent = {
          ...payload,
          id: `EV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          time: nowTimeLabel(),
          unread: true,
        };
        set((s) => ({ events: [ev, ...s.events] }));
        return ev;
      },

      unreadCount: () => get().events.filter((e) => e.unread).length,

      markRead: (id) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, unread: false } : e)) })),

      markAllRead: () => set((s) => ({ events: s.events.map((e) => ({ ...e, unread: false })) })),

      dismiss: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'stay-booking-events' }
  )
);

