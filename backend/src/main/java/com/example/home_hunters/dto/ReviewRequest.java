package com.example.home_hunters.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private int rating;
    private String review;
    private String fullName;
    private String email;
}