package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.CategoryRequest;
import dev.deveps.rastrix.dto.response.CategoryResponse;
import dev.deveps.rastrix.entities.Category;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void createThrowsWhenNameAlreadyExists() {
        CategoryRequest request = new CategoryRequest("Muebles", "desc", null);
        when(categoryRepository.existsByName("Muebles")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(categoryRepository, never()).save(any());
    }

    @Test
    void createSavesCategoryWhenNameIsFree() {
        CategoryRequest request = new CategoryRequest("Muebles", "desc", "icon.png");
        when(categoryRepository.existsByName("Muebles")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryResponse response = categoryService.create(request);

        assertThat(response.name()).isEqualTo("Muebles");
        assertThat(response.description()).isEqualTo("desc");
        assertThat(response.icon()).isEqualTo("icon.png");
    }

    @Test
    void updateThrowsWhenCategoryDoesNotExist() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        CategoryRequest request = new CategoryRequest("Muebles", null, null);

        assertThatThrownBy(() -> categoryService.update(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateThrowsWhenRenamingToAnExistingName() {
        Category existing = Category.builder().id(1L).name("Muebles").build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsByName("Relojes")).thenReturn(true);

        CategoryRequest request = new CategoryRequest("Relojes", null, null);

        assertThatThrownBy(() -> categoryService.update(1L, request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void updateAllowsKeepingTheSameName() {
        Category existing = Category.builder().id(1L).name("Muebles").description("old").build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        when(categoryRepository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryRequest request = new CategoryRequest("Muebles", "new description", null);

        CategoryResponse response = categoryService.update(1L, request);

        assertThat(response.description()).isEqualTo("new description");
        assertThat(captor.getValue().getName()).isEqualTo("Muebles");
        verify(categoryRepository, never()).existsByName(any());
    }

    @Test
    void deleteThrowsWhenCategoryDoesNotExist() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(categoryRepository, never()).delete(any());
    }

}
