package com.example.home_hunters.dto;

import lombok.Data;

import java.util.List;

@Data
public class FormData {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String propertyType;
    private String transactionType;
    private String furnished;
    private String address;
    private int rooms;
    private int bathrooms;
    private double surfaceArea;
    private List<String> amenities;
    private List<String> customAmenities;
    private String title;
    private String description;
    private double price;

    @Override
    public String toString() {
        return "FormData{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", propertyType='" + propertyType + '\'' +
                ", transactionType='" + transactionType + '\'' +
                ", furnished='" + furnished + '\'' +
                ", address='" + address + '\'' +
                ", rooms=" + rooms +
                ", bathrooms=" + bathrooms +
                ", surfaceArea=" + surfaceArea +
                ", amenities=" + amenities +
                ", customAmenities=" + customAmenities +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                '}';
    }
}
