package domain;

public class LeituraSensor extends EntidadeBase {
    private int sateliteId;
    private String tipo;
    private double valor;
    private String unidade;

    public LeituraSensor() {
        super();
    }

    public LeituraSensor(int id, int sateliteId, String tipo, double valor, String unidade) {
        super(id);
        this.sateliteId = sateliteId;
        this.tipo = tipo;
        this.valor = valor;
        this.unidade = unidade;
    }

    public boolean estaEmRisco() {
        if ("temperatura".equalsIgnoreCase(tipo) && valor > 70) {
            return true;
        }
        if ("bateria".equalsIgnoreCase(tipo) && valor < 20) {
            return true;
        }
        return "sinal".equalsIgnoreCase(tipo) && valor < 30;
    }

    @Override
    public String exibirResumo() {
        return super.exibirResumo()
                + " | Satelite ID: " + sateliteId
                + " | Tipo: " + tipo
                + " | Valor: " + valor + " " + unidade
                + " | Risco: " + (estaEmRisco() ? "sim" : "nao");
    }

    public int getSateliteId() {
        return sateliteId;
    }

    public void setSateliteId(int sateliteId) {
        this.sateliteId = sateliteId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }
}
