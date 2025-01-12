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

import CONFIG from "../../CONFIG"

function MakeID (length: number): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
charactersLength))
  }
  return result
}

let currentToken = MakeID(CONFIG.user.tokenLength)
console.log(`Token : ${currentToken}`)

const reRollToken = (): string => {
  currentToken = MakeID(CONFIG.user.tokenLength)
  console.log(`Token : ${currentToken}`)
  return currentToken
}

const login = (username: string | undefined, password: string | undefined): string | undefined => {
  if (username === CONFIG.user.username && password === CONFIG.user.password) return reRollToken()
  return undefined
}

const checkAccess = (token: string | undefined): boolean => {
  return (currentToken === token)
}

export default {
  login,
  checkAccess
}