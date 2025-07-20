import React, { useRef, useCallback, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { FlatList, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useChatStore } from '../store';
import { MessageItem } from './MessageItem';
import { TMessage } from '../types';
import { styles } from './MessageList.styles';

export interface MessageListRef {
  scrollToBottom: () => void;
}

interface MessageListProps {
  inputBarRef?: React.RefObject<any>;
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>((props, ref) => {
  const messages = useChatStore(state => state.messages) || [];
  const fetchOlder = useChatStore(state => state.fetchOlder);
  const hasMoreMessages = useChatStore(state => state.hasMoreMessages);
  const flatListRef = useRef<FlatList>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [isScrollingToBottom, setIsScrollingToBottom] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [scrollThrottle, setScrollThrottle] = useState(false);
  const inputBarRef = props.inputBarRef || useRef<any>(null);

  // Exposing scroll functions to parent
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (items.length > 0) {
        
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    }
  }));

  // Creating items array with headers and date separators
  const items = useMemo(() => {
    const result: any[] = [];
    
    if (!messages || messages.length === 0) {
      return result;
    }
    
    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const showHeader = !prevMessage || prevMessage.authorUuid !== message.authorUuid;
      
      
      if (prevMessage) {
        const prevDate = new Date(prevMessage.sentAt).toDateString();
        const currentDate = new Date(message.sentAt).toDateString();
        if (prevDate !== currentDate) {
          result.push({
            type: 'date',
            date: currentDate,
            key: `date-${currentDate}-${message.uuid}`
          });
        }
      }
      
      
      result.push({
        type: 'message',
        message,
        showHeader,
        key: `message-${message.uuid}`
      });
    });
    
    return result;
  }, [messages]);



  
  useEffect(() => {
    if (messages.length > 0 && items.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, items.length]);

  
  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      );
    }
    
    return (
      <MessageItem
        message={item.message}
        showHeader={item.showHeader}
        onStartEdit={(message) => {
          
          inputBarRef.current?.startEditing(message);
        }}
      />
    );
  }, []);



  
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    
    setContentHeight(contentSize.height);
    setScrollViewHeight(layoutMeasurement.height);
    
    
    const scrollPosition = contentOffset.y;
    const maxScrollPosition = contentSize.height - layoutMeasurement.height;
    const distanceFromBottom = maxScrollPosition - scrollPosition;
    
    
    const isCloseToBottom = distanceFromBottom <= 200;
    
    setIsNearBottom(isCloseToBottom);
    
    
    const shouldShowButton = !isCloseToBottom && scrollPosition > 500 && !isScrollingToBottom;
    setShowScrollToBottom(shouldShowButton);
    
    
    const distanceFromTop = scrollPosition;
    const isNearTop = distanceFromTop <= 300; 
    
    
    if (isNearTop && !isLoadingOlder && !scrollThrottle && hasMoreMessages && messages.length > 0) {
      
      const isScrollingUp = scrollPosition < lastScrollTop;
      
      if (isScrollingUp || distanceFromTop <= 100) {
        setScrollThrottle(true);
        setIsLoadingOlder(true);
        
        fetchOlder().finally(() => {
          setIsLoadingOlder(false);
          
          setTimeout(() => {
            setScrollThrottle(false);
          }, 1000);
        });
      }
    }
    
    setLastScrollTop(scrollPosition);
  }, [isLoadingOlder, messages.length, fetchOlder, hasMoreMessages, isScrollingToBottom, scrollThrottle, lastScrollTop]);

  
  const scrollToBottom = useCallback(() => {
    if (items.length > 0 && !isScrollingToBottom) {
      setIsScrollingToBottom(true);
      
      flatListRef.current?.scrollToEnd({ animated: true });
      
      
      setTimeout(() => {
        setIsScrollingToBottom(false);
      }, 500);
    }
  }, [items.length, isScrollingToBottom]);

 
  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Start a conversation!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoadingOlder && (
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>Loading 25 older messages...</Text>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        style={styles.flatList}

        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={fetchOlder}
          />
        }
        
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
      
      {showScrollToBottom && (
        <TouchableOpacity
          style={[
            styles.scrollToBottomButton,
            isScrollingToBottom && styles.scrollToBottomButtonDisabled
          ]}
          onPress={scrollToBottom}
          activeOpacity={0.8}
          disabled={isScrollingToBottom}
        >
          <Text style={[
            styles.scrollToBottomText,
            isScrollingToBottom && styles.scrollToBottomTextDisabled
          ]}>↓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});
