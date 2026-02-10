import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Patient } from '../../../models';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css'
})
export class PatientListComponent implements OnInit {

  patients: Patient[] = [];
  filtered: Patient[] = [];

  /** IDs seleccionados (checkbox) */
  selected: Set<string> = new Set();

  searchTerm = '';
  isLoading = false;

  /** Texto visible en la UI (modo debug) */
  debugMsg = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.load();
  }

  /**
   * Carga robusta:
   * - Normaliza respuestas (array, paginado, wrapper)
   * - Nunca deja la UI en "Cargando..." (finalize + watchdog)
   * - Fuerza refresco visual incluso si algo ejecuta fuera de Zone
   */
  load(): void {
    const startedAt = Date.now();

    this.isLoading = true;
    this.debugMsg = 'Cargando pacientes...';
    this.cdr.detectChanges();

    // Watchdog anti-bloqueo: si por cualquier motivo el observable no emite
    // (capa de red, CORS raro, etc.), desactivamos el loading.
    const watchdog = setTimeout(() => {
      if (this.isLoading) {
        this.zone.run(() => {
          this.isLoading = false;
          this.patients = [];
          this.filtered = [];
          this.selected.clear();
          this.debugMsg = '⏱️ Timeout: la petición no devolvió respuesta usable.';
          this.cdr.detectChanges();
        });
      }
    }, 9000);

    this.api.getPatients().pipe(
      map((data: any) => this.normalizeList(data)),
      catchError((err) => {
        // Convertimos el error en lista vacía y dejamos pista.
        this.zone.run(() => {
          this.debugMsg = this.formatHttpError(err);
        });
        return of([] as Patient[]);
      }),
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.isLoading = false;
          const ms = Date.now() - startedAt;
          // Si no hubo error, dejamos un resumen.
          if (!this.debugMsg || this.debugMsg.startsWith('Cargando')) {
            this.debugMsg = `OK (${ms} ms) · ${this.patients.length} registro(s)`;
          }
          this.cdr.detectChanges();
        });
      })
    ).subscribe((list) => {
      this.zone.run(() => {
        this.patients = list;
        this.filtered = [...list];
        this.selected.clear();
        this.cdr.detectChanges();
      });
    });
  }

  private normalizeList(data: any): Patient[] {
    // 1) Lista normal
    if (Array.isArray(data)) return data;

    // 2) Spring pageable: { content: [...] }
    if (data && Array.isArray(data.content)) return data.content;

    // 3) Wrapper custom: { items: [...] } o { patients: [...] }
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.patients)) return data.patients;

    // 4) Nada usable
    console.warn('⚠️ Formato inesperado en pacientes. Se usará lista vacía:', data);
    return [];
  }

  private formatHttpError(err: any): string {
    // Angular suele dar HttpErrorResponse.
    const status = err?.status;
    const msg = err?.message || 'Error desconocido';
    const url = err?.url || '';

    // Algunos errores CORS/Network salen como status 0
    if (status === 0) {
      return `🚫 Error de red/CORS (status 0). ${msg}`;
    }
    return `🔥 Error HTTP ${status ?? '?'} ${url ? `(${url})` : ''}: ${msg}`;
  }

  onSearchInput(): void {
    const q = (this.searchTerm || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.patients];
      return;
    }

    this.filtered = this.patients.filter(p =>
      (p.name ?? '').toLowerCase().includes(q) ||
      String(p.age ?? '').includes(q) ||
      (p.medicalHistory ?? '').toLowerCase().includes(q)
    );

    // Mantener selección coherente con lo visible
    const visibleIds = new Set(this.filtered.map(p => p.id).filter(Boolean) as string[]);
    for (const id of Array.from(this.selected)) {
      if (!visibleIds.has(id)) this.selected.delete(id);
    }
  }

  toggleSelection(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
  }

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }

  allVisibleSelected(): boolean {
    const visibleIds = this.filtered.map(p => p.id).filter(Boolean) as string[];
    return visibleIds.length > 0 && visibleIds.every(id => this.selected.has(id));
  }

  toggleSelectAll(): void {
    const visibleIds = this.filtered.map(p => p.id).filter(Boolean) as string[];
    const allSel = visibleIds.length > 0 && visibleIds.every(id => this.selected.has(id));

    if (allSel) visibleIds.forEach(id => this.selected.delete(id));
    else visibleIds.forEach(id => this.selected.add(id));
  }

  createNew(): void {
    this.router.navigate(['/patients/new']);
  }

  editSelected(): void {
    if (this.selected.size !== 1) {
      alert('Selecciona EXACTAMENTE 1 paciente para editar.');
      return;
    }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/patients/edit', id]);
  }

  inspectSelected(): void {
    if (this.selected.size !== 1) {
      alert('Selecciona EXACTAMENTE 1 paciente para inspeccionar.');
      return;
    }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/patients/edit', id], { queryParams: { mode: 'view' } });
  }

  viewSelected(): void {
    if (this.selected.size === 0) {
      alert('No hay elementos seleccionados.');
      return;
    }
    const details = this.patients.filter(p => p.id && this.selected.has(p.id));
    alert(details.map(p => `• ${p.name} (${p.age}) - ${p.medicalHistory ?? ''}`).join('\n'));
  }

  editRow(id: string): void {
    this.router.navigate(['/patients/edit', id]);
  }

  viewRow(id: string): void {
    this.router.navigate(['/patients/edit', id], { queryParams: { mode: 'view' } });
  }

  deleteOne(id: string): void {
    if (!confirm('¿Eliminar este paciente?')) return;
    this.api.deletePatient(id).subscribe({
      next: () => this.load(),
      error: () => alert('No se pudo eliminar.')
    });
  }

  deleteSelected(): void {
    if (this.selected.size === 0) {
      alert('Selecciona al menos 1 paciente para eliminar.');
      return;
    }
    const ids = Array.from(this.selected);
    if (!confirm(`¿Eliminar ${ids.length} paciente(s) seleccionado(s)?`)) return;

    this.api.deletePatientsMany(ids).subscribe({
      next: () => this.load(),
      error: () => alert('No se pudo eliminar el/los paciente(s).')
    });
  }

  refresh(): void {
    this.searchTerm = '';
    this.load();
  }
}
