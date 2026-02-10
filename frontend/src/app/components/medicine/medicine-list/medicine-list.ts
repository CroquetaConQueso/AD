import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Medicine } from '../../../models';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

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
  debugMsg = '';

  // --- VARIABLES MODAL ---
  showModal = false;
  selectedData: Medicine[] = [];

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

    this.api.getMedicines().pipe(
      map((data: any) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.content)) return data.content;
        return [];
      }),
      catchError((err) => {
        this.zone.run(() => this.debugMsg = `Error: ${err.message}`);
        return of([] as Medicine[]);
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
        this.medicines = data;
        this.filtered = [...this.medicines];
        this.selected.clear();
        this.cdr.detectChanges();
      });
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

  isSelected(id: string): boolean { return this.selected.has(id); }

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

  createNew(): void { this.router.navigate(['/medicines/new']); }

  editSelected(): void {
    if (this.selected.size !== 1) { alert('Selecciona 1.'); return; }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/medicines/edit', id]);
  }

  inspectSelected(): void {
    if (this.selected.size !== 1) { alert('Selecciona 1.'); return; }
    const id = Array.from(this.selected)[0];
    this.router.navigate(['/medicines/edit', id], { queryParams: { mode: 'view' } });
  }

  // --- LÓGICA MODAL ---
  viewSelected(): void {
    if (this.selected.size === 0) { alert('Nada seleccionado.'); return; }
    this.selectedData = this.medicines.filter(m => m.id && this.selected.has(m.id));
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
  // --------------------

  editRow(id: string): void { this.router.navigate(['/medicines/edit', id]); }
  viewRow(id: string): void { this.router.navigate(['/medicines/edit', id], { queryParams: { mode: 'view' } }); }

  deleteOne(id: string): void {
    if (!confirm('¿Eliminar?')) return;
    this.api.deleteMedicine(id).subscribe({ next: () => this.load(), error: () => alert('Error eliminando.') });
  }

  deleteSelected(): void {
    if (this.selected.size === 0) { alert('Selecciona algo.'); return; }
    const ids = Array.from(this.selected);
    if (!confirm(`¿Eliminar ${ids.length}?`)) return;
    this.api.deleteMedicinesMany(ids).subscribe({ next: () => this.load(), error: () => alert('Error eliminando.') });
  }

  refresh(): void {
    this.searchTerm = '';
    this.load();
  }
}