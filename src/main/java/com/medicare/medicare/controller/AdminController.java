package com.medicare.medicare.controller;

import com.medicare.medicare.model.User;
import com.medicare.medicare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }
    
    // Admin dashboard page
    @GetMapping("/dashboard")
    public String dashboard() {
        return "redirect:/admin/css/index.html";
    }
    
    // User management page
    @GetMapping("/users")
    public String users() {
        return "redirect:/admin/css/pages/users.html";
    }
    
    // Get specific user (AJAX endpoint)
    @GetMapping("/users/get/{id}")
    @ResponseBody
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    // Save or update user
    @PostMapping("/users/save")
    @ResponseBody
    public User saveUser(@ModelAttribute User user) {
        // Check if it's a new user
        boolean isNewUser = user.getId() == null || user.getId() == 0;
        
        // Special handling for password if it's an update
        if (!isNewUser && (user.getPassword() == null || user.getPassword().isEmpty())) {
            User existingUser = userService.findById(user.getId());
            if (existingUser != null) {
                user.setPassword(existingUser.getPassword());
            }
        }
        
        return userService.register(user);
    }
    
    // Delete user
    @PostMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id, Model model) {
        try {
            User user = userService.findById(id);
            if (user != null) {
                // Don't allow deletion of admin users
                if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                    model.addAttribute("error", "Admin users cannot be deleted");
                } else {
                    userService.deleteUser(id);
                    model.addAttribute("success", "User deleted successfully");
                }
            } else {
                model.addAttribute("error", "User not found");
            }
        } catch (Exception e) {
            model.addAttribute("error", "Failed to delete user: " + e.getMessage());
        }
        
        return "redirect:/admin/users";
    }
}