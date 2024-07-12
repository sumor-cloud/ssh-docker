import fse from 'fs-extra'
import os from 'os'
import generateSSL from './generateSSL.js'

export default async options => {
  const tmpFolder = `${os.tmpdir()}/ssh-docker-ssl-${Date.now()}`
  await fse.ensureDir(tmpFolder)

  const domainNames = []
  for (const domain of options.domains) {
    domainNames.push(domain.domain)
  }

  for (const domain of domainNames) {
    const sslDomainPath = `${options.ssl}/${domain}`
    const tmpDomainPath = `${tmpFolder}/${domain}`
    if (
      (await fse.exists(`${sslDomainPath}/domain.crt`)) &&
      (await fse.exists(`${sslDomainPath}/domain.key`))
    ) {
      await fse.ensureDir(`${tmpDomainPath}`)
      await fse.copy(`${sslDomainPath}/domain.crt`, `${tmpDomainPath}/domain.crt`)
      await fse.copy(`${sslDomainPath}/domain.key`, `${tmpDomainPath}/domain.key`)
    } else {
      await generateSSL(domain, `${tmpDomainPath}`)
    }
  }

  return tmpFolder
}
