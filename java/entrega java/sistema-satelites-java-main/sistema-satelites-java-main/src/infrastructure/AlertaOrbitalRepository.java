package infrastructure;

import java.util.ArrayList;
import java.util.List;

import domain.AlertaOrbital;

public class AlertaOrbitalRepository {
    private ArrayList<AlertaOrbital> alertas;
    private int proximoId;

    public AlertaOrbitalRepository() {
        alertas = new ArrayList<AlertaOrbital>();
        proximoId = 1;
    }

    public AlertaOrbital salvar(AlertaOrbital alerta) {
        alerta.setId(proximoId);
        proximoId++;
        alertas.add(alerta);
        return alerta;
    }

    public List<AlertaOrbital> listarTodos() {
        return alertas;
    }
}
