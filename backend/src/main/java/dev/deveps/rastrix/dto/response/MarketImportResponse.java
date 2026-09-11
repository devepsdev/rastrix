package dev.deveps.rastrix.dto.response;

/**
 * Resultado de importar un mercado: además del mercado resultante, indica si
 * se ha dado de alta o si ya existía y se ha actualizado. El importador
 * automático lo usa para saber cuántas altas reales trae cada pasada.
 */
public record MarketImportResponse(

        MarketResponse market,
        boolean created

) {
}
