package infrastructure;

import java.util.ArrayList;
import java.util.List;

import domain.LeituraSensor;

public class LeituraSensorRepository {
    private ArrayList<LeituraSensor> leituras;
    private int proximoId;

    public LeituraSensorRepository() {
        leituras = new ArrayList<LeituraSensor>();
        proximoId = 1;
    }

    public LeituraSensor salvar(LeituraSensor leitura) {
        leitura.setId(proximoId);
        proximoId++;
        leituras.add(leitura);
        return leitura;
    }

    public List<LeituraSensor> listarTodos() {
        return leituras;
    }
}
