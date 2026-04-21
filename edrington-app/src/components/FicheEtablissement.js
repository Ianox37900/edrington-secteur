import React, { useState } from 'react'
import { supabase, PRODUITS, RESULTATS, STATUT_COLORS } from '../supabase'
import { Edit2, Trash2, Plus, Phone, Mail, Globe, MapPin, User, Calendar, Package, FileText, ChevronDown, ChevronUp } from 'lucide-react'

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
      {/* Header */}
      <div style={{ borderBottom: '1px solid #2d3148', paddingBottom: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{etab.nom}</h2>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{etab.type} · {etab.categorie}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} style={{ background: '#2d3148', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={14} /></button>
            <button onClick={onDelete} style={{ background: '#2d1a1a', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
        </div>
        <span style={{ background: color, color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{etab.statut}</span>
        {etab.potentiel && <span style={{ background: '#1e2340', color: '#c9a96e', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, marginLeft: 6 }}>Potentiel : {etab.potentiel}</span>}
      </div>

      {/* Infos contact */}
      <div style={{ marginBottom: 20 }}>
        {sectionTitle('Contact', <MapPin size={12} />)}
        <div style={{ display: 'grid', gap: 6 }}>
          {etab.adresse && <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#94a3b8' }}><MapPin size={13} style={{ flexShrink: 0 }} />{etab.adresse}{etab.arrondissement ? ` · ${etab.arrondissement}` : ''}</div>}
          {etab.telephone && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Phone size={13} style={{ flexShrink: 0, color: '#c9a96e' }} /><a href={`tel:${etab.telephone}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{etab.telephone}</a></div>}
          {etab.email && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Mail size={13} style={{ flexShrink: 0, color: '#c9a96e' }} /><a href={`mailto:${etab.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{etab.email}</a></div>}
          {etab.site_web && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Globe size={13} style={{ flexShrink: 0, color: '#c9a96e' }} /><a href={etab.site_web} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>{etab.site_web}</a></div>}
        </div>
      </div>

      {/* Interlocuteur */}
      {etab.interlocuteur_nom && (
        <div style={{ marginBottom: 20, background: '#0f1117', borderRadius: 8, padding: 12 }}>
          {sectionTitle('Interlocuteur', <User size={12} />)}
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{etab.interlocuteur_nom} {etab.interlocuteur_poste ? `· ${etab.interlocuteur_poste}` : ''}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {etab.interlocuteur_tel && <a href={`tel:${etab.interlocuteur_tel}`} style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none' }}>{etab.interlocuteur_tel}</a>}
            {etab.interlocuteur_email && <a href={`mailto:${etab.interlocuteur_email}`} style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none' }}>{etab.interlocuteur_email}</a>}
          </div>
        </div>
      )}

      {/* Notes */}
      {etab.notes && (
        <div style={{ marginBottom: 20, background: '#0f1117', borderRadius: 8, padding: 12 }}>
          {sectionTitle('Notes', <FileText size={12} />)}
          <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>{etab.notes}</div>
        </div>
      )}

      {/* Produits */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          {sectionTitle(`Produits référencés (${totalVolume} btl/mois)`, <Package size={12} />)}
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
                <button onClick={saveProduit} style={{ flex: 1, background: 'linear-gradient(135deg, #c9a96e, #8b6914)', border: 'none', borderRadius: 6, padding: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Enregistrer</button>
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
              <div style={{ fontWeight: 600, fontSize: 12, color: '#c9a96e' }}>{p.produit}</div>
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
                <button onClick={saveVisite} style={{ flex: 1, background: 'linear-gradient(135deg, #c9a96e, #8b6914)', border: 'none', borderRadius: 6, padding: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Enregistrer</button>
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{new Date(v.date_visite).toLocaleDateString('fr-FR')}</span>
                    <span style={{ background: resultColors[v.resultat], color: 'white', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>{v.resultat}</span>
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
