import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import os from 'os'
import fse from 'fs-extra'

const tmpFolder = `${os.tmpdir()}/ssh-docker-test-ssl-${Date.now()}`;
import generateSSL from '../../src/site/ssl/generateSSL.js'
import prepare from '../../src/site/ssl/index.js'

describe('Site SSL', () => {
    beforeAll(async () => {
        await fse.ensureDir(tmpFolder)
    });
    afterAll(async () => {
        await fse.remove(tmpFolder)
    })
    it('generate SSL', async () => {
        const sslPath = `${tmpFolder}/ssl`;
        const domain = 'dev.example.com'
        await generateSSL(domain, sslPath)

        const existsCrt = await fse.exists(`${sslPath}/${domain}/domain.crt`)
        expect(existsCrt).toBe(true)

        const existsKey = await fse.exists(`${sslPath}/${domain}/domain.key`)
        expect(existsKey).toBe(true)

        await fse.remove(sslPath)
    })
    it('prepare SSL', async () => {
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
        const generatedSSLPath = await prepare(options)

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
    it('prepare SSL with existing ssl folder', async () => {
        const sslPath = `${tmpFolder}/ssl`;
        await generateSSL('dev1.example.com', sslPath)
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
        const generatedSSLPath = await prepare(options)

        const existsCrt1 = await fse.exists(`${generatedSSLPath}/dev1.example.com/domain.crt`)
        expect(existsCrt1).toBe(true)
        const generatedCrt = await fse.readFile(`${generatedSSLPath}/dev1.example.com/domain.crt`, 'utf8')
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