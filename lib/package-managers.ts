export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

export type PackageManagerCommands = Record<PackageManager, string>

const STORAGE_KEY = "layish.package-manager"

const listeners = new Set<() => void>()
let memoryValue: PackageManager | null = null

function isPackageManager(value: string | null): value is PackageManager {
  return !!value && (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

function readStored(): PackageManager {
  if (typeof window === "undefined") return "pnpm"
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (isPackageManager(value)) return value
  } catch {
    // ignore
  }
  return "pnpm"
}

function emit() {
  for (const listener of listeners) listener()
}

/** Convert an `npx …` install command into pnpm / npm / yarn / bun variants (shadcn-style). */
export function packageManagerCommands(
  command: string,
): PackageManagerCommands | null {
  if (!command.startsWith("npx ")) return null

  return {
    pnpm: command.replace(/^npx /, "pnpm dlx "),
    npm: command,
    yarn: command.replace(/^npx /, "yarn dlx "),
    bun: command.replace(/^npx /, "bunx --bun "),
  }
}

export function getPackageManagerSnapshot(): PackageManager {
  if (memoryValue !== null) return memoryValue
  return readStored()
}

export function getPackageManagerServerSnapshot(): PackageManager {
  return "pnpm"
}

export function subscribePackageManager(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setPackageManager(value: PackageManager) {
  memoryValue = value
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // ignore
  }
  emit()
}
