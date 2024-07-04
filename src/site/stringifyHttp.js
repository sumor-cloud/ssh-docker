export default options => {
  options = options || {}
  let content = options.content || ''
  if (content !== '') {
    content = '\n' + content
    const contentArr = content.split('\n')
    content = contentArr.join('\n\t')
  }
  const result = `http {
	proxy_connect_timeout 600s;
	proxy_send_timeout 600s;
	proxy_read_timeout 600s;
	server_tokens off;
	client_max_body_size 10m;
	server {
		listen 80 default_server;
		server_name _;
		return 301 https://$host$request_uri;
	}${content}
}`
  return result
}
