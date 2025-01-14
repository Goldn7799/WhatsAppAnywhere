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

import '../socket.io/socket.io.js'

const sock = io()
const tempData = {
  user: {}
}

window.onload = () => {
  const token = localStorage.getItem('token')
  if (token) {
    sock.emit('checkToken', token)
    sock.on('checkToken', (res) => {
      if (res) {
        sock.emit('sendToken', token)
      } else {
        window.location.replace('./login')
      }
    })
  } else {
    window.location.replace('./login')
  }
}

const getContentType = (content) => {
  if (content)
    return Object.keys(content).find((k) => (k === "conversation" || k.includes("Message")) && k !== "senderKeyDistributionMessage");
}

function previewMessageParser(text) {
  return text.replace('[ME]', 'You').replace('[stickerMessage]', '🌠 Sticker').replace('[audioMessage]', '🎧 Audio').replace('[imageMessage]', '📷 Image').replace('[videoMessage]', '🎥 Video').replace('[documentMessage]', '🗃️ File').replace('[locationMessage]', '🗺️ Location')
}

function messageParser(text) {
  return text.replaceAll(/\*(.*)\*/g, '<b>$1</b>')
}

const jidToWaNumber = (jid, formats) => {
  if (!jid) return undefined
  const blockOfNumber = jid.replace('@s.whatsapp.net', '').split('')
  const format = formats || [2, 3, 4]
  const cout = [0, 0]
  let waNumber = '+'
  for (const blockNumber of blockOfNumber) {
    if (cout[0] >= format[cout[1]]) {
      if (cout[1] > 0) {
        waNumber += '-'
      } else {
        waNumber += ' '
      }
      cout[0] = 0
      cout[1]++
    };
    cout[0]++
    waNumber += blockNumber
  }
  return waNumber
}

function timeParser(timestamp) {
  const time = new Date(Number(timestamp) * 1000)
  const timeHours = time.getHours()
  const timeAmPm = (timeHours >= 12) ? 'PM' : 'AM'
  const time12 = (timeHours) ? timeHours % 12 : 12
  return `${time12}:${(time.getMinutes().toString().padStart(2, '0'))} ${timeAmPm}`
}

async function openChat(jid) {
  document.getElementById('chatUser').classList.remove('d-none')
  document.getElementById('chatUser').classList.add('show')
  setTimeout(() => {
    document.getElementById('homePG').classList.add('d-none')
    document.getElementById('chatUser').classList.remove('show')
  }, 200);

  const thisTempUser = tempData.user[jid]
  const chatUser = document.getElementById('chatUser')
  chatUser.querySelector('img').src = thisTempUser.profile || './userpict.png'
  chatUser.querySelector('.username').innerHTML = thisTempUser.displayName

  sock.emit('userChat', jid)
  sock.on('userChat', (userc) => {
    const chats = document.getElementById('chats')
    chats.innerHTML = ''
    let lastChat = undefined
    for (const chat of userc) {
      const thisElement = document.createElement('div')
      thisElement.classList.add('thisChat')
      const chatType = getContentType(chat.message || undefined)
      const mediaCaption =  chat.message?.imageMessage?.caption || chat.message?.videoMessage?.caption || undefined
      const thisParticipant = chat.key?.participant || chat.participant || `${chat.key.fromMe}`
      if (chat.key.fromMe) thisElement.classList.add('fromMe');
      if (lastChat !== thisParticipant) {
        if (chat.key.fromMe) {
          thisElement.classList.add('right')
        } else {
          thisElement.classList.add('left')
        }
      };
      thisElement.innerHTML = `
        <div class="message">
          ${(chat.key.remoteJid.endsWith('@g.us') && !chat.key.fromMe) ? `<p class="name${(chat.pushName) ? ' hasName' : ''}">${(chat.pushName) ? `<span>${chat.pushName}</span>` : ''}<span>${jidToWaNumber(thisParticipant)}</span></p>` : ''}
          <p class="thisMsg">${messageParser((chat.message?.conversation) ? chat.message.conversation : (chat.message?.extendedTextMessage?.text) ? chat.message?.extendedTextMessage?.text : `[${chatType}] ${mediaCaption || ''}`)}</p>
          <p class="time">${timeParser(chat.messageTimestamp)}</p>
          </div>
      `
      lastChat = thisParticipant
      chats.appendChild(thisElement)
    }
    chats.scrollTop = chats.scrollHeight
  })
}

async function closeChat() {
  document.getElementById('chatList').querySelectorAll('.animate').forEach((a) => { a.classList.remove('animate') })
  document.getElementById('homePG').classList.remove('d-none')
  document.getElementById('chatUser').classList.add('hidden')
  setTimeout(() => {
    document.getElementById('chatUser').classList.remove('hidden')
    document.getElementById('chatUser').classList.add('d-none')
  }, 200);
}

document.querySelector('.backBtn').addEventListener('click', () => closeChat())

const chatList = document.getElementById('chatList')
sock.on('chatPreview', async (list) => {
  console.log(list)
  const isFirst = chatList.innerHTML.toString().includes('center')
  const firstElmStr = (!isFirst) ? chatList.querySelector('div').innerHTML.toString() : ''
  const temp = `${chatList.innerHTML}`
  chatList.innerHTML = ''
  for (const chat of list) {
    tempData.user[chat.remote] = chat

    const thisElement = document.createElement('div')
    thisElement.onclick = () => { openChat(chat.remote) }
    thisElement.classList.add('chat')
    if (isFirst || (!temp.includes(chat.displayName))) thisElement.classList.add('animate');
    if (!isFirst && list[0].remote === chat.remote && !firstElmStr.includes(chat.displayName)) thisElement.classList.add('animateUpdate');
    if (!isFirst && list[0].remote === chat.remote && firstElmStr.includes(chat.displayName)) thisElement.classList.add('animateMsgUpdate');
    thisElement.innerHTML = `
        <img src="${chat.profile || './userpic.png'}" alt="${chat.displayName} Profile" />
        <div class="info">
          <h4>${chat.displayName}</h4>
          <p>${previewMessageParser(chat.lastChat)}</p>
        </div>
        <div class="time">
          <p>${timeParser(chat.timestamp)}</p>
        </div>
    `
    if (isFirst) await new Promise((resolve) => setTimeout(() => resolve(), 50))
    chatList.appendChild(thisElement)
    // await new Promise((resolve) => setTimeout(() => resolve(), 500))
  }
})
