/**
 * @license
 * Copyright 2025 SGStudio Under Syeif Sultoni Akbar
 * 
 * Licensed under GNU General Public License Version 3 (the "License")
 * For more information on this, see
 * 
 *  https://www.gnu.org/licenses/
 * 
 * To "modify" a work means to copy from or adapt all or part of the work
 * in a fashion requiring copyright permission, other than the making of an
 * exact copy.  The resulting work is called a "modified version" of the
 * earlier work or a work "based on" the earlier work.
 */

import { getChatId, getContentType, type WAMessage } from "@whiskeysockets/baileys";
import main from "./main";
import type { chatHistoryT, chatPreviewT } from ".";
import parser from "./parser";
import WhatsApp from "../WhatsApp";

const get = (): chatHistoryT => {
  return main.getChatHistory()
}

const push = async (message: WAMessage): Promise<void> => {
  const remote = getChatId(message.key)
  if (remote) {
    const currentData = (main.getChatHistory()) || {}
    if (!currentData[remote]) {
      currentData[remote] = { chats: [] }
      if (remote.endsWith('@g.us')) {
        currentData[remote].group = await (WhatsApp.connection.getWaSock())?.groupMetadata(remote)
      };
    };
    try {
      if (!currentData[remote].profile || `${message.messageStubType}` === 'GROUP_CHANGE_ICON' || (await fetch(`${currentData[remote].profile}`, { method: 'HEAD' }))?.ok) currentData[remote].profile = await (WhatsApp.connection.getWaSock())?.profilePictureUrl(remote, 'image')
    } catch (err) { console.log(`${err}`) };
    currentData[remote].displayName = (currentData[remote].group) ? currentData[remote].group.subject : (!message.key.fromMe) ? message.pushName || undefined : (!currentData[remote].displayName) ? parser.jidToWaNumber(remote) : currentData[remote].displayName
    currentData[remote].chats?.push(message)
  };
}

const getPreview = async (): Promise<chatPreviewT[]> => {
  const thisChat = get() || {}
  const finalData: chatPreviewT[] = []
  for (const user in thisChat) {
    if(!user.includes('status') && !user.includes('newsletter')) {
      const userChat = thisChat[user].chats.filter((chat) => getContentType(chat.message || undefined) !== 'protocolMessage' )
      const thisChatProperties = thisChat[user]
      const lastChat = userChat[userChat.length - 1]
      if (lastChat) {
        const chatType = getContentType(lastChat.message || undefined)
        const mediaCaption = (chatType === 'videoMessage' || chatType === 'imageMessage') ? lastChat.message?.imageMessage?.caption || lastChat.message?.videoMessage?.caption || undefined : undefined
        const remote = getChatId(lastChat.key) || user
        finalData.push({
          remote,
          displayName: thisChatProperties.displayName,
          profile: thisChatProperties.profile,
          lastChat: `${(lastChat.key.fromMe) ? '[ME]: ' : (thisChatProperties.group) ? parser.jidToWaNumber(lastChat.key.participant || lastChat.participant || '') + ': ' : ''}${(lastChat.message?.conversation) ? lastChat.message.conversation : (lastChat.message?.extendedTextMessage?.text) ? lastChat.message?.extendedTextMessage?.text : `[${chatType}] ${mediaCaption || ''}`}`,
          timestamp: (typeof(lastChat.messageTimestamp) === 'number') ? lastChat.messageTimestamp : Number(lastChat.messageTimestamp)
        })
      };
    };
  }
  finalData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
  return finalData
}

const getUserChat = (jid: string): WAMessage[] | undefined => {
  const thisChat = get()
  const thisUserChat = (thisChat) ? thisChat[jid] : undefined
  return thisUserChat?.chats
}

export default {
  get,
  push,
  getPreview,
  getUserChat
}