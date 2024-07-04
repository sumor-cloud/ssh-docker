export default options => {
  options = options || {}
  const workerProcesses = options.workerProcesses || 1
  const workerConnections = options.workerConnections || 1024
  let result = `user root;
worker_processes ${workerProcesses};
events {
	worker_connections ${workerConnections};
}`
  if (options.content) {
    result += '\n' + options.content
  }
  return result
}
