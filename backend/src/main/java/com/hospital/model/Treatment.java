package com.hospital.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "treatments")
public class Treatment {
    @Id
    private String id;
    private String patientId;
    private String staffId;
    private String medicineId;
    private String date;
    private String notes;
    private String description;
}