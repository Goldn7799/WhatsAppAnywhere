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

import express from 'express'
import CONFIG from '../../CONFIG'
import { Server, Socket } from 'socket.io'
import http from 'http'
import Databases from '../Databases'
import auth from './auth'
import WhatsApp from '../WhatsApp'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.get('/', (_, res) => {
  res.sendFile(`${CONFIG.express.pagesRoot}/index.html`)
})

app.get('/:path', (req, res) => {
  const { path } = req.params
  if (path.includes('.')) {
    res.sendFile(`${CONFIG.express.pagesRoot}/${path}`)
  } else {
    res.sendFile(`${CONFIG.express.pagesRoot}/${path}/index.html`)
  }
})

app.get('/:path/:file', (req, res) => {
  const { path, file } = req.params
  res.sendFile(`${CONFIG.express.pagesRoot}/${path}/${file}`)
})

io.on('connection', (sock) => {
  console.log(`User Connected`)

  const cache = {
    chat: '',
    userChat: 0
  }
  let thisToken: string | undefined = undefined
  let isConnected = true
  let opennedUserChat: string | undefined = undefined

  sock.on('disconnect', (reason) => {
    console.log(`User Disconnected [${reason.toUpperCase()}]`)
    isConnected = false
  })

  sock.on('sendToken', (token) => {
    thisToken = token
    if (auth.checkAccess(thisToken)) sendAllUpdate(sock)
  })
  sock.on('loginToken', ({ username, password }) => {
    const token = auth.login(username, password)
    if (token) {
      sock.emit('loginToken', token)
    } else sock.emit('loginToken', undefined)
  })

  const sendPartialUpdate = async () => {
    if (!auth.checkAccess(thisToken)) return
    const thisChatPreview = await Databases.chat.getPreview()
    if (JSON.stringify(thisChatPreview) !== cache.chat) {
      cache.chat = JSON.stringify(thisChatPreview)
      sock.emit('chatPreview', thisChatPreview)
    };

    if (opennedUserChat) {
      const thisUserChat = Databases.chat.getUserChat(opennedUserChat)
      if (JSON.stringify(thisUserChat)?.length > cache.userChat) {
        cache.userChat = JSON.stringify(thisUserChat)?.length
        sock.emit('userChat', thisUserChat)
      };
    };
    setTimeout(() => {
      if (isConnected) return sendPartialUpdate();
    }, 1200);
  }

  const sendAllUpdate = () => {
    console.log('User Login')
    sendPartialUpdate()
  }

  sock.on('userChat', (jid) => {
    if (!auth.checkAccess(thisToken)) return;
    opennedUserChat = jid
    sock.emit('userChat', Databases.chat.getUserChat(jid))
  })
  sock.on('closeUserChat', () => {
    opennedUserChat = undefined
  })

  sock.on('checkToken', (token) => {
    sock.emit('checkToken', auth.checkAccess(token))
  })

  sock.on('profilePic', async (jid) => {
    try {
      sock.emit('profilePic', await WhatsApp.connection.getWaSock()?.profilePictureUrl(jid, 'image'))
    } catch {
      sock.emit('profilePic', undefined)
    }
  })
})

server.listen(CONFIG.express.port, () => {
  console.log(`Openned connection at port ${CONFIG.express.port}`)
})