import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Staff, Patient, Medicine, Treatment } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * URL base **relativa** para evitar CORS.
   *
   * Requiere `frontend/proxy.conf.json` (ya incluido) y `npm start`.
   * Así todas las llamadas van a `http://127.0.0.1:4200/api/...`
   * y el servidor de Angular las redirige al backend `http://127.0.0.1:8081`.
   */
  private readonly mainUrl = '/api';

  /**
   * Timeout para evitar "Cargando..." infinito si algo se queda colgado.
   */
  private readonly timeoutMs = 8000;

  private readonly jsonOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  // -------------------------
  // Staff
  // -------------------------
  getStaff(q?: string): Observable<Staff[]> {
    let params = new HttpParams();
    if (q && q.trim().length > 0) params = params.set('q', q.trim());
    return this.http.get<Staff[]>(`${this.mainUrl}/staff`, { params })
      .pipe(timeout(this.timeoutMs));
  }

  getStaffById(id: string): Observable<Staff> {
    return this.http.get<Staff>(`${this.mainUrl}/staff/${id}`)
      .pipe(timeout(this.timeoutMs));
  }

  createStaff(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(`${this.mainUrl}/staff`, staff, this.jsonOptions);
  }

  updateStaff(id: string, staff: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.mainUrl}/staff/${id}`, staff, this.jsonOptions);
  }

  deleteStaff(id: string): Observable<void> {
    return this.http.delete<void>(`${this.mainUrl}/staff/${id}`);
  }

  deleteStaffMany(ids: string[]): Observable<void> {
    return this.http.request<void>('delete', `${this.mainUrl}/staff`, { body: ids, ...this.jsonOptions });
  }

  // -------------------------
  // Patients
  // -------------------------
  getPatients(q?: string): Observable<Patient[]> {
    let params = new HttpParams();
    if (q && q.trim().length > 0) params = params.set('q', q.trim());
    return this.http.get<Patient[]>(`${this.mainUrl}/patients`, { params })
      .pipe(timeout(this.timeoutMs));
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.mainUrl}/patients/${id}`)
      .pipe(timeout(this.timeoutMs));
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.mainUrl}/patients`, patient, this.jsonOptions);
  }

  updatePatient(id: string, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.mainUrl}/patients/${id}`, patient, this.jsonOptions);
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.mainUrl}/patients/${id}`);
  }

  deletePatientsMany(ids: string[]): Observable<void> {
    return this.http.request<void>('delete', `${this.mainUrl}/patients`, { body: ids, ...this.jsonOptions });
  }

  // -------------------------
  // Medicines
  // -------------------------
  getMedicines(q?: string): Observable<Medicine[]> {
    let params = new HttpParams();
    if (q && q.trim().length > 0) params = params.set('q', q.trim());
    return this.http.get<Medicine[]>(`${this.mainUrl}/medicines`, { params })
      .pipe(timeout(this.timeoutMs));
  }

  getMedicineById(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.mainUrl}/medicines/${id}`)
      .pipe(timeout(this.timeoutMs));
  }

  createMedicine(medicine: Medicine): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.mainUrl}/medicines`, medicine, this.jsonOptions);
  }

  updateMedicine(id: string, medicine: Medicine): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.mainUrl}/medicines/${id}`, medicine, this.jsonOptions);
  }

  deleteMedicine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.mainUrl}/medicines/${id}`);
  }

  deleteMedicinesMany(ids: string[]): Observable<void> {
    return this.http.request<void>('delete', `${this.mainUrl}/medicines`, { body: ids, ...this.jsonOptions });
  }

  // -------------------------
  // Treatments
  // -------------------------
  getTreatments(): Observable<Treatment[]> {
    return this.http.get<Treatment[]>(`${this.mainUrl}/treatments`)
      .pipe(timeout(this.timeoutMs));
  }

  createTreatment(treatment: Treatment): Observable<Treatment> {
    return this.http.post<Treatment>(`${this.mainUrl}/treatments`, treatment, this.jsonOptions);
  }

  getTreatmentsByPatient(patientId: string): Observable<Treatment[]> {
    return this.http.get<Treatment[]>(`${this.mainUrl}/treatments/patient/${patientId}`)
      .pipe(timeout(this.timeoutMs));
  }

  getTreatmentById(id: string): Observable<Treatment> {
    return this.http.get<Treatment>(`${this.mainUrl}/treatments/${id}`)
      .pipe(timeout(this.timeoutMs));
  }

  updateTreatment(id: string, treatment: Treatment): Observable<Treatment> {
    return this.http.put<Treatment>(`${this.mainUrl}/treatments/${id}`, treatment, this.jsonOptions);
  }

  deleteTreatment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.mainUrl}/treatments/${id}`);
  }
}
