import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe, CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Treatment, Patient, Staff, Medicine } from '../../../models';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-treatment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgFor, NgIf, DatePipe], // Añadido CommonModule
  templateUrl: './treatment-list.html',
  styleUrl: './treatment-list.css',
})
export class TreatmentList implements OnInit {
  treatments: Treatment[] = [];
  patients: Patient[] = [];
  staffList: Staff[] = [];
  medicines: Medicine[] = [];

  isLoading = false;
  debugMsg = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.debugMsg = 'Cargando tratamientos completos...';
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.isLoading) {
        this.zone.run(() => {
          this.isLoading = false;
          this.debugMsg = '⏱️ Timeout en carga conjunta.';
          this.cdr.detectChanges();
        });
      }
    }, 12000); // Un poco más de tiempo porque son 4 peticiones

    // ForkJoin espera a que TODAS terminen
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
        // Normalizamos si viene paginado o directo
        this.treatments = this.normalize(data.treatments);
        this.patients = this.normalize(data.patients);
        this.staffList = this.normalize(data.staff);
        this.medicines = this.normalize(data.medicines);

        this.debugMsg = `Cargados: ${this.treatments.length} tratamientos`;
        this.cdr.detectChanges();
      });
    });
  }

  // Helper para limpiar datos
  private normalize(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  }

  getPatientName(id: string): string {
    return this.patients.find(p => p.id === id)?.name || id;
  }

  getStaffName(id: string): string {
    return this.staffList.find(s => s.id === id)?.name || id;
  }

  getMedicineName(id: string): string {
    return this.medicines.find(m => m.id === id)?.name || id;
  }

  delete(id: string | undefined) {
    if (id && confirm('¿Eliminar este tratamiento?')) {
      this.api.deleteTreatment(id).subscribe(() => this.loadData());
    }
  }
}