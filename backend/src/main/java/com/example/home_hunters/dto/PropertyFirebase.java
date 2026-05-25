package com.example.home_hunters.dto;

import com.google.cloud.Timestamp;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PropertyFirebase {
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String userEmail;
    private String userId;
    private String title;
    private String description;
    private double price;
    private int rooms;
    private int bathrooms;
    private double surfaceArea;
    private List<String> photoUrls;
    private int photoCount;
    private Location location;
    private String address;
    private Object marker;
    private List<String> amenities;
    private List<String> customAmenities;
    private transient Timestamp timestamp;
    private String furnished;
    private String transactionType;
    private String propertyType;

    private String id;
}
