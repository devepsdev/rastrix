package dev.deveps.rastrix.exception;

public class ResourceNotFoundException extends RastrixException {

    public ResourceNotFoundException() {
        super("El recurso solicitado no existe");
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
