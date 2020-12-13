import Server from './Server';

const flags = require('flags');

flags.defineInteger('port', 443, 'port');
flags.parse();
const server = new Server(flags.get('port'));
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
