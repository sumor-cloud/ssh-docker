export default async (ssh, dockerId) => {
  await ssh.docker.exec(dockerId, 'nginx -s reload')
}
