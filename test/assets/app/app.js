import createServer from '@sumor/ssl-server'
import demo from './demo.js'
import fse from 'fs-extra'

const app = createServer()

app.all('/', async (req, res) => {
  const configPath = `${process.cwd()}/config/config.json`
  let config = {}
  if (await fse.exists(configPath)) {
    config = await fse.readJson(configPath)
  }
  res.send({
    status: demo,
    config
  })
})

await app.listen()

console.log('server running on https://localhost')
