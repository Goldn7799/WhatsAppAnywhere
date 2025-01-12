import fs from 'fs'
import CONFIG from '../../CONFIG'
import type { chatHistoryT } from './chat'

export declare interface databaseFormat {
  chatHistory: chatHistoryT
}

const DBPATH = CONFIG.path.dbPath
let thisData: databaseFormat = {
  chatHistory: {}
}

fs.mkdir(DBPATH, () => {
  fs.readFile(CONFIG.path.chatHistory, 'utf-8',(err, res) => {
    if (err) {
      fs.writeFileSync(CONFIG.path.chatHistory, JSON.stringify({}))
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