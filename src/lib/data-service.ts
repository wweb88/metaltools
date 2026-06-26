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

export interface PlaneInfo {
  name: string;
  subName: string;
  type: string;
  image: string;
  imageBig: string;
}

export interface TypeInfo {
  name: string;
  image: string;
}

export const TIPOS_AVIONES = [
  'Light Fighter',
  'Medium Fighter',
  'Heavy Fighter',
  'Interceptor',
  'Attack'
];

export const TIPOS_INFO: TypeInfo[] = [
  { name: 'Light Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-light-fighter-bg.png' },
  { name: 'Medium Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-medium-fighter-bg.png' },
  { name: 'Heavy Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-heavy-fighter-bg.png' },
  { name: 'Interceptor', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-interceptor-bg.png' },
  { name: 'Attack', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-attack-bg.png' }
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
