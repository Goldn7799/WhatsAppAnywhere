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

import fs from 'fs'
import CONFIG from '../../CONFIG'
import type { chatHistoryT, databaseFormat } from '.'

const DBPATH = CONFIG.path.dbPath
let thisData: databaseFormat = {
  chatHistory: {}
}

fs.mkdir(DBPATH, () => {
  fs.readFile(CONFIG.path.chatHistory, 'utf-8',(err, res) => {
    if (err) {
      fs.writeFileSync(CONFIG.path.chatHistory, JSON.stringify(thisData.chatHistory))
    } else {
      thisData.chatHistory = JSON.parse(res)
    }
    SYNC()
  })
})

const SYNC = (): void => {
  fs.writeFileSync(CONFIG.path.chatHistory, JSON.stringify(thisData.chatHistory))

  setTimeout(() => {
    SYNC()
  }, 500);
}

const update = (data: databaseFormat): void => {
  thisData = data
}

const get = (): databaseFormat => {
  return thisData
}

const getChatHistory = (): chatHistoryT => {
  return thisData.chatHistory
}

const updateChatHistory = (data: chatHistoryT): void => {
  thisData.chatHistory = data
}

export default {
  get,
  update,
  getChatHistory,
  updateChatHistory
}