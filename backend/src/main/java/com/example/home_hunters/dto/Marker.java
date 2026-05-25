package com.example.home_hunters.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Marker {
    private Location location;
    private double price;
    private int rooms;
    private String title;
    private double surfaceArea;
}
