import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { format } from 'date-fns';
import { TMessage, TParticipant } from '../types';
import { useChatStore } from '../store';
import { styles } from './MessageItem.styles';

interface MessageItemProps {
  message: TMessage;
  showHeader: boolean;
  onStartEdit?: (message: TMessage) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

export const MessageItem = React.memo(({
  message,
  showHeader,
  onStartEdit,
}: MessageItemProps) => {
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  
  // Getting the sender info and current user from store
  const sender = useChatStore(state => state.participants[message.authorUuid]);
  const currentUserUuid = useChatStore(state => state.currentUserUuid);
  
  // Checking if this is the current user's message
  const isOwnMessage = message.authorUuid === currentUserUuid;

  
  const replyMessage = useChatStore(state => 
    state.messages.find(m => m.uuid === message.replyToMessageUuid)
  );

  
  const participants = useChatStore(state => state.participants);

  
  const reactionDetails = useMemo(() => {
    if (!message.reactions || message.reactions.length === 0) return [];
    
    return message.reactions.map(reaction => {
      const participant = participants[reaction.participantUuid];
      
      // If participant not found, checking if it's the current user
      if (!participant && reaction.participantUuid === currentUserUuid) {
        return {
          ...reaction,
          participant: {
            uuid: currentUserUuid,
            name: 'You',
            avatarUrl: 'https://i.pravatar.cc/150',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        };
      }
      
      return {
        ...reaction,
        participant: participant || {
          uuid: reaction.participantUuid,
          name: 'Unknown',
          avatarUrl: 'https://i.pravatar.cc/150',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };
    });
  }, [message.reactions, participants, currentUserUuid]);

  
  if (!message || !message.uuid) {
    return null;
  }

  const handleReactionPress = (emoji: string) => {
    setShowReactionModal(false);
    // Adding reaction to the message
    useChatStore.getState().addReaction(message.uuid, emoji);
  };

  const handleLongPress = () => {
    setShowContextMenu(true);
  };

  const handleImagePress = () => {
    if (message.attachments && message.attachments.length > 0) {
      setShowImageModal(true);
    }
  };

  const handleNamePress = () => {
    if (sender) {
      setShowParticipantModal(true);
    }
  };

  const handleReactionTap = () => {
    if (message.reactions && message.reactions.length > 0) {
      setShowReactionDetails(true);
    }
  };

  const handleReplyPress = () => {
    useChatStore.getState().setReplyingTo(message);
  };



  const handleContextMenuClose = () => {
    setShowContextMenu(false);
  };

  const handleContextMenuAction = (action: 'reply' | 'edit' | 'reactions') => {
    setShowContextMenu(false);
    switch (action) {
      case 'reply':
        useChatStore.getState().setReplyingTo(message);
        break;
      case 'edit':
        if (onStartEdit) {
          onStartEdit(message);
        }
        break;
      case 'reactions':
        setShowReactionModal(true);
        break;
    }
  };

  // Checking if message can be edited (own message, no attachments, within 5 minutes)
  const canEditMessage = isOwnMessage && 
    !message.attachments?.length && 
    message.sentAt && 
    (Date.now() - message.sentAt) < 300000 && 
    message.updatedAt === message.sentAt; 

  const renderReactionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.reactionOption}
      onPress={() => handleReactionPress(item)}
    >
      <Text style={styles.reactionEmoji}>{item}</Text>
    </TouchableOpacity>
  );

  const renderReactionDetail = ({ item }: { item: any }) => (
    <View style={styles.reactionDetailItem}>
      <Text style={styles.reactionDetailEmoji}>{item.value}</Text>
      <Text style={styles.reactionDetailName}>
        {item.participant?.name || 'Unknown'}
      </Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, isOwnMessage && styles.ownMessageContainer]}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        
        {showHeader && (
          <View style={[styles.header, isOwnMessage && styles.ownMessageHeader]}>
        <Image
            source={{ uri: sender?.avatarUrl ?? 'https://i.pravatar.cc/150' }}
            style={styles.avatar}
        />
            <TouchableOpacity onPress={handleNamePress}>
              <Text style={[styles.name, isOwnMessage && styles.ownMessageName]}>
                {isOwnMessage ? 'You' : (sender?.name ?? 'Unknown')}
              </Text>
            </TouchableOpacity>
        <Text style={styles.time}>
              {message.sentAt ? format(message.sentAt, 'p') : '--:--'}
        </Text>
        </View>
        )}

        
        {replyMessage && (
          <View style={styles.replyContainer}>
            <Text style={styles.replyText}>{replyMessage.text}</Text>
        </View>
      )}

        
        <View style={[styles.content, isOwnMessage && styles.ownMessageContent]}>
          {message.attachments && message.attachments.length > 0 ? (
        <TouchableOpacity onPress={handleImagePress}>
          <Image
                source={{ uri: message.attachments[0].url }}
            style={styles.image}
          />
        </TouchableOpacity>
      ) : (
            <Text style={[styles.text, isOwnMessage && styles.ownMessageText]}>
              {message.text || ''}
            </Text>
      )}
        </View>
      
        
        {message.updatedAt && message.sentAt && message.updatedAt !== message.sentAt && (
        <Text style={styles.edited}>(edited)</Text>
      )}

        
        {isOwnMessage && 
         !message.attachments?.length && 
         message.sentAt && 
         (Date.now() - message.sentAt) >= 300000 && 
         message.updatedAt && message.updatedAt === message.sentAt && (
          <Text style={styles.editExpired}>Edit time expired</Text>
        )}

        
        {message.reactions && message.reactions.length > 0 && (
          <TouchableOpacity
            style={styles.reactionsContainer}
            onPress={handleReactionTap}
          >
            {(() => {
              
              const reactionGroups = message.reactions.reduce((groups, reaction) => {
                const emoji = reaction.value;
                if (!groups[emoji]) {
                  groups[emoji] = [];
                }
                groups[emoji].push(reaction);
                return groups;
              }, {} as Record<string, typeof message.reactions>);

              return Object.entries(reactionGroups).map(([emoji, reactions]) => (
                <View key={emoji} style={styles.reaction}>
                  <Text style={styles.reactionText}>{emoji}</Text>
                  {reactions.length > 1 && (
                    <Text style={styles.reactionCount}>{reactions.length}</Text>
                  )}
                </View>
              ));
            })()}
          </TouchableOpacity>
        )}

        
      </TouchableOpacity>

      
      <Modal
        visible={showReactionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactionModal(false)}
        >
          <View style={styles.reactionModal}>
            <Text style={styles.reactionModalTitle}>Add Reaction</Text>
            <FlatList
              data={REACTION_EMOJIS}
              renderItem={renderReactionItem}
              keyExtractor={item => item}
              numColumns={4}
              style={styles.reactionGrid}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImageModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          
          <View style={styles.imageModalContainer}>
            {message.attachments && message.attachments.length > 0 && (
              <Image
                source={{ uri: message.attachments[0].url }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      
      <Modal
        visible={showParticipantModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowParticipantModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowParticipantModal(false)}
        >
          <View style={styles.participantModal}>
            <ScrollView style={styles.participantContent}>
              <View style={styles.participantHeader}>
                <Image
                  source={{ uri: sender?.avatarUrl ?? 'https://i.pravatar.cc/150' }}
                  style={styles.participantAvatar}
                />
                <Text style={styles.participantName}>
                  {isOwnMessage ? 'You' : (sender?.name || 'Unknown')}
                </Text>
                {isOwnMessage && (
                  <Text style={styles.currentUserIndicator}>Current User</Text>
                )}
              </View>
              
              {sender?.bio && (
                <View style={styles.participantSection}>
                  <Text style={styles.sectionTitle}>Bio</Text>
                  <Text style={styles.sectionText}>{sender.bio}</Text>
                </View>
              )}
              
              {sender?.email && (
                <View style={styles.participantSection}>
                  <Text style={styles.sectionTitle}>Email</Text>
                  <Text style={styles.sectionText}>{sender.email}</Text>
                </View>
              )}
              
              {sender?.jobTitle && (
                <View style={styles.participantSection}>
                  <Text style={styles.sectionTitle}>Job Title</Text>
                  <Text style={styles.sectionText}>{sender.jobTitle}</Text>
                </View>
              )}
              
              <View style={styles.participantSection}>
                <Text style={styles.sectionTitle}>Member Since</Text>
                <Text style={styles.sectionText}>
                  {sender?.createdAt ? format(sender.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

            
      <Modal
        visible={showReactionDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReactionDetails(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.bottomSheetOutsideOverlay}
            activeOpacity={1}
            onPress={() => setShowReactionDetails(false)}
          />
          <View style={styles.bottomSheetContainer}>
            
            <View style={styles.bottomSheetHandle}>
              <View style={styles.bottomSheetHandleBar} />
            </View>
            
            
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Reactions</Text>
              <TouchableOpacity
                style={styles.bottomSheetCloseButton}
                onPress={() => setShowReactionDetails(false)}
              >
                <Text style={styles.bottomSheetCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            
            <View style={styles.bottomSheetContent}>
              <ScrollView
                style={styles.bottomSheetScrollView}
                showsVerticalScrollIndicator={true}
                bounces={true}
                contentContainerStyle={styles.bottomSheetScrollContent}
                scrollEventThrottle={16}
              >
                {reactionDetails.map((item) => (
                  <View key={item.uuid} style={styles.bottomSheetItem}>
                    <Text style={styles.bottomSheetEmoji}>{item.value}</Text>
                    <Text style={styles.bottomSheetName}>
                      {item.participant?.name || 'Unknown'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      
      <Modal
        visible={showContextMenu}
        transparent
        animationType="fade"
        onRequestClose={handleContextMenuClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleContextMenuClose}
        >
          <View style={styles.contextMenu}>
            
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => handleContextMenuAction('reply')}
            >
              <Text style={styles.contextMenuText}>Reply</Text>
            </TouchableOpacity>

            
            {canEditMessage && (
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => handleContextMenuAction('edit')}
              >
                <Text style={styles.contextMenuText}>Edit</Text>
              </TouchableOpacity>
            )}

            
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => handleContextMenuAction('reactions')}
            >
              <Text style={styles.contextMenuText}>Reactions</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


    </>
  );
});
