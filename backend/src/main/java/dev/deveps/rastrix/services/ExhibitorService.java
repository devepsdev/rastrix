package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.ExhibitorRequest;
import dev.deveps.rastrix.dto.response.ExhibitorResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExhibitorService {

    ExhibitorResponse create(ExhibitorRequest request);

    ExhibitorResponse update(Long id, ExhibitorRequest request);

    void delete(Long id);

    ExhibitorResponse findById(Long id);

    List<ExhibitorResponse> findByMarketId(Long marketId);

    PageResponse<ExhibitorResponse> findAll(Pageable pageable);

}
