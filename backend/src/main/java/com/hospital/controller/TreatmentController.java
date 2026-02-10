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

    @PostMapping
    public Treatment create(@RequestBody Treatment treatment) {
        return service.createTreatment(treatment);
    }

    @GetMapping("/patient/{patientId}")
    public List<Treatment> getByPatient(@PathVariable String patientId) {
        return service.findByPatientId(patientId);
    }
}
