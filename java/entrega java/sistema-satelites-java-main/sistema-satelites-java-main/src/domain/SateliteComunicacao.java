package domain;

public class SateliteComunicacao extends Satelite {
    private int quantidadeAntenas;

    public SateliteComunicacao() {
        super();
    }

    public SateliteComunicacao(int id, String nome, String status, double altitudeKm, int quantidadeAntenas) {
        super(id, nome, status, altitudeKm);
        this.quantidadeAntenas = quantidadeAntenas;
    }

    @Override
    public int calcularPrioridadeOperacional() {
        if ("problema".equalsIgnoreCase(getStatus())) {
            return 10;
        }
        if (quantidadeAntenas <= 1) {
            return 7;
        }
        return 3;
    }

    @Override
    public String exibirResumo() {
        return "Satelite de comunicacao -> " + super.exibirResumo()
                + " | Antenas: " + quantidadeAntenas;
    }

    public int getQuantidadeAntenas() {
        return quantidadeAntenas;
    }

    public void setQuantidadeAntenas(int quantidadeAntenas) {
        this.quantidadeAntenas = quantidadeAntenas;
    }
}
