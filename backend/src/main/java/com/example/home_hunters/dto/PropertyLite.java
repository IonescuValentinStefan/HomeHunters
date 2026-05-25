package com.example.home_hunters.dto;

import lombok.Data;

import java.util.List;

@Data
public class PropertyLite {
    private String id;
    private String title;
    private String description;
    private double surfaceArea;
    private int rooms;
    private int bathrooms;
    private List<String> amenities;
    private String transactionType;
    private String furnished;
    private String propertyType;
    private double price;
}

