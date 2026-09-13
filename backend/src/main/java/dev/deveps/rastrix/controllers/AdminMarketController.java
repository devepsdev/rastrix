package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.response.MarketResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.services.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lectura de mercados para el panel de administración. A diferencia de
 * /api/markets, incluye los ocultos: es donde se revisa lo pendiente. Las
 * escrituras siguen en MarketController, también restringidas a ADMIN.
 */
@RestController
@RequestMapping("/api/admin/markets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMarketController {

    private final MarketService marketService;

    @GetMapping
    public PageResponse<MarketResponse> search(
            @RequestParam(required = false) Boolean active,
            @RequestParam(name = "q", required = false) String query,
            Pageable pageable) {
        return marketService.searchForAdmin(active, query, pageable);
    }

    @GetMapping("/{id}")
    public MarketResponse findById(@PathVariable Long id) {
        return marketService.findByIdIncludingHidden(id);
    }

}
