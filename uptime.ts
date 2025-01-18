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