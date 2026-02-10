import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Patient } from '../../../models';

type Mode = 'new' | 'edit' | 'view';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css'
})
export class PatientFormComponent implements OnInit {

  patient: Patient = { name: '', age: 0, medicalHistory: '' };

  mode: Mode = 'new';
  private patientId: string | null = null;

  loading = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get isView(): boolean { return this.mode === 'view'; }

  get title(): string {
    if (this.mode === 'new') return 'Nuevo Paciente';
    if (this.mode === 'edit') return 'Editar Paciente';
    return 'Inspeccionar Paciente';
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    const qpMode = (this.route.snapshot.queryParamMap.get('mode') || '').toLowerCase();

    const nav = this.router.getCurrentNavigation();
    const stateView = !!nav?.extras?.state && (nav.extras.state as any).view === true;

    if (this.patientId) {
      this.mode = (qpMode === 'view' || stateView) ? 'view' : 'edit';
      this.loadPatient(this.patientId);
    } else {
      this.mode = 'new';
    }
  }

  private loadPatient(id: string): void {
    this.loading = true;
    this.api.getPatientById(id).subscribe({
      next: (data) => {
        this.patient = {
          id: data.id,
          name: data.name ?? '',
          age: data.age ?? 0,
          medicalHistory: data.medicalHistory ?? ''
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el paciente.');
        this.router.navigate(['/patients']);
      }
    });
  }

  save(): void {
    if (this.isView) return;

    const payload: Patient = {
      id: this.patient.id,
      name: (this.patient.name || '').trim(),
      age: Number(this.patient.age ?? 0),
      medicalHistory: (this.patient.medicalHistory || '').trim()
    };

    if (!payload.name) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (!Number.isFinite(payload.age) || payload.age < 0) {
      alert('La edad no es válida.');
      return;
    }

    this.loading = true;

    if (this.mode === 'new') {
      this.api.createPatient(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/patients']);
        },
        error: () => {
          this.loading = false;
          alert('No se pudo guardar el paciente.');
        }
      });
      return;
    }

    if (!this.patientId) {
      this.loading = false;
      alert('ID no válido.');
      return;
    }

    this.api.updatePatient(this.patientId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/patients']);
      },
      error: () => {
        this.loading = false;
        alert('No se pudo actualizar el paciente.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }
}
