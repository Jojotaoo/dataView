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

export interface InteractOverrideParam {
  key: string
  value: string
}

export interface InteractOverrideBody {
  key: string
  value: string
}

export interface RequestOverrideConfig {
  params: Record<string, string>
  body: Record<string, string>
}

export interface InteractEventItem {
  interactOn: string
  interactComponentId?: string
  interactComponentIds: string[]
  interactFn: Record<string, string>
  requestOverrides?: RequestOverrideConfig
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
