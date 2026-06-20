// lib/content/useMDXComponent.ts
import { useMemo } from 'react'
import type { ComponentType } from 'react'
import * as runtime from 'react/jsx-runtime'

export function useMDXComponent(code: string): ComponentType {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return useMemo(() => new Function(code)({ ...runtime }).default, [code])
}
