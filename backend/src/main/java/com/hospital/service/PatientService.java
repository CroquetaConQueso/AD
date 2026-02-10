package com.hospital.service;

import com.hospital.model.Patient;
import com.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public List<Patient> findAll() {
        return repository.findAll();
    }

    public List<Patient> search(String q) {
        if (q == null || q.trim().isEmpty()) return repository.findAll();
        return repository.search(q.trim());
    }

    public Optional<Patient> findById(String id) {
        return repository.findById(id);
    }

    public Patient save(Patient patient) {
        return repository.save(patient);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }

    public void deleteMany(List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        ids.forEach(repository::deleteById);
    }
}
