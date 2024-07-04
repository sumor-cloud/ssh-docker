import { describe, expect, it } from '@jest/globals'

import stringifyConf from '../src/site/stringifyConf.js'
import stringifyHttp from '../src/site/stringifyHttp.js'
import stringifyServer from '../src/site/stringifyServer.js'
import stringify from '../src/site/index.js'

import loadNginxFiles from './loadNginxFiles.js'
const nginxFiles = await loadNginxFiles()

describe('Site related', () => {
  it('stringify nginx config', () => {
    const result1 = stringifyConf()
    expect(result1).toBe(nginxFiles.stringifyConfig1)
    const result2 = stringifyConf({
      workerProcesses: 2,
      workerConnections: 2048,
      content: `http {\n\n}`
    })
    expect(result2).toBe(nginxFiles.stringifyConfig2)
  })
  it('stringify nginx http', () => {
    const result1 = stringifyHttp()
    expect(result1).toBe(nginxFiles.stringifyHttp1)
    const result2 = stringifyHttp({
      content: `server {\n	\n}`
    })
    expect(result2).toBe(nginxFiles.stringifyHttp2)
  })
  it('stringify nginx server', () => {
    const result1 = stringifyServer()
    expect(result1).toBe(nginxFiles.stringifyServer1)
    const result2 = stringifyServer({
      domain: 'dev.example.com',
      servers: [
        {
          host: 'dev.example.com',
          port: 30001
        },
        {
          host: 'dev.example.com',
          port: 30002,
          weight: 1
        }
      ]
    })
    expect(result2).toBe(nginxFiles.stringifyServer2)
  })
  it('stringify entry', () => {
    const result1 = stringify()
    expect(result1).toBe(nginxFiles.stringifyEntry1)
    const result2 = stringify({
      workerProcesses: 2,
      workerConnections: 2048,
      domains: [
        {
          domain: 'dev.example.com',
          servers: [
            {
              host: 'dev.example.com',
              port: 30001
            },
            {
              host: 'dev.example.com',
              port: 30002,
              weight: 1
            }
          ]
        }
      ]
    })
    expect(result2).toBe(nginxFiles.stringifyEntry2)
  })
})
