import { createRequire } from "node:module"

// resolves to the package version from package.json
const { version } = createRequire(import.meta.url)("../package.json") as {
  version: string
}

export default version
