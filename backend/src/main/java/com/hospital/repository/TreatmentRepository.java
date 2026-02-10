package com.hospital.repository;

import com.hospital.model.Treatment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TreatmentRepository extends MongoRepository<Treatment, String> {
    List<Treatment> findByPatientId(String patientId);

    List<Treatment> findByStaffId(String staffId);
}
