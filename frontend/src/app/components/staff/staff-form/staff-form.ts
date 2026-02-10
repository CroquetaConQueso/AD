import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Staff } from '../../../models';

type Mode = 'new' | 'edit' | 'view';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.css'
})
export class StaffFormComponent implements OnInit {

  staff: Staff = { name: '', role: 'DOCTOR', specialization: '' };

  mode: Mode = 'new';
  private staffId: string | null = null;

  readonly roles: Staff['role'][] = ['DOCTOR', 'NURSE'];

  loading = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get isView(): boolean { return this.mode === 'view'; }
  get title(): string {
    if (this.mode === 'new') return 'Nuevo Personal';
    if (this.mode === 'edit') return 'Editar Personal';
    return 'Inspeccionar Personal';
  }

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id');
    const qpMode = (this.route.snapshot.queryParamMap.get('mode') || '').toLowerCase();

    // si navegamos con router state (por ejemplo desde staff-list)
    const nav = this.router.getCurrentNavigation();
    const stateView = !!nav?.extras?.state && (nav.extras.state as any).view === true;

    if (this.staffId) {
      this.mode = (qpMode === 'view' || stateView) ? 'view' : 'edit';
      this.loadStaff(this.staffId);
    } else {
      this.mode = 'new';
    }
  }

  private loadStaff(id: string): void {
    this.loading = true;
    this.api.getStaffById(id).subscribe({
      next: (data) => {
        this.staff = {
          id: data.id,
          name: data.name ?? '',
          role: (data.role as any) ?? 'DOCTOR',
          specialization: data.specialization ?? ''
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el personal.');
        this.router.navigate(['/staff']);
      }
    });
  }

  save(): void {
    if (this.isView) return;

    const payload: Staff = {
      id: this.staff.id,
      name: (this.staff.name || '').trim(),
      role: this.staff.role,
      specialization: (this.staff.specialization || '').trim() || null as any
    };

    if (!payload.name) {
      alert('El nombre es obligatorio.');
      return;
    }

    this.loading = true;

    if (this.mode === 'new') {
      this.api.createStaff(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/staff']);
        },
        error: () => {
          this.loading = false;
          alert('No se pudo guardar el personal.');
        }
      });
      return;
    }

    // edit
    if (!this.staffId) {
      this.loading = false;
      alert('ID no válido.');
      return;
    }

    this.api.updateStaff(this.staffId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/staff']);
      },
      error: () => {
        this.loading = false;
        alert('No se pudo actualizar el personal.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/staff']);
  }
}
