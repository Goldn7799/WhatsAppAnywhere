const root = process.cwd()
const dbPath = `${root}/data-store`

export default {
  express: {
    port: 8090,
    allowedIP: "*",
    uploadLimit: "100mb",
    
  },
  path: {
    root,
    dbPath,
    chatHistory: `${dbPath}/chatHistory.json`
  }
}