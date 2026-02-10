package com.hospital.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "treatments")
public class Treatment {
    @Id
    private String id;
    private String patientId;
    private String staffId;
    private String medicineId;
    private LocalDateTime date;
    private String notes;
}
