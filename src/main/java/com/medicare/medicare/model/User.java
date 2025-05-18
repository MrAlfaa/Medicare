package com.medicare.medicare.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    // Mark this as JsonProperty so it's properly handled in serialization/deserialization
    @JsonProperty("admin")
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }
    
    // This ensures the admin field is properly set during deserialization
    @JsonProperty("admin")
    private void setAdmin(boolean admin) {
        // This is just a setter for Jackson - we don't need to do anything here
        // since the role field controls the admin status
    }
}