package com.medicare.medicare.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // This tells Jackson to ignore unknown properties
public class User {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String address;
    private String password;
    private String role = "USER"; // Default role is USER
    
    // Check if user is admin
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }
}