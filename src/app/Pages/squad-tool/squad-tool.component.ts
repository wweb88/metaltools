import { Component , OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

interface Avion {
  nombre: string;
  nivel: number;
  specialSkill: number;
  passiveAbility: number;
}

interface Jugador {
  jugador: string;
  aviones: Avion[];
}

interface PlaneInfo {
  name: string;
  subName: string;
  type: string;
  image: string;
  imageBig: string;
}

interface TypeInfo {
  name: string;
  image: string;
}

interface ResultadoTabla {
  id: string;
  tipo: string;
  imagenTipo: string;
  nombreCompleto: string;
  imagenAvion: string;
  imagenBig: string;
  jugador: string;
  nivel: number;
  specialSkill: number;
  passiveAbility: number;
  seleccionado?: boolean;
}

@Component({
  selector: 'app-squad-tool',
  imports: [ButtonModule, CommonModule, FormsModule, Select, Checkbox, TableModule , Breadcrumb, DialogModule],
  templateUrl: './squad-tool.component.html',
  styleUrl: './squad-tool.component.sass',
})
export class SquadToolComponent implements OnInit {
  title = 'metalstorm';
  excelData: any[] = [];
  fileName: string = '';
  jugadores: Jugador[] = [];
  urlGoogle: string = '';
  cargando: boolean = false;
  errorMensaje: string = '';
  mostrarModalPlantilla: boolean = false;
  mostrarModalFiltros: boolean = false;
  alertaModal: string = '';
  terminoBusqueda: string = '';
  resultadosFiltrados: ResultadoTabla[] = [];
  
  // Datos del dataInfo.json - hardcoded para evitar problemas con BOM
  tiposAviones: string[] = [
    'Light Fighter',
    'Medium Fighter',
    'Heavy Fighter',
    'Interceptor',
    'Attack'
  ];
  
  tiposInfo: TypeInfo[] = [
    { name: 'Light Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-light-fighter-bg.png' },
    { name: 'Medium Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-medium-fighter-bg.png' },
    { name: 'Heavy Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-heavy-fighter-bg.png' },
    { name: 'Interceptor', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-interceptor-bg.png' },
    { name: 'Attack', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-attack-bg.png' }
  ];
  
  planesInfo: PlaneInfo[] = [];
  
  // Filtros
  nivelesDisponibles = Array.from({ length: 20 }, (_, i) => ({ label: `Nivel ${i + 1}`, value: i + 1 }));
  usuariosDisponibles: { label: string; value: string }[] = [];
  nivelSeleccionado: number | null = null;
  usuarioSeleccionado: string | null = null;
  tiposSeleccionados: string[] = [];
  
  // Resultados
  resultadosTabla: ResultadoTabla[] = [];
  seleccionados: ResultadoTabla[] = [];


  items: MenuItem[] | undefined;

  home: MenuItem | undefined;
  
  constructor( private http: HttpClient ) {
    this.cargarDataInfo();
  }

  ngOnInit() {
    this.items = [
      { label: 'SQUAD Tool' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }

  cargarDesdeUrl(): void {
    if (!this.urlGoogle.trim()) {
      this.errorMensaje = 'Por favor, ingresa una URL válida';
      return;
    }

    // Extraer el ID del Google Sheets desde la URL
    const spreadsheetId = this.extraerIdDelGoogle(this.urlGoogle);
    
    if (!spreadsheetId) {
      this.errorMensaje = 'URL inválida. Asegúrate de que sea una URL válida de Google Sheets';
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;
    this.leerExcelDesdeGoogle(spreadsheetId);
  }

  private extraerIdDelGoogle(url: string): string | null {
    // Patrón para extraer el ID del Google Sheets
    const patron = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const coincidencia = url.match(patron);
    return coincidencia ? coincidencia[1] : null;
  }

  private leerExcelDesdeGoogle(spreadsheetId: string) {
    // URL del Google Sheets exportado como Excel
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    
    this.http.get(url, { responseType: 'arraybuffer' }).subscribe(
      (data) => {
        try {
          const bstr = new Uint8Array(data);
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'array' });
          
          // Procesar cada pestaña (cada jugador)
          this.jugadores = wb.SheetNames.map(sheetName => {
            const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
            const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            
            // Procesar aviones: A=nombre, B=nivel, C=specialSkill, D=passiveAbility
            const aviones = dataRows
              .filter((row: any) => row[0] && row[1] !== undefined) // Filtrar filas válidas
              .map((row: any) => ({
                nombre: row[0],
                nivel: Number(row[1]) || 0,
                specialSkill: Number(row[2]) || 0,
                passiveAbility: Number(row[3]) || 0
              }))
              .filter(avion => avion.nivel > 0); // Solo aviones con nivel > 0
            
            return {
              jugador: sheetName,
              aviones: aviones
            };
          });
          
          console.log('=== DATOS DE JUGADORES (Cargados desde Google Sheets) ===');
          console.log(JSON.stringify(this.jugadores, null, 2));
          console.log('=========================================================');
          
          this.excelData = this.jugadores;
          this.actualizarUsuariosDisponibles();
          this.inicializarTiposSeleccionados();
          this.cargando = false;
        } catch (error) {
          console.error('Error al procesar el archivo de Google Sheets:', error);
        }
      },
      (error) => {
        console.error('Error al descargar el archivo de Google Sheets:', error);
        this.cargando = false;
        this.errorMensaje = 'Error al cargar el archivo. Verifica que la URL sea correcta y que el archivo sea accesible.';
        this.jugadores = [];
        this.resultadosTabla = [];
      }
    );
  }
  
  async cargarDataInfo() {
    try {
      const response = await fetch('/assets/files/dataInfo.json');
      const text = await response.text();
      
      // Remover BOM si existe
      const cleanText = text.replace(/^\uFEFF/, '');
      const data = JSON.parse(cleanText);
      this.planesInfo = data.planes as PlaneInfo[];
      console.log('Planes cargados:', this.planesInfo.length);
    } catch (error) {
      console.error('Error al cargar dataInfo.json:', error);
    }
  }


  actualizarUsuariosDisponibles(): void {
    this.usuariosDisponibles = this.jugadores.map(jugador => ({
      label: jugador.jugador,
      value: jugador.jugador
    }));
  }

  inicializarTiposSeleccionados(): void {
    this.tiposSeleccionados = [...this.tiposAviones];
  }

  onNivelChange(): void {
    this.aplicarFiltros();
  }

  onUsuarioChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.nivelSeleccionado = null;
    this.usuarioSeleccionado = null;
    this.tiposSeleccionados = [...this.tiposAviones];
    this.terminoBusqueda = '';
    this.seleccionados = [];
    this.resultadosTabla = [];
    this.resultadosFiltrados = [];
  }
  
  aplicarFiltros(): void {
    if (!this.nivelSeleccionado || this.tiposSeleccionados.length === 0) {
      this.resultadosTabla = [];
      this.aplicarBusqueda();
      return;
    }
    
    const resultados: ResultadoTabla[] = [];

    // Determinar qué jugadores filtrar
    const jugadoresAFiltrar = this.usuarioSeleccionado
      ? this.jugadores.filter(j => j.jugador === this.usuarioSeleccionado)
      : this.jugadores;
    
    // Recorrer cada jugador
    jugadoresAFiltrar.forEach(jugador => {
      const avionSeleccionadoDeEsteJugador = this.seleccionados.find(s => s.jugador === jugador.jugador);

      if (avionSeleccionadoDeEsteJugador) {
        // Solo mostrar el avión ya seleccionado (para que el usuario pueda desmarcarlo)
        resultados.push({ ...avionSeleccionadoDeEsteJugador, seleccionado: true });
        return;
      }

      // Recorrer cada avión del jugador
      jugador.aviones.forEach(avion => {
        // Verificar si el nivel coincide
        if (avion.nivel === this.nivelSeleccionado) {
          // Buscar información del avión en dataInfo
          const planeInfo = this.planesInfo.find(p => 
            p.name.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name} ${p.subName}`.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name}-${p.subName}`.toLowerCase() === avion.nombre.toLowerCase()
          );
          
          if (planeInfo && this.tiposSeleccionados.includes(planeInfo.type)) {
            const tipoInfo = this.tiposInfo.find(t => t.name === planeInfo.type);
            const id = `${planeInfo.name}-${planeInfo.subName}-${jugador.jugador}`;
            resultados.push({
              id: id,
              tipo: planeInfo.type,
              imagenTipo: tipoInfo?.image || '',
              nombreCompleto: `${planeInfo.name} ${planeInfo.subName}`,
              imagenAvion: planeInfo.image,
              imagenBig: planeInfo.imageBig ? `assets/images/planes/${planeInfo.imageBig}` : '',
              jugador: jugador.jugador,
              nivel: avion.nivel,
              specialSkill: avion.specialSkill,
              passiveAbility: avion.passiveAbility,
              seleccionado: false
            });
          }
        }
      });
    });
    
    // Ordenar: seleccionados primero, luego alfabético
    resultados.sort((a, b) => {
      if (a.seleccionado && !b.seleccionado) return -1;
      if (!a.seleccionado && b.seleccionado) return 1;
      return a.nombreCompleto.localeCompare(b.nombreCompleto);
    });
    
    this.resultadosTabla = resultados;
    this.aplicarBusqueda();
    console.log('Resultados filtrados:', resultados);
  }

  aplicarBusqueda(): void {
    if (!this.terminoBusqueda.trim()) {
      this.resultadosFiltrados = this.resultadosTabla;
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.resultadosFiltrados = this.resultadosTabla.filter(resultado => 
      resultado.nombreCompleto.toLowerCase().includes(termino) ||
      resultado.jugador.toLowerCase().includes(termino)
    );
  }
  
  onToggleSeleccion(resultado: ResultadoTabla): void {
    const index = this.seleccionados.findIndex(s => s.id === resultado.id);

    if (index > -1) {
      // Deseleccionar
      this.seleccionados.splice(index, 1);
      this.aplicarFiltros();
    } else {
      // Verificar si ya hay un avión del mismo tipo seleccionado
      const tipoYaSeleccionado = this.seleccionados.some(s => s.tipo === resultado.tipo);
      if (tipoYaSeleccionado) {
        // Deferir el reset para que Angular lo detecte como un cambio real
        setTimeout(() => { resultado.seleccionado = false; }, 0);
        this.mostrarAlertaModal(`Ya tienes un avión de tipo "${resultado.tipo}" en el equipo. Quítalo primero.`);
        return;
      }
      this.seleccionados.push({...resultado, seleccionado: true});
      this.aplicarFiltros();
    }
  }

  private mostrarAlertaModal(mensaje: string): void {
    this.alertaModal = mensaje;
    setTimeout(() => { this.alertaModal = ''; }, 4000);
  }

  descargarPlantilla(): void {
    const enlace = document.createElement('a');
    enlace.href = 'assets/files/planificacion-base.xlsx';
    enlace.download = 'planificacion-base.xlsx';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  abrirModalPlantilla(): void {
    this.mostrarModalPlantilla = true;
  }

  cerrarModalPlantilla(): void {
    this.mostrarModalPlantilla = false;
  }

  abrirModalFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  cerrarModalFiltros(): void {
    this.mostrarModalFiltros = false;
  }

  limpiarSeleccion(): void {
    this.seleccionados = [];
    this.aplicarFiltros();
  }

  removerSeleccionado(resultado: ResultadoTabla): void {
    const index = this.seleccionados.findIndex(s => s.id === resultado.id);
    if (index > -1) {
      this.seleccionados.splice(index, 1);
      this.aplicarFiltros();
    }
  }

  generarEquipoAleatorio(): void {
    if (!this.nivelSeleccionado) {
      return;
    }

    // Construir pool completo usando SOLO el nivel, ignorando otros filtros
    const pool: ResultadoTabla[] = [];
    const jugadoresUsados = new Set<string>();

    this.jugadores.forEach(jugador => {
      jugador.aviones.forEach(avion => {
        if (avion.nivel === this.nivelSeleccionado) {
          const planeInfo = this.planesInfo.find(p =>
            p.name.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name} ${p.subName}`.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name}-${p.subName}`.toLowerCase() === avion.nombre.toLowerCase()
          );
          if (planeInfo) {
            const tipoInfo = this.tiposInfo.find(t => t.name === planeInfo.type);
            pool.push({
              id: `${planeInfo.name}-${planeInfo.subName}-${jugador.jugador}`,
              tipo: planeInfo.type,
              imagenTipo: tipoInfo?.image || '',
              nombreCompleto: `${planeInfo.name} ${planeInfo.subName}`,
              imagenAvion: planeInfo.image,
              imagenBig: planeInfo.imageBig ? `assets/images/planes/${planeInfo.imageBig}` : '',
              jugador: jugador.jugador,
              nivel: avion.nivel,
              specialSkill: avion.specialSkill,
              passiveAbility: avion.passiveAbility,
              seleccionado: true
            });
          }
        }
      });
    });

    const equipoAleatorio: ResultadoTabla[] = [];

    // Para cada tipo de avión, elegir un avión aleatorio de un jugador no usado aún
    for (const tipo of this.tiposAviones) {
      const candidatos = pool.filter(r => r.tipo === tipo && !jugadoresUsados.has(r.jugador));
      if (candidatos.length > 0) {
        const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
        jugadoresUsados.add(elegido.jugador);
        equipoAleatorio.push(elegido);
      }
    }

    if (equipoAleatorio.length === this.tiposAviones.length) {
      this.seleccionados = equipoAleatorio;
      this.aplicarFiltros();
      this.cerrarModalFiltros();
    } else {
      this.mostrarAlertaModal('No se pudo generar un equipo completo. No hay suficientes jugadores con aviones para cada tipo en el nivel seleccionado.');
    }
  }
}
