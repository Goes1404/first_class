package domain;

public class Satelite extends EntidadeBase {
    private String nome;
    private String status;
    private double altitudeKm;

    public Satelite() {
        super();
    }

    public Satelite(int id, String nome, String status, double altitudeKm) {
        super(id);
        this.nome = nome;
        this.status = status;
        this.altitudeKm = altitudeKm;
    }

    public int calcularPrioridadeOperacional() {
        return 5;
    }

    public String mostrarSituacao() {
        return nome + " esta com status " + status;
    }

    public String mostrarSituacao(String observacao) {
        return mostrarSituacao() + ". Observacao: " + observacao;
    }

    @Override
    public String exibirResumo() {
        return super.exibirResumo()
                + " | Nome: " + nome
                + " | Status: " + status
                + " | Altitude: " + altitudeKm + " km"
                + " | Prioridade: " + calcularPrioridadeOperacional();
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getAltitudeKm() {
        return altitudeKm;
    }

    public void setAltitudeKm(double altitudeKm) {
        this.altitudeKm = altitudeKm;
    }
}
