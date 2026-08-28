package infrastructure;

import java.util.ArrayList;
import java.util.List;

import domain.Satelite;

public class SateliteRepository {
    private ArrayList<Satelite> satelites;
    private int proximoId;

    public SateliteRepository() {
        satelites = new ArrayList<Satelite>();
        proximoId = 1;
    }

    public Satelite salvar(Satelite satelite) {
        satelite.setId(proximoId);
        proximoId++;
        satelites.add(satelite);
        return satelite;
    }

    public Satelite buscarPorId(int id) {
        for (Satelite satelite : satelites) {
            if (satelite.getId() == id) {
                return satelite;
            }
        }
        return null;
    }

    public List<Satelite> listarTodos() {
        return satelites;
    }
}
