import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, DatePipe, CommonModule } from '@angular/common'; // Agregado CommonModule
import { ApiService } from '../../../services/api.service';
import { Treatment, Patient, Staff, Medicine } from '../../../models';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-treatment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, DatePipe, RouterLink], // CommonModule necesario para *ngIf
  templateUrl: './treatment-form.html',
  styleUrl: './treatment-form.css',
})
export class TreatmentForm implements OnInit {
  patients: Patient[] = [];
  staffList: Staff[] = [];
  medicines: Medicine[] = [];

  // Variable necesaria para controlar la carga visual
  loading = false;

  treatment: Treatment = {
    patientId: '',
    staffId: '',
    medicineId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    notes: ''
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.loading) {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    }, 5000);

    forkJoin({
      patients: this.api.getPatients(),
      staff: this.api.getStaff(),
      medicines: this.api.getMedicines()
    }).pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe(data => {
      this.zone.run(() => {
        this.patients = data.patients;
        this.staffList = data.staff;
        this.medicines = data.medicines;
      });
    });
  }

  save() {
    this.loading = true;
    this.cdr.detectChanges();

    // Asegurar formato fecha
    this.treatment.date = new Date().toISOString();

    // Watchdog
    const watchdog = setTimeout(() => {
      if (this.loading) {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    }, 5000);

    this.api.createTreatment(this.treatment).pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe(() => {
      this.zone.run(() => this.router.navigate(['/treatments']));
    });
  }
}