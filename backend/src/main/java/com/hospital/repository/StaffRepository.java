package com.hospital.repository;

import com.hospital.model.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface StaffRepository extends MongoRepository<Staff, String> {

    /**
     * Búsqueda flexible (case-insensitive) por name, role o specialization.
     * role se guarda como string en Mongo (por defecto), así que el regex funciona.
     */
    @Query("{ '$or': [ " +
            "{ 'name': { $regex: ?0, $options: 'i' } }, " +
            "{ 'role': { $regex: ?0, $options: 'i' } }, " +
            "{ 'specialization': { $regex: ?0, $options: 'i' } } " +
            "] }")
    List<Staff> search(String q);
}
