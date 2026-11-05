# Assistente ELO · configuração do GPT personalizado (ChatGPT)

Preencha a aba **Configurar** do editor de GPTs com o conteúdo abaixo.

## Nome
Assistente ELO · IA em Operações

## Descrição
Ajuda grupos do Seminário de IA em Operações e Supply Chain (COPPEAD/UFRJ) a desenhar uma solução de IA, planejar
evidência e auditar seis meses simulados com o ELO.

## Instruções
Cole todo o conteúdo do arquivo `instrucoes_do_gpt.txt` (7.142 caracteres; o limite é 8.000).

## Frases iniciais (conversation starters)
1. Somos o Grupo 1 e vamos começar a Sessão 1.
2. Grupo 1, Sessão 2. Vou colar o resumo da Sessão 1.
3. Grupo 1, Sessão 3. Vou colar o resumo das Sessões 1 e 2.
4. Como funciona o seminário e o que vamos entregar?

## Conhecimento
Envie o arquivo `manual_coach.md`. Ele traz o menu e as fichas dos 8 cenários, o canvas com as perguntas e
opções, as regras da simulação da Sessão 3 e os conceitos.

## Recursos
- **Pesquisa na web:** desligar. O assistente deve trabalhar só com o manual e os dados didáticos.
- **Geração de imagens:** desligar.
- **Interpretador de código e análise de dados:** opcional. Pode ajudar a conferir somas da Sessão 3, mas não é
  necessário.

## Compartilhamento
Publique como **Qualquer pessoa com o link** e envie o link para a turma. Quem for usar precisa ter conta no
ChatGPT; a disponibilidade de GPTs personalizados para contas gratuitas pode variar.

## Teste antes da aula
1. Abra o GPT e escreva "Somos o Grupo 1 e vamos começar a Sessão 1". Ele deve mostrar o plano da sessão e o
   menu de cenários, e parar.
2. Escolha um cenário e responda "não sei" a uma pergunta de dado. Ele deve oferecer um valor marcado como
   **[DADO DIDÁTICO]**.
3. Responda "não sei" a uma pergunta de decisão (ex.: qual objetivo vence no conflito). Ele deve oferecer 2 ou 3
   opções e pedir que o grupo escolha.
