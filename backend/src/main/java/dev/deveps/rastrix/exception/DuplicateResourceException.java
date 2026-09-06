package dev.deveps.rastrix.exception;

public class DuplicateResourceException extends RastrixException {

    public DuplicateResourceException() {
        super("El recurso ya existe");
    }

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }

}
