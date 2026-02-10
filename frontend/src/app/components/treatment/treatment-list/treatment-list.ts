import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgFor, NgIf, DatePipe, CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Treatment, Patient, Staff, Medicine } from '../../../models';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-treatment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgFor, NgIf, DatePipe],
  templateUrl: './treatment-list.html',
  styleUrl: './treatment-list.css',
})
export class TreatmentList implements OnInit {

  treatments: Treatment[] = [];
  patients: Patient[] = [];
  staffList: Staff[] = [];
  medicines: Medicine[] = [];

  // Selección
  selected: Set<string> = new Set();

  isLoading = false;
  debugMsg = '';

  // Modal
  showModal = false;
  selectedData: Treatment[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.selected.clear();
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.isLoading) {
        this.zone.run(() => {
          this.isLoading = false;
          this.debugMsg = 'Timeout.';
          this.cdr.detectChanges();
        });
      }
    }, 10000);

    forkJoin({
      treatments: this.api.getTreatments().pipe(catchError(() => of([]))),
      patients: this.api.getPatients().pipe(catchError(() => of([]))),
      staff: this.api.getStaff().pipe(catchError(() => of([]))),
      medicines: this.api.getMedicines().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe((data: any) => {
      this.zone.run(() => {
        this.treatments = this.normalize(data.treatments);
        this.patients = this.normalize(data.patients);
        this.staffList = this.normalize(data.staff);
        this.medicines = this.normalize(data.medicines);

        this.cdr.detectChanges();
      });
    });
  }

  private normalize(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  }

  // --- Helpers visuales ---
  getPatientName(id: string): string {
    return this.patients.find(p => p.id === id)?.name || 'Desconocido';
  }

  getStaffName(id: string): string {
    return this.staffList.find(s => s.id === id)?.name || 'Desconocido';
  }

  // --- Lógica de Selección ---
  toggleSelection(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
  }

  isSelected(id: string): boolean { return this.selected.has(id); }

  allSelected(): boolean {
    return this.treatments.length > 0 && this.treatments.every(t => t.id && this.selected.has(t.id));
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selected.clear();
    } else {
      this.treatments.forEach(t => { if (t.id) this.selected.add(t.id); });
    }
  }

  // --- Acciones de Botones ---
  editSelected(): void {
    if (this.selected.size !== 1) { alert('Selecciona 1 tratamiento.'); return; }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/treatments/edit', id]);
  }

  inspectSelected(): void {
    if (this.selected.size !== 1) { alert('Selecciona 1 tratamiento.'); return; }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/treatments/edit', id], { queryParams: { mode: 'view' } });
  }

  deleteSelected(): void {
    if (this.selected.size === 0) { alert('Nada seleccionado.'); return; }

    if (!confirm(`¿Borrar ${this.selected.size} tratamientos?`)) return;

    // Simple loop de borrado (idealmente usar forkJoin)
    const ids = Array.from(this.selected);
    let deletedCount = 0;

    ids.forEach(id => {
      this.api.deleteTreatment(id).subscribe(() => {
        deletedCount++;
        if (deletedCount === ids.length) this.loadData();
      });
    });
  }

  delete(id: string | undefined) {
    if (id && confirm('¿Eliminar este tratamiento?')) {
      this.api.deleteTreatment(id).subscribe(() => this.loadData());
    }
  }

  // --- MODAL ---
  viewSelected(): void {
    if (this.selected.size === 0) { alert('Nada seleccionado.'); return; }
    this.selectedData = this.treatments.filter(t => t.id && this.selected.has(t.id));
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}