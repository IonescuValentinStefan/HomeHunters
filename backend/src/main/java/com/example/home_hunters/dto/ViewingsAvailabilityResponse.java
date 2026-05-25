package com.example.home_hunters.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewingsAvailabilityResponse {
    private String date;
    private List<TimeSlot> timeSlots;
}

