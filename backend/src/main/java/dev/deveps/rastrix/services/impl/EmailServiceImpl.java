package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendPasswordResetCode(String to, String userName, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Código para recuperar tu contraseña - Rastrix");
            helper.setText(buildBody(userName, code), true);

            mailSender.send(message);
            log.info("Email de recuperación de contraseña enviado a: {}", to);
        } catch (MessagingException e) {
            log.error("Error al enviar el email de recuperación a {}: {}", to, e.getMessage());
            throw new IllegalStateException("No se ha podido enviar el email de recuperación", e);
        }
    }

    private String buildBody(String userName, String code) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recuperar contraseña</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                        <tr>
                            <td align="center">
                                <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="background-color: #0f172a; padding: 24px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Rastrix</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 32px 30px;">
                                            <h2 style="color: #333333; margin-top: 0; font-size: 18px;">Hola %s,</h2>
                                            <p style="color: #666666; font-size: 15px; line-height: 1.6;">
                                                Has solicitado recuperar tu contraseña. Introduce este código en la app para continuar:
                                            </p>
                                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <span style="display: inline-block; padding: 16px 32px; background-color: #f1f5f9; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">%s</span>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin: 0; color: #856404; font-size: 13px; text-align: center;">
                                                ⏱️ Este código caduca en 15 minutos.
                                            </p>
                                            <p style="color: #999999; font-size: 13px; line-height: 1.6; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eeeeee;">
                                                Si no has solicitado recuperar tu contraseña, puedes ignorar este correo con tranquilidad: tu contraseña actual seguirá siendo válida.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #f8f8f8; padding: 16px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                                            <p style="color: #999999; font-size: 12px; margin: 0;">© 2026 Rastrix</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(userName, code);
    }

}
