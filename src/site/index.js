import stringify from './stringify/index.js'
import ssl from './ssl/index.js'

export default (ssh, docker) => {
  const run = async options => {
    const nginxConfig = stringify(options)
    
    const port = options.port || 443;
    const remotePath = `/usr/sites/site_${port}`;

    await ssh.file.ensureDir(remotePath);
    await ssh.file.writeFile(`${remotePath}/nginx.conf`, nginxConfig);
    const sslPath = await ssl(options);
    await ssh.file.putFolder(sslPath, `${remotePath}/ssl`);
    
  }

  docker.runSite = run
}
