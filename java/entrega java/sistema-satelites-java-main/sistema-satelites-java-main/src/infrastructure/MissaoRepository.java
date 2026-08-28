package infrastructure;

import java.util.ArrayList;
import java.util.List;

import domain.Missao;

public class MissaoRepository {
    private ArrayList<Missao> missoes;
    private int proximoId;

    public MissaoRepository() {
        missoes = new ArrayList<Missao>();
        proximoId = 1;
    }

    public Missao salvar(Missao missao) {
        missao.setId(proximoId);
        proximoId++;
        missoes.add(missao);
        return missao;
    }

    public List<Missao> listarTodos() {
        return missoes;
    }
}
