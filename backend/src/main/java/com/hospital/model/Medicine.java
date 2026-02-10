package com.hospital.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "medicines")
public class Medicine {
    @Id
    private String id;
    private String name;
    private int quantity;
}
