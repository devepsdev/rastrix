package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.response.StatsResponse;
import dev.deveps.rastrix.services.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StatsService statsService;

    @GetMapping("/stats")
    public StatsResponse getStats() {
        return statsService.getStats();
    }

}
