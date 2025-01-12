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

import type { FullJid, GroupMetadata, WAMessage } from "@whiskeysockets/baileys";
import chat from "./chat";
import main from "./main";

export declare interface chatPreviewT {
  remote: string | FullJid,
  displayName: string | undefined,
  profile: string | undefined,
  lastChat: string,
  timestamp: number | Long.Long | null
}

export declare type chatHistoryT = Record<string, chatHistoryPropertyT> | undefined

export declare interface chatHistoryPropertyT {
  displayName?: string,
  group?: GroupMetadata,
  profile?: string,
  chats: WAMessage[]
}

export declare interface databaseFormat {
  chatHistory: chatHistoryT
}

export default {
  main,
  chat
}

