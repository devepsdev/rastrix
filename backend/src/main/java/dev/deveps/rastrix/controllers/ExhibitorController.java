package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.ExhibitorRequest;
import dev.deveps.rastrix.dto.response.ExhibitorResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.services.ExhibitorService;
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

import java.util.List;

@RestController
@RequestMapping("/api/exhibitors")
@RequiredArgsConstructor
public class ExhibitorController {

    private final ExhibitorService exhibitorService;

    @GetMapping
    public PageResponse<ExhibitorResponse> findAll(Pageable pageable) {
        return exhibitorService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ExhibitorResponse findById(@PathVariable Long id) {
        return exhibitorService.findById(id);
    }

    @GetMapping("/market/{marketId}")
    public List<ExhibitorResponse> findByMarketId(@PathVariable Long marketId) {
        return exhibitorService.findByMarketId(marketId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExhibitorResponse> create(@Valid @RequestBody ExhibitorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exhibitorService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ExhibitorResponse update(@PathVariable Long id, @Valid @RequestBody ExhibitorRequest request) {
        return exhibitorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exhibitorService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
