package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.services.MarketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/markets")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping
    public PageResponse<MarketResponse> findAll(Pageable pageable) {
        return marketService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public MarketResponse findById(@PathVariable Long id) {
        return marketService.findById(id);
    }

    @GetMapping("/uuid/{uuid}")
    public MarketResponse findByUuid(@PathVariable String uuid) {
        return marketService.findByUuid(uuid);
    }

    @GetMapping("/city/{city}")
    public PageResponse<MarketResponse> findByCity(@PathVariable String city, Pageable pageable) {
        return marketService.findByCity(city, pageable);
    }

    @GetMapping("/province/{province}")
    public PageResponse<MarketResponse> findByProvince(@PathVariable String province, Pageable pageable) {
        return marketService.findByProvince(province, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketResponse> create(@Valid @RequestBody MarketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MarketResponse update(@PathVariable Long id, @Valid @RequestBody MarketRequest request) {
        return marketService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        marketService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
