import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useChatStore } from './src/store';
import { MessageList, MessageListRef } from './src/components/MessageList';
import { InputBar, InputBarRef } from './src/components/InputBar';
import { styles } from './App.styles';

export default function App() {
  
  const loadSession = useChatStore(s => s.loadSession);
  const pollUpdates = useChatStore(s => s.pollUpdates);
  const hydrated = useChatStore(s => s.hydrated);
  const loading = useChatStore(s => s.loading);
  const error = useChatStore(s => s.error);
  const participants = useChatStore(s => s.participants);
  const messages = useChatStore(s => s.messages);

  
  const messageListRef = useRef<MessageListRef>(null);
  const inputBarRef = useRef<InputBarRef>(null);

  // Loading initial data and start polling for updates
  useEffect(() => {
    loadSession();
    
    
    const interval = setInterval(pollUpdates, 5000);
    
    return () => clearInterval(interval);
  }, [loadSession, pollUpdates]);

  
  const handleMessageSent = () => {
    messageListRef.current?.scrollToBottom();
  };

  // Showing loading screen while data is being fetched
  if (!hydrated || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  // Showing error screen if there's an error
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText}>Pull to refresh to retry</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>💬</Text>
          <Text style={styles.headerTitle}>Tribe Chat</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.participantCount}>
            {Object.keys(participants).length} participants
          </Text>
          <Text style={styles.messageCount}>
            {messages.length} messages
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.messageListContainer}>
          <MessageList ref={messageListRef} inputBarRef={inputBarRef} />
        </View>
        <InputBar ref={inputBarRef} onMessageSent={handleMessageSent} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
