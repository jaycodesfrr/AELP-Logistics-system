package com.aelp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AelpApplication {
    public static void main(String[] args) {
        SpringApplication.run(AelpApplication.class, args);
        System.out.println("==========================================================================");
        System.out.println(" Antarctica Expedition & Logistics Platform (AELP) Enterprise Core Running ");
        System.out.println("==========================================================================");
    }
}
