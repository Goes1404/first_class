package application;

import java.util.List;

import domain.AlertaOrbital;
import domain.LeituraSensor;
import domain.Missao;
import domain.Satelite;
import domain.SateliteComunicacao;
import domain.SateliteObservacao;
import infrastructure.AlertaOrbitalRepository;
import infrastructure.LeituraSensorRepository;
import infrastructure.MissaoRepository;
import infrastructure.SateliteRepository;

public class SateliteService {
    private final SateliteRepository sateliteRepository;
    private final MissaoRepository missaoRepository;
    private final LeituraSensorRepository leituraSensorRepository;
    private final AlertaOrbitalRepository alertaOrbitalRepository;

    public SateliteService() {
        this.sateliteRepository = new SateliteRepository();
        this.missaoRepository = new MissaoRepository();
        this.leituraSensorRepository = new LeituraSensorRepository();
        this.alertaOrbitalRepository = new AlertaOrbitalRepository();
    }

    public SateliteComunicacao cadastrarSateliteComunicacao(String nome) {
        return cadastrarSateliteComunicacao(nome, 550, 2);
    }

    public SateliteComunicacao cadastrarSateliteComunicacao(String nome, double altitudeKm, int quantidadeAntenas) {
        validarTexto(nome, "nome");
        validarNumeroPositivo(altitudeKm, "altitude");
        if (quantidadeAntenas <= 0) {
            throw new IllegalArgumentException("A quantidade de antenas deve ser maior que zero.");
        }

        SateliteComunicacao satelite = new SateliteComunicacao(0, nome, "normal", altitudeKm, quantidadeAntenas);
        return (SateliteComunicacao) sateliteRepository.salvar(satelite);
    }

    public SateliteObservacao cadastrarSateliteObservacao(String nome) {
        return cadastrarSateliteObservacao(nome, 700, "Brasil");
    }

    public SateliteObservacao cadastrarSateliteObservacao(String nome, double altitudeKm, String areaMonitorada) {
        validarTexto(nome, "nome");
        validarTexto(areaMonitorada, "area monitorada");
        validarNumeroPositivo(altitudeKm, "altitude");

        SateliteObservacao satelite = new SateliteObservacao(0, nome, "normal", altitudeKm, areaMonitorada);
        return (SateliteObservacao) sateliteRepository.salvar(satelite);
    }

    public Missao cadastrarMissao(String nome) {
        return cadastrarMissao(nome, "Monitoramento orbital", 0);
    }

    public Missao cadastrarMissao(String nome, String objetivo, int sateliteId) {
        validarTexto(nome, "nome");
        validarTexto(objetivo, "objetivo");
        if (sateliteId > 0 && buscarSatelite(sateliteId) == null) {
            throw new IllegalArgumentException("Satelite informado nao existe.");
        }

        Missao missao = new Missao(0, nome, objetivo, sateliteId);
        return missaoRepository.salvar(missao);
    }

    public LeituraSensor registrarLeitura(int sateliteId, String tipo, double valor) {
        return registrarLeitura(sateliteId, tipo, valor, unidadePadrao(tipo));
    }

    public LeituraSensor registrarLeitura(int sateliteId, String tipo, double valor, String unidade) {
        Satelite satelite = buscarSatelite(sateliteId);
        if (satelite == null) {
            throw new IllegalArgumentException("Satelite nao encontrado.");
        }
        validarTexto(tipo, "tipo de leitura");
        validarTexto(unidade, "unidade");

        LeituraSensor leitura = new LeituraSensor(0, sateliteId, tipo, valor, unidade);
        leituraSensorRepository.salvar(leitura);

        if (leitura.estaEmRisco()) {
            gerarAlerta(sateliteId, "Leitura de " + tipo + " esta em risco: " + valor + " " + unidade);
            satelite.setStatus("problema");
        }
        return leitura;
    }

    public AlertaOrbital gerarAlerta(int sateliteId, String descricao) {
        if (buscarSatelite(sateliteId) == null) {
            throw new IllegalArgumentException("Satelite nao encontrado.");
        }
        validarTexto(descricao, "descricao");

        AlertaOrbital alerta = new AlertaOrbital(0, sateliteId, descricao, true);
        return alertaOrbitalRepository.salvar(alerta);
    }

    public Satelite buscarSatelite(int id) {
        return sateliteRepository.buscarPorId(id);
    }

    public Satelite buscarSatelite(String nome) {
        validarTexto(nome, "nome");
        for (Satelite satelite : sateliteRepository.listarTodos()) {
            if (satelite.getNome().equalsIgnoreCase(nome)) {
                return satelite;
            }
        }
        return null;
    }

    public List<Satelite> listarSatelites() {
        return sateliteRepository.listarTodos();
    }

    public List<Missao> listarMissoes() {
        return missaoRepository.listarTodos();
    }

    public List<LeituraSensor> listarLeituras() {
        return leituraSensorRepository.listarTodos();
    }

    public List<AlertaOrbital> listarAlertas() {
        return alertaOrbitalRepository.listarTodos();
    }

    private String unidadePadrao(String tipo) {
        if ("temperatura".equalsIgnoreCase(tipo)) {
            return "C";
        }
        if ("bateria".equalsIgnoreCase(tipo) || "sinal".equalsIgnoreCase(tipo)) {
            return "%";
        }
        return "un";
    }

    private void validarTexto(String valor, String campo) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("O campo " + campo + " e obrigatorio.");
        }
    }

    private void validarNumeroPositivo(double valor, String campo) {
        if (valor <= 0) {
            throw new IllegalArgumentException("O campo " + campo + " deve ser maior que zero.");
        }
    }
}
