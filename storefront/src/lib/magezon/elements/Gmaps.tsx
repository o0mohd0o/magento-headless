'use client';
/**
 * Gmaps — port of element/gmaps.phtml (category: embed).
 *
 * Renders a Google Map with markers + clickable infoboxes. Faithful to the
 * Magezon template, which builds a `google.maps.Map`, drops one Marker per
 * `items[]` row, and opens an InfoWindow on click (or immediately when
 * `infobox_opened` is set).
 *
 * Element fields (from Data/Element/Gmaps.php):
 *   - items: dynamic-rows array; each row = { center, image, lat, lng, info }
 *       center -> radio flag selecting the map's center marker
 *       image  -> marker icon path (resolved via media base url, like the
 *                 PHP block which runs getImageUrl() on it)
 *       lat/lng-> marker coordinates
 *       info   -> InfoWindow HTML content
 *   - map_zoom (default 12), map_type (roadmap|satellite|hybrid|terrain,
 *     default roadmap)
 *   - map_ui (toggle, default true)  -> disableDefaultUI
 *   - map_scrollwheel (default true), map_draggable (default true)
 *   - infobox_opened -> open every InfoWindow by default
 *   - map_width (default 100%), map_height (default 400) -> container size
 *   - infobox_width / infobox_text_color / infobox_background_color ->
 *     InfoWindow styling (applied to the rendered InfoWindow content node)
 *
 * API KEY: the PHP block reads the key from store config
 * (Builder\Helper\Data::getGoogleMapApi); in a headless app it is not part of
 * the element JSON. It is read here from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 * Mirroring the block's isEnabled()/centerItem guards, nothing renders when the
 * key is missing or there is no centerable marker.
 *
 * The Google Maps JS SDK is loaded once per page (shared loader promise) and
 * the map is initialised in an effect — no jQuery, no `require([...])`.
 */
import React, { useEffect, useId, useRef } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, mediaUrl, str } from '../media';

interface GmapsMarker {
  lat: number;
  lng: number;
  center: boolean;
  image: string;
  info: string;
}

const GOOGLE_MAPS_API_KEY =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
  '';

/** Shared loader so the SDK <script> is injected at most once per page. */
let mapsLoader: Promise<unknown> | null = null;

function loadGoogleMaps(apiKey: string): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google && w.google.maps) return Promise.resolve(w.google.maps);
  if (mapsLoader) return mapsLoader;

  mapsLoader = new Promise((resolve, reject) => {
    const existing = document.getElementById('mgz-gmaps-sdk') as HTMLScriptElement | null;
    const onReady = () => {
      const g = (window as unknown as { google?: { maps?: unknown } }).google;
      if (g && g.maps) resolve(g.maps);
      else reject(new Error('Google Maps failed to initialise'));
    };
    if (existing) {
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', () => reject(new Error('Google Maps script error')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'mgz-gmaps-sdk';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places`;
    script.addEventListener('load', onReady);
    script.addEventListener('error', () => reject(new Error('Google Maps script error')));
    document.head.appendChild(script);
  });
  return mapsLoader;
}

/** Mirror Block\Element\Gmaps::getCenterItem(). */
function pickCenter(markers: GmapsMarker[]): GmapsMarker | null {
  for (const m of markers) {
    if (m.center && m.lat && m.lng) return m;
  }
  for (const m of markers) {
    if (m.lat && m.lng) return m;
  }
  return null;
}

export function Gmaps({ element, ctx }: MagezonElementProps) {
  const reactId = useId();
  const mapRef = useRef<HTMLDivElement | null>(null);

  // Build the marker list (mirrors Block::getItems()).
  const rawItems = Array.isArray(element.items) ? (element.items as Record<string, unknown>[]) : [];
  const markers: GmapsMarker[] = rawItems
    .filter(Boolean)
    .map((it) => ({
      lat: Number(str(it.lat)),
      lng: Number(str(it.lng)),
      center: bool(it.center),
      image: it.image ? mediaUrl(it.image, ctx) : '',
      info: str(it.info),
    }))
    .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

  const centerItem = pickCenter(markers);

  // Map options.
  const zoomRaw = Number(str(element.map_zoom));
  const zoom = Number.isFinite(zoomRaw) && zoomRaw > 0 ? zoomRaw : 12;
  const mapType = str(element.map_type) || 'roadmap';
  const disableDefaultUI = element.map_ui === undefined ? true : bool(element.map_ui);
  const scrollwheel = element.map_scrollwheel === undefined ? true : bool(element.map_scrollwheel);
  const draggable = element.map_draggable === undefined ? true : bool(element.map_draggable);
  const infoboxOpened = bool(element.infobox_opened);

  // InfoWindow styling.
  const infoboxWidth = str(element.infobox_width);
  const infoboxTextColor = str(element.infobox_text_color);
  const infoboxBackground = str(element.infobox_background_color);

  // Container sizing (defaults from Data/Element: 100% x 400).
  const widthRaw = str(element.map_width) || '100%';
  const heightRaw = str(element.map_height) || '400';
  const cssSize = (v: string) => (/^\d+$/.test(v) ? `${v}px` : v);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !centerItem || !mapRef.current) return;
    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        if (cancelled || !mapRef.current) return;
        const g = maps as any;

        const map = new g.Map(mapRef.current, {
          center: { lat: centerItem.lat, lng: centerItem.lng },
          zoom,
          mapTypeId: mapType,
          disableDefaultUI,
          scrollwheel,
          draggable,
        });

        markers.forEach((option) => {
          const marker = new g.Marker({
            position: new g.LatLng(option.lat, option.lng),
            map,
            icon: option.image || undefined,
          });

          if (option.info) {
            const content = document.createElement('div');
            content.className = 'mgz-gmaps-infobox';
            content.innerHTML = option.info;
            if (infoboxWidth) content.style.width = cssSize(infoboxWidth);
            if (infoboxTextColor) content.style.color = infoboxTextColor;
            if (infoboxBackground) content.style.background = infoboxBackground;

            const infowindow = new g.InfoWindow({ content });
            marker.addListener('click', () => infowindow.open(map, marker));
            if (infoboxOpened) infowindow.open(map, marker);
          }
        });
      })
      .catch(() => {
        /* SDK unavailable — leave the empty container in place. */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactId]);

  // Match the PHP guard: no key or no centerable marker -> render nothing.
  if (!GOOGLE_MAPS_API_KEY || !centerItem) return null;

  const mapId = `${str(element.id) || reactId.replace(/[:]/g, '')}-map`;

  return (
    <div className="mgz-gmaps">
      <div
        id={mapId}
        ref={mapRef}
        className="mgz-gmaps-canvas"
        style={{ width: cssSize(widthRaw), height: cssSize(heightRaw) }}
      />
    </div>
  );
}
