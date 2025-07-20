import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useChatStore } from '../store';
import { TParticipant, TMessage } from '../types';
import { styles } from './InputBar.styles';

interface InputBarProps {
  onMessageSent?: () => void;
}

export interface InputBarRef {
  startEditing: (message: TMessage) => void;
}

export const InputBar = React.forwardRef<InputBarRef, InputBarProps>(({ onMessageSent }, ref) => {
  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<TMessage | null>(null);
  const sendMessage = useChatStore(state => state.sendMessage);
  const sendReply = useChatStore(state => state.sendReply);
  const editMessage = useChatStore(state => state.editMessage);
  const replyingTo = useChatStore(state => state.replyingTo);
  const setReplyingTo = useChatStore(state => state.setReplyingTo);
  const participants = useChatStore(state => state.participants);

  // Here I am getting the participants array from the participants object
  const participantsArray = useMemo(() => 
    Object.values(participants), [participants]
  );

  // Filtering the participants array for @mention
  const mentionCandidates = useMemo(() => {
    if (!showMentions) return [];
    const query = mentionQuery.toLowerCase();
    return participantsArray
      .filter(p => p.name.toLowerCase().includes(query))
      .slice(0, 5); // Limit to 5 results
  }, [showMentions, mentionQuery, participantsArray]);

  const handleChangeText = (newText: string) => {
    setText(newText);
    
    
    const atIndex = newText.lastIndexOf('@');
    if (atIndex >= 0) {
      const query = newText.slice(atIndex + 1);
      if (query.length > 0) {
        setShowMentions(true);
        setMentionQuery(query);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (participant: TParticipant) => {
    // Replacing the "@query" with the full "@Name " pattern
    const atIndex = text.lastIndexOf('@');
    const newText = text.slice(0, atIndex + 1) + participant.name + ' ';
    setText(newText);
    setShowMentions(false);
  };

  // Handling the sending of message
  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (trimmedText && !isSending) {
      setIsSending(true);
      try {
        if (editingMessage) {
          await editMessage(editingMessage.uuid, trimmedText);
          setEditingMessage(null);
        } else if (replyingTo) {
         
          await sendReply(trimmedText, replyingTo.uuid);
        } else {
          
          await sendMessage(trimmedText);
        }
        setText('');
        setShowMentions(false);
        onMessageSent?.();
      } catch (error) {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  }, [text, sendMessage, sendReply, editMessage, replyingTo, editingMessage, isSending, onMessageSent]);

  const renderMentionItem = ({ item }: { item: TParticipant }) => (
    <TouchableOpacity
      style={styles.mentionItem}
      onPress={() => handleMentionSelect(item)}
    >
      <Text style={styles.mentionName}>{item.name}</Text>
      {item.jobTitle && (
        <Text style={styles.mentionJobTitle}>{item.jobTitle}</Text>
      )}
    </TouchableOpacity>
  );

  // editing the message
  const startEditing = useCallback((message: TMessage) => {
    setEditingMessage(message);
    setText(message.text || '');
    setReplyingTo(null); // Clear any reply state
  }, [setReplyingTo]);

  // canceling the editing of message
  const cancelEditing = useCallback(() => {
    setEditingMessage(null);
    setText('');
  }, []);

  
  React.useImperativeHandle(ref, () => ({
    startEditing,
  }));

  const isButtonDisabled = !text.trim() || isSending;

  return (
    <View style={styles.container}>
      {replyingTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewLabel}>Replying to:</Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.replyCancelButton}
            onPress={() => setReplyingTo(null)}
          >
            <Text style={styles.replyCancelText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {editingMessage && (
        <View style={styles.editPreview}>
          <View style={styles.editPreviewContent}>
            <Text style={styles.editPreviewLabel}>Editing:</Text>
            <Text style={styles.editPreviewText} numberOfLines={1}>
              {editingMessage.text}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editCancelButton}
            onPress={cancelEditing}
          >
            <Text style={styles.editCancelText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {showMentions && mentionCandidates.length > 0 && (
        <View style={styles.mentionListContainer}>
          <FlatList
            data={mentionCandidates}
            renderItem={renderMentionItem}
            keyExtractor={item => item.uuid}
            style={styles.mentionList}
            nestedScrollEnabled
          />
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder="Type a message... (use @ to mention someone)"
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isSending}
        />
        <TouchableOpacity
          style={[styles.sendButton, isButtonDisabled && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isButtonDisabled}
          activeOpacity={0.7}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});
