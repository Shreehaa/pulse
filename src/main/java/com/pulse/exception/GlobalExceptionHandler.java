package com.pulse.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException exception) {

        Map<String, Object> response = new HashMap<>();

        String message =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .filter(error ->
                                "name".equals(error.getField())
                                        && "NotBlank".equals(
                                        error.getCode()
                                )
                        )
                        .findFirst()
                        .map(error -> error.getDefaultMessage())
                        .orElseGet(() ->
                                exception.getBindingResult()
                                        .getFieldErrors()
                                        .stream()
                                        .findFirst()
                                        .map(error ->
                                                error.getDefaultMessage()
                                        )
                                        .orElse("Validation failed")
                        );

        response.put("timestamp", Instant.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("message", message);
        response.put("path", "/api/jobs");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<Map<String, Object>> handleIdempotencyConflict(
            IdempotencyConflictException exception) {
        {

            Map<String, Object> response = new HashMap<>();

            response.put("timestamp", Instant.now());
            response.put("status", HttpStatus.CONFLICT.value());
            response.put("message", exception.getMessage());
            response.put("path", "/api/jobs");

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }
    }
}