package com.restaurant.ordersystem.config;

import com.restaurant.ordersystem.model.MenuItem;
import com.restaurant.ordersystem.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    
    private final MenuItemRepository menuItemRepository;
    
    @Override
    public void run(String... args) {
        // Pizzas
        menuItemRepository.save(new MenuItem(null, "Pizza Margherita", 
            "Sauce tomate, mozzarella, basilic frais", 9.99, "PIZZA", 
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002", 50, true));
        
        menuItemRepository.save(new MenuItem(null, "Pizza 4 Fromages", 
            "Mozzarella, gorgonzola, parmesan, chèvre", 12.99, "PIZZA", 
            "https://images.unsplash.com/photo-1513104890138-7c749659a591", 50, true));
        
        menuItemRepository.save(new MenuItem(null, "Pizza Pepperoni", 
            "Sauce tomate, mozzarella, pepperoni épicé", 11.99, "PIZZA", 
            "https://images.unsplash.com/photo-1628840042765-356cda07504e", 50, true));
        
        // Burgers
        menuItemRepository.save(new MenuItem(null, "Classic Burger", 
            "Boeuf, cheddar, salade, tomate, oignons", 8.99, "BURGER", 
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", 50, true));
        
        menuItemRepository.save(new MenuItem(null, "Chicken Burger", 
            "Poulet croustillant, sauce barbecue, salade", 9.49, "BURGER", 
            "https://images.unsplash.com/photo-1606755962773-d324e0a13086", 50, true));
        
        menuItemRepository.save(new MenuItem(null, "Veggie Burger", 
            "Steak végétal, avocat, tomate, salade", 8.49, "BURGER", 
            "https://images.unsplash.com/photo-1520072959219-c595dc870360", 50, true));
        
        // Boissons
        menuItemRepository.save(new MenuItem(null, "Coca-Cola", 
            "33cl", 2.50, "BOISSON", 
            "https://images.unsplash.com/photo-1554866585-cd94860890b7", 100, true));
        
        menuItemRepository.save(new MenuItem(null, "Schweppes", 
            "33cl", 2.50, "BOISSON", 
            "https://images.unsplash.com/photo-1581006852262-e4307cf6283a", 100, true));
        
        menuItemRepository.save(new MenuItem(null, "Jus d'Orange", 
            "25cl pressé", 3.50, "BOISSON", 
            "https://images.unsplash.com/photo-1600271886742-f049cd451bba", 50, true));
        
        // Desserts
        menuItemRepository.save(new MenuItem(null, "Tiramisu", 
            "Mascarpone, café, cacao", 5.99, "DESSERT", 
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9", 30, true));
        
        menuItemRepository.save(new MenuItem(null, "Brownie Chocolat", 
            "Avec glace vanille", 4.99, "DESSERT", 
            "https://images.unsplash.com/photo-1607920591413-4ec007e70023", 30, true));
        
        menuItemRepository.save(new MenuItem(null, "Tarte aux Pommes", 
            "Maison, servie tiède", 5.49, "DESSERT", 
            "https://images.unsplash.com/photo-1535920527002-b35e96722eb9", 30, true));
        
        System.out.println("✅ Données de test chargées avec succès!");
    }
}
