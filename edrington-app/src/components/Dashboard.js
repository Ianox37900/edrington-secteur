import React from 'react'
import { STATUT_COLORS } from '../supabase'

export default function Dashboard({ etablissements }) {
  const total = etablissements.length
  const clients = etablissements.filter(e => e.statut === 'Client actif').length
  const prospectsChauds = etablissements.filter(e => e.statut === 'Prospect chaud').length
  const prospectsFroids = etablissements.filter(e => e.statut === 'Prospect froid').length

  const totalVolume = etablissements.reduce((sum, e) =>
    sum + (e.produits_references?.reduce((s, p) => s + (p.volume_mensuel || 0), 0) || 0), 0)

  const totalVisites = etablissements.reduce((sum, e) => sum + (e.visites?.length || 0), 0)

  // Volume par produit
  const volumeParProduit = {}
  etablissements.forEach(e => {
    e.produits_references?.forEach(p => {
      volumeParProduit[p.produit] = (volumeParProduit[p.produit] || 0) + (p.volume_mensuel || 0)
    })
  })
  const topProduits = Object.entries(volumeParProduit).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Par type
  const parType = {}
  etablissements.forEach(e => { if (e.type) parType[e.type] = (parType[e.type] || 0) + 1 })

  // Par arrondissement
  const parArr = {}
  etablissements.forEach(e => { if (e.arrondissement) parArr[e.arrondissement] = (parArr[e.arrondissement] || 0) + 1 })

  // Alertes : pas de visite depuis 30j
  const today = new Date()
  const aRelancer = etablissements.filter(e => {
    if (e.statut !== 'Client actif') return false
    const visites = e.visites || []
    if (visites.length === 0) return true
    const last = new Date(Math.max(...visites.map(v => new Date(v.date_visite))))
    return (today - last) / (1000 * 60 * 60 * 24) > 30
  })

  // Prochaines visites planifiées
  const prochainesVisites = []
  etablissements.forEach(e => {
    e.visites?.forEach(v => {
      if (v.prochaine_visite && new Date(v.prochaine_visite) >= today) {
        prochainesVisites.push({ ...v, etablissement: e.nom })
      }
    })
  })
  prochainesVisites.sort((a, b) => new Date(a.prochaine_visite) - new Date(b.prochaine_visite))

  const cardStyle = (accent) => ({
    background: '#1a1d2e', border: `1px solid ${accent || '#2d3148'}`, borderRadius: 12, padding: '20px',
  })
  const statCard = (label, value, sub, color) => (
    <div style={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 12, padding: '18px 20px', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 20 }}>
      <h2 style={{ margin: '0 0 20px', color: '#c9a96e', fontSize: 18 }}>Dashboard Secteur</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statCard('Établissements', total, '8e · 16e · 17e', '#c9a96e')}
        {statCard('Clients actifs', clients, `${Math.round(clients / total * 100) || 0}% du portefeuille`, '#22c55e')}
        {statCard('Prospects chauds', prospectsChauds, 'À convertir', '#f97316')}
        {statCard('Volume total', `${totalVolume}`, 'bouteilles / mois', '#60a5fa')}
        {statCard('Visites total', totalVisites, 'depuis le début', '#a78bfa')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Statuts */}
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a96e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Répartition statuts</div>
          {Object.entries(STATUT_COLORS).map(([s, c]) => {
            const count = etablissements.filter(e => e.statut === s).length
            const pct = total ? Math.round(count / total * 100) : 0
            return (
              <div key={s} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{s}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{count}</span>
                </div>
                <div style={{ height: 6, background: '#0f1117', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Par type */}
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a96e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Par type d'établissement</div>
          {Object.entries(parType).map(([type, count]) => (
            <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #2d3148' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{type}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{count}</span>
            </div>
          ))}
          {Object.keys(parType).length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>Aucune donnée</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Top produits */}
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a96e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Top produits (btl/mois)</div>
          {topProduits.length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>Aucun produit référencé</div>}
          {topProduits.map(([produit, vol]) => {
            const max = topProduits[0]?.[1] || 1
            return (
              <div key={produit} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{produit.replace('The Macallan', 'TM').replace('Highland Park', 'HP')}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e' }}>{vol} btl</span>
                </div>
                <div style={{ height: 5, background: '#0f1117', borderRadius: 3 }}>
                  <div style={{ width: `${vol / max * 100}%`, height: '100%', background: 'linear-gradient(90deg, #c9a96e, #8b6914)', borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Par arrondissement */}
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a96e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Par arrondissement</div>
          {Object.entries(parArr).map(([arr, count]) => (
            <div key={arr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2d3148' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{arr}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 6, width: 80, background: '#0f1117', borderRadius: 3 }}>
                  <div style={{ width: `${count / total * 100}%`, height: '100%', background: '#c9a96e', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', width: 20 }}>{count}</span>
              </div>
            </div>
          ))}
          {Object.keys(parArr).length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>Aucune donnée</div>}
        </div>
      </div>

      {/* Alertes */}
      {aRelancer.length > 0 && (
        <div style={{ ...cardStyle('#f97316'), marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>⚠️ Clients à relancer (+30 jours sans visite)</div>
          {aRelancer.map(e => (
            <div key={e.id} style={{ padding: '6px 0', borderBottom: '1px solid #2d3148', fontSize: 12, color: '#94a3b8' }}>
              {e.nom} · {e.type} · {e.arrondissement}
            </div>
          ))}
        </div>
      )}

      {/* Prochaines visites */}
      {prochainesVisites.length > 0 && (
        <div style={cardStyle('#60a5fa')}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>📅 Prochaines visites planifiées</div>
          {prochainesVisites.slice(0, 5).map((v, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2d3148', fontSize: 12 }}>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{v.etablissement}</span>
              <span style={{ color: '#60a5fa' }}>{new Date(v.prochaine_visite).toLocaleDateString('fr-FR')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
