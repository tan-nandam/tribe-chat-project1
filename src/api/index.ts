import axios from 'axios';
import { TMessage, TParticipant } from '../types';

const BASE = "https://dummy-chat-server.tribechat.com/api"

export const getInfo = () => axios.get<{ sessionUuid: string; apiVersion: number}>(`${BASE}/info`) //to fetch session info


export const getAllMessages = () => 
    axios.get<TMessage[]>(`${BASE}/messages/all`); // to get entire msg history

export const getLatestMessages = () =>
    axios.get<TMessage[]>(`${BASE}/messages/latest`); // get latest 25 msgs (for refresh)

export const getOlderMessages = (refMessageUuid: string) => 
    axios.get<TMessage[]>(`${BASE}/messages/older/${refMessageUuid}`); // get 25 msgs sent before given msg uuid. for lazy loading older msgs

export const getMessageUpdates = (since: number) =>
    axios.get<TMessage[]>(`${BASE}/messages/updates/${since}`);

   
export const postNewMessage = (text: string) => 
    axios.post<TMessage>(`${BASE}/messages/new`, { text });   //Post a new text msg. Returns the saved msg object

export const getAllParticipants = () =>
    axios.get<TParticipant[]>(`${BASE}/participants/all`);

export const getParticipantUpdates = (since: number) =>
    axios.get<TParticipant[]>(`${BASE}/participants/updates/${since}`);

