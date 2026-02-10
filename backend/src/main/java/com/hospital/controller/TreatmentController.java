package com.hospital.controller;

import com.hospital.model.Treatment;
import com.hospital.service.TreatmentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/treatments")
public class TreatmentController {
    private final TreatmentService service;

    public TreatmentController(TreatmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Treatment> getAll() {
        return service.findAll();
    }

    // Endpoint para buscar uno solo (necesario para "Editar")
    @GetMapping("/{id}")
    public Treatment getById(@PathVariable String id) {
        return service.findById(id).orElseThrow(() -> new RuntimeException("Treatment not found"));
    }

    @PostMapping
    public Treatment create(@RequestBody Treatment treatment) {
        return service.createTreatment(treatment);
    }

    // Endpoint para actualizar
    @PutMapping("/{id}")
    public Treatment update(@PathVariable String id, @RequestBody Treatment treatment) {
        return service.updateTreatment(id, treatment);
    }

    @GetMapping("/patient/{patientId}")
    public List<Treatment> getByPatient(@PathVariable String patientId) {
        return service.findByPatientId(patientId);
    }

    // --- EL ENDPOINT QUE FALTABA PARA BORRAR ---
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteTreatment(id);
    }
}