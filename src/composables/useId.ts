export function useId(): string {
  return crypto.randomUUID()
}

export function useIdGenerator(): () => string {
  return () => crypto.randomUUID()
}
