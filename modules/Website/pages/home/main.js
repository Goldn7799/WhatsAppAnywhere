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

const chats = document.getElementById('chats')
let isFirst = true
let lastChat = undefined
async function openChat(jid) {
  document.getElementById('chatUser').classList.remove('d-none')
  document.getElementById('chatUser').classList.add('show')
  document.getElementById('chats').innerHTML = ''
  await new Promise ((resolve) => {
    setTimeout(() => {
      document.getElementById('homePG').classList.add('d-none')
      document.getElementById('chatUser').classList.remove('show')
      resolve()
    }, 200);
  })

  isFirst = true
  lastChat = undefined
  const thisTempUser = tempData.user[jid]
  const chatUser = document.getElementById('chatUser')
  chatUser.querySelector('img').src = thisTempUser.profile || './userpic.png'
  chatUser.querySelector('.username').innerHTML = thisTempUser.displayName

  setTimeout(() => {
    sock.emit('userChat', jid)
  }, 200);
}

  function toChat(chat) {
    const thisElement = document.createElement('div')
    thisElement.classList.add('thisChat')
    const chatType = getContentType(chat.message || undefined)
    const mediaCaption =  chat.message?.imageMessage?.caption || chat.message?.videoMessage?.caption || undefined
    const thisParticipant = chat.key?.participant || chat.participant || `${chat.key.fromMe}`
    if (chat.key.fromMe) thisElement.classList.add('fromMe');
    if (isFirst) thisElement.classList.add('render');
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
    return thisElement
  }

sock.on('userChat', async (userc) => {
  if (document.querySelector('.sendChat').querySelector('.btn').classList.contains('animateSend')) {
    document.querySelector('.sendChat').querySelector('.btn').classList.remove('animateSend')
    setTimeout(() => {
      document.querySelector('.sendChat').querySelector('.btn').classList.add('animateSendB')
      setTimeout(() => {
        document.querySelector('.sendChat').querySelector('.btn').classList.remove('animateSendB')
      }, 500);
    }, 5);
  };
  if (isFirst) {
    // chats.style.opacity = 0
    for (const chat of userc) {
      chats.appendChild(toChat(chat))
    }
  } else {
    for (const chat of userc) {
      const msg = toChat(chat)
      msg.classList.add('new')
      chats.appendChild(msg)
      chats.scrollTop = chats.scrollHeight
    }
  }
  console.log(userc)
  if (isFirst) {
    // chats.style.opacity = 1
    chats.scrollTop = chats.scrollHeight
  }
  isFirst = false
})

function sendChat(message) {
  sock.emit('sendChat', message)
  document.getElementById('sendChatInput').value = ''
  document.querySelector('.sendChat').querySelector('.btn').classList.add('animateSend')
}

document.getElementById('sendChatInput').addEventListener('keydown', (evn) => {
  const value = document.getElementById('sendChatInput').value
  if (value.trim().length > 0 && evn.key === 'Enter') {
    sendChat(value)
  };
})
document.querySelector('.sendChat').querySelector('.btn').addEventListener('click', () => {
  const value = document.getElementById('sendChatInput').value
  if (value.trim().length > 0) {
    sendChat(value)
  };
})
setInterval(() => {
  const value = document.getElementById('sendChatInput').value
  if (value.trim().length > 0) {
    document.querySelector('.sendChat').querySelector('.btn').classList.remove('deactive')
  } else {
    document.querySelector('.sendChat').querySelector('.btn').classList.add('deactive')
  }
}, 100);

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
