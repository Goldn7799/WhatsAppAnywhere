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

import makeWASocket, { Browsers, DisconnectReason, getContentType, useMultiFileAuthState, type WASocket } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import Databases from "../Databases";
// import fs from 'fs'

let waSock: WASocket | undefined = undefined

/**
 * Try To Connect to WhatsApp services using Baileys.
 * @public
 */
const tryConnect = async () => {
  /**
   * Basic Initial for Baileys.
   */
  const { state, saveCreds } = (await useMultiFileAuthState('./DataStore/WhatsAppState'))
  const sock: WASocket = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('GeminiOnWA'),
    printQRInTerminal: true
  })

  /**
   * Save WhatsApp Connection State.
   */
  sock.ev.on('creds.update', saveCreds)

  /**
   * Check if Whatsapp Connected, Disconnected and Connecting.
   * Auto Reconnect Feature.
   */
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'connecting') {
      console.log('Conneting...')
    };
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(`Connection Closed Due To ${lastDisconnect?.error}, Reconneting ${shouldReconnect}`)

      if (shouldReconnect) {
        console.log('Reconneting in 2.5s...')
        setTimeout(() => {
          tryConnect()
        }, 2500);
      };
    } else if (connection === 'open') {
      console.log('Opened Connection')
      await sock.sendPresenceUpdate('available')
    };
  })

  /**
   * Reciving A Message from WhatsApp.
   */
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    const thisParticipant = (msg.participant) ? msg.participant : (msg.key.participant) ? msg.key.participant : (msg.key.remoteJid) ? msg.key.remoteJid : ''

    /**
     * Make Log for Development.
     */
    waSock = sock
    console.log(`${(msg.key.fromMe) ? '> [ME] ' : '\n> '}${(msg.key.remoteJid?.includes('@g.us') ? ` (${msg.key.remoteJid}) ` : ' ')}${thisParticipant} => ${(getContentType((msg.message) ? msg.message : undefined)) ? `[ -${getContentType((msg.message) ? msg.message : undefined)?.toUpperCase()}- ] ` : ''}${(msg.message?.conversation) ? msg.message?.conversation : (msg.message?.extendedTextMessage?.text) ? msg.message?.extendedTextMessage?.text : ''}`)
    Databases.chat.push(msg)
    // fs.writeFileSync(`${process.cwd()}/DataStore/temp.json`, JSON.stringify(msg))
  })
}

const getWaSock = (): WASocket | undefined => {
  return waSock
}

/**
 * Main Connection Function.
 * @public
 */
export default {
  tryConnect,
  getWaSock
}