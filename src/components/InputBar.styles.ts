import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mentionListContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mentionList: {
    maxHeight: 150,
  },
  mentionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mentionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  mentionJobTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyPreviewContent: {
    flex: 1,
    marginRight: 10,
  },
  replyPreviewLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  replyPreviewText: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  replyCancelButton: {
    padding: 5,
  },
  replyCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  editPreview: {
    backgroundColor: '#fff3cd',
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editPreviewContent: {
    flex: 1,
    marginRight: 10,
  },
  editPreviewLabel: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 2,
  },
  editPreviewText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  editCancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#856404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCancelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 