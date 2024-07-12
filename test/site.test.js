import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import SSH from './test-utils/SSH.js'
import server from './test-utils/server.js'
import generateSSL from '../src/ssl/generateSSL.js'
import ping from './test-utils/ping.js'
import os from 'os'
import fse from 'fs-extra'

let port, port1, port2, port3, port4
let remoteFolder
let dockerId
const domain = server.domain
const alias = server.alias

const localSslPath = `${os.tmpdir()}/sumor-ssh-docker-test-${Date.now()}/ssl`

describe('Site related', () => {
  beforeAll(
    async () => {
      await fse.ensureDir(localSslPath)
      const ssh = new SSH(server)
      await ssh.connect()
      port = await ssh.port.getPort()
      port1 = await ssh.port.getPort()
      port2 = await ssh.port.getPort()
      port3 = await ssh.port.getPort()
      port4 = await ssh.port.getPort()
      dockerId = `sumor_site_${port}`
      remoteFolder = `/tmp/sumor-ssh-docker-test/${dockerId}`
      await ssh.file.ensureDir(remoteFolder)

      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  afterAll(
    async () => {
      await fse.remove(localSslPath)
      const ssh = new SSH(server)
      await ssh.connect()
      await ssh.docker.remove(dockerId)
      await ssh.docker.remove(dockerId + '-demo1')
      await ssh.docker.remove(dockerId + '-demo2')
      await ssh.docker.remove(dockerId + '-demo3')
      await ssh.docker.remove(dockerId + '-demo4')
      await ssh.file.remove(remoteFolder)
      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  it(
    'run site',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()

      try {
        await generateSSL('localhost', localSslPath + '/localhost')

        // prepare demo site
        const runDemo = async ({ name, port }) => {
          const path = `${remoteFolder}/${name}`
          const remoteSSLPath = `${path}/ssl`
          await ssh.file.ensureDir(`${path}/html`)
          await ssh.file.writeFile(`${path}/html/index.html`, name)
          await ssh.file.putFolder(localSslPath + '/localhost', remoteSSLPath)
          const nginxConfig = `user  root;
worker_processes  1;
events {
    worker_connections  1024;
}
http {
    server {
	      listen 443 ssl;
        ssl_certificate_key ssl/domain.key;
        ssl_certificate ssl/domain.crt;
        ssl_session_timeout 5m;
        ssl_ciphers EECDH+AESGCM:EECDH+CHACHA20:ECDH+AESGCM:ECDH+AES256:DH+AESGCM:DH+AES256:ECDH+AES128:DH+AES:RSA+AESGCM:RSA+AES:!aNULL:!MD5:!DSS;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        location /html {
            root /etc/nginx;
            index index.html;
        }
    }
}`
          await ssh.file.writeFile(`${path}/nginx.conf`, nginxConfig)
          await ssh.docker.runNginx({
            name: dockerId + '-' + name,
            ports: [
              {
                from: 443,
                to: port
              }
            ],
            bindings: [
              {
                from: '/etc/nginx/nginx.conf',
                to: `${path}/nginx.conf`
              },
              {
                from: '/etc/nginx/html',
                to: `${path}/html`
              },
              {
                from: '/etc/nginx/ssl',
                to: `${path}/ssl`
              }
            ]
          })

          // check demo server availability
          const response = await ping(ssh, `https://${domain}:${port}/html/`)
          expect(response).toBe(name)
        }
        await runDemo({
          name: 'demo1',
          port: port1
        })
        await runDemo({
          name: 'demo2',
          port: port2
        })
        await runDemo({
          name: 'demo3',
          port: port3
        })
        await runDemo({
          name: 'demo4',
          port: port4
        })
        const containers = await ssh.docker.containers()
        console.log(containers)

        const siteConfig = {
          workerProcesses: 2,
          workerConnections: 2048,
          port,
          domains: [
            {
              domain,
              servers: [
                {
                  host: domain,
                  port: port1
                },
                {
                  host: domain,
                  port: port2
                }
              ]
            },
            {
              domain: alias,
              servers: [
                {
                  host: alias,
                  port: port3
                },
                {
                  host: alias,
                  port: port4
                }
              ]
            }
          ]
        }

        await ssh.docker.runSite(siteConfig)

        const results = []
        for (let i = 0; i < 10; i++) {
          const response = await ping(ssh, `https://${domain}:${port}/html/`)
          results.push(response)
        }
        expect(results).toContain('demo1')
        expect(results).toContain('demo2')

        const results2 = []
        for (let i = 0; i < 10; i++) {
          const response = await ping(ssh, `https://${alias}:${port}/html/`)
          results2.push(response)
        }
        expect(results2).toContain('demo3')
        expect(results2).toContain('demo4')

        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )
})

/*
docker rm -f nginx
docker run -it -v ./nginx.conf:/etc/nginx/nginx.conf -v ./html:/etc/nginx/html -v ./ssl:/etc/nginx/ssl -p 30100:443 --name nginx nginx
*/
