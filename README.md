# ssh-docker

A [Sumor Cloud](https://sumor.cloud) Tool.  
[More Documentation](https://sumor.cloud/ssh-docker)

ssh-docker is a docker tool for @sumor/ssh-tools

[![CI](https://github.com/sumor-cloud/ssh-docker/actions/workflows/ci.yml/badge.svg)](https://github.com/sumor-cloud/ssh-docker/actions/workflows/ci.yml)
[![Test](https://github.com/sumor-cloud/ssh-docker/actions/workflows/ut.yml/badge.svg)](https://github.com/sumor-cloud/ssh-docker/actions/workflows/ut.yml)
[![Coverage](https://github.com/sumor-cloud/ssh-docker/actions/workflows/coverage.yml/badge.svg)](https://github.com/sumor-cloud/ssh-docker/actions/workflows/coverage.yml)
[![Audit](https://github.com/sumor-cloud/ssh-docker/actions/workflows/audit.yml/badge.svg)](https://github.com/sumor-cloud/ssh-docker/actions/workflows/audit.yml)

## Installation

```bash
npm i @sumor/ssh-docker --save
```

## Prerequisites

### Node.JS version

Require Node.JS version 18.x or above

### require Node.JS ES module

As this package is written in ES module,
please change the following code in your `package.json` file:

```json
{
  "type": "module"
}
```

## Usage

### Import tool

```js
import SSHBasic from '@sumor/ssh-tools'
import docker from '@sumor/ssh-docker'

class SSH extends SSHBasic {
  constructor(config) {
    super(config)
    this.addTool('docker', docker)
  }
}

export default SSH
```

### Use tool

```js
import SSH from './ssh.js'

const ssh = new SSH(server)

await ssh.connect()

// docker build image
const sourceFolder = '/path/to/source/folder'
const imageName = 'image-name'
const version = '1.0.0'
await ssh.docker.buildImage(sourceFolder, imageName, version)

// images list
const images = await ssh.docker.images()

// exists image
const exists = await ssh.docker.existsImage(imageName, version)

// docker run container
await ssh.docker.run({
  name: 'container-name',
  image: imageName,
  version: version,
  ports: [
    {
      from: 443, // container port
      to: 30123 // host port
    }
  ],
  bindings: [
    {
      from: '/usr/source/config', // container folder
      to: '/path/to/config/folder', // host folder
      readOnly: true // optional, default is false
    }
  ]
})

// docker containers list
const containers = await ssh.docker.containers()

// exists container
const exists = await ssh.docker.exists('container-name')

// exec command in container
const result = await ssh.docker.exec('container-name', 'ls -al')

// docker delete container
await ssh.docker.remove('container-name')

// docker delete image
await ssh.docker.removeImage(imageName, version)

// build node.js project
const logs = await ssh.docker.buildNode('/path/to/source')

// run node.js project
const logs = await ssh.docker.runNode('container-name', '/path/to/source', {
  port
})

// run Nginx
const logs = await ssh.docker.runNginx({
  name: 'container-name',
  ports: [
    {
      from: 443, // container port
      to: 30123 // host port
    }
  ],
  bindings: [
    {
      from: '/usr/source/config', // container folder
      to: '/path/to/config/folder', // host folder
      readOnly: true // optional, default is false
    }
  ]
})

// update Nginx config
await ssh.docker.updateNginx(dockerId)

// run site
await ssh.docker.runSite({
  workerProcesses: 2,
  workerConnections: 2048,
  port: 30100,
  domains: [
    {
      domain: 'dev.example.com',
      servers: [
        {
          host: 'dev.example.com',
          port: 30001,
          maxFails: 3,
          maxConns: 5
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

await ssh.disconnect()
```
