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

  selected: Set<string> = new Set();

  searchTerm = '';
  isLoading = false;
  debugMsg = '';

  // --- VARIABLES PARA EL MODAL ---
  showModal = false;
  selectedData: Patient[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const startedAt = Date.now();

    this.isLoading = true;
    this.cdr.detectChanges();

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
        this.zone.run(() => {
          this.debugMsg = this.formatHttpError(err);
        });
        return of([] as Patient[]);
      }),
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.isLoading = false;
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
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.patients)) return data.patients;
    console.warn('⚠️ Formato inesperado en pacientes. Se usará lista vacía:', data);
    return [];
  }

  private formatHttpError(err: any): string {
    const status = err?.status;
    const msg = err?.message || 'Error desconocido';
    const url = err?.url || '';
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

  // --- NUEVA LÓGICA DE MODAL ---
  viewSelected(): void {
    if (this.selected.size === 0) {
      alert('No hay elementos seleccionados.');
      return;
    }
    // Rellenamos la lista de datos para el modal
    this.selectedData = this.patients.filter(p => p.id && this.selected.has(p.id));
    // Mostramos el modal
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
  // -----------------------------

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