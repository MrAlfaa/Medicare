package com.medicare.medicare.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    
    @GetMapping("/")
    public String home() {
        // Redirect to the login page when the application starts
        return "redirect:/e_commerce/pages/pages/login.html";
    }
    
    @GetMapping("/medicines")
    public String medicines() {
        return "redirect:/e_commerce/pages/pages/medicines.html";
    }
}