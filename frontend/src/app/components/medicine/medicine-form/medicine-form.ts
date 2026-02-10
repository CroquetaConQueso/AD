import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Medicine } from '../../../models';
import { finalize } from 'rxjs/operators';

type Mode = 'new' | 'edit' | 'view';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicine-form.html',
  styleUrl: './medicine-form.css'
})
export class MedicineFormComponent implements OnInit {

  medicine: Medicine = { name: '', quantity: 0 };

  mode: Mode = 'new';
  private medicineId: string | null = null;

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
    if (this.mode === 'new') return 'Nueva Medicina';
    if (this.mode === 'edit') return 'Editar Medicina';
    return 'Inspeccionar Medicina';
  }

  ngOnInit(): void {
    this.medicineId = this.route.snapshot.paramMap.get('id');
    const qpMode = (this.route.snapshot.queryParamMap.get('mode') || '').toLowerCase();

    const nav = this.router.getCurrentNavigation();
    const stateView = !!nav?.extras?.state && (nav.extras.state as any).view === true;

    if (this.medicineId) {
      this.mode = (qpMode === 'view' || stateView) ? 'view' : 'edit';
      this.loadMedicine(this.medicineId);
    } else {
      this.mode = 'new';
    }
  }

  private loadMedicine(id: string): void {
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

    this.api.getMedicineById(id).pipe(
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
          this.medicine = {
            id: data.id,
            name: data.name ?? '',
            quantity: data.quantity ?? 0
          };
        });
      },
      error: () => {
        this.zone.run(() => {
          alert('No se pudo cargar la medicina.');
          this.router.navigate(['/medicines']);
        });
      }
    });
  }

  save(): void {
    if (this.isView) return;

    const payload: Medicine = {
      id: this.medicine.id,
      name: (this.medicine.name || '').trim(),
      quantity: Number(this.medicine.quantity ?? 0)
    };

    if (!payload.name) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (!Number.isFinite(payload.quantity) || payload.quantity < 0) {
      alert('La cantidad no es válida.');
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
      ? this.api.createMedicine(payload)
      : this.api.updateMedicine(this.medicineId!, payload);

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
        this.zone.run(() => this.router.navigate(['/medicines']));
      },
      error: () => {
        this.zone.run(() => alert('No se pudo guardar la medicina.'));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/medicines']);
  }
}