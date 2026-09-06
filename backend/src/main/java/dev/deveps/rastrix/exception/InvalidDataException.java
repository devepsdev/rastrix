package dev.deveps.rastrix.exception;

public class InvalidDataException extends RastrixException {

    public InvalidDataException() {
        super("Los datos proporcionados no son válidos");
    }

    public InvalidDataException(String message) {
        super(message);
    }

    public InvalidDataException(String message, Throwable cause) {
        super(message, cause);
    }

}
