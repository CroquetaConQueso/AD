import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { PatientListComponent } from './components/patient/patient-list/patient-list';
import { PatientFormComponent } from './components/patient/patient-form/patient-form';
import { StaffListComponent } from './components/staff/staff-list/staff-list';
import { StaffFormComponent } from './components/staff/staff-form/staff-form';
import { MedicineListComponent } from './components/medicine/medicine-list/medicine-list';
import { MedicineFormComponent } from './components/medicine/medicine-form/medicine-form';
import { TreatmentList } from './components/treatment/treatment-list/treatment-list';
import { TreatmentForm } from './components/treatment/treatment-form/treatment-form';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Dashboard },

    // Pacientes
    { path: 'patients', component: PatientListComponent },
    { path: 'patients/new', component: PatientFormComponent },
    { path: 'patients/edit/:id', component: PatientFormComponent },

    // Personal (Staff)
    { path: 'staff', component: StaffListComponent },
    { path: 'staff/new', component: StaffFormComponent },
    { path: 'staff/edit/:id', component: StaffFormComponent },

    // Medicinas
    { path: 'medicines', component: MedicineListComponent },
    { path: 'medicines/new', component: MedicineFormComponent },
    { path: 'medicines/edit/:id', component: MedicineFormComponent },

    // Tratamientos
    { path: 'treatments', component: TreatmentList },
    { path: 'treatments/new', component: TreatmentForm },
    { path: 'treatments/edit/:id', component: TreatmentForm }
];
