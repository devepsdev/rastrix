package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.ExhibitorRequest;
import dev.deveps.rastrix.dto.response.ExhibitorResponse;

import java.util.List;

public interface ExhibitorService {

    ExhibitorResponse create(ExhibitorRequest request);

    ExhibitorResponse update(Long id, ExhibitorRequest request);

    void delete(Long id);

    ExhibitorResponse findById(Long id);

    List<ExhibitorResponse> findByMarketId(Long marketId);

    List<ExhibitorResponse> findAll();

}
