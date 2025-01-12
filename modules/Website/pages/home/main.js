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

const getPP = async (jid) => {
  return new Promise((resolve) => {
    sock.emit('profilePic', jid)
    sock.on('profilePic', (url) => {
      resolve(url)
    })
  })
}

const chatList = document.getElementById('chatList')
sock.on('chatPreview', async (list) => {
  console.log(list)
  let finalElement = ''
  for (const chat of list) {
    const time = new Date(chat.timestamp * 1000)
    finalElement += `
      <div class="chat">
        <img src="${chat.profile || './icon.png'}" alt="${chat.displayName} Profile" />
        <div class="info">
          <h4>${chat.displayName}</h4>
          <p>${chat.lastChat}</p>
        </div>
        <div class="time">
          <p>${time.getHours()}:${time.getMinutes()}</p>
        </div>
      </div>
    `
    // await new Promise((resolve) => setTimeout(() => resolve(), 500))
  }
  chatList.innerHTML = finalElement
})