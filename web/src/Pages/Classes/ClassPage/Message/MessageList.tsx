import React from 'react'
import { convertToLocalTimezone } from '@/lib/utils'

interface Message {
  senderId: string
  senderName: string
  senderAvatar: string
  messageContent: string
  sendDate: string
  isRead: boolean
}

interface MessageListProps {
  messages: Message[]
  onMessageClick: (message: Message) => void
}

const MessageList = ({ messages, onMessageClick }: MessageListProps) => {
  return (
    <div className="flex flex-col divide-y">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
            !message.isRead ? 'bg-blue-50' : ''
          }`}
          onClick={() => onMessageClick(message)}
        >
          <div className="relative">
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-10 h-10 rounded-full"
            />
            {!message.isRead && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm truncate">{message.senderName}</h4>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {convertToLocalTimezone(message.sendDate)}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{message.messageContent}</p>
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="p-4 text-center text-gray-500">No new messages</div>
      )}
    </div>
  )
}

export default MessageList 