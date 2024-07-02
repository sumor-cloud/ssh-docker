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
