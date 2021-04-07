module.exports = {
  apps: [{
    name: 'ZPHIM2',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '100G',
    watch: true,
    watch_delay: 1000,
    ignore_watch: ['statics', 'node_modules'],
    watch_options: {
      followSymlinks: false
    }
  }]
}
