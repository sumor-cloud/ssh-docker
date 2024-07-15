import selfsigned from 'selfsigned'
import fse from 'fs-extra'

export default async (domain, path) => {
  await fse.ensureDir(path)

  const attrs = [{ name: 'commonName', value: domain || 'localhost' }]
  const pems = selfsigned.generate(attrs, {
    keySize: 2048,
    algorithm: 'sha256',
    days: 36500
  })

  await fse.writeFile(`${path}/domain.crt`, pems.cert)
  await fse.writeFile(`${path}/domain.key`, pems.private)
}
