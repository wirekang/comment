import Server from './Server';

const server = new Server(8081);
process.stdin.resume();

function cleanup() {
  console.log('Clean start.');
  server.close();
  console.log('Clean------');
}

function cleanAndExit() {
  cleanup();
  process.exit(0);
}

process.on('exit', cleanup);
process.on('SIGINT', cleanAndExit);
process.on('SIGTERM', cleanAndExit);
