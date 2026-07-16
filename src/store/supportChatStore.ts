import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportRole = 'user' | 'support' | 'superadmin';

export interface SupportMessage {
  id: string;
  threadId: string;
  fromRole: SupportRole;
  fromUserId: string;
  fromName: string;
  text: string;
  createdAt: number;
  unreadForSupport: boolean;
  unreadForUser: boolean;
}

export interface SupportThread {
  id: string;
  userId: string;
  userName: string;
  createdAt: number;
  lastMessageAt?: number;
  lastMessagePreview?: string;
}

export interface SupportFeedback {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
  unreadForSupport: boolean;
  repliedText?: string;
  repliedAt?: number;
}


interface SupportChatState {
  threads: SupportThread[];
  messages: SupportMessage[];

  feedbacks: SupportFeedback[];

  ensureThreadForUser: (payload: { userId: string; userName: string }) => SupportThread;

  sendMessageFromUser: (payload: {
    threadId: string;
    userId: string;
    userName: string;
    text: string;
  }) => SupportMessage;

  sendMessageFromSupport: (payload: {
    threadId: string;
    fromUserId: string;
    fromName: string;
    text: string;
  }) => SupportMessage;

  // Feedbacks
  createFeedbackFromUser: (payload: { userId: string; userName: string; text: string }) => SupportFeedback;
  markFeedbackReadForSupport: (feedbackId: string) => void;
  markAllFeedbackReadForSupport: () => void;

  supportReplyFeedback: (payload: { feedbackId: string; repliedText: string }) => void;

  // Chat read
  markThreadReadForSupport: (threadId: string) => void;
  markThreadReadForUser: (threadId: string, userId: string) => void;

  getUnreadThreadsForSupport: () => number;
  getUnreadFeedbacksForSupport: () => number;
}

const now = () => Date.now();
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: [],
      feedbacks: [],


      ensureThreadForUser: ({ userId, userName }) => {
        const existing = get().threads.find((t) => t.userId === userId);
        if (existing) return existing;

        const t: SupportThread = {
          id: id('TH'),
          userId,
          userName,
          createdAt: now(),
          lastMessageAt: now(),
          lastMessagePreview: 'تم بدء محادثة الدعم',
        };

        set((s) => ({ threads: [t, ...s.threads] }));
        return t;
      },

      sendMessageFromUser: ({ threadId, userId, userName, text }) => {
        const msg: SupportMessage = {
          id: id('MSG'),
          threadId,
          fromRole: 'user',
          fromUserId: userId,
          fromName: userName,
          text,
          createdAt: now(),
          unreadForSupport: true,
          unreadForUser: false,
        };

        set((s) => ({
          messages: [msg, ...s.messages],
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessageAt: msg.createdAt,
                  lastMessagePreview: msg.text.slice(0, 60),
                }
              : t
          ),
        }));

        return msg;
      },

      sendMessageFromSupport: ({ threadId, fromUserId, fromName, text }) => {
        const msg: SupportMessage = {
          id: id('MSG'),
          threadId,
          fromRole: 'support',
          fromUserId,
          fromName,
          text,
          createdAt: now(),
          unreadForSupport: false,
          unreadForUser: true,
        };

        set((s) => ({
          messages: [msg, ...s.messages],
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessageAt: msg.createdAt,
                  lastMessagePreview: msg.text.slice(0, 60),
                }
              : t
          ),
        }));

        return msg;
      },

      markThreadReadForSupport: (threadId) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.threadId === threadId && m.fromRole === 'user'
              ? { ...m, unreadForSupport: false }
              : m
          ),
        }));
      },

      markThreadReadForUser: (threadId, userId) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.threadId === threadId && m.fromUserId !== userId
              ? { ...m, unreadForUser: false }
              : m
          ),
        }));
      },

      // Feedbacks
      createFeedbackFromUser: ({ userId, userName, text }) => {
        const feedback: SupportFeedback = {
          id: id('FB'),
          userId,
          userName,
          text,
          createdAt: now(),
          unreadForSupport: true,
        };

        set((s) => ({
          feedbacks: [feedback, ...s.feedbacks],
        }));

        return feedback;
      },

      markFeedbackReadForSupport: (feedbackId) => {
        set((s) => ({
          feedbacks: s.feedbacks.map((f) =>
            f.id === feedbackId ? { ...f, unreadForSupport: false } : f
          ),
        }));
      },

      markAllFeedbackReadForSupport: () => {
        set((s) => ({
          feedbacks: s.feedbacks.map((f) => ({ ...f, unreadForSupport: false })),
        }));
      },

      supportReplyFeedback: ({ feedbackId, repliedText }) => {
        set((s) => ({
          feedbacks: s.feedbacks.map((f) =>
            f.id === feedbackId
              ? {
                  ...f,
                  repliedText,
                  repliedAt: now(),
                  unreadForSupport: false,
                }
              : f
          ),
        }));
      },

      getUnreadThreadsForSupport: () => {
        const unreadThreadIds = new Set(
          get().messages
            .filter((m) => m.unreadForSupport)
            .map((m) => m.threadId)
        );
        return unreadThreadIds.size;
      },

      getUnreadFeedbacksForSupport: () => {
        return new Set(
          get().feedbacks.filter((f) => f.unreadForSupport).map((f) => f.id)
        ).size;
      },
    }),
    { name: 'stay-support-chat' }
  )
);

