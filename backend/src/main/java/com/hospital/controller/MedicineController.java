package com.hospital.controller;

import com.hospital.model.Medicine;
import com.hospital.service.MedicineService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {
    private final MedicineService service;

    public MedicineController(MedicineService service) {
        this.service = service;
    }

    @GetMapping
    public List<Medicine> getAll(@RequestParam(value = "q", required = false) String q) {
        return service.search(q);
    }

    @GetMapping("/{id}")
    public Medicine getById(@PathVariable String id) {
        return service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicina no encontrada: " + id));
    }

    @PostMapping
    public Medicine create(@RequestBody Medicine medicine) {
        medicine.setId(null);
        return service.save(medicine);
    }

    @PutMapping("/{id}")
    public Medicine update(@PathVariable String id, @RequestBody Medicine medicine) {
        service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicina no encontrada: " + id));
        medicine.setId(id);
        return service.save(medicine);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteById(id);
    }

    @DeleteMapping
    public void deleteMany(@RequestBody List<String> ids) {
        service.deleteMany(ids);
    }
}
