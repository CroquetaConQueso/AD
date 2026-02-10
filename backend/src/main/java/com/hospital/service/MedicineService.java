package com.hospital.service;

import com.hospital.model.Medicine;
import com.hospital.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {
    private final MedicineRepository repository;

    public MedicineService(MedicineRepository repository) {
        this.repository = repository;
    }

    public List<Medicine> findAll() {
        return repository.findAll();
    }

    public List<Medicine> search(String q) {
        if (q == null || q.trim().isEmpty()) return repository.findAll();
        return repository.search(q.trim());
    }

    public Optional<Medicine> findById(String id) {
        return repository.findById(id);
    }

    public Medicine save(Medicine medicine) {
        return repository.save(medicine);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }

    public void deleteMany(List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        ids.forEach(repository::deleteById);
    }
}
