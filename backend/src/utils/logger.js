function info(message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp}] [INFO] ${message}${metaStr}`);
}

function warn(message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  console.warn(`[${timestamp}] [WARN] ${message}${metaStr}`);
}

function error(message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  console.error(`[${timestamp}] [ERROR] ${message}${metaStr}`);
}

module.exports = { info, warn, error };
