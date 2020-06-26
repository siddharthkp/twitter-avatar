const express = require("express");
const cheerio = require("cheerio");
const request = require("request");
const cors = require("cors");

const app = express();
app.use(cors());
const port = 3000;

const cache = {};

const get = (username, size) => {
  const url = "https://mobile.twitter.com/" + username;
  return new Promise((resolve) => {
    if (cache[username]) resolve(cache[username]);
    else
      request(url, (_, __, body) => {
        const $ = cheerio.load(body);
        const url = ($(".avatar img").attr("src") || "").replace(
          "_normal",
          size
        );
        cache[username] = url;
        resolve(url);
      });
  });
};

const sizes = {
  small: "_200x200",
  big: "_400x400",
  full: "",
  mini: "_mini",
};

app.get("/:user/:size?", async (req, res, next) => {
  const result = await get(req.params.user, sizes[req.params.size || "small"]);
  if (!result) return next(404);
  res.status(301).redirect(result);
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

module.exports = app;
