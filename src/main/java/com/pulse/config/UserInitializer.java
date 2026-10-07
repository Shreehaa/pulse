package com.pulse.config;

import com.pulse.entity.User;
import com.pulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserInitializer {

    @Bean
    CommandLineRunner initializeDefaultUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${pulse.app.username}") String username,
            @Value("${pulse.app.password}") String password
    ) {
        return args -> {

            if (!userRepository.existsByUsername(username)) {

                User user = new User(
                        username,
                        passwordEncoder.encode(password),
                        "USER"
                );

                userRepository.save(user);
            }
        };
    }
}