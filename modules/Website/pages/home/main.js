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

function previewMessageParser(text) {
  return text.replace('[ME]', 'You').replace('[stickerMessage]', '🌠 Sticker').replace('[audioMessage]', '🎧 Audio').replace('[imageMessage]', '📷 Image').replace('[videoMessage]', '🎥 Video').replace('[documentMessage]', '🗃️ File').replace('[locationMessage]', '🗺️ Location')
}

const chatList = document.getElementById('chatList')
sock.on('chatPreview', async (list) => {
  console.log(list)
  const isFirst = chatList.innerHTML.toString().includes('center')
  const firstElmStr = (!isFirst) ? chatList.querySelector('div').innerHTML.toString() : ''
  const temp = `${chatList.innerHTML}`
  chatList.innerHTML = ''
  for (const chat of list) {
    const time = new Date(chat.timestamp * 1000)
    const timeHours = time.getHours()
    const timeAmPm = (timeHours >= 12) ? 'PM' : 'AM'
    const time12 = (timeHours) ? timeHours % 12 : 12

    const thisElement = document.createElement('div')
    thisElement.onclick = () => {console.log(chat.remote)}
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
          <p>${time12}:${(time.getMinutes().toString().padStart(2, '0'))} ${timeAmPm}</p>
        </div>
    `
    if (isFirst) await new Promise((resolve) => setTimeout(() => resolve(), 50))
    chatList.appendChild(thisElement)
    // await new Promise((resolve) => setTimeout(() => resolve(), 500))
  }
})
