package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketImportResponse;
import dev.deveps.rastrix.dto.response.MarketResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface MarketService {

    MarketResponse create(MarketRequest request);

    MarketResponse update(Long id, MarketRequest request);

    /**
     * Alta o actualización según la clave natural (nombre + ciudad), pensado
     * para importaciones repetidas. Al actualizar respeta el estado de
     * publicación que tenga el mercado: si un administrador lo ha ocultado,
     * una importación posterior no vuelve a publicarlo.
     */
    MarketImportResponse upsert(MarketRequest request);

    void delete(Long id);

    /** Panel de administración: incluye mercados ocultos. */
    MarketResponse findByIdIncludingHidden(Long id);

    /** Panel de administración: incluye ocultos, con filtros opcionales. */
    PageResponse<MarketResponse> searchForAdmin(Boolean active, String query, Pageable pageable);

    /** App: solo publicados, filtrando por texto (nombre, ciudad, provincia) y categoría. */
    PageResponse<MarketResponse> search(String query, Long categoryId, Pageable pageable);

    MarketResponse findById(Long id);

    MarketResponse findByUuid(String uuid);

    PageResponse<MarketResponse> findAll(Pageable pageable);

    PageResponse<MarketResponse> findByCity(String city, Pageable pageable);

    PageResponse<MarketResponse> findByProvince(String province, Pageable pageable);

}
