package com.hospital.controller;

import com.hospital.model.Staff;
import com.hospital.service.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    private final StaffService service;

    public StaffController(StaffService service) {
        this.service = service;
    }

    // LIST + SEARCH
    @GetMapping
    public List<Staff> getAll(@RequestParam(value = "q", required = false) String q) {
        return service.search(q);
    }

    @GetMapping("/{id}")
    public Staff getById(@PathVariable String id) {
        return service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff no encontrado: " + id));
    }

    @PostMapping
    public Staff create(@RequestBody Staff staff) {
        // por seguridad, al crear ignoramos id si viene
        staff.setId(null);
        return service.save(staff);
    }

    @PutMapping("/{id}")
    public Staff update(@PathVariable String id, @RequestBody Staff staff) {
        // si no existe -> 404
        service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff no encontrado: " + id));
        staff.setId(id);
        return service.save(staff);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteById(id);
    }

    // BULK DELETE (body: ["id1","id2",...])
    @DeleteMapping
    public void deleteMany(@RequestBody List<String> ids) {
        service.deleteMany(ids);
    }
}
