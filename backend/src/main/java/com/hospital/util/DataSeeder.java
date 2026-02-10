package com.hospital.util;

import com.hospital.model.Medicine;
import com.hospital.model.Patient;
import com.hospital.model.Staff;
import com.hospital.model.Staff.Role;
import com.hospital.repository.MedicineRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.StaffRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;

    public DataSeeder(StaffRepository staffRepository, PatientRepository patientRepository,
            MedicineRepository medicineRepository) {
        this.staffRepository = staffRepository;
        this.patientRepository = patientRepository;
        this.medicineRepository = medicineRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedStaff();
        seedPatients();
        seedMedicines();
    }

    private void seedStaff() {
        if (staffRepository.count() < 4) {
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
            nurse1.setRole(Role.NURSE);

            staffRepository.saveAll(Arrays.asList(doc1, doc2, nurse1));
            System.out.println("Staff seeded");
        }
    }

    private void seedPatients() {
        if (patientRepository.count() < 4) {
            Patient p1 = new Patient();
            p1.setName("Carlos Ruiz");
            p1.setAge(35);
            p1.setMedicalHistory("Hipertensión leve");

            Patient p2 = new Patient();
            p2.setName("Ana Martinez");
            p2.setAge(28);
            p2.setMedicalHistory("Alergia a la penicilina");

            Patient p3 = new Patient();
            p3.setName("Luis Torres");
            p3.setAge(50);
            p3.setMedicalHistory("Diabetes Tipo 2");

            patientRepository.saveAll(Arrays.asList(p1, p2, p3));
            System.out.println("Patients seeded");
        }
    }

    private void seedMedicines() {
        if (medicineRepository.count() < 4) {
            Medicine m1 = new Medicine();
            m1.setName("Paracetamol");
            m1.setQuantity(500);

            Medicine m2 = new Medicine();
            m2.setName("Ibuprofeno");
            m2.setQuantity(300);

            Medicine m3 = new Medicine();
            m3.setName("Amoxicilina");
            m3.setQuantity(100);

            medicineRepository.saveAll(Arrays.asList(m1, m2, m3));
            System.out.println("Medicines seeded");
        }
    }
}
