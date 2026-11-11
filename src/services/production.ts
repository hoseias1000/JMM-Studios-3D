import type { Agent, Task, Stage, SimulationPreview } from '../types';
/** Contratos para integrações futuras. Nenhum adaptador externo está implementado. */
export interface ProductionAdapter { readonly kind: 'simulation' | 'external'; createTask(task: Task): Promise<Task>; moveTask(task: Task, stage: Stage): Promise<Task>; simulateTask(task: Task, agent: Agent): Promise<SimulationPreview> }
export interface MediaAdapter { generateImage(prompt: string): Promise<Blob>; generateVoice(text: string): Promise<Blob>; renderVideo(task: Task): Promise<Blob> }
export interface PublishingAdapter { publish(task: Task, media: Blob): Promise<{ url: string }> }
export class SimulationAdapter implements ProductionAdapter {
  readonly kind = 'simulation' as const;
  async createTask(task: Task) { return { ...task }; }
  async moveTask(task: Task, stage: Stage) { return { ...task, stage, updatedAt: new Date().toISOString() }; }
  async simulateTask(task: Task, agent: Agent): Promise<SimulationPreview> {
    const templates: Record<string, { title: string; steps: string[] }> = {
      ceo: { title: 'Plano de direção demonstrativo', steps: ['Definir o objetivo e o público do vídeo.', 'Validar o briefing e os limites da produção.', 'Encaminhar a proposta ao gestor de produção.'] },
      producer: { title: 'Plano de produção demonstrativo', steps: ['Organizar o briefing em roteiro, cenas, edição e revisão.', 'Definir responsáveis e prioridades no Kanban.', 'Conferir materiais necessários antes da produção.'] },
      writer: { title: 'Estrutura de roteiro demonstrativa', steps: ['00–03s · Gancho: apresentar a pergunta central do briefing.', '03–20s · Desenvolvimento: separar o assunto em três pontos.', '20–30s · Encerramento: retomar a ideia principal e propor uma conclusão.', 'Antes de gravar: pesquisar os fatos e escrever as falas definitivas.'] },
      visual: { title: 'Storyboard demonstrativo', steps: ['Cena 01 · Plano de abertura relacionado ao briefing.', 'Cena 02 · Detalhes visuais para apoiar os pontos do roteiro.', 'Cena 03 · Composição final com espaço para legendas.', 'Separar referências e verificar direitos de uso antes de gerar ou baixar imagens.'] },
      editor: { title: 'Plano de edição demonstrativo', steps: ['Organizar roteiro, voz e imagens em uma sequência vertical.', 'Planejar os cortes e a duração de cada cena.', 'Prever legendas, trilha e ajuste de volume.', 'Nenhum arquivo de vídeo foi editado ou renderizado por esta simulação.'] },
      reviewer: { title: 'Checklist de revisão demonstrativo', steps: ['Conferir se o conteúdo responde ao briefing.', 'Verificar fatos, ortografia, direitos de uso e legibilidade.', 'Revisar ritmo, áudio, legendas e formato do canal.', 'Não há aprovação real de mídia: este é apenas um checklist de exemplo.'] },
      receptionist: { title: 'Plano de atendimento demonstrativo', steps: ['Anotar o nome do visitante e o motivo do contato no atendimento de exemplo.', 'Identificar o setor responsável e sugerir o encaminhamento.', 'Organizar uma proposta de horário para a sala de reunião.', 'Nenhum visitante real foi cadastrado, nenhuma mensagem foi enviada e nenhum horário foi reservado.'] },
    };
    const template = templates[agent.id] ?? templates.producer;
    const brief = task.instructions || task.title;
    return { kind: 'simulation', title: template.title, createdAt: new Date().toISOString(), body: `PRÉVIA SIMULADA · MODELO LOCAL, SEM IA\n\nAgente: ${agent.name} · ${agent.role}\nBriefing recebido:\n${brief}\n\n${template.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nEste texto é um exemplo montado por regras locais. A ordem não foi executada por Codex ou por um modelo de IA; não houve criação de mídia nem consumo de API.` };
  }
}
export const production = new SimulationAdapter();
