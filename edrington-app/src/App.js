import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Carte from './components/Carte'
import ListeEtablissements from './components/ListeEtablissements'
import FicheEtablissement from './components/FicheEtablissement'
import FormulaireEtablissement from './components/FormulaireEtablissement'
import Dashboard from './components/Dashboard'
import { MapPin, LayoutList, BarChart2, Plus, X } from 'lucide-react'

export default function App() {
  const [vue, setVue] = useState('carte')
  const [etablissements, setEtablissements] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ statut: '', type: '', search: '' })

  useEffect(() => { fetchEtablissements() }, [])

  async function fetchEtablissements() {
    setLoading(true)
    const { data } = await supabase
      .from('etablissements')
      .select('*, produits_references(*), visites(*)')
      .order('nom')
    setEtablissements(data || [])
    setLoading(false)
  }

  function handleSelect(etab) {
    setSelected(etab)
    setShowForm(false)
  }

  function handleEdit(etab) {
    setEditTarget(etab)
    setShowForm(true)
    setSelected(null)
  }

  function handleNew() {
    setEditTarget(null)
    setShowForm(true)
    setSelected(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet établissement ?')) return
    await supabase.from('etablissements').delete().eq('id', id)
    setSelected(null)
    fetchEtablissements()
  }

  function handleSaved() {
    setShowForm(false)
    setEditTarget(null)
    fetchEtablissements()
  }

  const filtered = etablissements.filter(e => {
    if (filters.statut && e.statut !== filters.statut) return false
    if (filters.type && e.type !== filters.type) return false
    if (filters.search && !e.nom.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1117', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#1a1d2e', borderBottom: '1px solid #2d3148', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #c9a96e, #8b6914)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥃</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#c9a96e' }}>Edrington — Mon Secteur</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>8e · 16e · 17e arrondissements</div>
          </div>
        </div>
        <button onClick={handleNew} style={{ background: 'linear-gradient(135deg, #c9a96e, #8b6914)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Plus size={16} /> Ajouter
        </button>
      </header>

      {/* Nav */}
      <nav style={{ background: '#1a1d2e', borderBottom: '1px solid #2d3148', display: 'flex', padding: '0 20px', flexShrink: 0 }}>
        {[
          { id: 'carte', icon: <MapPin size={15} />, label: 'Carte' },
          { id: 'liste', icon: <LayoutList size={15} />, label: 'Liste' },
          { id: 'dashboard', icon: <BarChart2 size={15} />, label: 'Dashboard' },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setVue(tab.id); setSelected(null); setShowForm(false) }}
            style={{ background: 'none', border: 'none', padding: '12px 16px', color: vue === tab.id ? '#c9a96e' : '#64748b', fontWeight: vue === tab.id ? 700 : 400, cursor: 'pointer', borderBottom: vue === tab.id ? '2px solid #c9a96e' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, transition: 'all 0.15s' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
          <input placeholder="Rechercher..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, padding: '5px 10px', color: '#f1f5f9', fontSize: 12, width: 140 }} />
          <select value={filters.statut} onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))}
            style={{ background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, padding: '5px 10px', color: '#f1f5f9', fontSize: 12 }}>
            <option value="">Tous statuts</option>
            {['Client actif', 'Prospect chaud', 'Prospect froid', 'Inactif', 'Perdu'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            style={{ background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, padding: '5px 10px', color: '#f1f5f9', fontSize: 12 }}>
            <option value="">Tous types</option>
            {['Bar', 'Restaurant', 'Caviste', 'Hotel', 'Club', 'Autre'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Vue principale */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>Chargement...</div>
          ) : vue === 'carte' ? (
            <Carte etablissements={filtered} onSelect={handleSelect} selected={selected} />
          ) : vue === 'liste' ? (
            <ListeEtablissements etablissements={filtered} onSelect={handleSelect} selected={selected} onEdit={handleEdit} />
          ) : (
            <Dashboard etablissements={etablissements} />
          )}
        </div>

        {/* Panel latéral */}
        {(selected || showForm) && (
          <div style={{ width: 420, background: '#1a1d2e', borderLeft: '1px solid #2d3148', overflow: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
              <button onClick={() => { setSelected(null); setShowForm(false) }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            {showForm ? (
              <FormulaireEtablissement etab={editTarget} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditTarget(null) }} />
            ) : selected ? (
              <FicheEtablissement etab={selected} onEdit={() => handleEdit(selected)} onDelete={() => handleDelete(selected.id)} onRefresh={fetchEtablissements} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
