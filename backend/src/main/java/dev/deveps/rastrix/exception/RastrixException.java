package dev.deveps.rastrix.exception;

public abstract class RastrixException extends RuntimeException {

    protected RastrixException(String message) {
        super(message);
    }

    protected RastrixException(String message, Throwable cause) {
        super(message, cause);
    }

}
