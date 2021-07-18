const APP_PORT = process.argv[2] || 3030;

const express = require("express");

const app = new express();

app.set("port", APP_PORT);

app.get("/healthcheck", (_, res) => {
  res.sendStatus(200);
});

app.listen(app.get("port"), () => {
  console.log(`Date service listening on port ${app.get("port")}`);
});
