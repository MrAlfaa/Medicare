package com.medicare.medicare.service;

import com.medicare.medicare.model.Order;
import com.medicare.medicare.model.Product;
import com.medicare.medicare.repository.OrderFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderFileRepository orderRepository;
    private final ProductService productService;

    @Autowired
    public OrderService(OrderFileRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public List<Order> findByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Order placeOrder(Order order) {
        // Process the order
        // Update inventory - decrease stock for each item
        for (Order.OrderItem item : order.getItems()) {
            Product product = productService.findById(item.getProductId());
            if (product != null) {
                int newStock = product.getStock() - item.getQuantity();
                product.setStock(Math.max(0, newStock)); // Don't go below 0
                productService.save(product);
            }
        }

        // Save the order
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = findById(orderId);
        if (order != null) {
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }
}