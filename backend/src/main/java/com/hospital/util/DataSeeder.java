package com.hospital.util;

import com.hospital.model.Medicine;
import com.hospital.model.Patient;
import com.hospital.model.Staff;
import com.hospital.model.Staff.Role;
import com.hospital.model.Treatment;
import com.hospital.repository.MedicineRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.StaffRepository;
import com.hospital.repository.TreatmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;
    private final TreatmentRepository treatmentRepository;

    public DataSeeder(StaffRepository staffRepository,
            PatientRepository patientRepository,
            MedicineRepository medicineRepository,
            TreatmentRepository treatmentRepository) {
        this.staffRepository = staffRepository;
        this.patientRepository = patientRepository;
        this.medicineRepository = medicineRepository;
        this.treatmentRepository = treatmentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Limpieza opcional para evitar duplicados en desarrollo
        // treatmentRepository.deleteAll();

        seedStaff();
        seedPatients();
        seedMedicines();
        seedTreatments(); // <--- IMPORTANTE
    }

    private void seedStaff() {
        if (staffRepository.count() == 0) {
            Staff doc1 = new Staff();
            doc1.setName("Dr. Alejandro García");
            doc1.setRole(Role.DOCTOR);
            doc1.setSpecialization("Cardiología");

            Staff doc2 = new Staff();
            doc2.setName("Dra. Maria Rodriguez");
            doc2.setRole(Role.DOCTOR);
            doc2.setSpecialization("Pediatría");

            Staff nurse1 = new Staff();
            nurse1.setName("Enfermero Juan Lopez");
            nurse1.setRole(Role.NURSE); // OJO: Si cambiaste el Enum a ENFERMERO, pon ENFERMERO aquí.

            staffRepository.saveAll(Arrays.asList(doc1, doc2, nurse1));
            System.out.println("✅ Staff seeded");
        }
    }

    private void seedPatients() {
        if (patientRepository.count() == 0) {
            Patient p1 = new Patient();
            p1.setName("Carlos Ruiz");
            p1.setAge(35);
            p1.setMedicalHistory("Hipertensión leve");

            Patient p2 = new Patient();
            p2.setName("Ana Martinez");
            p2.setAge(28);
            p2.setMedicalHistory("Alergia a la penicilina");

            patientRepository.saveAll(Arrays.asList(p1, p2));
            System.out.println("✅ Patients seeded");
        }
    }

    private void seedMedicines() {
        if (medicineRepository.count() == 0) {
            Medicine m1 = new Medicine();
            m1.setName("Paracetamol");
            m1.setQuantity(500);
            medicineRepository.save(m1);
            System.out.println("✅ Medicines seeded");
        }
    }

    private void seedTreatments() {
        if (treatmentRepository.count() == 0) {
            List<Patient> patients = patientRepository.findAll();
            List<Staff> staff = staffRepository.findAll();

            if (!patients.isEmpty() && !staff.isEmpty()) {
                Treatment t1 = new Treatment();
                t1.setDescription("Chequeo General");
                t1.setNotes("Todo correcto");
                t1.setPatientId(patients.get(0).getId());
                t1.setStaffId(staff.get(0).getId());
                t1.setDate(LocalDateTime.now().toString());

                treatmentRepository.save(t1);
                System.out.println("✅ Treatments seeded");
            }
        }
    }
}