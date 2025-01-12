const run = () => {
  fetch('https://87205458-21d4-4401-8820-415fb4cab7cf-00-25tl6f9pczyo6.worf.replit.dev', { method: "GET" })
  .then((res) => {
    const date = new Date();
    return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] ${res.status} ${res.statusText}`
  }).then((res) => console.log(res)).catch((err) => console.log(err))
  setTimeout(() => {
    run()
  }, 15000);
}
run()