export interface ComponentProp {
  label: string
  key: string
  type: 'text' | 'number' | 'color' | 'select'
  options?: { label: string; value: string | number }[]
  defaultValue?: string | number
}

export interface ComponentDefinition {
  type: string
  name: string
  icon: string
  isContainer?: boolean
  props: ComponentProp[]
  defaultProps: Record<string, any>
}

export interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  parentId: string | null
  x: number
  y: number
  width: number
  height: number
}

export interface PageConfig {
  width: number
  height: number
  bgColor: string
  bgImage: string
}
