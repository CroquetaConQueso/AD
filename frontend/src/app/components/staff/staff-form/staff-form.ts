import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Staff } from '../../../models';
import { finalize } from 'rxjs/operators';

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

  loading = false; // Variable original

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  get isView(): boolean { return this.mode === 'view'; }
  get title(): string {
    if (this.mode === 'new') return 'Nuevo Personal';
    if (this.mode === 'edit') return 'Editar Personal';
    return 'Inspeccionar Personal';
  }

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id');
    const qpMode = (this.route.snapshot.queryParamMap.get('mode') || '').toLowerCase();

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
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.loading) {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    }, 5000);

    this.api.getStaffById(id).pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.staff = {
            id: data.id,
            name: data.name ?? '',
            role: (data.role as any) ?? 'DOCTOR',
            specialization: data.specialization ?? ''
          };
        });
      },
      error: () => {
        this.zone.run(() => {
          alert('No se pudo cargar el personal.');
          this.router.navigate(['/staff']);
        });
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
    this.cdr.detectChanges();

    const watchdog = setTimeout(() => {
      if (this.loading) {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    }, 5000);

    const request$ = this.mode === 'new'
      ? this.api.createStaff(payload)
      : this.api.updateStaff(this.staffId!, payload);

    request$.pipe(
      finalize(() => {
        clearTimeout(watchdog);
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: () => {
        this.zone.run(() => this.router.navigate(['/staff']));
      },
      error: () => {
        this.zone.run(() => alert('No se pudo guardar el personal.'));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/staff']);
  }
}