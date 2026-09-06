package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.MarketCategoryRequest;
import dev.deveps.rastrix.dto.response.MarketCategoryResponse;
import dev.deveps.rastrix.services.MarketCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market-categories")
@RequiredArgsConstructor
public class MarketCategoryController {

    private final MarketCategoryService marketCategoryService;

    @GetMapping("/{id}")
    public MarketCategoryResponse findById(@PathVariable Long id) {
        return marketCategoryService.findById(id);
    }

    @GetMapping("/market/{marketId}")
    public List<MarketCategoryResponse> findByMarketId(@PathVariable Long marketId) {
        return marketCategoryService.findByMarketId(marketId);
    }

    @GetMapping("/category/{categoryId}")
    public List<MarketCategoryResponse> findByCategoryId(@PathVariable Long categoryId) {
        return marketCategoryService.findByCategoryId(categoryId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketCategoryResponse> create(@Valid @RequestBody MarketCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketCategoryService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        marketCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
