package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.response.CategoryResponse;
import dev.deveps.rastrix.security.CustomUserDetailsService;
import dev.deveps.rastrix.security.JwtAuthenticationFilter;
import dev.deveps.rastrix.security.JwtService;
import dev.deveps.rastrix.security.PasswordEncoderConfig;
import dev.deveps.rastrix.security.SecurityConfig;
import dev.deveps.rastrix.services.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Comprueba, a nivel HTTP, la política pública/protegida/solo-ADMIN definida
 * en SecurityConfig. Usa CategoryController como representante del patrón
 * "catálogo": lectura pública, escritura solo ADMIN.
 */
@WebMvcTest(CategoryController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class, PasswordEncoderConfig.class})
class CategoryControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void listIsPublicWithoutAuthentication() throws Exception {
        when(categoryService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void createWithoutAuthenticationIsRejected() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Muebles\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "USER")
    void createAsRegularUserIsForbidden() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Muebles\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAsAdminSucceeds() throws Exception {
        CategoryResponse response = new CategoryResponse(
                1L, "uuid-1", "Muebles", null, null, LocalDateTime.now(), LocalDateTime.now());
        when(categoryService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Muebles\"}"))
                .andExpect(status().isCreated());
    }

}
