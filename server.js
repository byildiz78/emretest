const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

// Increase Node.js memory limits
const v8 = require('v8')
v8.setFlagsFromString('--max-old-space-size=4096')

// Configure garbage collection
if (!dev) {
  require('v8').setFlagsFromString('--expose_gc')
  global.gc = require('vm').runInNewContext('gc')
  setInterval(() => {
    try {
      global.gc()
    } catch (e) {
      console.error('Failed to garbage collect:', e)
    }
  }, 30000) // Run GC every 30 seconds
}

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
