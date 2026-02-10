package com.hospital.service;

import com.hospital.model.Medicine;
import com.hospital.model.Treatment;
import com.hospital.repository.MedicineRepository;
import com.hospital.repository.TreatmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class TreatmentService {
    private final TreatmentRepository treatmentRepository;
    private final MedicineRepository medicineRepository;

    public TreatmentService(TreatmentRepository treatmentRepository, MedicineRepository medicineRepository) {
        this.treatmentRepository = treatmentRepository;
        this.medicineRepository = medicineRepository;
    }

    public List<Treatment> findAll() {
        return treatmentRepository.findAll();
    }

    @Transactional
    public Treatment createTreatment(Treatment treatment) {
        if (treatment.getMedicineId() != null) {
            Optional<Medicine> medicineOpt = medicineRepository.findById(treatment.getMedicineId());
            if (medicineOpt.isPresent()) {
                Medicine medicine = medicineOpt.get();
                if (medicine.getQuantity() > 0) {
                    medicine.setQuantity(medicine.getQuantity() - 1);
                    medicineRepository.save(medicine);
                } else {
                    String currentNotes = treatment.getNotes() != null ? treatment.getNotes() : "";
                    treatment.setNotes(currentNotes + " [WARNING: Medicine out of stock]");
                }
            }
        }
        return treatmentRepository.save(treatment);
    }

    public List<Treatment> findByPatientId(String patientId) {
        return treatmentRepository.findByPatientId(patientId);
    }
}
