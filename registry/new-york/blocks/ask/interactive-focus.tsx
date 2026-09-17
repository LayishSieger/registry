"use client"

import * as React from "react"

export type InteractiveFocusTrigger =
  | React.RefObject<HTMLElement | null>
  | HTMLElement
  | null
  | undefined

type InteractiveFocusEntry = {
  id: string
  priority: number
  getRoot: () => HTMLElement | null
  getTriggers: () => InteractiveFocusTrigger[]
  activate: () => void
  deactivate: () => void
}

type InteractiveFocusContextValue = {
  register: (entry: InteractiveFocusEntry) => () => void
  requestFocus: (id: string) => void
  focusedId: string | null
}

const InteractiveFocusContext =
  React.createContext<InteractiveFocusContextValue | null>(null)

const InteractiveFocusSurfaceContext =
  React.createContext<React.RefObject<HTMLElement | null> | null>(null)

function resolveElement(
  trigger: InteractiveFocusTrigger,
): HTMLElement | null {
  if (!trigger) return null
  if (typeof HTMLElement !== "undefined" && trigger instanceof HTMLElement) {
    return trigger
  }
  if (typeof trigger === "object" && "current" in trigger) {
    return trigger.current
  }
  return null
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (!(target instanceof HTMLInputElement)) {
    return (
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    )
  }
  return !["button", "checkbox", "radio", "reset", "submit"].includes(
    target.type,
  )
}

function eventInside(entry: InteractiveFocusEntry, target: EventTarget | null) {
  if (!(target instanceof Node)) return false
  const root = entry.getRoot()
  if (root?.contains(target)) return true
  for (const trigger of entry.getTriggers()) {
    const el = resolveElement(trigger)
    if (el?.contains(target)) return true
  }
  return false
}

function blurEntryRoot(getRoot: () => HTMLElement | null) {
  const root = getRoot()
  if (!root) return
  const active = document.activeElement
  if (active instanceof HTMLElement && root.contains(active)) {
    active.blur()
  }
  if (typeof root.blur === "function") {
    root.blur()
  }
}

export function InteractiveFocusProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const entriesRef = React.useRef(new Map<string, InteractiveFocusEntry>())
  const [focusedId, setFocusedId] = React.useState<string | null>(null)
  const focusedIdRef = React.useRef<string | null>(null)

  const setFocused = React.useCallback((nextId: string | null) => {
    const previous = focusedIdRef.current
    if (previous === nextId) return
    if (previous) entriesRef.current.get(previous)?.deactivate()
    focusedIdRef.current = nextId
    setFocusedId(nextId)
    if (nextId) entriesRef.current.get(nextId)?.activate()
  }, [])

  const requestFocus = React.useCallback(
    (id: string) => {
      if (!entriesRef.current.has(id)) return
      setFocused(id)
    },
    [setFocused],
  )

  const register = React.useCallback((entry: InteractiveFocusEntry) => {
    entriesRef.current.set(entry.id, entry)
    // Do not auto-focus on mount — host click / Tab arms a card.
    return () => {
      entriesRef.current.delete(entry.id)
      if (focusedIdRef.current === entry.id) {
        focusedIdRef.current = null
        setFocusedId(null)
      }
    }
  }, [])

  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      const matches = [...entriesRef.current.values()].filter((entry) =>
        eventInside(entry, target),
      )
      if (matches.length === 0) {
        setFocused(null)
        return
      }
      matches.sort((a, b) => b.priority - a.priority)
      setFocused(matches[0]!.id)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      if (event.defaultPrevented || event.isComposing) return
      if (isEditableKeyboardTarget(event.target)) return
      const ranked = [...entriesRef.current.values()].sort(
        (a, b) => b.priority - a.priority || a.id.localeCompare(b.id),
      )
      if (ranked.length < 2) return
      // Only cycle once a card is already armed.
      if (focusedIdRef.current == null) return

      event.preventDefault()
      const currentIndex = ranked.findIndex(
        (entry) => entry.id === focusedIdRef.current,
      )
      const delta = event.shiftKey ? -1 : 1
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + delta + ranked.length) % ranked.length
      setFocused(ranked[nextIndex]!.id)
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [setFocused])

  const value = React.useMemo(
    () => ({ register, requestFocus, focusedId }),
    [register, requestFocus, focusedId],
  )

  return (
    <InteractiveFocusContext.Provider value={value}>
      {children}
    </InteractiveFocusContext.Provider>
  )
}

/**
 * Marks a container (e.g. chat pane / preview chrome) as a shared focus
 * surface. Interactive cards inside can treat it as a focus trigger.
 */
export function InteractiveFocusSurface({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <InteractiveFocusSurfaceContext.Provider value={ref}>
      <div
        ref={ref}
        className={className}
        data-slot="interactive-focus-surface"
        {...props}
      >
        {children}
      </div>
    </InteractiveFocusSurfaceContext.Provider>
  )
}

export function useInteractiveFocusSurface() {
  return React.useContext(InteractiveFocusSurfaceContext)
}

export function useInteractiveFocusRegistration(options: {
  enabled: boolean
  priority?: number
  rootRef: React.RefObject<HTMLElement | null>
  triggers?: InteractiveFocusTrigger[]
  onFocusChange?: (focused: boolean) => void
}) {
  const ctx = React.useContext(InteractiveFocusContext)
  const surface = useInteractiveFocusSurface()
  const id = React.useId()
  const [soloFocused, setSoloFocused] = React.useState(false)
  const onFocusChangeRef = React.useRef(options.onFocusChange)
  const triggersRef = React.useRef(options.triggers)
  const priority = options.priority ?? 0
  const entryRef = React.useRef<InteractiveFocusEntry | null>(null)

  React.useEffect(() => {
    onFocusChangeRef.current = options.onFocusChange
  }, [options.onFocusChange])

  React.useEffect(() => {
    triggersRef.current = options.triggers
  }, [options.triggers])

  const focused = !options.enabled
    ? true
    : ctx
      ? ctx.focusedId === id
      : soloFocused

  React.useEffect(() => {
    if (!options.enabled) return
    onFocusChangeRef.current?.(focused)
  }, [focused, options.enabled])

  const activate = React.useCallback(() => {
    options.rootRef.current?.focus({ preventScroll: true })
  }, [options.rootRef])

  const deactivate = React.useCallback(() => {
    blurEntryRoot(() => options.rootRef.current)
  }, [options.rootRef])

  React.useEffect(() => {
    if (!options.enabled) return

    if (!ctx) {
      setSoloFocused(false)
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target
        const root = options.rootRef.current
        const triggers = [...(triggersRef.current ?? []), surface]
        const hit =
          (root != null &&
            target instanceof Node &&
            root.contains(target)) ||
          triggers.some((trigger) => {
            const el = resolveElement(trigger)
            return (
              el != null && target instanceof Node && el.contains(target)
            )
          })
        if (hit) {
          setSoloFocused(true)
          options.rootRef.current?.focus({ preventScroll: true })
          return
        }
        setSoloFocused(false)
        blurEntryRoot(() => options.rootRef.current)
      }
      document.addEventListener("pointerdown", onPointerDown, true)
      return () =>
        document.removeEventListener("pointerdown", onPointerDown, true)
    }

    const entry: InteractiveFocusEntry = {
      id,
      priority,
      getRoot: () => options.rootRef.current,
      getTriggers: () => [...(triggersRef.current ?? []), surface],
      activate,
      deactivate,
    }
    entryRef.current = entry
    return ctx.register(entry)
  }, [
    activate,
    ctx,
    deactivate,
    id,
    options.enabled,
    options.rootRef,
    priority,
    surface,
  ])

  const requestFocus = React.useCallback(() => {
    if (!options.enabled) return
    if (ctx) {
      ctx.requestFocus(id)
      return
    }
    setSoloFocused(true)
    options.rootRef.current?.focus({ preventScroll: true })
  }, [ctx, id, options.enabled, options.rootRef])

  return {
    focused,
    requestFocus,
    focusedId: ctx?.focusedId ?? null,
  }
}
