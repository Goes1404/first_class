package domain;

public class AlertaOrbital extends EntidadeBase {
    private int sateliteId;
    private String descricao;
    private boolean ativo;

    public AlertaOrbital() {
        super();
    }

    public AlertaOrbital(int id, int sateliteId, String descricao, boolean ativo) {
        super(id);
        this.sateliteId = sateliteId;
        this.descricao = descricao;
        this.ativo = ativo;
    }

    @Override
    public String exibirResumo() {
        return super.exibirResumo()
                + " | Satelite ID: " + sateliteId
                + " | Ativo: " + (ativo ? "sim" : "nao")
                + " | Descricao: " + descricao;
    }

    public int getSateliteId() {
        return sateliteId;
    }

    public void setSateliteId(int sateliteId) {
        this.sateliteId = sateliteId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
