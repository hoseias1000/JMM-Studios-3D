# JMM Studios 3D

Uma produtora audiovisual em forma de escritório virtual 3D. Versão local **v0.2**, em português, com sete personagens, quatro setores de produção, recepcionista, painel de agentes e Kanban de produção.

### Reformulação visual v0.2

Interface administrativa em preto, branco e cinza, com contraste ampliado e cartões mais discretos. O escritório usa toda a largura disponível até selecionar um agente, quando abre o painel lateral. A expansão usa a API de tela cheia do navegador quando disponível e mantém uma alternativa por CSS; Escape ou o botão de fechar restauram a visualização.

O cenário continua colorido: divisórias de vidro, janelas, pisos diferenciados, estações com acessórios, cadeiras arredondadas com rodízios, estantes, luminárias, plantas e lounge. Há uma mesa de reunião com sete lugares. Os personagens são criações procedurais originais, com geometrias suavizadas, cabelos e roupas variados, articulações e poses sentadas. Não há modelos externos ou personagens de terceiros para baixar/licenciar.

O ajuste à referência de escritório usa carpetes em carvão, paredes quentes, mesas claras e cadeiras azuis. Portas e painéis de vidro mais altos delimitam as salas; impressora, bebedouro, quadro de planejamento, documentos, estantes baixas e acessórios enriquecem as estações. As etiquetas flutuantes mostram nome, função, ícones e progresso da tarefa simulada; no celular, ficam compactas. A imagem de referência não é necessária para executar o projeto e nenhum elemento dela foi recortado como ativo.

### Planta ampliada com oito salas

Os quatro setores de trabalho foram preservados e conectados por corredores livres. A nova ala inclui **sala de reunião**, com mesa de sete lugares, tela e quadro; **sala de descanso**, com sofás, poltronas e copa; e **entrada/recepção**, com balcão, espera, portas duplas e degraus externos. O corredor transversal conecta a nova ala ao eixo central e aos setores existentes. As salas têm acessos e sinalização próprios.

A **Sala da CEO** ocupa uma ala exclusiva à direita, com piso de madeira, tapetes, parede em madeira com detalhes dourados, janela panorâmica, logo, mesa executiva, cadeira escura, armários, troféus, sofá e mesa para reuniões privadas. A entrada conecta a sala ao corredor transversal. Marina Costa trabalha nessa estação, com seu monitor atualizado pelas tarefas e seu traje social. Ao voltar de reunião, pausa ou deslocamento para Trabalhando/Disponível, ela retorna à sala executiva. A câmera inclui as oito salas, com ajuste automático no celular. O código dessa ala está em `src/components/office/ExecutiveSuite.tsx`.

A recepcionista **Beatriz Nunes** fica sentada atrás do balcão da entrada, com blazer, crachá e headset. Seu posto tem monitor, teclado, mouse e telefone; a bancada interna foi ajustada à altura das mãos. Clique nela ou no cartão em **Agentes** para consultar tarefas e enviar ordens de atendimento simuladas. Ela responde ao gestor Lucas Mendes e começa Disponível. Suas ordens começam em Ideia e geram um plano de atendimento de exemplo, sem cadastrar visitantes reais, enviar mensagens ou reservar horários. Também pode participar de reuniões, descansar e caminhar pelo corredor, como os demais personagens. Os dados anteriores são preservados.

Ao escolher **Em reunião**, o agente aparece em um dos lugares da sala de reunião. **Em pausa** o coloca em um assento do descanso. **Em deslocamento** o faz percorrer o corredor central, em uma animação decorativa simulada. A volta para Trabalhando ou Disponível o devolve à estação original. Não há alteração no responsável pelas tarefas nem nos dados salvos.

A câmera foi reenquadrada para toda a planta. Arraste com o botão esquerdo para girar, use o botão direito para deslocar a vista e a roda para aproximar. No celular, use dois dedos para deslocar/aproximar. O botão de restaurar câmera retorna ao enquadramento completo. O modo leve continua disponível, sem sombras dinâmicas nem os acessórios mais finos.

O estado **Em reunião** leva o agente a um lugar na mesa e anima gestos. Trabalhando anima os braços sobre o teclado; Em deslocamento anima braços, pernas e deslocamento pelo corredor; Disponível mantém uma pose de espera na estação e Em pausa leva ao descanso. São animações decorativas simuladas, sem navegação por obstáculos nem agentes autônomos. O formato de persistência anterior foi preservado: não é necessário limpar suas tarefas.

**Os agentes, canais, tarefas e registros de produção são simulações. Não há inteligência artificial em execução no escritório, geração de arquivos de vídeo nem publicação. O painel Tokens Codex é separado: ele lê contadores reais disponíveis nos registros locais do Codex.**

### Central dos agentes e ordens

Os monitores das mesas mostram a tarefa em foco, canal, etapa, estado e progresso de cada agente. As telas variam por função, com briefing de roteiro, storyboard ilustrativo, timeline de edição, checklist de revisão e resumo de produção. Os monitores secundários exibem a fila da estação. As imagens e timelines são ilustrações da simulação, e acompanham as alterações das tarefas. Clique numa tela para abrir a central do agente e use o zoom do escritório para ler os detalhes.

Clique no personagem, no nome flutuante ou em um cartão da página **Agentes**. A central mostra a tarefa em foco, o briefing recebido, o canal, a etapa e seu progresso. Com mais de uma tarefa pendente, escolha **Tarefa em foco** ou use **Colocar em foco** na fila.

Em **Dar uma ordem**, escreva o que deseja e escolha o canal. **Enviar ordem** cria uma tarefa para aquele agente, coloca-a em foco e muda seu estado para Trabalhando. A ordem começa na etapa correspondente ao cargo: Direção/Gestão em Ideia, Roteirista em Roteiro, Diretor Visual em Cenas, Editor em Edição e Revisor em Revisão. As tarefas anteriores são mantidas na fila.

**Importante:** as ordens não são executadas por IA. O adaptador local monta uma prévia demonstrativa baseada em modelos de texto por cargo, inclui o briefing e deixa claro que é uma simulação. Não há compreensão de linguagem por modelo, chamada ao Codex, consumo de tokens, geração de imagens/voz/vídeo, renderização ou publicação. O painel **Tokens Codex** continua medindo separadamente os logs reais do Codex usado para desenvolver o projeto.

Os controles **Iniciar tarefa/Retomar**, **Pausar trabalho**, **Avançar etapa** e **Concluir tarefa** alteram o estado simulado e o Kanban. Durante uma pausa, retome antes de avançar/concluir. **Gerar prévia simulada/Refazer prévia simulada** cria um exemplo local para a tarefa em foco. O progresso é manual, por etapa; não avança sozinho. Ao concluir, a próxima pendência fica em foco; sem pendências, o agente em trabalho fica Disponível.

Ordens, prévias, tarefa em foco, estados e histórico são salvos no mesmo localStorage das tarefas anteriores. Entregas simuladas continuam consultáveis após a conclusão. Trocar de agente limpa o rascunho não enviado, para evitar dar uma ordem à pessoa errada. O campo aceita até 2.000 caracteres. No celular, o painel selecionado é trazido para a área visível.

Para uma execução real no futuro, será necessário implementar um adaptador/backend de IA e mídia. A versão atual não solicita credenciais e não executa comandos do computador a partir do texto das ordens.

### Portas e acessos

Os setores são separados por divisórias de vidro nos lados dos corredores central e transversal. Edição e Revisão têm portas voltadas para o corredor central, próximas à nova ala. A passagem entre a sala de reunião e a recepção é aberta. A planta tem oito folhas de porta, incluindo a sala da CEO, a entrada e os acessos da sala de reunião e de descanso, com batentes claros, soleiras, puxadores e abertura visual. As posições ficam no registro `roomDoors`, em `src/components/office/layout.ts`.

As portas ficam em posições abertas decorativas; não há um comando de abrir/fechar nem navegação física dos personagens por todas as salas.

### Painel Tokens Codex

No **Escritório 3D**, clique na tela da sala de reunião ou no botão **Painel do estúdio**. A tela mostra os tokens registrados hoje e as contagens atuais das produções por etapa. O painel ampliado permite filtrar tokens por período, atualizar a leitura, filtrar tarefas por canal/etapa e alterar suas etapas. As mudanças nas tarefas aparecem no Kanban e ficam salvas localmente. Os atalhos **Ver detalhes dos tokens** e **Abrir produção** abrem as páginas completas. O painel também funciona no celular e na visão ampliada do escritório.

Os tokens vêm dos registros locais do Codex usado neste computador. As produções exibidas são as tarefas simuladas do estúdio. Quando a leitura local falha, o painel informa a indisponibilidade. A atualização automática acontece a cada 30 segundos com a aba visível.

Abra **Tokens Codex** na barra lateral. O painel lê `token_count` nos arquivos JSONL de `~/.codex/sessions` deste computador. Não precisa de chave de API, login adicional ou chamadas pagas. O serviço de leitura roda dentro do próprio Vite, em `npm.cmd run dev` e `npm.cmd run preview`. **Reinicie o servidor uma vez após atualizar esta versão**, caso a rota ainda não esteja disponível.

Você pode filtrar por workspace/todas as sessões locais e por hoje, 7 dias, 30 dias ou histórico. Há totais de entrada sem cache, entrada em cache, saída e raciocínio; gráfico diário; modelos; limites registrados; atualização automática a cada 30 segundos e exportação CSV dos agregados. O fuso é America/Sao_Paulo. O formato interno dos logs pode mudar e não constitui uma API de faturamento oficial.

**Token não é valor cobrado.** A entrada em cache já faz parte da entrada, e raciocínio já faz parte da saída: o painel evita somar esses subconjuntos duas vezes. Snapshots cumulativos repetidos são deduplicados; em logs com baseline herdado, a leitura começa pelo último uso informado e segue por diferenças. Cópias da mesma sessão são identificadas para evitar duplicação. Registros incompletos ou inacessíveis podem deixar o relatório parcial.

A estimativa em **créditos equivalentes Standard** usa taxas publicadas por modelo, conferidas em 11/11/2026, e é apenas uma referência de consumo. Não indica cobrança real, uso incluído da assinatura nem saldo comprado. Fast/Ultrafast, ferramentas, contratos e descontos podem ter outras regras. Modelos sem taxa cadastrada ficam fora da estimativa e o painel informa cobertura parcial. **O gasto em reais/dólares aparece como não disponível** porque esses arquivos não fornecem uma fatura confiável da assinatura. Consulte [a documentação oficial de preços](https://learn.chatgpt.com/docs/pricing) e [o uso oficial da conta](https://chatgpt.com/codex/settings/usage).

O workspace atual inclui sessões iniciadas na pasta do projeto, em subpastas ou na pasta pai. Isso é necessário porque o Codex pode ter sido aberto na pasta `Projetos de Vídeos`; não é possível atribuir cada token a um arquivo individual dentro dela. O painel informa quando a pasta pai foi incluída. Os limites são os do **último registro local** e podem estar defasados; janelas já expiradas são identificadas.

O leitor retém somente contadores, datas, modelo e identificadores de sessão anonimizados. Mensagens, código, instruções, nomes de arquivos e credenciais não são enviados ao navegador; `auth.json` e bancos de credenciais não são lidos. A rota aceita somente GET, em localhost e na mesma origem, sem caminhos arbitrários enviados pelo cliente. Nenhum registro original é modificado. A leitura fica em memória, com cache por tamanho/data, e é limitada a 600 arquivos recentes e 200 MB por varredura; arquivos individuais acima de 40 MB são ignorados. O relatório sinaliza leitura parcial.

Sem registros locais, sem permissão ou em hospedagem estática sem o serviço Node, o painel mostra a indisponibilidade, sem inventar tokens. O diretório alternativo pode ser configurado pela variável de ambiente `CODEX_HOME` antes de iniciar o Vite.

### Logo oficial

A arte **JMM Commerce**, fornecida pelo usuário, está em `public/branding/jmm-commerce-logo.png`. O PNG original foi copiado sem alterações e sem modificar suas proporções ou inscrições. Ele aparece na barra lateral, no ícone da aba e em placas 3D da parede, entrada e recepção. O nome da aplicação continua sendo **JMM Studios**.

Os caminhos da marca ficam em `src/data/branding.ts` e as placas em `src/components/office/BrandPlaque.tsx`. O projeto usa apenas a cópia local; não precisa acessar o Google Drive para mostrar a logo.

## Iniciar no Windows / VS Code

Pré-requisito: Node.js **22.17.0** (versão usada na validação) e navegador recente com WebGL e aceleração gráfica. Não precisa de Docker, banco de dados, Blender, chaves de API ou hospedagem.

1. No VS Code, abra a pasta `JMM-Studios-3D`.
2. Abra **Terminal → Novo Terminal**.
3. Execute:

```powershell
npm.cmd install
npm.cmd run dev
```

4. Abra o endereço mostrado no terminal, normalmente **http://127.0.0.1:5173**.

Mantenha o terminal aberto enquanto usa o estúdio. Para parar, pressione **Ctrl+C**. Para iniciar novamente, basta `npm.cmd run dev`; não precisa reinstalar a cada uso.

`npm install`, `npm run dev` e `npm run build` também funcionam em terminais que permitem executar o npm. O sufixo `.cmd` evita o bloqueio de `npm.ps1` pela política de execução do PowerShell, sem alterar configurações de segurança do Windows.

### Build de produção

```powershell
npm.cmd run build
npm.cmd run preview
```

O build verifica TypeScript e gera `dist/`. O preview normalmente usa http://127.0.0.1:4173. Não abra `index.html` diretamente pelo Explorador de Arquivos: use o servidor local.

## Como usar

- **Escritório 3D:** arraste para girar, role para aproximar. No celular, um dedo gira e dois dedos controlam zoom. A câmera tem limites para manter o escritório visível. Use o botão circular para restaurar a vista ou o botão de expansão para ampliar.
- **Selecionar:** clique no personagem ou no nome flutuante. Também há uma lista acessível na aba **Agentes**. O painel mostra cargo, superior, setor, identificador, tarefas, progresso e registros.
- **Estado:** escolha Trabalhando, Disponível, Em pausa, Em deslocamento ou Em reunião. O personagem recebe uma animação correspondente. O estado escolhido manualmente prevalece sobre o automático.
- **Nova tarefa:** informe título, canal e responsável. A tarefa começa em Ideia.
- **Produção:** arraste os cartões entre colunas ou use o seletor de etapa, inclusive no celular e pelo teclado. Etapas: Ideia → Roteiro → Cenas → Edição → Revisão → Concluído. Pode avançar ou voltar livremente.
- **Progresso:** cada etapa representa 20% do fluxo. É um indicador manual, não processamento de mídia. Cada agente mantém suas tarefas atribuídas ao longo das etapas; não há redistribuição automática. Sem um estado manual, um agente com tarefas pendentes aparece Trabalhando e sem tarefas pendentes aparece Disponível.
- **Visão Geral e Canais:** resumos calculados com os dados atuais. “Vídeos em produção” conta tarefas entre Roteiro e Revisão; “concluídos” conta cartões concluídos, sem arquivos reais.
- **Configurações:** modo leve e controle de animações, salvos localmente. No celular, a resolução é reduzida e a suavização é desativada automaticamente.

## Persistência e privacidade

Tarefas, estados escolhidos, os últimos 100 registros e preferências ficam no **localStorage** com a chave `jmm-studios-v1`. Seleção de agente, aba aberta e câmera são temporárias. A aplicação não faz chamadas a serviços externos e usa fontes do sistema.

Os dados pertencem ao navegador, perfil, protocolo, endereço e porta usados. `localhost`, `127.0.0.1`, porta 5173 e porta 4173 têm armazenamentos diferentes. Use sempre o mesmo endereço para reencontrar as alterações. Se a porta 5173 estiver ocupada, o Vite pode escolher outra; confira o terminal. Limpar os dados do navegador remove o conteúdo salvo. **Não há sincronização nem backup nesta versão.**

Na primeira execução são carregadas seis tarefas de demonstração. Para restaurar a demonstração, remova apenas a chave `jmm-studios-v1` nas ferramentas de desenvolvedor do navegador (Aplicativo → Armazenamento local) e recarregue. Isso descarta suas alterações locais. Dados salvos com estrutura inválida são filtrados. Se o armazenamento estiver bloqueado ou cheio, um aviso informa que as alterações ficam apenas na sessão.

## Organização do código

```text
src/
  components/
    office/OfficeScene.tsx     # Canvas, iluminação, qualidade e câmera
    office/OfficeRoom.tsx      # Arquitetura, pisos e decoração
    office/ExecutiveSuite.tsx  # Sala exclusiva da CEO, mesa executiva e lounge
    office/AmenityWing.tsx     # Corredor, reunião, descanso e entrada/recepção
    office/OfficeFurniture.tsx # Estações, cadeiras, vidro, estantes e lounge
    office/OfficeDetails.tsx   # Impressora, bebedouro, quadro e acessórios
    office/office-overlays.css # Etiquetas dos agentes dentro da cena
    office/OfficeCharacter.tsx # Personagens procedurais e articulações animadas
    office/StudioWallMonitor.tsx # Tela 3D clicável com contadores e gráfico atualizados
    office/primitives.tsx      # Geometrias/materiais compartilhados e lotes estáticos
    office/layout.ts          # Posições das estações e setores
    ui/AgentPanel.tsx          # Perfil e tarefas do agente
    ui/TaskModal.tsx           # Criação de tarefas
    ui/Kanban.tsx              # Etapas, cartões e movimentação
    ui/TokenUsagePanel.tsx     # Consumo local do Codex e referência de créditos
    ui/AgentOrders.tsx         # Ordens, controles e prévias locais por agente
    ui/StudioMonitorDialog.tsx # Tokens e produções no painel interativo da sala
  hooks/useCodexUsage.ts       # Leitura compartilhada e atualização dos contadores locais
  data/demo.ts                # Sete agentes, hierarquia, canais e tarefas de exemplo
  services/production.ts      # Contratos de integração e adaptador de simulação
  services/codex-usage.ts     # Consulta local, filtros, créditos e exportação CSV
  data/codex-rates.ts         # Taxas Standard de referência e fonte oficial
  types/index.ts              # Tipos e etapas de produção
  store.ts                    # Zustand, persistência, validação e regras de estado
  App.tsx                     # Navegação e telas
  styles.css                  # Estrutura base e responsividade
  theme.css                   # Tema neutro v0.2 e layout ampliado do escritório
tests/studio.spec.ts           # Testes funcionais no navegador
tests/tokens.spec.ts           # Testes do painel e cobertura de portas
tests/agent-orders.spec.ts     # Ordens, retomada, fila, prévias e persistência
tests/receptionist.spec.ts     # Recepcionista, ordens de atendimento e estados nas salas
tests/studio-monitor.spec.ts   # Clique na tela 3D, filtros, etapas e acesso pelo celular
server/codex-usage.mjs          # Leitor de contadores e endpoint somente de leitura
server/codex-plugin.ts         # Integração do endpoint ao Vite dev/preview
server/codex-usage.test.mjs     # Contadores, deduplicação, privacidade e origem HTTP
```

Para personalizar nomes, cores, cargos e canais, comece por `src/data/demo.ts`. As posições visuais e orientações das estações ficam em `src/components/office/layout.ts`. Elas usam `[x, y, z]`: x é a lateral, y é altura e z é profundidade. Os membros são cápsulas com articulações; as cabeças são esferas suavizadas. Não existem modelos externos para baixar.

A cena reutiliza geometrias e materiais e agrupa a mobília estática por material para reduzir chamadas de desenho. Há apenas uma luz com sombras, usando mapa de 1024×1024; o modo leve e o celular desativam essas sombras e alguns detalhes decorativos. Não há pós-processamento, reflexos em tempo real nem refração de vidro. A resolução é limitada a 1,5× no desktop e 1× no modo leve/celular. O módulo 3D é carregado separadamente do painel. Não foi medida uma taxa de FPS específica na RX 580.

## Integrações futuras

`ProductionAdapter`, `MediaAdapter` e `PublishingAdapter` definem pontos de extensão. Somente `SimulationAdapter` está implementado e conectado ao estado. Paperclip, Codex, modelos de IA, FFmpeg, imagens, vozes e publicação aparecem como **não implementados**.

Para integrar de verdade, será necessário implementar os adaptadores e um serviço local/backend para manter credenciais fora do navegador, controlar filas e processar arquivos. Nunca coloque segredos em variáveis `VITE_*`, pois são expostas no JavaScript entregue ao navegador. O volume de 5–10 vídeos/dia depende dessa infraestrutura futura e não é garantido pela simulação.

## Verificações

`npm.cmd test` executa os testes do leitor no Node e depois os testes de navegador. Para verificar apenas o leitor de tokens, use `npm.cmd run test:usage`. As fixtures desses testes são sintéticas e ficam em diretórios temporários próprios; os registros reais do Codex não são alterados.

```powershell
npm.cmd run build
npm.cmd test
npm.cmd audit
```

Os testes usam Playwright em modo invisível com o **Google Chrome já instalado**, sem baixar outro navegador. Verificam seleção no escritório, estados, criação, movimentação, persistência, configurações, telas pequenas e armazenamento indisponível. Cada teste usa armazenamento isolado. Capturas de tela são gravadas em `test-results/` (ignorado pelo Git). O servidor de teste usa a porta 5173; feche outro projeto que esteja ocupando essa porta. Para usar Edge, altere `channel: 'chrome'` para `channel: 'msedge'` em `playwright.config.ts`.

## Se algo não abrir

- **npm não encontrado:** reinstale o Node ou reabra o terminal após a instalação.
- **npm.ps1 bloqueado:** use `npm.cmd`, como nos exemplos.
- **Tela 3D indisponível:** ative a aceleração gráfica nas configurações do navegador, atualize o driver de vídeo e tente Chrome ou Edge. Agentes e Produção continuam disponíveis quando o WebGL não inicia.
- **Desempenho:** ative Modo leve, desative animações e feche outras abas pesadas. A RX 580 é o alvo de projeto, mas o desempenho varia com driver e navegador; não há medição garantida de FPS.
- **Não vejo as tarefas salvas:** confira navegador, perfil, endereço e porta. Modo privado e limpeza de dados podem remover a persistência.

## Limites desta primeira versão

Sem agentes autônomos, geração/exportação de vídeos, mídia real, login, servidor de banco de dados, colaboração entre computadores, agendamento ou publicação. Os três canais são exemplos. A movimentação dos personagens é decorativa, sem navegação por obstáculos. O escritório é uma cena Three.js real, interativa e renderizada em WebGL.
