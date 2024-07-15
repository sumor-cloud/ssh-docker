import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import os from 'os'
import fse from 'fs-extra'
import generateSSL from '../src/ssl/generateSSL.js'
import loadSSLs from '../src/ssl/loadSSLs.js'
import loadSSL from '../src/ssl/loadSSL.js'

const tmpFolder = `${os.tmpdir()}/ssh-docker-test-ssl-${Date.now()}`

describe('Site SSL', () => {
  beforeAll(async () => {
    await fse.ensureDir(tmpFolder)
  })
  afterAll(async () => {
    await fse.remove(tmpFolder)
  })
  it('generate SSL', async () => {
    const sslPath = `${tmpFolder}/ssl`
    const domain = 'dev.example.com'
    const generatedSSLPath = `${sslPath}/${domain}`
    await generateSSL(domain, generatedSSLPath)

    const existsCrt = await fse.exists(`${generatedSSLPath}/domain.crt`)
    expect(existsCrt).toBe(true)

    const existsKey = await fse.exists(`${generatedSSLPath}/domain.key`)
    expect(existsKey).toBe(true)

    await fse.remove(sslPath)
  })
  it('load SSL', async () => {
    const domain = 'dev.example.com'
    const generatedSSLPath = await loadSSL(domain, tmpFolder)

    const existsCrt = await fse.exists(`${generatedSSLPath}/domain.crt`)
    expect(existsCrt).toBe(true)

    const existsKey = await fse.exists(`${generatedSSLPath}/domain.key`)
    expect(existsKey).toBe(true)

    await fse.remove(generatedSSLPath)
  })
  it('load SSL with existing ssl folder', async () => {
    const sslPath = `${tmpFolder}/ssl`
    await generateSSL('dev.example.com', sslPath)
    const crt = await fse.readFile(`${sslPath}/domain.crt`, 'utf8')
    const generatedSSLPath = await loadSSL('dev.example.com', sslPath)

    const existsCrt = await fse.exists(`${generatedSSLPath}/domain.crt`)
    expect(existsCrt).toBe(true)
    const generatedCrt = await fse.readFile(`${generatedSSLPath}/domain.crt`, 'utf8')
    expect(generatedCrt).toBe(crt)

    const existsKey = await fse.exists(`${generatedSSLPath}/domain.key`)
    expect(existsKey).toBe(true)

    await fse.remove(sslPath)
    await fse.remove(generatedSSLPath)
  })
  it('load SSLs', async () => {
    const options = {
      domains: [
        {
          domain: 'dev1.example.com'
        },
        {
          domain: 'dev2.example.com'
        }
      ]
    }
    const generatedSSLPath = await loadSSLs(options)

    const existsCrt1 = await fse.exists(`${generatedSSLPath}/dev1.example.com/domain.crt`)
    expect(existsCrt1).toBe(true)

    const existsKey1 = await fse.exists(`${generatedSSLPath}/dev1.example.com/domain.key`)
    expect(existsKey1).toBe(true)

    const existsCrt2 = await fse.exists(`${generatedSSLPath}/dev2.example.com/domain.crt`)
    expect(existsCrt2).toBe(true)

    const existsKey2 = await fse.exists(`${generatedSSLPath}/dev2.example.com/domain.key`)
    expect(existsKey2).toBe(true)

    await fse.remove(generatedSSLPath)
  })
  it('load SSLs with existing ssl folder', async () => {
    const sslPath = `${tmpFolder}/ssl`
    await generateSSL('dev1.example.com', `${sslPath}/dev1.example.com`)
    const crt = await fse.readFile(`${sslPath}/dev1.example.com/domain.crt`, 'utf8')
    const options = {
      ssl: sslPath,
      domains: [
        {
          domain: 'dev1.example.com'
        },
        {
          domain: 'dev2.example.com'
        }
      ]
    }
    const generatedSSLPath = await loadSSLs(options)

    const existsCrt1 = await fse.exists(`${generatedSSLPath}/dev1.example.com/domain.crt`)
    expect(existsCrt1).toBe(true)
    const generatedCrt = await fse.readFile(
      `${generatedSSLPath}/dev1.example.com/domain.crt`,
      'utf8'
    )
    expect(generatedCrt).toBe(crt)

    const existsKey1 = await fse.exists(`${generatedSSLPath}/dev1.example.com/domain.key`)
    expect(existsKey1).toBe(true)

    const existsCrt2 = await fse.exists(`${generatedSSLPath}/dev2.example.com/domain.crt`)
    expect(existsCrt2).toBe(true)

    const existsKey2 = await fse.exists(`${generatedSSLPath}/dev2.example.com/domain.key`)
    expect(existsKey2).toBe(true)

    await fse.remove(sslPath)
    await fse.remove(generatedSSLPath)
  })
})
