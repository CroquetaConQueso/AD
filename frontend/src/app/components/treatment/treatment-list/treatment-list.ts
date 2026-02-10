import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Treatment, Patient, Staff, Medicine } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-treatment-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe],
  templateUrl: './treatment-list.html',
  styleUrl: './treatment-list.css',
})
export class TreatmentList implements OnInit {
  treatments: Treatment[] = [];
  patients: Patient[] = [];
  staffList: Staff[] = [];
  medicines: Medicine[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    forkJoin({
      treatments: this.api.getTreatments(),
      patients: this.api.getPatients(),
      staff: this.api.getStaff(),
      medicines: this.api.getMedicines()
    }).subscribe(data => {
      this.treatments = data.treatments;
      this.patients = data.patients;
      this.staffList = data.staff;
      this.medicines = data.medicines;
    });
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
