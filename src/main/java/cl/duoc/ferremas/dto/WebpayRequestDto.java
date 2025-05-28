package cl.duoc.ferremas.dto;

public class WebpayRequestDto {
    private double amount;
    // Agrega otros campos si los necesitas para tu lógica de negocio antes de Webpay

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}