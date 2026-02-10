import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Medicine } from '../../../models';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.css'
})
export class MedicineListComponent implements OnInit {

  medicines: Medicine[] = [];
  filtered: Medicine[] = [];
  selected: Set<string> = new Set();

  searchTerm = '';
  isLoading = false;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.api.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data ?? [];
        this.filtered = [...this.medicines];
        this.selected.clear();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Error al cargar medicinas');
      }
    });
  }

  onSearchInput(): void {
    const q = (this.searchTerm || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.medicines];
      return;
    }

    this.filtered = this.medicines.filter(m =>
      (m.name ?? '').toLowerCase().includes(q) ||
      String(m.quantity ?? '').includes(q)
    );

    const visibleIds = new Set(this.filtered.map(m => m.id).filter(Boolean) as string[]);
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
    const visibleIds = this.filtered.map(m => m.id).filter(Boolean) as string[];
    return visibleIds.length > 0 && visibleIds.every(id => this.selected.has(id));
  }

  toggleSelectAll(): void {
    const visibleIds = this.filtered.map(m => m.id).filter(Boolean) as string[];
    const allSel = visibleIds.length > 0 && visibleIds.every(id => this.selected.has(id));

    if (allSel) visibleIds.forEach(id => this.selected.delete(id));
    else visibleIds.forEach(id => this.selected.add(id));
  }

  createNew(): void {
    this.router.navigate(['/medicines/new']);
  }

  editSelected(): void {
    if (this.selected.size !== 1) {
      alert('Selecciona EXACTAMENTE 1 medicina para editar.');
      return;
    }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/medicines/edit', id]);
  }

  inspectSelected(): void {
    if (this.selected.size !== 1) {
      alert('Selecciona EXACTAMENTE 1 medicina para inspeccionar.');
      return;
    }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/medicines/edit', id], { queryParams: { mode: 'view' } });
  }

  viewSelected(): void {
    if (this.selected.size === 0) {
      alert('No hay elementos seleccionados.');
      return;
    }
    const details = this.medicines.filter(m => m.id && this.selected.has(m.id));
    alert(details.map(m => `• ${m.name} (qty: ${m.quantity})`).join('\n'));
  }

  editRow(id: string): void {
    this.router.navigate(['/medicines/edit', id]);
  }

  viewRow(id: string): void {
    this.router.navigate(['/medicines/edit', id], { queryParams: { mode: 'view' } });
  }

  deleteOne(id: string): void {
    if (!confirm('¿Eliminar esta medicina?')) return;
    this.api.deleteMedicine(id).subscribe({
      next: () => this.load(),
      error: () => alert('No se pudo eliminar.')
    });
  }

  deleteSelected(): void {
    if (this.selected.size === 0) {
      alert('Selecciona al menos 1 medicina para eliminar.');
      return;
    }
    const ids = Array.from(this.selected);
    if (!confirm(`¿Eliminar ${ids.length} medicina(s) seleccionada(s)?`)) return;

    this.api.deleteMedicinesMany(ids).subscribe({
      next: () => this.load(),
      error: () => alert('No se pudo eliminar la(s) medicina(s).')
    });
  }

  refresh(): void {
    this.searchTerm = '';
    this.load();
  }
}
