import { execSync } from 'child_process'
import { rmSync, existsSync } from 'fs'

execSync('tsc -b && vite build --mode publico', { stdio: 'inherit' })

for (const dir of ['dist/data', 'dist/files']) {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true })
        console.log(`[build:publico] removido: ${dir}`)
    }
}