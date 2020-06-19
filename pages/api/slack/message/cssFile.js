/*
Triggered when a new file shows up in the #scrapbook-css channel.
This jugaad sets the request's `text` field to the first attachment's public URL.
Will this work for text snippets in slack with a .txt extension?
If not, can we somehow fix that on the frontend?
Max and Matthew plz halp
*/

import {
  getPublicFileUrl,
  getUserRecord,
  makeSlackFilePublic,
  reply,
  react,
  updatesTable,
  accountsTable,
  displayStreaks,
  getReplyMessage,
  fetchProfile,
  formatText,
  incrementStreakCount,
  postEphemeral,
  t
} from '../../../../lib/api-utils'

import css from './css'

export default async (req, res) => {
  const { files = [], channel, ts, user, text } = req.body.event

  let attachments = []
  
  console.log(`Receiving file from ${user}`)

  // Straight outta created.js
  await Promise.all([
    react('add', channel, ts, 'beachball'),
    ...files.map(async (file, i) => {
      console.log(`FILE ${i}:`, file) 
      const publicFile = await makeSlackFilePublic(file.id)
      if (!publicFile) {
        await Promise.all([
          react('remove', channel, ts, 'beachball'),
          reply(channel, ts, t('messages.errors.filetype')),
          react('add', channel, ts, 'x')
        ])
      }
      console.log('PUBLIC FILE: ', publicFile)
      attachments.push(publicFile)
    })
  ])

  await react('remove', channel, ts, 'beachball')

  let userRecord = await getUserRecord(user)
  console.log(attachments)
  console.log(userRecord)

  // I am assuming that this method will only ever be called when attachments has at least one file.
  const url = attachments[0].permalink_public
  console.log(`Setting CSS event body text to: ${url}`)
  req.body.event.text = url

  return await css(req, res)
}