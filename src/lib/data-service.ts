import * as XLSX from 'xlsx';

export interface Avion {
  nombre: string;
  nivel: number;
  specialSkill: number;
  passiveAbility: number;
}

export interface Jugador {
  jugador: string;
  aviones: Avion[];
}

export interface ModInfo {
  id: number;
  image: string;
}

export interface ModGameInfo {
  id: number;
  image: string;
}

export interface PlaneModGame {
  idModsGame: number;
  mods: number[];
  tacticalImage?: string;
}

export interface PlaneInfo {
  name: string;
  subName: string;
  type: string;
  image: string;
  imageBig: string;
  tacticalImages?: string[];
  mods?: number[];
  modsGame?: PlaneModGame[];
}

export interface TypeInfo {
  name: string;
  image: string;
}

export interface StreamerSocials {
  twitch?: string;
  youtube?: string;
  tiktok?: string;
  kick?: string;
  instagram?: string;
  twitter?: string;
  discord?: string;
  facebook?: string;
  web?: string;
}

export interface StreamerInfo {
  id: number | string;
  name: string;
  tag?: string;
  avatar: string;
  language?: string;
  description: string | { es: string; en: string };
  socials: StreamerSocials;
}

export const TIPOS_AVIONES = [
  'Light Fighter',
  'Medium Fighter',
  'Heavy Fighter',
  'Interceptor',
  'Attack'
];

export const TIPOS_INFO: TypeInfo[] = [
  { name: 'Light Fighter', image: '/assets/planes/roles/role-light-fighter-bg.png' },
  { name: 'Medium Fighter', image: '/assets/planes/roles/role-medium-fighter-bg.png' },
  { name: 'Heavy Fighter', image: '/assets/planes/roles/role-heavy-fighter-bg.png' },
  { name: 'Interceptor', image: '/assets/planes/roles/role-interceptor-bg.png' },
  { name: 'Attack', image: '/assets/planes/roles/role-attack-bg.png' }
];

export async function fetchPlanesInfo(): Promise<PlaneInfo[]> {
  try {
    const response = await fetch('/assets/files/dataInfo.json');
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const cleanText = text.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanText);
    return data.planes as PlaneInfo[];
  } catch (error) {
    console.error('Error fetching dataInfo.json:', error);
    return [];
  }
}

export async function fetchModsInfo(): Promise<ModInfo[]> {
  try {
    const response = await fetch('/assets/files/dataInfo.json');
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const cleanText = text.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanText);
    return (data.mods || []) as ModInfo[];
  } catch (error) {
    console.error('Error fetching mods from dataInfo.json:', error);
    return [];
  }
}

export async function fetchModsGamesInfo(): Promise<ModGameInfo[]> {
  try {
    const response = await fetch('/assets/files/dataInfo.json');
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const cleanText = text.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanText);
    return (data.modsGames || []) as ModGameInfo[];
  } catch (error) {
    console.error('Error fetching modsGames from dataInfo.json:', error);
    return [];
  }
}

export async function fetchStreamersInfo(): Promise<StreamerInfo[]> {
  try {
    const response = await fetch('/assets/files/streamers.json');
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const cleanText = text.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanText);
    return (data.streamers || []) as StreamerInfo[];
  } catch (error) {
    console.error('Error fetching streamers from streamers.json:', error);
    return [];
  }
}

export function extractGoogleSheetId(url: string): string | null {
  const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function fetchPlayersFromGoogleSheet(spreadsheetId: string): Promise<Jugador[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch Google Sheet");
    
    const arrayBuffer = await response.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    
    const jugadores: Jugador[] = wb.SheetNames.map(sheetName => {
      const ws = wb.Sheets[sheetName];
      const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const aviones = dataRows
        .filter((row) => row[0] && row[1] !== undefined)
        .map((row) => ({
          nombre: row[0] ? String(row[0]) : '',
          nivel: Number(row[1]) || 0,
          specialSkill: Number(row[2]) || 0,
          passiveAbility: Number(row[3]) || 0
        }))
        .filter(avion => avion.nivel > 0);
      
      return {
        jugador: sheetName,
        aviones: aviones
      };
    });
    
    return jugadores;
  } catch (error) {
    console.error('Error processing Google Sheet:', error);
    throw error;
  }
}
