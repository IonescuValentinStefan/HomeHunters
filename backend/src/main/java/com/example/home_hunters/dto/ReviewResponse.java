package com.example.home_hunters.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private int rating;
    private String review;
    private String fullName;
    private String email;
    private Date date;
}
