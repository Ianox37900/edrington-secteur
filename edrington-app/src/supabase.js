import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const PRODUITS = [
  'The Macallan 12 Double Cask',
  'The Macallan 12 Sherry Oak',
  'The Macallan 15 Double Cask',
  'The Macallan 18 Double Cask',
  'The Macallan 18 Sherry Oak',
  'The Macallan 25 Sherry Oak',
  'The Macallan Rare Cask',
  'The Macallan Edition',
  'Highland Park 12',
  'Highland Park 18',
  'Highland Park 25',
  'The Glenrothes 10',
  'The Glenrothes 12',
  'Brugal 1888',
  'Brugal Extra Viejo',
  'Brugal Anejo',
  'Wyoming Whiskey Small Batch',
  'Valdespino Sherry',
  'No.3 London Dry Gin',
]

export const STATUTS = ['Client actif', 'Prospect chaud', 'Prospect froid', 'Inactif', 'Perdu']
export const TYPES = ['Bar', 'Restaurant', 'Caviste', 'Hotel', 'Club', 'Autre']
export const CATEGORIES = ['Palace', 'Haut de gamme', 'Premium', 'Standard']
export const POTENTIELS = ['Faible', 'Moyen', 'Fort', 'Très fort']
export const RESULTATS = ['Gagné', 'En cours', 'Refus', 'Relance']

export const STATUT_COLORS = {
  'Client actif': '#22c55e',
  'Prospect chaud': '#f97316',
  'Prospect froid': '#60a5fa',
  'Inactif': '#9ca3af',
  'Perdu': '#ef4444',
}
