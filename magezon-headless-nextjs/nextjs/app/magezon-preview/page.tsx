'use client';
/**
 * /magezon-preview — headless live preview for the Magezon admin builder.
 *
 * Opened by the "Headless Preview" button in the Magezon builder navbar with
 * ?builderId=<id>. It polls the magezonPreview GraphQL query (which reads the
 * live content the admin saves on every edit) and renders it with the SAME React
 * components used in production — so editors see exactly what customers will get,
 * the headless equivalent of Magezon's own storefront live preview.
 *
 * Copy to your Next.js app/ dir. Adjust the `@/lib/magezon` import alias to match
 * your project (or use a relative path). Pages Router equivalent: put the default
 * export in pages/magezon-preview.tsx (drop this file's App-Router assumptions).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MagezonRenderer, fetchMagezonPreview } from '@/lib/magezon';
import type { MagezonContent } from '@/lib/magezon';
import '@/lib/magezon/styles/magezon.css';
import '@/lib/magezon/styles/icons.css';

const POLL_MS = 2000;

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 768, mobile: 375 };

export default function MagezonPreviewPage() {
  const [builderId, setBuilderId] = useState<string | null>(null);
  const [storeCode, setStoreCode] = useState<string | undefined>(undefined);
  const [content, setContent] = useState<MagezonContent | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [status, setStatus] = useState<'connecting' | 'live' | 'updated' | 'error' | 'empty'>('connecting');
  const [lastSync, setLastSync] = useState<string>('');
  const lastKey = useRef<string>('');

  // Read params from the URL on mount (avoids the useSearchParams Suspense dance).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBuilderId(params.get('builderId'));
    setStoreCode(params.get('storeCode') || undefined);
  }, []);

  const poll = useCallback(
    async (signal: AbortSignal) => {
      if (!builderId) return;
      try {
        const next = await fetchMagezonPreview(builderId, { storeCode, signal });
        const key = `${next.updated_at ?? ''}|${(next.profile_json ?? '').length}`;
        if (key !== lastKey.current) {
          lastKey.current = key;
          setContent(next);
          setLastSync(new Date().toLocaleTimeString());
          setStatus(next.has_pagebuilder ? 'updated' : 'empty');
          // Settle the "updated" flash back to "live".
          window.setTimeout(() => setStatus((s) => (s === 'updated' ? 'live' : s)), 800);
        } else if (status === 'connecting') {
          setStatus(content?.has_pagebuilder ? 'live' : 'empty');
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setStatus('error');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [builderId, storeCode],
  );

  useEffect(() => {
    if (!builderId) return;
    const controller = new AbortController();
    poll(controller.signal);
    const t = window.setInterval(() => poll(controller.signal), POLL_MS);
    // Also refresh immediately if the opener (admin) tells us to.
    const onMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'qasr-headless-preview:refresh') poll(controller.signal);
    };
    window.addEventListener('message', onMsg);
    return () => {
      controller.abort();
      window.clearInterval(t);
      window.removeEventListener('message', onMsg);
    };
  }, [builderId, poll]);

  const width = DEVICE_WIDTH[device];

  return (
    <div style={styles.root}>
      <Toolbar
        device={device}
        setDevice={setDevice}
        status={status}
        lastSync={lastSync}
        onRefresh={() => {
          const c = new AbortController();
          poll(c.signal);
        }}
      />
      <div style={styles.stage}>
        <div
          style={{
            ...styles.frame,
            width: width ? `${width}px` : '100%',
            maxWidth: width ? `${width}px` : '100%',
          }}
        >
          {!builderId && <Empty msg="Missing ?builderId — open this from the Magezon builder’s Headless Preview button." />}
          {builderId && status === 'error' && <Empty msg="Couldn’t reach the store. Check NEXT_PUBLIC_MAGENTO_GRAPHQL_URL and CORS." />}
          {builderId && status === 'empty' && <Empty msg="No Magezon content yet — add elements in the builder." />}
          {content?.has_pagebuilder && (
            <MagezonRenderer profileJson={content.profile_json} mediaBaseUrl={content.media_base_url} />
          )}
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  device,
  setDevice,
  status,
  lastSync,
  onRefresh,
}: {
  device: Device;
  setDevice: (d: Device) => void;
  status: string;
  lastSync: string;
  onRefresh: () => void;
}) {
  const dot =
    status === 'live' || status === 'updated'
      ? '#21a366'
      : status === 'error'
        ? '#d4380d'
        : status === 'empty'
          ? '#b0b0b0'
          : '#e8a33d';
  return (
    <div style={styles.toolbar}>
      <div style={styles.brand}>
        <span style={{ ...styles.statusDot, background: dot, animation: status === 'updated' ? 'qasrPulse .8s' : undefined }} />
        Magezon Headless Preview
        <span style={styles.statusText}>
          {status === 'updated' ? 'updated' : status}
          {lastSync ? ` · ${lastSync}` : ''}
        </span>
      </div>
      <div style={styles.devices}>
        {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            style={{ ...styles.deviceBtn, ...(device === d ? styles.deviceBtnActive : {}) }}
          >
            {d}
          </button>
        ))}
        <button onClick={onRefresh} style={styles.refresh} title="Refresh now">
          ↻
        </button>
      </div>
      <style>{`@keyframes qasrPulse {0%{transform:scale(1)}50%{transform:scale(1.9)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div style={styles.empty}>{msg}</div>;
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#f4f5f7', display: 'flex', flexDirection: 'column' },
  toolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 16px',
    background: '#fff',
    borderBottom: '1px solid #e3e3e3',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#303030' },
  statusDot: { width: 9, height: 9, borderRadius: '50%', display: 'inline-block' },
  statusText: { fontWeight: 400, color: '#8a8a8a', textTransform: 'capitalize' },
  devices: { display: 'flex', gap: 6, alignItems: 'center' },
  deviceBtn: {
    border: '1px solid #d6d6d6',
    background: '#fff',
    borderRadius: 6,
    padding: '4px 10px',
    cursor: 'pointer',
    textTransform: 'capitalize',
    fontSize: 12,
    color: '#444',
  },
  deviceBtnActive: { background: '#1979c3', color: '#fff', borderColor: '#1979c3' },
  refresh: { border: '1px solid #d6d6d6', background: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' },
  stage: { flex: 1, display: 'flex', justifyContent: 'center', padding: 16, overflow: 'auto' },
  frame: {
    background: '#fff',
    minHeight: 200,
    boxShadow: '0 1px 4px rgba(0,0,0,.12)',
    transition: 'width .2s ease',
  },
  empty: { padding: '48px 24px', textAlign: 'center', color: '#8a8a8a', fontFamily: 'system-ui, sans-serif', fontSize: 14 },
};
