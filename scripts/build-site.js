import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootIndex = path.join(root, 'index.html')
const entryIndex = path.join(root, 'site-entry.html')
const docsIndex = path.join(root, 'docs', 'index.html')
const docsAssets = path.join(root, 'docs', 'assets')
const rootAssets = path.join(root, 'assets')

const previousIndex = fs.existsSync(rootIndex) ? fs.readFileSync(rootIndex, 'utf8') : ''

try {
  fs.copyFileSync(entryIndex, rootIndex)
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
  const result = spawnSync(
    process.execPath,
    [viteBin, 'build', '--base=./', '--outDir', 'docs', '--emptyOutDir'],
    { cwd: root, stdio: 'inherit' },
  )

  if (result.status !== 0) {
    throw new Error(`vite build failed with exit code ${result.status}`)
  }

  if (!fs.existsSync(docsIndex)) {
    throw new Error('Build output missing docs/index.html')
  }

  fs.mkdirSync(rootAssets, { recursive: true })
  for (const file of fs.readdirSync(docsAssets)) {
    fs.copyFileSync(path.join(docsAssets, file), path.join(rootAssets, file))
  }

  fs.copyFileSync(docsIndex, rootIndex)
  console.log('Built docs/ and synced deployable root index.html plus assets/.')
} catch (error) {
  fs.writeFileSync(rootIndex, previousIndex)
  throw error
}
