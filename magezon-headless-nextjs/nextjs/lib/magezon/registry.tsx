/**
 * registry.tsx — maps Magezon element `type` -> React component.
 *
 * This is the Approach-B equivalent of PWA Studio's ContentTypeFactory: each
 * Magezon element type is re-implemented as a React component and registered
 * here. Unregistered types fall back to <Fallback>. Add a new element by writing
 * elements/MyType.tsx and calling registerElement('my_type', MyType).
 */
import type React from 'react';
import type { MagezonElementProps } from './types';

export type ElementComponent = React.ComponentType<MagezonElementProps>;

const registry = new Map<string, ElementComponent>();

export function registerElement(type: string, component: ElementComponent): void {
  registry.set(type, component);
}

export function registerElements(map: Record<string, ElementComponent>): void {
  for (const [type, component] of Object.entries(map)) registry.set(type, component);
}

export function getElementComponent(type: string): ElementComponent | undefined {
  return registry.get(type);
}

export function registeredTypes(): string[] {
  return Array.from(registry.keys()).sort();
}
