const express = require("express");
const cheerio = require("cheerio");
const request = require("request");
const cors = require("cors");
const Zombie = require("zombie");
var nock = require("nock")

// Twitter takes surprisingly long to load
Zombie.waitDuration = '15s'
Zombie.userAgent = "Mozilla/5.0 (X11; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0";
Zombie.silent = true;

// Don't load the following urls in Zombie
nock('https://www.google-analytics.com')
  .get(/.*/)
  .times(Math.Infinity)
  .reply(200, '{}')

nock('https://app.link')
  .get(/.*/)
  .times(Math.Infinity)
  .reply(200, '{}')

nock('https://api2.branch.io')
  .get(/.*/)
  .times(Math.Infinity)
  .reply(200, '{}')

const app = express();
app.use(cors());
const port = 3000;

const cache = {};

const get = (username, size) => {
  return new Promise((resolve) => {
    if (cache[username + size]) resolve(cache[username + size]);
    else {
      const browser = new Zombie();
      browser
        .visit(`https://twitter.com/${username}/photo`)
        .then(() => {
          const $ = cheerio.load(browser.html());
          const url = ($("img[src^='https://pbs.twimg.com/profile_images/'][src$='_400x400.jpg']").attr("src") || "").replace(
            "_400x400",
            size
          );
          cache[username + size] = url;
          resolve(url);
        })
        .catch((err) => {
          console.error("Failed to fetch profile", err);
          resolve("");
        });
    }
  });
};

app.get("/:user", async (req, res, next) => {
  const result = await get(req.params.user, "_200x200");
  if (!result) return res.status(404).send('Not Found');
  request(result).pipe(res);
});

app.get("/:user/big", async (req, res, next) => {
  const result = await get(req.params.user, "_400x400");
  if (!result) return res.status(404).send('Not Found');
  request(result).pipe(res);
});

app.get("/:user/full", async (req, res, next) => {
  const result = await get(req.params.user, "");
  if (!result) return res.status(404).send('Not Found');
  request(result).pipe(res);
});

app.get("/:user/mini", async (req, res, next) => {
  const result = await get(req.params.user, "_mini");
  if (!result) return res.status(404).send('Not Found');
  request(result).pipe(res);
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

module.exports = app;
