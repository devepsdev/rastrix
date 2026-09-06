package dev.deveps.rastrix.dto.request;

import dev.deveps.rastrix.entities.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(

        @NotNull
        Role role

) {
}
