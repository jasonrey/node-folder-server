#!/usr/bin/env node

const packageData = require('./package.json')
const path = require('path')
const fs = require('fs')
const program = require('commander')
const express = require('express')
const http = require('http')

program
  .version(packageData.version)
  .option('-p, --port [port]', 'Define server port', 8080)
  .option('-t, --target [path]', 'Define path to serve', '.')
  .option('-q, --quiet', 'Disable logging', false)
  .parse(process.argv)

const target = path.resolve('.', program.target)

const app = express()

app.disable('X-Powered-By')
app.set('view engine', 'pug')
app.set('views', './src/pug')

app.use((req, res, next) => {
  const reqPath = path.resolve(target, `./${req.url}`)

  let pathStat

  try {
    pathStat = fs.statSync(reqPath)
  } catch (err) {
    res.status(404)
    res.write(err.message.replace(reqPath, req.url))
    return res.end()
  }

  if (pathStat.isDirectory()) {
    const items = fs.readdirSync(reqPath)

    res.render('dir', {
      items
    })

    return res.end()
  }

  next()
})

app.use('/', express.static(target))

http
  .createServer(app)
  .listen(program.port, () => {
    if (!program.quiet) {
      console.log(`Serving ${program.target}:${program.port}`)
    }
  })
