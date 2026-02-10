import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Treatment, Patient, Staff, Medicine } from '../../../models';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-treatment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treatment-form.html',
  styleUrl: './treatment-form.css'
})
export class TreatmentForm implements OnInit { // <--- NOMBRE CORREGIDO

  // --- MODELOS ---
  treatment: Treatment = {
    patientId: '',
    staffId: '',
    medicineId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  patients: Patient[] = [];
  staffList: Staff[] = [];
  medicines: Medicine[] = [];

  // --- VARIABLES DE ESTADO ---
  isLoading = false;
  debugMsg = '';
  isEdit = false;
  isViewMode = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');

    // Configurar modo
    if (mode === 'view') {
      this.isViewMode = true;
    }
    if (id) {
      this.isEdit = true;
    }

    this.loadAllData(id);
  }

  loadAllData(treatmentId: string | null): void {
    this.isLoading = true;
    this.debugMsg = 'Cargando datos...';
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.isLoading) {
        this.zone.run(() => {
          this.isLoading = false;
          this.debugMsg = 'Tiempo agotado. La red no responde.';
          this.cdr.detectChanges();
        });
      }
    }, 8000);

    const requests: any = {
      patients: this.api.getPatients().pipe(catchError(() => of([]))),
      staff: this.api.getStaff().pipe(catchError(() => of([]))),
      medicines: this.api.getMedicines().pipe(catchError(() => of([])))
    };

    if (treatmentId) {
      requests.treatment = this.api.getTreatmentById(treatmentId).pipe(catchError((err) => {
        this.debugMsg = 'Error cargando tratamiento: ' + err.message;
        return of(null);
      }));
    }

    forkJoin(requests).pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe((data: any) => {
      this.zone.run(() => {
        this.patients = this.normalize(data.patients);
        this.staffList = this.normalize(data.staff);
        this.medicines = this.normalize(data.medicines);

        if (data.treatment) {
          this.treatment = data.treatment;
          if (this.treatment.date && typeof this.treatment.date === 'string') {
            this.treatment.date = this.treatment.date.split('T')[0];
          }
        }

        if (!this.debugMsg.startsWith('Error')) {
          this.debugMsg = '';
        }
        this.cdr.detectChanges();
      });
    });
  }

  private normalize(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  }

  save(): void {
    if (this.isViewMode) return;

    this.isLoading = true;
    this.debugMsg = 'Guardando...';
    this.cdr.detectChanges();

    const payload = { ...this.treatment };
    if (payload.date) {
      payload.date = new Date(payload.date).toISOString();
    }

    const watchdog = setTimeout(() => {
      if (this.isLoading) {
        this.zone.run(() => {
          this.isLoading = false;
          alert('El servidor tarda en responder. Verifica si se ha guardado.');
          this.cdr.detectChanges();
        });
      }
    }, 5000);

    const request$ = this.isEdit
      ? this.api.updateTreatment(this.treatment.id!, payload)
      : this.api.createTreatment(payload);

    request$.pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: () => this.zone.run(() => this.router.navigate(['/treatments'])),
      error: (err) => {
        this.zone.run(() => {
          this.debugMsg = 'Error: ' + (err.message || 'Fallo al guardar');
          console.error(err);
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/treatments']);
  }
}