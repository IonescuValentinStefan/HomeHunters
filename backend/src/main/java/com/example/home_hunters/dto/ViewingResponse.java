package com.example.home_hunters.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ViewingResponse {
    private String userId;
    private PropertyFirebase property;
    private String date;
    private String time;
    private String id;

    public ViewingResponse(String userId, PropertyFirebase property, String date, String time) {
        this.userId = userId;
        this.property = property;
        this.date = date;
        this.time = time;
    }
}