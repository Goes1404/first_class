package presentation;

import java.util.List;
import java.util.Scanner;

import application.SateliteService;
import domain.AlertaOrbital;
import domain.EntidadeBase;
import domain.LeituraSensor;
import domain.Missao;
import domain.Satelite;

public class Main {
    private final Scanner scanner;
    private final SateliteService service;

    public Main() {
        this.scanner = new Scanner(System.in);
        this.service = new SateliteService();
    }

    public static void main(String[] args) {
        new Main().executar();
    }

    private void executar() {
        int opcao;
        do {
            mostrarMenu();
            opcao = lerInteiro("Escolha uma opcao: ");
            tratarOpcao(opcao);
        } while (opcao != 0);
        scanner.close();
    }

    private void mostrarMenu() {
        System.out.println();
        System.out.println("=== Sistema de Gerenciamento de Satelites em Orbita ===");
        System.out.println("1 - Cadastrar satelite de comunicacao");
        System.out.println("2 - Cadastrar satelite de observacao");
        System.out.println("3 - Listar satelites");
        System.out.println("4 - Registrar leitura de sensor");
        System.out.println("5 - Gerar alerta orbital");
        System.out.println("6 - Cadastrar missao");
        System.out.println("7 - Listar missoes");
        System.out.println("8 - Listar leituras");
        System.out.println("9 - Listar alertas");
        System.out.println("10 - Buscar satelite por nome");
        System.out.println("0 - Sair");
    }

    private void tratarOpcao(int opcao) {
        try {
            switch (opcao) {
                case 1:
                    cadastrarSateliteComunicacao();
                    break;
                case 2:
                    cadastrarSateliteObservacao();
                    break;
                case 3:
                    listarSatelites();
                    break;
                case 4:
                    registrarLeitura();
                    break;
                case 5:
                    gerarAlerta();
                    break;
                case 6:
                    cadastrarMissao();
                    break;
                case 7:
                    listarMissoes();
                    break;
                case 8:
                    listarLeituras();
                    break;
                case 9:
                    listarAlertas();
                    break;
                case 10:
                    buscarSatelitePorNome();
                    break;
                case 0:
                    System.out.println("Encerrando sistema...");
                    break;
                default:
                    System.out.println("Opcao invalida. Tente novamente.");
                    break;
            }
        } catch (IllegalArgumentException ex) {
            System.out.println("Erro: " + ex.getMessage());
        }
    }

    private void cadastrarSateliteComunicacao() {
        String nome = lerTexto("Nome: ");
        double altitude = lerDouble("Altitude em km: ");
        int antenas = lerInteiro("Quantidade de antenas: ");

        Satelite satelite = service.cadastrarSateliteComunicacao(nome, altitude, antenas);
        System.out.println("Satelite cadastrado: " + satelite.exibirResumo());
    }

    private void cadastrarSateliteObservacao() {
        String nome = lerTexto("Nome: ");
        double altitude = lerDouble("Altitude em km: ");
        String area = lerTexto("Area monitorada: ");

        Satelite satelite = service.cadastrarSateliteObservacao(nome, altitude, area);
        System.out.println("Satelite cadastrado: " + satelite.exibirResumo());
    }

    private void registrarLeitura() {
        int sateliteId = lerInteiro("ID do satelite: ");
        String tipo = lerTexto("Tipo da leitura (temperatura, bateria, sinal): ");
        double valor = lerDouble("Valor: ");
        String unidade = lerTextoOpcional("Unidade (Enter para padrao): ");

        LeituraSensor leitura;
        if (unidade.isEmpty()) {
            leitura = service.registrarLeitura(sateliteId, tipo, valor);
        } else {
            leitura = service.registrarLeitura(sateliteId, tipo, valor, unidade);
        }
        System.out.println("Leitura registrada: " + leitura.exibirResumo());
    }

    private void gerarAlerta() {
        int sateliteId = lerInteiro("ID do satelite: ");
        String descricao = lerTexto("Descricao: ");

        AlertaOrbital alerta = service.gerarAlerta(sateliteId, descricao);
        System.out.println("Alerta gerado: " + alerta.exibirResumo());
    }

    private void cadastrarMissao() {
        String nome = lerTexto("Nome da missao: ");
        String objetivo = lerTexto("Objetivo: ");
        int sateliteId = lerInteiro("ID do satelite responsavel (0 para nenhum): ");

        Missao missao = service.cadastrarMissao(nome, objetivo, sateliteId);
        System.out.println("Missao cadastrada: " + missao.exibirResumo());
    }

    private void buscarSatelitePorNome() {
        String nome = lerTexto("Nome do satelite: ");
        Satelite satelite = service.buscarSatelite(nome);
        if (satelite == null) {
            System.out.println("Nenhum satelite encontrado com esse nome.");
        } else {
            System.out.println(satelite.exibirResumo());
            System.out.println(satelite.mostrarSituacao("Busca realizada pelo menu"));
        }
    }

    private void listarSatelites() {
        listar("satelites", service.listarSatelites());
    }

    private void listarMissoes() {
        listar("missoes", service.listarMissoes());
    }

    private void listarLeituras() {
        listar("leituras", service.listarLeituras());
    }

    private void listarAlertas() {
        listar("alertas", service.listarAlertas());
    }

    private void listar(String titulo, List<? extends EntidadeBase> itens) {
        if (itens.isEmpty()) {
            System.out.println("Nenhum registro encontrado em " + titulo + ".");
            return;
        }
        for (EntidadeBase item : itens) {
            System.out.println(item.exibirResumo());
        }
    }

    private String lerTexto(String mensagem) {
        String valor;
        do {
            System.out.print(mensagem);
            valor = scanner.nextLine().trim();
            if (valor.isEmpty()) {
                System.out.println("Campo obrigatorio. Digite novamente.");
            }
        } while (valor.isEmpty());
        return valor;
    }

    private String lerTextoOpcional(String mensagem) {
        System.out.print(mensagem);
        return scanner.nextLine().trim();
    }

    private int lerInteiro(String mensagem) {
        while (true) {
            System.out.print(mensagem);
            String valor = scanner.nextLine().trim();
            try {
                return Integer.parseInt(valor);
            } catch (NumberFormatException ex) {
                System.out.println("Digite um numero inteiro valido.");
            }
        }
    }

    private double lerDouble(String mensagem) {
        while (true) {
            System.out.print(mensagem);
            String valor = scanner.nextLine().trim().replace(",", ".");
            try {
                return Double.parseDouble(valor);
            } catch (NumberFormatException ex) {
                System.out.println("Digite um numero valido.");
            }
        }
    }
}
