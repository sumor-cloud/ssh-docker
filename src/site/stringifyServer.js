export default options => {
  options = options || {}
  const domain = options.domain || 'localhost'
  const domainName = domain.replace(/\./g, '_')
  const servers = options.servers || []
  const upstreams = []
  servers.forEach(server => {
    const result = ['server']
    const host = server.host
    const port = server.port
    const hostString = port ? `${host}:${port}` : host
    result.push(hostString)

    const weight = server.weight
    if (weight) {
      result.push(`weight=${weight}`)
    }

    const maxConns = server.maxConns
    if (maxConns) {
      result.push(`max_conns=${maxConns}`)
    }

    const maxFails = server.maxFails
    if (maxFails) {
      result.push(`max_fails=${maxFails}`)
    }

    return upstreams.push(`${result.join(' ')};`)
  })
  return `upstream ${domainName}_stream {
	${upstreams.join('\n\t')}
}
server {
	server_tokens off;
	listen 443 ssl http2;
	server_name ${domain};
	access_log /tmp/${domainName}_access.log;
	error_log /tmp/${domainName}_error.log;
	ssl_certificate ssl/${domain}/domain.crt;
	ssl_certificate_key ssl/${domain}/domain.key;
	ssl_session_timeout 5m;
	ssl_ciphers EECDH+AESGCM:EECDH+CHACHA20:ECDH+AESGCM:ECDH+AES256:DH+AESGCM:DH+AES256:ECDH+AES128:DH+AES:RSA+AESGCM:RSA+AES:!aNULL:!MD5:!DSS;
	ssl_protocols TLSv1.2 TLSv1.3;
	ssl_prefer_server_ciphers on;
	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $remote_addr;
		proxy_pass https://${domainName}_stream;
		proxy_ssl_server_name on;
		proxy_ssl_name $host;
	}
}`
}
