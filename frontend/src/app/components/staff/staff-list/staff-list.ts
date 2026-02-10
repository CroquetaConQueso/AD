import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Staff } from '../../../models';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.css'
})
export class StaffListComponent implements OnInit {

  staffList: Staff[] = [];
  filteredList: Staff[] = [];
  selectedStaff: Set<string> = new Set();
  searchTerm: string = '';
  isLoading = false;
  debugMsg = '';

  // --- VARIABLES MODAL ---
  showModal = false;
  selectedData: Staff[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.isLoading) {
        this.zone.run(() => {
          this.isLoading = false;
          this.debugMsg = 'Timeout.';
          this.cdr.detectChanges();
        });
      }
    }, 5000);

    this.api.getStaff().pipe(
      map((data: any) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.content)) return data.content;
        return [];
      }),
      catchError((err) => {
        this.zone.run(() => this.debugMsg = `Error: ${err.message}`);
        return of([] as Staff[]);
      }),
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe((data) => {
      this.zone.run(() => {
        this.staffList = data;
        this.filteredList = [...this.staffList];
        this.selectedStaff.clear();
        this.cdr.detectChanges();
      });
    });
  }

  onSearchInput(): void {
    const q = (this.searchTerm || '').toLowerCase().trim();
    if (!q) {
      this.filteredList = [...this.staffList];
      return;
    }
    this.filteredList = this.staffList.filter(staff =>
      (staff.name ?? '').toLowerCase().includes(q) ||
      (staff.role ?? '').toLowerCase().includes(q) ||
      (staff.specialization ?? '').toLowerCase().includes(q)
    );
    // Limpiar selección de invisibles
    const visibleIds = new Set(this.filteredList.map(s => s.id).filter(Boolean) as string[]);
    for (const id of Array.from(this.selectedStaff)) {
      if (!visibleIds.has(id)) this.selectedStaff.delete(id);
    }
  }

  toggleSelection(id: string): void {
    if (this.selectedStaff.has(id)) this.selectedStaff.delete(id);
    else this.selectedStaff.add(id);
  }

  isSelected(id: string): boolean {
    return this.selectedStaff.has(id);
  }

  toggleSelectAll(): void {
    const visibleIds = this.filteredList.map(s => s.id).filter(Boolean) as string[];
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => this.selectedStaff.has(id));

    if (allSelected) visibleIds.forEach(id => this.selectedStaff.delete(id));
    else visibleIds.forEach(id => this.selectedStaff.add(id));
  }

  allVisibleSelected(): boolean {
    const visibleIds = this.filteredList.map(s => s.id).filter(Boolean) as string[];
    return visibleIds.length > 0 && visibleIds.every(id => this.selectedStaff.has(id));
  }

  createNew(): void { this.router.navigate(['/staff/new']); }

  editSelected(): void {
    if (this.selectedStaff.size !== 1) { alert('Selecciona 1 elemento.'); return; }
    const id = Array.from(this.selectedStaff)[0];
    this.router.navigate(['/staff/edit', id]);
  }

  inspectSelected(): void {
    if (this.selectedStaff.size !== 1) { alert('Selecciona 1 elemento.'); return; }
    const id = Array.from(this.selectedStaff)[0];
    this.router.navigate(['/staff/edit', id], { queryParams: { mode: 'view' } });
  }

  // --- LÓGICA MODAL ---
  viewSelected(): void {
    if (this.selectedStaff.size === 0) {
      alert('Nada seleccionado.');
      return;
    }
    this.selectedData = this.staffList.filter(s => s.id && this.selectedStaff.has(s.id));
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
  // --------------------

  editRow(id: string): void { this.router.navigate(['/staff/edit', id]); }
  viewRow(id: string): void { this.router.navigate(['/staff/edit', id], { queryParams: { mode: 'view' } }); }

  deleteOne(id: string): void {
    if (!confirm('¿Eliminar?')) return;
    this.api.deleteStaff(id).subscribe({ next: () => this.loadStaff(), error: () => alert('Error eliminando.') });
  }

  deleteSelected(): void {
    if (this.selectedStaff.size === 0) { alert('Selecciona algo.'); return; }
    const ids = Array.from(this.selectedStaff);
    if (!confirm(`¿Eliminar ${ids.length}?`)) return;
    this.api.deleteStaffMany(ids).subscribe({ next: () => this.loadStaff(), error: () => alert('Error eliminando.') });
  }

  refresh(): void {
    this.searchTerm = '';
    this.loadStaff();
  }
}