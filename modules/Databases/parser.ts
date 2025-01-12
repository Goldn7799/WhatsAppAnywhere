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

const jidToWaNumber = (jid: string | undefined, formats?: number[] | undefined): string | undefined => {
  if (!jid) return undefined
  const blockOfNumber = jid.replace('@s.whatsapp.net', '').split('')
  const format = formats || [2, 3, 4]
  const cout = [0, 0]
  let waNumber = '+'
  for (const blockNumber of blockOfNumber) {
    if (cout[0] >= format[cout[1]]) {
      if (cout[1] > 0) {
        waNumber += '-'
      } else {
        waNumber += ' '
      }
      cout[0] = 0
      cout[1]++
    };
    cout[0]++
    waNumber += blockNumber
  }
  return waNumber
}

export default {
  jidToWaNumber
}