const { cpSync, rmSync } = require('fs')
const { resolve } = require('path')

const projectRoot = resolve(__dirname, '../..')
const target = resolve(projectRoot, 'dist/handoff')

rmSync(target, { recursive: true, force: true })
cpSync(resolve(projectRoot, 'handoff'), target, { recursive: true })

// The deploy artifact should contain the integration assets, not the build-only copier.
rmSync(resolve(target, 'source/copy-to-dist.cjs'), { force: true })
