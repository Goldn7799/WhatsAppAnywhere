import { getContentType, type FullJid, type WAMessage } from "@whiskeysockets/baileys";
import main from "./main";

export declare type chatHistoryT = Record<string, WAMessage[]> | undefined
export declare type lastChatT = ''
export declare interface chatPrevewT {
  remote: string | FullJid,
  displayName: string | undefined,
  lastChat: string,
}

const get = (): chatHistoryT => {
  return main.getChatHistory()
}

const push = (message: WAMessage): void => {
  if (message.key.remoteJid!) {
    const currentData = main.getChatHistory() || {}
    if (!currentData[message.key.remoteJid!]) currentData[message.key.remoteJid!] = []
    currentData[message.key.remoteJid!].push(message)
  };
}

const getPreview = () => {
  const thisChat = get() || {}
  const finalData: chatPrevewT[] = []
  for (const user in thisChat) {
    const userChat = thisChat[user]
    const lastChat = userChat[userChat.length - 1]
    const chatType = getContentType(lastChat.message || undefined)
    const mediaCaption = (chatType === 'videoMessage' || chatType === 'imageMessage') ? lastChat.message?.imageMessage?.caption || lastChat.message?.videoMessage?.caption || undefined : undefined
    finalData.push({
      remote: user,
      displayName: lastChat.pushName || undefined,
      lastChat: (lastChat.message?.conversation) ? lastChat.message.conversation : `[${chatType}] ${mediaCaption || ''}`
    })
  }
}

export default {
  get,
  push,
  getPreview
}