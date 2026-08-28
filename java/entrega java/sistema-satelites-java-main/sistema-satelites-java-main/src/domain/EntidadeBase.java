package domain;

public class EntidadeBase {
    private int id;

    public EntidadeBase() {
    }

    public EntidadeBase(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean possuiId() {
        return id > 0;
    }

    public String exibirResumo() {
        return "Id: " + id;
    }
}
