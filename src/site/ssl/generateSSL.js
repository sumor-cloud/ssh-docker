import selfsigned from 'selfsigned'
import fse from 'fs-extra'

export default async (domain, path) => {
  const domainPath = `${path}/${domain}`
  await fse.ensureDir(domainPath)

  const attrs = [{ name: 'commonName', value: domain }]
  const pems = selfsigned.generate(attrs, {
    keySize: 2048,
    algorithm: 'sha256',
    days: 36500
  })

  await fse.writeFile(`${domainPath}/domain.crt`, pems.cert)
  await fse.writeFile(`${domainPath}/domain.key`, pems.private)
}
