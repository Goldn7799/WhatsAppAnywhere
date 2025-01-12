import express from 'express'
import CONFIG from '../../CONFIG'
import { Server } from 'socket.io'
import http from 'http'
import Databases from '../Databases'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.get(`/`, (_, res) => {
  res.sendFile(`${CONFIG.path.root}/modules/Website/pages/home.html`)
})
app.get('/node_modules/socket.io.js', (_, res) => {
  res.sendFile(`${CONFIG.path.root}/node_modules/socket.io/client-dist/socket.io.js`)
})

io.on('connection', (sock) => {
  console.log(`User Connected`)
  sendAllUpdate()
  sock.on('disconnect', (reason) => {
    console.log(`User Disconnected (${reason})`)
  })
})

const sendAllUpdate = () => {
  const thisChat = Databases.chat.get()
  io.emit('chatHistory', thisChat)
}

const count = {
  chat: 0
}
const sendPartialUpdate = () => {
  const thisChat = Databases.chat.get()
  if (JSON.stringify(thisChat)?.length > count.chat) {
    count.chat = JSON.stringify(thisChat).length
    io.emit('chatHistory', thisChat)
  };
}


setInterval(() => {
  sendPartialUpdate()
}, 1200)

server.listen(CONFIG.express.port, () => {
  console.log(`Openned connection at port ${CONFIG.express.port}`)
})