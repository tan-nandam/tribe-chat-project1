import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';
import { TMessage, TParticipant } from '../types';

interface ChatState {
  // Session data
  sessionUuid: string | null;
  messages: TMessage[];
  participants: Record<string, TParticipant>;
  currentUserUuid: string | null;
  lastUpdate: number;
  hydrated: boolean;
  loading: boolean;
  error: string | null;

  // Infinite scroll state
  hasMoreMessages: boolean;

  // Reply state
  replyingTo: TMessage | null;

  // Actions
  loadSession: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sendReply: (text: string, replyToUuid: string) => Promise<void>;
  editMessage: (messageUuid: string, newText: string) => Promise<void>;
  addReaction: (messageUuid: string, emoji: string) => Promise<void>;
  fetchOlder: () => Promise<void>;
  pollUpdates: () => Promise<void>;
  setCurrentUser: (uuid: string) => void;
  setReplyingTo: (message: TMessage | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionUuid: null,
      messages: [],
      participants: {},
      currentUserUuid: null,
      lastUpdate: 0,
      hydrated: false,
      loading: false,
      error: null,
      hasMoreMessages: true,
      replyingTo: null,

     
      setCurrentUser: (uuid: string) => {
        set({ currentUserUuid: uuid });
      },

      
      loadSession: async () => {
        try {
          set({ loading: true, error: null });
          
          
          const { data: info } = await api.getInfo();
          
          
          const [messagesRes, participantsRes] = await Promise.all([
            api.getAllMessages(),
            api.getAllParticipants()
          ]);

          
          const participantsMap = Object.fromEntries(
            participantsRes.data.map(p => [p.uuid, p])
          );

          
          let currentUserUuid = null;
          if (messagesRes.data.length > 0) {
            const recentMessages = messagesRes.data
              .filter(msg => Date.now() - msg.sentAt < 3600000) 
              .sort((a, b) => b.sentAt - a.sentAt); 
            
            if (recentMessages.length > 0) {
              currentUserUuid = 'user-1'; 
            }
          }

          const sortedMessages = messagesRes.data.sort((a, b) => a.sentAt - b.sentAt);
          const latestMessages = sortedMessages.slice(-25); // Getting only the latest 25 messages

          set({
            sessionUuid: info.sessionUuid,
            messages: latestMessages,
            participants: participantsMap,
            currentUserUuid,
            lastUpdate: Date.now(),
            hydrated: true,
            loading: false,
            error: null
          });
        } catch (error) {
          set({ 
            loading: false, 
            error: 'Failed to load chat data. Please check your connection.',
            hydrated: true
          });
        }
      },

      
      sendMessage: async (text: string) => {
        try {
          const { data: newMessage } = await api.postNewMessage(text);
          
          
          const { currentUserUuid } = get();
          if (!currentUserUuid) {
            set({ currentUserUuid: newMessage.authorUuid });
          }
          
          
          const messageWithCorrectAuthor = {
            ...newMessage,
            authorUuid: currentUserUuid || newMessage.authorUuid
          };
          

          
          
          set(state => ({
            messages: [...state.messages, messageWithCorrectAuthor]
          }));
        } catch (error) {
          const { currentUserUuid } = get();
          const tempMessage: TMessage = {
            uuid: `temp-${Date.now()}`,
            authorUuid: currentUserUuid || 'user-1',
            text: text,
            attachments: [],
            sentAt: Date.now(),
            updatedAt: Date.now(),
            reactions: []
          };
          set(state => ({
            messages: [...state.messages, tempMessage]
          }));
        }
      },

      // Loading older messages (for infinite scroll)
      fetchOlder: async () => {
        const { messages, hasMoreMessages } = get();
        if (messages.length === 0 || !hasMoreMessages) return;

        try {
          const oldestMessage = messages[0];
          const { data: olderMessages } = await api.getOlderMessages(oldestMessage.uuid);
          
          if (olderMessages.length > 0) {
            
            const sortedOlderMessages = olderMessages.sort((a, b) => a.sentAt - b.sentAt);
            
            
            set(state => {
              const existingUuids = new Set(state.messages.map(m => m.uuid));
              const uniqueOlderMessages = sortedOlderMessages.filter(m => !existingUuids.has(m.uuid));
              
              
              if (uniqueOlderMessages.length > 0) {
                return {
                  messages: [...uniqueOlderMessages, ...state.messages],
                  hasMoreMessages: olderMessages.length >= 25 // If we got less than 25, we've reached the end
                };
              }
              
              
              return {
                hasMoreMessages: false
              };
            });
          } else {
            
            set({ hasMoreMessages: false });
          }
        } catch (error) {
          
          console.warn('Failed to fetch older messages:', error);
        }
      },

      // Poll for new messages
      pollUpdates: async () => {
        const { lastUpdate } = get();
        
        try {
          const { data: newMessages } = await api.getMessageUpdates(lastUpdate);
          
          if (newMessages.length > 0) {
            
            const sortedNewMessages = newMessages.sort((a, b) => a.sentAt - b.sentAt);
            
            
            set(state => {
              const existingUuids = new Set(state.messages.map(m => m.uuid));
              const uniqueNewMessages = sortedNewMessages.filter(m => !existingUuids.has(m.uuid));
              
              return {
                messages: [...state.messages, ...uniqueNewMessages],
                lastUpdate: Date.now()
              };
            });
          }
        } catch (error) {
          
        }
      },

      // Sending a reply to a message
      sendReply: async (text: string, replyToUuid: string) => {
        try {
          
          const { data: newMessage } = await api.postNewMessage(text);
          
          
          const { currentUserUuid } = get();
          if (!currentUserUuid) {
            set({ currentUserUuid: newMessage.authorUuid });
          }
          
          
          const replyMessage = {
            ...newMessage,
            authorUuid: currentUserUuid || newMessage.authorUuid,
            replyToMessageUuid: replyToUuid
          };
          
          
          set(state => ({
            messages: [...state.messages, replyMessage],
            replyingTo: null 
          }));
        } catch (error) {
          const { currentUserUuid } = get();
          const tempMessage: TMessage = {
            uuid: `temp-${Date.now()}`,
            authorUuid: currentUserUuid || 'user-1',
            text: text,
            attachments: [],
            sentAt: Date.now(),
            updatedAt: Date.now(),
            reactions: [],
            replyToMessageUuid: replyToUuid
          };
          set(state => ({
            messages: [...state.messages, tempMessage],
            replyingTo: null 
          }));
        }
      },

      
      setReplyingTo: (message: TMessage | null) => {
        set({ replyingTo: message });
      },

      
      editMessage: async (messageUuid: string, newText: string) => {
        try {
          set(state => ({
            messages: state.messages.map(msg => 
              msg.uuid === messageUuid 
                ? { ...msg, text: newText, updatedAt: Date.now() }
                : msg
            )
          }));
      
    } catch (error) {
      set(state => ({
        messages: state.messages.map(msg => 
          msg.uuid === messageUuid 
            ? { ...msg, text: newText, updatedAt: msg.sentAt }
            : msg
        )
      }));
    }
  },
  addReaction: async (messageUuid: string, emoji: string) => {
    try {
      const { currentUserUuid } = get();
      if (!currentUserUuid) return;

      set(state => {
        
        const updatedParticipants = { ...state.participants };
        if (!updatedParticipants[currentUserUuid]) {
          updatedParticipants[currentUserUuid] = {
            uuid: currentUserUuid,
            name: 'You',
            avatarUrl: 'https://i.pravatar.cc/150',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
        }

        return {
          participants: updatedParticipants,
          messages: state.messages.map(msg => {
            if (msg.uuid === messageUuid) {
              
              const existingReaction = msg.reactions?.find(
                r => r.participantUuid === currentUserUuid && r.value === emoji
              );
              
              if (existingReaction) {
                
                return {
                  ...msg,
                  reactions: msg.reactions?.filter(r => r.uuid !== existingReaction.uuid) || []
                };
              } else {
                
                const newReaction = {
                  uuid: `reaction-${Date.now()}`,
                  participantUuid: currentUserUuid,
                  value: emoji
                };
                return {
                  ...msg,
                  reactions: [...(msg.reactions || []), newReaction]
                };
              }
            }
            return msg;
          })
        };
      });
      
    } catch (error) {
    }
  },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionUuid: state.sessionUuid,
        messages: state.messages.slice(-100),
        participants: state.participants,
        currentUserUuid: state.currentUserUuid,
        lastUpdate: state.lastUpdate,
      }),
    }
  )
);
