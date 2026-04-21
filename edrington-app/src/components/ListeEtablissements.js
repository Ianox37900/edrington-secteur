import React from 'react'
import { STATUT_COLORS } from '../supabase'
import { MapPin, Phone, User, Package, Calendar } from 'lucide-react'

export default function ListeEtablissements({ etablissements, onSelect, selected, onEdit }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 16 }}>
      {etablissements.length === 0 && (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 14 }}>
          Aucun établissement trouvé.<br />
          <span style={{ fontSize: 12 }}>Cliquez sur "Ajouter" pour commencer.</span>
        </div>
      )}
      <div style={{ display: 'grid', gap: 10 }}>
        {etablissements.map(etab => {
          const color = STATUT_COLORS[etab.statut] || '#9ca3af'
          const isSelected = selected?.id === etab.id
          const totalVolume = etab.produits_references?.reduce((s, p) => s + (p.volume_mensuel || 0), 0) || 0
          const derniereVisite = etab.visites?.sort((a, b) => new Date(b.date_visite) - new Date(a.date_visite))[0]

          return (
            <div key={etab.id} onClick={() => onSelect(etab)}
              style={{ background: isSelected ? '#1e2340' : '#1a1d2e', border: `1px solid ${isSelected ? '#c9a96e' : '#2d3148'}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 2 }}>{etab.nom}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{etab.type} · {etab.categorie} · {etab.arrondissement}</div>
                </div>
                <span style={{ background: color, color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{etab.statut}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {etab.adresse && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}><MapPin size={11} />{etab.adresse}</div>}
                {etab.telephone && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}><Phone size={11} />{etab.telephone}</div>}
                {etab.interlocuteur_nom && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}><User size={11} />{etab.interlocuteur_nom}</div>}
                {totalVolume > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#c9a96e' }}><Package size={11} />{totalVolume} btl/mois</div>}
                {derniereVisite && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}><Calendar size={11} />Visite : {new Date(derniereVisite.date_visite).toLocaleDateString('fr-FR')}</div>}
              </div>
              {etab.produits_references?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {etab.produits_references.map(p => (
                    <span key={p.id} style={{ background: '#0f1117', border: '1px solid #2d3148', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#c9a96e' }}>{p.produit.replace('The Macallan', 'TM').replace('Highland Park', 'HP')}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
