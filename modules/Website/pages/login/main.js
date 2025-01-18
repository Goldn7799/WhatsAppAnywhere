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
        window.location.replace('./home')
      };
    })
  };
}

const username = document.getElementById('username')
const password = document.getElementById('password')
const loginBtn = document.getElementById('loginBtn')

setInterval(() => {
  loginBtn.disabled = !(username.value.trim() && password.value.trim())
}, 100);

loginBtn.addEventListener('click', () => {
  sock.emit('loginToken', { username: username.value, password: password.value })
  sock.on('loginToken', (token) => {
    if (token) {
      localStorage.setItem('token', token)
      window.location.replace('./home')
    } else {
      document.getElementById('error').classList.add('active')
      document.getElementById('error').classList.add('animate')
      setTimeout(() => {
        document.getElementById('error').classList.remove('animate')
      }, 300);
    }
  })
})