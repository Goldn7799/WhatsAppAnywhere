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

const loginBtn = document.getElementById('loginBtn')
loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  sock.emit('loginToken', { username, password })
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