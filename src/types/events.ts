export interface BaseEventType {
  click?: string
  dblclick?: string
  mouseenter?: string
  mouseleave?: string
}

export interface AdvancedEventType {
  vnodeMounted?: string
  vnodeBeforeMount?: string
}

export interface InteractEventItem {
  interactOn: string
  interactComponentId: string
  interactFn: Record<string, string>
}

export interface InteractActionItem {
  interactType: string
  interactName: string
  componentEmitEvents: Record<string, { value: string; label: string }[]>
}

export interface EventsType {
  baseEvent?: BaseEventType
  advancedEvents?: AdvancedEventType
  interactEvents?: InteractEventItem[]
}
