import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import SSH from './SSH.js'
import server from './server.js'

let port
let remoteFolder
let dockerId
describe('Nginx related', () => {
  beforeAll(
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      port = await ssh.port.getPort()
      dockerId = `test-ssh-docker-nginx-${port}`
      remoteFolder = `/tmp/sumor-ssh-docker-test/${dockerId}`
      await ssh.file.ensureDir(remoteFolder)

      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  afterAll(
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      await ssh.docker.remove(dockerId)
      await ssh.file.remove(remoteFolder)
      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  it(
    'run nginx',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      try {
        const demoPage1 = `PAGE1`
        await ssh.file.ensureDir(`${remoteFolder}/html1`)
        await ssh.file.writeFile(`${remoteFolder}/html1/index.html`, demoPage1)

        const demoPage2 = `PAGE2`
        await ssh.file.ensureDir(`${remoteFolder}/html2`)
        await ssh.file.writeFile(`${remoteFolder}/html2/index.html`, demoPage2)

        const nginxConfig1 = `user  root;
worker_processes  1;
events {
    worker_connections  1024;
}
http {
    server {
        listen 80;
        location /html1 {
            root /etc/nginx;
            index index.html;
        }
    }
}`
        await ssh.file.writeFile(`${remoteFolder}/nginx.conf`, nginxConfig1)
        await ssh.docker.runNginx({
          name: dockerId,
          ports: [
            {
              from: 80,
              to: port
            }
          ],
          bindings: [
            {
              from: '/etc/nginx/nginx.conf',
              to: `${remoteFolder}/nginx.conf`
            },
            {
              from: '/etc/nginx/html1',
              to: `${remoteFolder}/html1`
            },
            {
              from: '/etc/nginx/html2',
              to: `${remoteFolder}/html2`
            }
          ]
        })

        const containers = await ssh.docker.containers()
        console.log(containers)

        let response11
        try {
          response11 = await ssh.exec(`curl http://localhost:${port}/html1/`, {
            cwd: '/'
          })
        } catch (e) {
          console.log(e)
        }
        expect(response11).toBe(demoPage1)

        let response12
        try {
          response12 = await ssh.exec(`curl http://localhost:${port}/html2/`, {
            cwd: '/'
          })
        } catch (e) {
          console.log(e)
        }
        expect(response12.indexOf('404')).toBeGreaterThan(0)

        // very simple nginx config only with demo page
        const nginxConfig2 = `user  root;
worker_processes  1;
events {
    worker_connections  1024;
}
http {
    server {
        listen 80;
        location /html1 {
            root /etc/nginx;
            index index.html;
        }
        location /html2 {
            root /etc/nginx;
            index index.html;
        }
    }
}`
        await ssh.file.writeFile(`${remoteFolder}/nginx.conf`, nginxConfig2)
        await ssh.docker.updateNginx(dockerId)

        let response21
        try {
          response21 = await ssh.exec(`curl http://localhost:${port}/html1/`, {
            cwd: '/'
          })
        } catch (e) {
          console.log(e)
        }
        expect(response21).toBe(demoPage1)

        let response22
        try {
          response22 = await ssh.exec(`curl http://localhost:${port}/html2/`, {
            cwd: '/'
          })
        } catch (e) {
          console.log(e)
        }
        expect(response22).toBe(demoPage2)

        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )
})
