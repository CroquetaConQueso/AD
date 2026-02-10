package com.hospital.service;

import com.hospital.model.Staff;
import com.hospital.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {
    private final StaffRepository repository;

    public StaffService(StaffRepository repository) {
        this.repository = repository;
    }

    public List<Staff> findAll() {
        return repository.findAll();
    }

    public List<Staff> search(String q) {
        if (q == null || q.trim().isEmpty()) return repository.findAll();
        return repository.search(q.trim());
    }

    public Optional<Staff> findById(String id) {
        return repository.findById(id);
    }

    public Staff save(Staff staff) {
        return repository.save(staff);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }

    public void deleteMany(List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        ids.forEach(repository::deleteById);
    }
}
