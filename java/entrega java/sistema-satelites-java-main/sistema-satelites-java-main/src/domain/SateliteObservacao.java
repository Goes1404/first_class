package domain;

public class SateliteObservacao extends Satelite {
    private String areaMonitorada;

    public SateliteObservacao() {
        super();
    }

    public SateliteObservacao(int id, String nome, String status, double altitudeKm, String areaMonitorada) {
        super(id, nome, status, altitudeKm);
        this.areaMonitorada = areaMonitorada;
    }

    @Override
    public int calcularPrioridadeOperacional() {
        if ("problema".equalsIgnoreCase(getStatus())) {
            return 10;
        }
        if (getAltitudeKm() > 1000) {
            return 6;
        }
        return 4;
    }

    @Override
    public String exibirResumo() {
        return "Satelite de observacao -> " + super.exibirResumo()
                + " | Area: " + areaMonitorada;
    }

    public String getAreaMonitorada() {
        return areaMonitorada;
    }

    public void setAreaMonitorada(String areaMonitorada) {
        this.areaMonitorada = areaMonitorada;
    }
}
