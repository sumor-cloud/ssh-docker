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
  ports: [{ from: 443, to: 30000 }],
  folders: {
    config: '/path/to/config/folder'
  }
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

await ssh.disconnect()
```
