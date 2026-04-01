import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const sourceFile = resolve(projectRoot, 'src/templates/pulse-prism-ui.html')
const runtimeFile = resolve(projectRoot, 'src/templates/pulse-prism-app.js')
const outputDir = resolve(projectRoot, 'dist-share')
const outputFile = resolve(outputDir, 'index.html')

const template = await readFile(sourceFile, 'utf8')
const runtime = await readFile(runtimeFile, 'utf8')
const standaloneHtml = template.replace('__PULSE_PRISM_APP__', runtime)

await mkdir(outputDir, { recursive: true })
await writeFile(outputFile, standaloneHtml, 'utf8')

console.log(`Standalone share HTML written to ${outputFile}`)
