import React, { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { STATUT_COLORS } from '../supabase'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

export default function Carte({ etablissements, onSelect, selected }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])

  useEffect(() => {
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [2.3088, 48.8737],
      zoom: 13,
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')
  }, [])

  useEffect(() => {
    markers.current.forEach(m => m.remove())
    markers.current = []

    etablissements.forEach(etab => {
      if (!etab.latitude || !etab.longitude) return

      const color = STATUT_COLORS[etab.statut] || '#9ca3af'
      const isSelected = selected?.id === etab.id

      const el = document.createElement('div')
      el.style.cssText = `
        width: ${isSelected ? 20 : 14}px;
        height: ${isSelected ? 20 : 14}px;
        border-radius: 50%;
        background: ${color};
        border: ${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.4)'};
        cursor: pointer;
        box-shadow: 0 0 ${isSelected ? '12px' : '6px'} ${color};
        transition: all 0.2s;
      `

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false, closeOnClick: false })
        .setHTML(`
          <div style="padding:8px;min-width:160px;font-family:system-ui">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${etab.nom}</div>
            <div style="font-size:11px;color:#888;margin-bottom:2px">${etab.type || ''} · ${etab.arrondissement || ''}</div>
            <div style="display:inline-block;background:${color};color:white;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600">${etab.statut}</div>
          </div>
        `)

      el.addEventListener('mouseenter', () => popup.addTo(map.current))
      el.addEventListener('mouseleave', () => popup.remove())
      el.addEventListener('click', () => onSelect(etab))

      const marker = new mapboxgl.Marker(el)
        .setLngLat([etab.longitude, etab.latitude])
        .addTo(map.current)

      marker._popup = popup
      markers.current.push(marker)
    })
  }, [etablissements, selected, onSelect])

  useEffect(() => {
    if (selected?.latitude && selected?.longitude && map.current) {
      map.current.flyTo({ center: [selected.longitude, selected.latitude], zoom: 15, speed: 1.2 })
    }
  }, [selected])

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%' }} />
      {/* Légende */}
      <div style={{ position: 'absolute', bottom: 30, left: 16, background: 'rgba(26,29,46,0.95)', borderRadius: 10, padding: '12px 16px', border: '1px solid #2d3148' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e', marginBottom: 8 }}>STATUTS</div>
        {Object.entries(STATUT_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{s}</span>
          </div>
        ))}
      </div>
      {/* Compteur */}
      <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(26,29,46,0.95)', borderRadius: 8, padding: '6px 12px', border: '1px solid #2d3148', fontSize: 12, color: '#94a3b8' }}>
        {etablissements.filter(e => e.latitude).length} établissements affichés
      </div>
    </div>
  )
}
