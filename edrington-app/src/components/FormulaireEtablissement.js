import React, { useState, useEffect } from 'react'
import { supabase, TYPES, CATEGORIES, STATUTS, POTENTIELS } from '../supabase'

export default function FormulaireEtablissement({ etab, onSaved, onCancel }) {
  const [form, setForm] = useState({
    nom: '', adresse: '', arrondissement: '', telephone: '', email: '', site_web: '',
    type: 'Restaurant', categorie: 'Premium', statut: 'Prospect froid', potentiel: 'Moyen',
    latitude: '', longitude: '', notes: '',
    interlocuteur_nom: '', interlocuteur_poste: '', interlocuteur_tel: '', interlocuteur_email: '',
  })
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    if (etab) {
      setForm({
        nom: etab.nom || '', adresse: etab.adresse || '', arrondissement: etab.arrondissement || '',
        telephone: etab.telephone || '', email: etab.email || '', site_web: etab.site_web || '',
        type: etab.type || 'Restaurant', categorie: etab.categorie || 'Premium',
        statut: etab.statut || 'Prospect froid', potentiel: etab.potentiel || 'Moyen',
        latitude: etab.latitude || '', longitude: etab.longitude || '', notes: etab.notes || '',
        interlocuteur_nom: etab.interlocuteur_nom || '', interlocuteur_poste: etab.interlocuteur_poste || '',
        interlocuteur_tel: etab.interlocuteur_tel || '', interlocuteur_email: etab.interlocuteur_email || '',
      })
    }
  }, [etab])

  async function geocodeAdresse() {
    if (!form.adresse) return
    setGeocoding(true)
    try {
      const query = encodeURIComponent(`${form.adresse}, Paris, France`)
      const token = process.env.REACT_APP_MAPBOX_TOKEN
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`)
      const data = await res.json()
      if (data.features?.[0]) {
        const [lng, lat] = data.features[0].center
        setForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
      }
    } catch (e) { }
    setGeocoding(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    }
    if (etab) {
      await supabase.from('etablissements').update(payload).eq('id', etab.id)
    } else {
      await supabase.from('etablissements').insert(payload)
    }
    setSaving(false)
    onSaved()
  }

  const inputStyle = { background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, padding: '8px 10px', color: '#f1f5f9', fontSize: 13, width: '100%', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block', fontWeight: 500 }
  const sectionStyle = { marginBottom: 20 }
  const sectionTitle = (title) => <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a96e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #2d3148' }}>{title}</div>

  return (
    <form onSubmit={handleSubmit} style={{ padding: '0 20px 24px' }}>
      <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: 16 }}>{etab ? 'Modifier' : 'Nouvel établissement'}</h3>

      <div style={sectionStyle}>
        {sectionTitle('Informations générales')}
        <div style={{ display: 'grid', gap: 10 }}>
          <div><label style={labelStyle}>Nom *</label><input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} placeholder="Ex: Le Bristol" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Catégorie</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Statut</label>
              <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} style={inputStyle}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Potentiel</label>
              <select value={form.potentiel} onChange={e => setForm(f => ({ ...f, potentiel: e.target.value }))} style={inputStyle}>
                {POTENTIELS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        {sectionTitle('Localisation')}
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Adresse</label><input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} style={inputStyle} placeholder="57 Rue d'Anjou" /></div>
            <button type="button" onClick={geocodeAdresse} disabled={geocoding}
              style={{ marginTop: 18, background: '#1e2340', border: '1px solid #2d3148', borderRadius: 6, padding: '8px 12px', color: '#c9a96e', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', height: 37 }}>
              {geocoding ? '...' : '📍 Localiser'}
            </button>
          </div>
          <div><label style={labelStyle}>Arrondissement</label>
            <select value={form.arrondissement} onChange={e => setForm(f => ({ ...f, arrondissement: e.target.value }))} style={inputStyle}>
              <option value="">Sélectionner</option>
              <option>8ème</option><option>16ème</option><option>17ème</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Latitude</label><input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} style={inputStyle} placeholder="48.8737" /></div>
            <div><label style={labelStyle}>Longitude</label><input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} style={inputStyle} placeholder="2.3088" /></div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        {sectionTitle('Contact établissement')}
        <div style={{ display: 'grid', gap: 10 }}>
          <div><label style={labelStyle}>Téléphone</label><input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} style={inputStyle} placeholder="+33 1 XX XX XX XX" /></div>
          <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Site web</label><input value={form.site_web} onChange={e => setForm(f => ({ ...f, site_web: e.target.value }))} style={inputStyle} placeholder="https://..." /></div>
        </div>
      </div>

      <div style={sectionStyle}>
        {sectionTitle('Interlocuteur')}
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Nom</label><input value={form.interlocuteur_nom} onChange={e => setForm(f => ({ ...f, interlocuteur_nom: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Poste</label><input value={form.interlocuteur_poste} onChange={e => setForm(f => ({ ...f, interlocuteur_poste: e.target.value }))} style={inputStyle} placeholder="Bar Manager" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Tél direct</label><input value={form.interlocuteur_tel} onChange={e => setForm(f => ({ ...f, interlocuteur_tel: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Email direct</label><input type="email" value={form.interlocuteur_email} onChange={e => setForm(f => ({ ...f, interlocuteur_email: e.target.value }))} style={inputStyle} /></div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        {sectionTitle('Notes')}
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Observations, opportunités, contexte..." />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #c9a96e, #8b6914)', border: 'none', borderRadius: 8, padding: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          {saving ? 'Enregistrement...' : etab ? 'Mettre à jour' : 'Créer l\'établissement'}
        </button>
        <button type="button" onClick={onCancel} style={{ background: '#2d3148', border: 'none', borderRadius: 8, padding: '10px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>
          Annuler
        </button>
      </div>
    </form>
  )
}
