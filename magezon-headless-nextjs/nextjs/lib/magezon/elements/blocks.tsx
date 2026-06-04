/**
 * blocks.tsx — adapters for Magezon's LAYOUT-block elements: custom_block and
 * sidebar.
 *
 * These render Magento *layout* blocks by name (custom_block ->
 * renderElement($blockName); sidebar -> div.sidebar.main / div.sidebar.additional).
 * A layout block has no headless equivalent — its markup is produced by PHP block
 * classes + theme templates that don't exist in Next.js. So your app decides what
 * (if anything) to render for a given block name via MagezonBlockProvider.
 *
 *   <MagezonBlockProvider
 *     render={(name) => name === 'my.promo' ? <MyPromo/> : null}>
 *     <MagezonRenderer .../>
 *   </MagezonBlockProvider>
 *
 * Out of the box: dev shows a labelled placeholder, prod renders nothing.
 */
'use client';

import React, { createContext, useContext } from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

export type BlockRenderer = (blockName: string, element: MagezonElementProps['element']) => React.ReactNode;

const BlockContext = createContext<BlockRenderer | null>(null);

export function MagezonBlockProvider({
  render,
  children,
}: {
  render: BlockRenderer;
  children: React.ReactNode;
}) {
  return <BlockContext.Provider value={render}>{children}</BlockContext.Provider>;
}

const isDev = process.env.NODE_ENV !== 'production';

function Placeholder({ label }: { label: string }) {
  if (!isDev) return null;
  return (
    <div className="mgz-block-placeholder" data-mgz-block={label}>
      <span style={{ font: '12px/1.4 monospace', color: '#8a6d3b', background: '#fcf8e3', padding: '2px 6px' }}>
        Magento layout block: <code>{label}</code> — provide one via MagezonBlockProvider.
      </span>
    </div>
  );
}

/** custom_block: renders the Magento block named `block_name`. */
export function CustomBlock({ element }: MagezonElementProps) {
  const name = str(element.block_name);
  const renderer = useContext(BlockContext);
  if (!name) return null;
  if (renderer) return <>{renderer(name, element)}</>;
  return <Placeholder label={name} />;
}

/** sidebar: renders the storefront sidebar regions (div.sidebar.main / .additional). */
export function Sidebar({ element }: MagezonElementProps) {
  const renderer = useContext(BlockContext);
  if (renderer) {
    return (
      <>
        {renderer('div.sidebar.main', element)}
        {renderer('div.sidebar.additional', element)}
      </>
    );
  }
  return <Placeholder label="sidebar (div.sidebar.main / additional)" />;
}
