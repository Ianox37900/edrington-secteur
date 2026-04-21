import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { STATUT_COLORS } from '../supabase'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const ARRONDISSEMENTS = {
  '8ème': {
    color: '#c9a96e',
    coordinates: [[
      [2.2950, 48.8620],[2.2950, 48.8800],[2.3000, 48.8830],[2.3100, 48.8840],
      [2.3260, 48.8820],[2.3320, 48.8780],[2.3350, 48.8720],[2.3300, 48.8620],
      [2.3150, 48.8580],[2.2950, 48.8620],
    ]],
  },
  '16ème': {
    color: '#60a5fa',
    coordinates: [[
      [2.2350, 48.8380],[2.2350, 48.8720],[2.2550, 48.8780],[2.2800, 48.8780],
      [2.2950, 48.8800],[2.2950, 48.8620],[2.3000, 48.8580],[2.2900, 48.8400],
      [2.2700, 48.8320],[2.2350, 48.8380],
    ]],
  },
  '17ème': {
    color: '#a78bfa',
    coordinates: [[
      [2.2800, 48.8780],[2.2800, 48.8960],[2.3000, 48.8980],[2.3200, 48.8960],
      [2.3350, 48.8900],[2.3380, 48.8820],[2.3260, 48.8820],[2.3100, 48.8840],
      [2.3000, 48.8830],[2.2800, 48.8780],
    ]],
  },
}

const POTENTIEL_ICONS = { 'Très fort': '⭐⭐⭐', 'Fort': '⭐⭐', 'Moyen': '⭐', 'Faible': '' }

export default function Carte({ etablissements, onSelect, selected }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const zonesAdded = useRef(false)
  const [showLabels, setShowLabels] = useState(true)
  const [showZones, setShowZones] = useState(true)

  useEffect(() => {
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [2.3050, 48.8760],
      zoom: 13,
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')
    map.current.on('load', () => { addZones(); zonesAdded.current = true })
  }, [])

  function addZones() {
    Object.entries(ARRONDISSEMENTS).forEach(([name, zone]) => {
      const id = `zone-${name}`
      if (map.current.getSource(id)) return
      map.current.addSource(id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: zone.coordinates } } })
      map.current.addLayer({ id, type: 'fill', source: id, paint: { 'fill-color': zone.color, 'fill-opacity': 0.07 } })
      map.current.addLayer({ id: `border-${name}`, type: 'line', source: id, paint: { 'line-color': zone.color, 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 3] } })
      const coords = zone.coordinates[0]
      const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length
      const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length
      map.current.addSource(`label-${name}`, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { name } } })
      map.current.addLayer({ id: `label-${name}`, type: 'symbol', source: `label-${name}`, layout: { 'text-field': name, 'text-size': 18, 'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'], 'text-anchor': 'center' }, paint: { 'text-color': zone.color, 'text-opacity': 0.7, 'text-halo-color': '#0f1117', 'text-halo-width': 2 } })
    })
  }

  useEffect(() => {
    if (!map.current || !zonesAdded.current) return
    Object.keys(ARRONDISSEMENTS).forEach(name => {
      const vis = showZones ? 'visible' : 'none'
      try { map.current.setLayoutProperty(`zone-${name}`, 'visibility', vis) } catch (e) {}
      try { map.current.setLayoutProperty(`border-${name}`, 'visibility', vis) } catch (e) {}
      try { map.current.setLayoutProperty(`label-${name}`, 'visibility', vis) } catch (e) {}
    })
  }, [showZones])

  useEffect(() => {
    markers.current.forEach(m => m.remove())
    markers.current = []
    etablissements.forEach(etab => {
      if (!etab.latitude || !etab.longitude) return
      const color = STATUT_COLORS[etab.statut] || '#9ca3af'
      const isSelected = selected?.id === etab.id
      const size = isSelected ? 22 : 14

      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;gap:2px;'

      const dot = document.createElement('div')
      dot.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.5)'};box-shadow:0 0 ${isSelected ? 14 : 6}px ${color};transition:all 0.2s;flex-shrink:0;`

      const label = document.createElement('div')
      const shortName = etab.nom.length > 16 ? etab.nom.slice(0, 14) + '…' : etab.nom
      label.textContent = shortName
      label.style.cssText = `margin-top:2px;background:rgba(15,17,23,0.88);color:#f1f5f9;font-size:9px;font-weight:700;font-family:system-ui;padding:2px 5px;border-radius:3px;white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(255,255,255,0.12);display:${showLabels ? 'block' : 'none'};pointer-events:none;`

      wrapper.appendChild(dot)
      wrapper.appendChild(label)

      const popup = new mapboxgl.Popup({ offset: [0, -10], closeButton: false, closeOnClick: false, maxWidth: '240px' })
        .setHTML(`<div style="padding:10px;font-family:system-ui;"><div style="font-weight:700;font-size:13px;margin-bottom:3px">${etab.nom}</div><div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${etab.type || ''} · ${etab.categorie || ''} · ${etab.arrondissement || ''}</div><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;"><span style="background:${color};color:white;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">${etab.statut}</span>${etab.potentiel ? `<span style="color:#c9a96e;font-size:11px">${POTENTIEL_ICONS[etab.potentiel] || ''} ${etab.potentiel}</span>` : ''}</div>${etab.notes ? `<div style="font-size:10px;color:#94a3b8;margin-top:6px;line-height:1.4">${etab.notes.slice(0, 90)}${etab.notes.length > 90 ? '…' : ''}</div>` : ''}</div>`)

      dot.addEventListener('mouseenter', () => popup.addTo(map.current))
      dot.addEventListener('mouseleave', () => popup.remove())
      wrapper.addEventListener('click', () => onSelect(etab))

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: 'bottom' }).setLngLat([etab.longitude, etab.latitude]).addTo(map.current)
      markers.current.push(marker)
    })
  }, [etablissements, selected, onSelect, showLabels])

  useEffect(() => {
    if (selected?.latitude && selected?.longitude && map.current) {
      map.current.flyTo({ center: [selected.longitude, selected.latitude], zoom: 15, speed: 1.2 })
    }
  }, [selected])

  const btnStyle = (active, color) => ({
    background: active ? `rgba(${color},0.15)` : 'rgba(26,29,46,0.92)',
    border: `1px solid ${active ? `rgb(${color})` : '#2d3148'}`,
    borderRadius: 6, padding: '5px 10px',
    color: active ? `rgb(${color})` : '#94a3b8',
    cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'system-ui',
  })

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ background: 'rgba(26,29,46,0.95)', borderRadius: 8, padding: '6px 12px', border: '1px solid #2d3148', fontSize: 12, color: '#94a3b8' }}>
          {etablissements.filter(e => e.latitude).length} établissements
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={btnStyle(showZones, '201,169,110')} onClick={() => setShowZones(z => !z)}>🗺 Zones</button>
          <button style={btnStyle(showLabels, '201,169,110')} onClick={() => setShowLabels(l => !l)}>🏷 Noms</button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 30, left: 16, background: 'rgba(26,29,46,0.95)', borderRadius: 10, padding: '12px 16px', border: '1px solid #2d3148' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e', marginBottom: 8 }}>STATUTS</div>
        {Object.entries(STATUT_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{s}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #2d3148', marginTop: 8, paddingTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e', marginBottom: 6 }}>ZONES</div>
          {Object.entries(ARRONDISSEMENTS).map(([name, z]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ width: 14, height: 3, background: z.color, borderRadius: 2, opacity: 0.8 }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
