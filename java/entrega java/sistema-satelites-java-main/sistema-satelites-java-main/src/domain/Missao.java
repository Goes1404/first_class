package domain;

public class Missao extends EntidadeBase {
    private String nome;
    private String objetivo;
    private int sateliteId;

    public Missao() {
        super();
    }

    public Missao(int id, String nome, String objetivo, int sateliteId) {
        super(id);
        this.nome = nome;
        this.objetivo = objetivo;
        this.sateliteId = sateliteId;
    }

    @Override
    public String exibirResumo() {
        return super.exibirResumo()
                + " | Missao: " + nome
                + " | Objetivo: " + objetivo
                + " | Satelite ID: " + sateliteId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getObjetivo() {
        return objetivo;
    }

    public void setObjetivo(String objetivo) {
        this.objetivo = objetivo;
    }

    public int getSateliteId() {
        return sateliteId;
    }

    public void setSateliteId(int sateliteId) {
        this.sateliteId = sateliteId;
    }
}
