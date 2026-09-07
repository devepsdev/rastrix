package dev.deveps.rastrix.services;

public interface EmailService {

    void sendPasswordResetCode(String to, String userName, String code);

}
