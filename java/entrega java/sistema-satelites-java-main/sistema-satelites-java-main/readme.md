# Sistema de Monitoramento e Gerenciamento de Satélites

## Global Solution 2026 – FIAP

### Integrantes

| Nome                           | RM |
|--------------------------------| -- |
| Arthur Marcio de Barros Silva  | 563359 |
| Gabriela Abdelnor Tavares         | 562291 |
| Maria Eduarda Sousa Acyole De Oliveira            | 566337 |
| Matheus Goes Da Silva             | 566407 |
| Mayke Costa Santos             | 562680 |

---

# Sobre o Projeto

Sistema em Java para gerenciamento de satelites, missoes, leituras de sensores e alertas orbitais. O projeto roda pelo console e foi organizado em camadas para demonstrar conceitos de programacao orientada a objetos.
---

# Objetivos da Solução

* Gerenciar satélites de diferentes categorias.
* Registrar missões espaciais.
* Monitorar leituras de sensores.
* Detectar situações de risco operacional.
* Gerar alertas orbitais automaticamente.
* Demonstrar conceitos de desenvolvimento orientado a objetos.

---

## Tecnologias

- Java
- Programacao orientada a objetos
- Repositorios em memoria com `ArrayList`

# Funcionalidades

## Gerenciamento de Satélites

* Cadastro de Satélites de Comunicação.
* Cadastro de Satélites de Observação.
* Listagem de satélites.
* Busca de satélite por nome.

## Gerenciamento de Missões

* Cadastro de missões.
* Associação de missões a satélites.
* Listagem de missões.

## Monitoramento de Sensores

* Registro de leituras.
* Classificação de risco operacional.
* Consulta de leituras registradas.

## Alertas Orbitais

* Geração automática de alertas.
* Listagem de alertas ativos.
* Monitoramento de ocorrências críticas.

---

# Arquitetura do Projeto

O projeto foi estruturado seguindo o padrão de Arquitetura em Camadas:

```text
sistema-satelites-java/
  docs/
    diagrama-classes-domain.puml
  src/
    application/      Regras de aplicacao
    domain/           Entidades e regras de dominio
    infrastructure/   Repositorios em memoria
    presentation/     Menu e interacao com o usuario
```

Cada camada possui responsabilidades específicas, promovendo organização, manutenção e reutilização de código.

---

# Conceitos de Programação Orientada a Objetos

## Encapsulamento

Todas as entidades possuem atributos privados com acesso controlado por getters e setters.

Exemplo:

* Satelite
* Missao
* LeituraSensor
* AlertaOrbital

---

## Herança

A classe base:

```java
EntidadeBase
```

é utilizada por:

```java
Satelite
Missao
LeituraSensor
AlertaOrbital
```

Além disso:

```java
Satelite
 ├── SateliteComunicacao
 └── SateliteObservacao
```

---

## Polimorfismo por Sobrescrita (Override)

Métodos redefinidos nas subclasses:

```java
calcularPrioridadeOperacional()
exibirResumo()
```

---

## Polimorfismo por Sobrecarga (Overload)

Métodos com múltiplas assinaturas:

```java
mostrarSituacao()
mostrarSituacao(String observacao)
```

e métodos de cadastro presentes na camada de aplicação.

---

# Estruturas de Dados Utilizadas

O sistema utiliza armazenamento em memória através de:

```java
ArrayList
```

para gerenciamento de:

* Satélites
* Missões
* Leituras
* Alertas

---

# Diagrama UML

O diagrama de classes do domínio encontra-se em:

```text
docs/diagrama-classes-domain.puml
```

O arquivo representa:

* Herança
* Associações
* Atributos
* Métodos
* Cardinalidades

---


## Como executar

Tenha o JDK instalado e execute os comandos abaixo no PowerShell, dentro da pasta do projeto:

```powershell
$files = Get-ChildItem -Recurse src -Filter *.java | ForEach-Object { $_.FullName }
javac -d out $files
java -cp out presentation.Main
```

## Menu principal

O sistema permite:

- Cadastrar satelite de comunicacao.
- Cadastrar satelite de observacao.
- Listar satelites.
- Registrar leitura de sensor.
- Gerar alerta orbital.
- Cadastrar missao.
- Listar missoes, leituras e alertas.
- Buscar satelite por nome.

## Conceitos aplicados

- Separacao em pacotes: `presentation`, `application`, `domain` e `infrastructure`.
- Encapsulamento com atributos privados, getters e setters.
- Construtor padrao e construtores com parametros.
- Heranca usando `EntidadeBase` e `Satelite`.
- Sobrescrita de metodos em `SateliteComunicacao` e `SateliteObservacao`.
- Sobrecarga de metodos em servicos e entidades.
- Persistencia em memoria com listas.

## Diagrama

O diagrama de classes do dominio esta em:

```text
docs/diagrama-classes-domain.puml
```
---

# Exemplo de Uso

1. Cadastrar um satélite.
2. Registrar uma missão.
3. Registrar leitura de sensor.
4. Gerar alerta orbital.
5. Consultar informações cadastradas.

---

# Contribuição para os ODS

Esta solução está alinhada principalmente aos seguintes Objetivos de Desenvolvimento Sustentável:

* ODS 9 – Indústria, Inovação e Infraestrutura
* ODS 11 – Cidades e Comunidades Sustentáveis
* ODS 13 – Ação Contra a Mudança Global do Clima

---

# Considerações Finais

O projeto demonstra a aplicação prática dos principais conceitos de Programação Orientada a Objetos, arquitetura em camadas e modelagem de domínio, simulando um sistema de monitoramento espacial inspirado nos desafios atuais da economia espacial e da exploração de satélites.
