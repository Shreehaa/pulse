package com.pulse.controller;

import com.pulse.dto.LoginRequest;
import com.pulse.dto.RegisterRequest;
import com.pulse.entity.User;
import com.pulse.repository.UserRepository;
import com.pulse.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Map<String, String> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.username(),
                                request.password()
                        )
                );

        String role =
                authentication.getAuthorities()
                        .stream()
                        .findFirst()
                        .map(authority ->
                                authority.getAuthority()
                        )
                        .orElse("ROLE_USER");

        String token =
                jwtService.generateToken(
                        authentication.getName(),
                        role
                );

        return Map.of(
                "token",
                token
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(
            @Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(
                request.username()
        )) {
            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        User user = new User(
                request.username(),
                passwordEncoder.encode(
                        request.password()
                ),
                "USER"
        );

        userRepository.save(user);

        return Map.of(
                "message",
                "Account created successfully"
        );
    }
}