const root = process.cwd()
const dbPath = `${root}/DataStore`

export default {
  user: {
    username: 'Admin',
    password: 'Admin',
    tokenLength: 26
  },
  express: {
    port: 8090,
    allowedIP: "*",
    uploadLimit: "100mb",
    pagesRoot: `${root}/modules/Website/pages`
  },
  path: {
    root,
    dbPath,
    chatHistory: `${dbPath}/chatHistory.json`,
    profilePic: `${dbPath}/profilePic.json`
  }
}