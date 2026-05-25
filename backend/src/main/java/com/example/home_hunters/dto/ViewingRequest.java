package com.example.home_hunters.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ViewingRequest {
    private String userId;
    private String propertyId;
    private String date;
    private String time;
}
