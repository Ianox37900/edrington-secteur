import React, { useState } from 'react'
import { supabase, PRODUITS, RESULTATS, STATUT_COLORS } from '../supabase'
import { Edit2, Trash2, Plus, Phone, Mail, Globe, MapPin, User, Calendar, Package, FileText, ChevronDown, ChevronUp, Star } from 'lucide-react'

const POTENTIEL_CONFIG = {
  'Très fort': { stars: 4, color: '#22c55e', label: 'Très fort' },
  'Fort':      { stars: 3, color: '#c9a96e', label: 'Fort' },
  'Moyen':     { stars: 2, color: '#60a5fa', label: 'Moyen' },
  'Faible':    { stars: 1, color: '#9ca3af', label: 'Faible' },
}

function PriorityScore({ potentiel, statut }) {
  const cfg = POTENTIEL_CONFIG[potentiel] || POTENTIEL_CONFIG['Moyen']
  const statutBonus = statut === 'Client actif' ? 1 : statut === 'Prospect chaud' ? 0.5 : 0
  const score = Math.min(Math.round((cfg.stars / 4) * 100 + statutBonus * 10), 100)

  return (
    <div style={{ background: '#0f1117', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        Score de priorité
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Jauge circulaire */}
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="28" cy="28" r="22" fill="none" stroke="#2d3148" strokeWidth="5" />
            <circle cx="28" cy="28" r="22" fill="none" stroke={cfg.color} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - score / 100)}`}
              strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: cfg.color }}>
            {score}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {/* Étoiles */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            {[1,2,3,4].map(i => (
              <Star key={i} size={14} fill={i <= cfg.stars ? cfg.color : 'none'} color={i <= cfg.stars ? cfg.color : '#2d3148'} />
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            {statut === 'Client actif' ? '+10 pts client actif' : statut === 'Prospect chaud' ? '+5 pts prospect chaud' : 'Aucun bonus statut'}
          </div>
        </div>
      </div>
      {/* Barre de progression */}
      <div style={{ marginTop: 10, height: 5, background: '#2d3148', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

function PhotoHeader({ etab, color }) {

  // Google Places photo via Mapbox geocoding ou placeholder basé sur le type
  const typeEmojis = { 'Bar': '🍸', 'Restaurant': '🍽️', 'Caviste': '🍷', 'Hotel': '🏨', 'Club': '🎵', 'Autre': '📍' }
  const emoji = typeEmojis[etab.type] || '📍'

  // Photo via Google Static Map centrée sur l'adresse si coordonnées disponibles

  return (
    <div style={{ margin: '0 -20px', marginBottom: 16, position: 'relative', height: 120, overflow: 'hidden', background: 'linear-gradient(135deg, #1a1d2e, #0f1117)', borderBottom: `3px solid ${color}` }}>
      {/* Fond avec dégradé et emoji géant */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 64, opacity: 0.15 }}>{emoji}</div>
      </div>
      {/* Dégradé coloré selon statut */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}15, ${color}05)` }} />
      {/* Grille de points décorative */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      {/* Infos en overlay */}
      <div style={{ position: 'absolute', bottom: 12, left: 20, right: 20 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
          {emoji} {etab.type} · {etab.categorie} · {etab.arrondissement}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
          <span style={{ fontSize: 11, color: color, fontWeight: 700 }}>{etab.statut}</span>
          {etab.telephone && (
            <a href={`tel:${etab.telephone}`} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', color: '#f1f5f9', fontSize: 11, textDecoration: 'none', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
              📞 Appeler
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FicheEtablissement({ etab, onEdit, onDelete, onRefresh }) {
  const [showVisiteForm, setShowVisiteForm] = useState(false)
  const [showProduitForm, setShowProduitForm] = useState(false)
  const [showVisites, setShowVisites] = useState(true)
  const [visite, setVisite] = useState({ date_visite: new Date().toISOString().split('T')[0], objectif: '', resultat: 'En cours', compte_rendu: '', prochaine_visite: '' })
  const [produit, setProduit] = useState({ produit: PRODUITS[0], volume_mensuel: 0, prix_vente: '', date_referencement: '', notes: '' })

  const color = STATUT_COLORS[etab.statut] || '#9ca3af'
  const totalVolume = etab.produits_references?.reduce((s, p) => s + (p.volume_mensuel || 0), 0) || 0
  const visitesSorted = [...(etab.visites || [])].sort((a, b) => new Date(b.date_visite) - new Date(a.date_visite))

  async function saveVisite() {
    await supabase.from('visites').insert({ ...visite, etablissement_id: etab.id })
    setShowVisiteForm(false)
    setVisite({ date_visite: new Date().toISOString().split('T')[0], objectif: '', resultat: 'En cours', compte_rendu: '', prochaine_visite: '' })
    onRefresh()
  }

  async function saveProduit() {
    await supabase.from('produits_references').insert({ ...produit, etablissement_id: etab.id, volume_mensuel: Number(produit.volume_mensuel) })
    setShowProduitForm(false)
    setProduit({ produit: PRODUITS[0], volume_mensuel: 0, prix_vente: '', date_referencement: '', notes: '' })
    onRefresh()
  }

  async function deleteProduit(id) {
    await supabase.from('produits_references').delete().eq('id', id)
    onRefresh()
  }

  async function deleteVisite(id) {
    await supabase.from('visites').delete().eq('id', id)
    onRefresh()
  }

  const inputStyle = { background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, padding: '7px 10px', color: '#f1f5f9', fontSize: 12, width: '100%', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11, color: '#64748b', marginBottom: 3, display: 'block' }
  const sectionTitle = (title, icon) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon}{title}
    </div>
  )

  return (
    <div style={{ padding: '0 20px 24px', fontSize: 13 }}>

      {/* Photo / Header visuel */}
      <PhotoHeader etab={etab} color={color} />

      {/* Titre + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>{etab.nom}</h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ background: '#2d3148', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={14} /></button>
          <button onClick={onDelete} style={{ background: '#2d1a1a', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Score de priorité */}
      <PriorityScore potentiel={etab.potentiel} statut={etab.statut} />

      {/* Infos contact */}
      <div style={{ marginBottom: 18 }}>
        {sectionTitle('Contact', <MapPin size={12} />)}
        <div style={{ display: 'grid', gap: 6 }}>
          {etab.adresse && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(etab.adresse + ' Paris')}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#60a5fa', textDecoration: 'none', fontSize: 12 }}>
              <MapPin size={13} style={{ flexShrink: 0, color: '#c9a96e' }} />
              {etab.adresse}{etab.arrondissement ? ` · ${etab.arrondissement}` : ''}
            </a>
          )}
          {etab.telephone && (
            <a href={`tel:${etab.telephone}`} style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#60a5fa', textDecoration: 'none', fontSize: 12 }}>
              <Phone size={13} style={{ flexShrink: 0, color: '#c9a96e' }} />
              {etab.telephone}
            </a>
          )}
          {etab.email && (
            <a href={`mailto:${etab.email}`} style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#60a5fa', textDecoration: 'none', fontSize: 12 }}>
              <Mail size={13} style={{ flexShrink: 0, color: '#c9a96e' }} />
              {etab.email}
            </a>
          )}
          {etab.site_web && (
            <a href={etab.site_web} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#60a5fa', textDecoration: 'none', fontSize: 12 }}>
              <Globe size={13} style={{ flexShrink: 0, color: '#c9a96e' }} />
              {etab.site_web.replace('https://', '').replace('http://', '')}
            </a>
          )}
        </div>
      </div>

      {/* Interlocuteur */}
      {etab.interlocuteur_nom && (
        <div style={{ marginBottom: 18, background: '#0f1117', borderRadius: 8, padding: 12 }}>
          {sectionTitle('Interlocuteur', <User size={12} />)}
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{etab.interlocuteur_nom}
            {etab.interlocuteur_poste && <span style={{ fontWeight: 400, color: '#64748b', fontSize: 12 }}> · {etab.interlocuteur_poste}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {etab.interlocuteur_tel && <a href={`tel:${etab.interlocuteur_tel}`} style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{etab.interlocuteur_tel}</a>}
            {etab.interlocuteur_email && <a href={`mailto:${etab.interlocuteur_email}`} style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{etab.interlocuteur_email}</a>}
          </div>
        </div>
      )}

      {/* Notes */}
      {etab.notes && (
        <div style={{ marginBottom: 18, background: '#0f1117', borderRadius: 8, padding: 12, borderLeft: '3px solid #c9a96e' }}>
          {sectionTitle('Notes', <FileText size={12} />)}
          <div style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: 12 }}>{etab.notes}</div>
        </div>
      )}

      {/* Produits */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          {sectionTitle(`Produits (${totalVolume} btl/mois)`, <Package size={12} />)}
          <button onClick={() => setShowProduitForm(!showProduitForm)} style={{ background: '#1e2340', border: '1px solid #2d3148', borderRadius: 6, padding: '4px 10px', color: '#c9a96e', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={12} /> Ajouter
          </button>
        </div>
        {showProduitForm && (
          <div style={{ background: '#0f1117', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div><label style={labelStyle}>Produit</label>
                <select value={produit.produit} onChange={e => setProduit(p => ({ ...p, produit: e.target.value }))} style={inputStyle}>
                  {PRODUITS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Volume (btl/mois)</label><input type="number" value={produit.volume_mensuel} onChange={e => setProduit(p => ({ ...p, volume_mensuel: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Prix vente (€)</label><input type="number" value={produit.prix_vente} onChange={e => setProduit(p => ({ ...p, prix_vente: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Date référencement</label><input type="date" value={produit.date_referencement} onChange={e => setProduit(p => ({ ...p, date_referencement: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Notes</label><input value={produit.notes} onChange={e => setProduit(p => ({ ...p, notes: e.target.value }))} style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveProduit} style={{ flex: 1, background: 'linear-gradient(135deg,#c9a96e,#8b6914)', border: 'none', borderRadius: 6, padding: 8, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Enregistrer</button>
                <button onClick={() => setShowProduitForm(false)} style={{ background: '#2d3148', border: 'none', borderRadius: 6, padding: '8px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Annuler</button>
              </div>
            </div>
          </div>
        )}
        {etab.produits_references?.length === 0 && !showProduitForm && (
          <div style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>Aucun produit référencé</div>
        )}
        {etab.produits_references?.map(p => (
          <div key={p.id} style={{ background: '#0f1117', borderRadius: 8, padding: '10px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#c9a96e' }}>{p.produit}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                {p.volume_mensuel > 0 && `${p.volume_mensuel} btl/mois`}
                {p.prix_vente && ` · ${p.prix_vente}€`}
                {p.date_referencement && ` · depuis ${new Date(p.date_referencement).toLocaleDateString('fr-FR')}`}
              </div>
              {p.notes && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{p.notes}</div>}
            </div>
            <button onClick={() => deleteProduit(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, padding: 4 }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      {/* Visites */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button onClick={() => setShowVisites(!showVisites)} style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: 0 }}>
            <Calendar size={12} />Visites ({visitesSorted.length}) {showVisites ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button onClick={() => setShowVisiteForm(!showVisiteForm)} style={{ background: '#1e2340', border: '1px solid #2d3148', borderRadius: 6, padding: '4px 10px', color: '#c9a96e', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={12} /> Nouvelle visite
          </button>
        </div>
        {showVisiteForm && (
          <div style={{ background: '#0f1117', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Date de visite</label><input type="date" value={visite.date_visite} onChange={e => setVisite(v => ({ ...v, date_visite: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Résultat</label>
                  <select value={visite.resultat} onChange={e => setVisite(v => ({ ...v, resultat: e.target.value }))} style={inputStyle}>
                    {RESULTATS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={labelStyle}>Objectif</label><input value={visite.objectif} onChange={e => setVisite(v => ({ ...v, objectif: e.target.value }))} style={inputStyle} placeholder="Ex: Référencement Macallan 18" /></div>
              <div><label style={labelStyle}>Compte-rendu</label><textarea value={visite.compte_rendu} onChange={e => setVisite(v => ({ ...v, compte_rendu: e.target.value }))} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Notes de visite..." /></div>
              <div><label style={labelStyle}>Prochaine visite</label><input type="date" value={visite.prochaine_visite} onChange={e => setVisite(v => ({ ...v, prochaine_visite: e.target.value }))} style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveVisite} style={{ flex: 1, background: 'linear-gradient(135deg,#c9a96e,#8b6914)', border: 'none', borderRadius: 6, padding: 8, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Enregistrer</button>
                <button onClick={() => setShowVisiteForm(false)} style={{ background: '#2d3148', border: 'none', borderRadius: 6, padding: '8px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Annuler</button>
              </div>
            </div>
          </div>
        )}
        {showVisites && visitesSorted.map(v => {
          const resultColors = { 'Gagné': '#22c55e', 'En cours': '#f97316', 'Refus': '#ef4444', 'Relance': '#60a5fa' }
          return (
            <div key={v.id} style={{ background: '#0f1117', borderRadius: 8, padding: '10px 12px', marginBottom: 6, borderLeft: `3px solid ${resultColors[v.resultat] || '#64748b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 12 }}>{new Date(v.date_visite).toLocaleDateString('fr-FR')}</span>
                    <span style={{ background: resultColors[v.resultat], color: 'white', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{v.resultat}</span>
                  </div>
                  {v.objectif && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>🎯 {v.objectif}</div>}
                  {v.compte_rendu && <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{v.compte_rendu}</div>}
                  {v.prochaine_visite && <div style={{ fontSize: 11, color: '#c9a96e', marginTop: 4 }}>📅 Prochain RDV : {new Date(v.prochaine_visite).toLocaleDateString('fr-FR')}</div>}
                </div>
                <button onClick={() => deleteVisite(v.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5, padding: 4 }}><Trash2 size={12} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
