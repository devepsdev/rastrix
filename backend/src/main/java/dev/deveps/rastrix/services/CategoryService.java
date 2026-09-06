package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.CategoryRequest;
import dev.deveps.rastrix.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);

    CategoryResponse findById(Long id);

    CategoryResponse findByUuid(String uuid);

    List<CategoryResponse> findAll();

}
