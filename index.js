const express = require('express')
const cheerio = require('cheerio')
const request = require('request')
const cors = require('cors')

const app = express()
app.use(cors())

const cache = {}

const get = username => {
  const url = 'https://mobile.twitter.com/' + username
  return new Promise((resolve, reject) => {
    if (cache[username]) resolve(cache[username])
    else
      request(url, (error, res, body) => {
        const $ = cheerio.load(body)
        const url = ($('.avatar img').attr('src') || '').replace(
          '_normal',
          '_200x200'
        )
        cache[username] = url
        resolve(url)
      })
  })
}

app.get('/:user', async (req, res, next) => {
  const result = await get(req.params.user)
  if (!result) return next(404)
  request(result).pipe(res)
})

module.exports = app
