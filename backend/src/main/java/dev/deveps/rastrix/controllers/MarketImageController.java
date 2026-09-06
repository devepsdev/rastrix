package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.MarketImageRequest;
import dev.deveps.rastrix.dto.response.MarketImageResponse;
import dev.deveps.rastrix.services.MarketImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequestMapping("/api/market-images")
@RequiredArgsConstructor
public class MarketImageController {

    private final MarketImageService marketImageService;

    @GetMapping("/{id}")
    public MarketImageResponse findById(@PathVariable Long id) {
        return marketImageService.findById(id);
    }

    @GetMapping("/market/{marketId}")
    public List<MarketImageResponse> findByMarketId(@PathVariable Long marketId) {
        return marketImageService.findByMarketId(marketId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketImageResponse> create(@Valid @RequestBody MarketImageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketImageService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MarketImageResponse update(@PathVariable Long id, @Valid @RequestBody MarketImageRequest request) {
        return marketImageService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        marketImageService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
