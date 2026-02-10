import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Staff } from '../../../models';

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

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.api.getStaff().subscribe({
      next: (data) => {
        this.staffList = data ?? [];
        this.filteredList = [...this.staffList];
        this.selectedStaff.clear();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Error al cargar el personal');
      }
    });
  }

  // --- Búsqueda local (rápida) ---
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

    // limpiar selección de items que ya no están visibles
    const visibleIds = new Set(this.filteredList.map(s => s.id).filter(Boolean) as string[]);
    for (const id of Array.from(this.selectedStaff)) {
      if (!visibleIds.has(id)) this.selectedStaff.delete(id);
    }
  }

  // --- selección ---
  toggleSelection(id: string): void {
    if (this.selectedStaff.has(id)) this.selectedStaff.delete(id);
    else this.selectedStaff.add(id);
  }

  isSelected(id: string): boolean {
    return this.selectedStaff.has(id);
  }

  toggleSelectAll(): void {
    const visibleIds = this.filteredList.map(staff => staff.id).filter(Boolean) as string[];
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => this.selectedStaff.has(id));

    if (allSelected) {
      visibleIds.forEach(id => this.selectedStaff.delete(id));
    } else {
      visibleIds.forEach(id => this.selectedStaff.add(id));
    }
  }

  allVisibleSelected(): boolean {
    const visibleIds = this.filteredList.map(s => s.id).filter(Boolean) as string[];
    return visibleIds.length > 0 && visibleIds.every(id => this.selectedStaff.has(id));
  }

  // --- acciones ---
  createNew(): void {
    this.router.navigate(['/staff/new']);
  }

  editSelected(): void {
    if (this.selectedStaff.size !== 1) {
      alert('Selecciona EXACTAMENTE 1 elemento para editar.');
      return;
    }
    const id = Array.from(this.selectedStaff)[0];
    this.router.navigate(['/staff/edit', id]);
  }

  inspectSelected(): void {
    if (this.selectedStaff.size !== 1) {
      alert('Selecciona EXACTAMENTE 1 elemento para inspeccionar.');
      return;
    }
    const id = Array.from(this.selectedStaff)[0];
    this.router.navigate(['/staff/edit', id], { queryParams: { mode: 'view' } });
  }

  viewSelected(): void {
    if (this.selectedStaff.size === 0) {
      alert('No hay elementos seleccionados.');
      return;
    }
    const selectedDetails = this.staffList.filter(staff => staff.id && this.selectedStaff.has(staff.id));
    alert(
      selectedDetails
        .map(staff => `• ${staff.name} (${staff.role})${staff.specialization ? ' - ' + staff.specialization : ''}`)
        .join('\n')
    );
  }

  editRow(id: string): void {
    this.router.navigate(['/staff/edit', id]);
  }

  viewRow(id: string): void {
    this.router.navigate(['/staff/edit', id], { queryParams: { mode: 'view' } });
  }

  deleteOne(id: string): void {
    if (!confirm('¿Eliminar este elemento?')) return;

    this.api.deleteStaff(id).subscribe({
      next: () => this.loadStaff(),
      error: () => alert('No se pudo eliminar.')
    });
  }

  deleteSelected(): void {
    if (this.selectedStaff.size === 0) {
      alert('Selecciona al menos 1 elemento para eliminar.');
      return;
    }

    const ids = Array.from(this.selectedStaff);

    if (!confirm(`¿Eliminar ${ids.length} elemento(s) seleccionado(s)?`)) return;

    // Usamos endpoint bulk
    this.api.deleteStaffMany(ids).subscribe({
      next: () => this.loadStaff(),
      error: () => alert('No se pudo eliminar el/los elemento(s).')
    });
  }

  refresh(): void {
    this.searchTerm = '';
    this.loadStaff();
  }
}
