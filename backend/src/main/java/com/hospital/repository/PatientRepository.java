package com.hospital.repository;

import com.hospital.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PatientRepository extends MongoRepository<Patient, String> {

    /**
     * Búsqueda flexible (case-insensitive) por name o medicalHistory.
     */
    @Query("{ '$or': [ " +
            "{ 'name': { $regex: ?0, $options: 'i' } }, " +
            "{ 'medicalHistory': { $regex: ?0, $options: 'i' } } " +
            "] }")
    List<Patient> search(String q);
}
