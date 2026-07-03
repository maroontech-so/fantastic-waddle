export interface User {
  uid?: string;
  id?: string;
  name: string;
  email: string;
  username?: string;
  regNumber?: string;
  coverUrl?: string;
  bio: string;
  skills: string[];
  avatarUrl?: string;
  xp?: number;
  level?: number;
  streak?: number;
  lastCheckIn?: string;
  contributions?: number;
  learningCount?: number;
  engagementCount?: number;
}

export type NoticeCategory = 'blue' | 'emerald' | 'purple';

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  category: NoticeCategory;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  details: string;
  teamRegistered: boolean;
}

export interface LibraryFolder {
  id: string;
  name: string;
  itemsCount: number;
}

export type FileType = 'pdf' | 'link' | 'zip' | 'code';

export interface LibraryFile {
  id: string;
  name: string;
  size: string;
  type: FileType;
  uploader: string;
  time: string;
  category: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: string;
  time: string;
  text: string;
  self: boolean;
  status?: 'sent' | 'delivered' | 'read'; // WhatsApp ticks
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  unreadCount?: number;
  isDM?: boolean;
  avatarUrl?: string;
  online?: boolean;
  statusText?: string;
  regNumber?: string;
}
