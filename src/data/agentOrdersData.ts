export type OrderChannel =
  | 'WhatsApp'
  | 'E-mail'
  | 'Chat do sistema'
  | 'Portais'
  | 'Upload de documentos';

export type OrderCategory =
  | 'Cadastro e atualização'
  | 'Locação e contratos'
  | 'Cobrança e financeiro'
  | 'Vendas e captação'
  | 'Manutenção e vistoria'
  | 'Jurídico e documentos'
  | 'Consulta e relatório'
  | 'Comunicação'
  | 'Triagem (não classificado)';

export const ORDER_CATEGORIES: Record<OrderCategory, string[]> = {
  'Cadastro e atualização': [
    'Cadastro de imóvel',
    'Cadastro de contrato',
    'Atualização cadastral',
    'Cadastro de pessoa',
  ],
  'Locação e contratos': [
    'Renovação',
    'Rescisão',
    'Reajuste anual',
    'Garantia locatícia',
    'Nova locação',
    'Análise cadastral',
  ],
  'Cobrança e financeiro': [
    'Segunda via de boleto',
    'Cobrança',
    'Repasse',
    'Baixa de pagamento',
    'Acordo',
    'Comissão',
  ],
  'Vendas e captação': [
    'Lead de portal',
    'Captação de imóvel',
    'Proposta de compra',
    'Proposta de locação',
    'Ajuste de preço',
    'Exclusividade',
  ],
  'Manutenção e vistoria': [
    'Chamado',
    'Vistoria',
    'Orçamento de reparo',
    'Entrega de chaves',
  ],
  'Jurídico e documentos': [
    'Aditivo contratual',
    'Notificação',
    'Minuta de contrato',
    'Análise documental',
  ],
  'Consulta e relatório': [
    'Relatório',
    'Consulta cadastral',
    'Resumo operacional',
    'Extrato financeiro',
  ],
  'Comunicação': [
    'Agendamento de visita',
    'Aviso a inquilino',
    'Retorno a proprietário',
    'Follow-up comercial',
  ],
  'Triagem (não classificado)': [
    'Mensagem ambígua',
    'Solicitante desconhecido',
    'Anexo ilegível',
  ],
};

export type OrderPriority = 'Urgente' | 'Alta' | 'Normal' | 'Baixa';

export type OrderStatus =
  | 'Recebido'
  | 'Interpretado'
  | 'Aguardando esclarecimento'
  | 'Aguardando aprovação'
  | 'Em execução'
  | 'Entregue'
  | 'Concluído'
  | 'Reaberto'
  | 'Cancelado';

export type SlaSemaphore = 'no_prazo' | 'em_risco' | 'atrasado' | 'pausado';

export type TimelineActor = 'Agente' | 'Solicitante' | 'Gestor' | 'Sistema';

export type TimelineEventType =
  | 'Recebido'
  | 'Classificado'
  | 'Pergunta enviada'
  | 'Resposta recebida'
  | 'Aprovado por'
  | 'Execução iniciada'
  | 'Passo executado'
  | 'Entregue'
  | 'Aceito'
  | 'Reaberto';

export interface TimelineEventItem {
  id: string;
  cycle: number;
  type: TimelineEventType;
  actor: TimelineActor;
  actorName: string;
  timestamp: string;
  summary: string; // max 160 chars
  details: string;
}

export interface ExecutionStepItem {
  id: string;
  label: string;
  status: 'completed' | 'running' | 'pending' | 'undone';
  duration: string;
  change?: {
    entity: string;
    field: string;
    before: string;
    after: string;
    undone?: boolean;
  };
}

export interface OrderLinkChip {
  type: 'Imóvel' | 'Contrato' | 'Pessoa';
  code: string;
  label: string;
}

export interface OrderStageDuration {
  stage: string;
  duration: string;
  active?: boolean;
}

export interface OrderDeliveryInfo {
  solutionSummary: string; // max 280
  artifacts: { name: string; type: 'PDF' | 'Link' | 'Planilha'; meta: string }[];
  systemChangesSummary: string[];
  requesterPreview: {
    channel: OrderChannel;
    subject?: string; // max 70 for E-mail
    body: string; // max 300 for WhatsApp, max 600 for E-mail
  };
  autoAcceptNotice?: boolean;
  acceptedType?: 'Aceito' | 'Aceite automático' | 'Ajuste solicitado';
  rating?: number; // 1..5
  feedbackComment?: string; // max 280
}

export interface AgentOrder {
  id: string;
  protocol: string;
  parentProtocol?: string;
  subOrders?: string[];
  cycle: number;
  channel: OrderChannel;
  category: OrderCategory;
  subtype: string;
  subject: string; // max 60
  objective: string; // max 140
  narrative: string; // max 400
  requesterName: string;
  requesterRole: string;
  requesterContact: string;
  priority: OrderPriority;
  status: OrderStatus;
  slaSemaphore: SlaSemaphore;
  slaText: string;
  slaRequested: string;
  slaCommitted: string;
  slaPausedReason?: string;
  stageDurations: OrderStageDuration[];
  assigneeType: 'Agente' | 'Humano';
  assigneeName: string;
  confidence: number;
  registeredBy: string;
  createdAt: string;
  appliedRules?: { ruleId: string; version: number }[];
  links: OrderLinkChip[];
  decisionMeta?: {
    pauseReason: 'Ação sensível' | 'Baixa confiança' | 'Exceção';
    proposedAction: string;
    evidenceSource: string;
    evidenceExcerpt: string;
  };
  originalMessage: {
    receivedAt: string;
    rawText: string;
    attachments: { name: string; size: string; mime: string }[];
    channelMetadata: { label: string; value: string }[];
  };
  timeline: TimelineEventItem[];
  executionSteps: ExecutionStepItem[];
  delivery: OrderDeliveryInfo;
}

export const SLA_BY_PRIORITY: Record<
  OrderPriority | 'Consulta simples',
  { confirmation: string; delivery: string }
> = {
  Urgente: { confirmation: '5 min', delivery: '4 h' },
  Alta: { confirmation: '15 min', delivery: '1 dia útil' },
  Normal: { confirmation: '1 h', delivery: '3 dias úteis' },
  Baixa: { confirmation: '4 h', delivery: '7 dias úteis' },
  'Consulta simples': { confirmation: 'Imediata', delivery: 'Resposta imediata' },
};

export function truncateAtWordBoundary(
  text: string,
  maxChars: number
): { display: string; truncated: boolean } {
  const clean = text.trim();
  if (clean.length <= maxChars) {
    return { display: clean, truncated: false };
  }
  const slice = clean.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const cutIndex = lastSpace > Math.floor(maxChars * 0.45) ? lastSpace : maxChars;
  return {
    display: `${slice.slice(0, cutIndex).replace(/[.,;:!?-]+$/, '')}…`,
    truncated: true,
  };
}

export const INITIAL_ORDERS: AgentOrder[] = [
  {
    id: 'ord-4812',
    protocol: 'PED-2026-004812',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Locação e contratos',
    subtype: 'Renovação',
    subject: 'Renovar contrato do Apto 302 com reajuste IGP-M',
    objective: 'Calcular reajuste de 4,2% pelo IGP-M e emitir minuta de renovação por 12 meses.',
    narrative:
      'Proprietário João Batista solicitou via WhatsApp a renovação do contrato do Apto 302 (Ed. Vista Verde) aplicando o índice IGP-M acumulado de 4,2%, mantendo a garantia de caução e vigência adicional de 12 meses.',
    requesterName: 'João Batista',
    requesterRole: 'Proprietário',
    requesterContact: '+55 11 99142-8810',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 8h (Gestor)',
    slaRequested: 'Hoje, 17:00',
    slaCommitted: 'Hoje, 18:15 (8 h · JUR-002 v4)',
    stageDurations: [
      { stage: 'Triagem e leitura', duration: '3 min' },
      { stage: 'Conferência contratual', duration: '18 min' },
      { stage: 'Minuta concluída (Em execução)', duration: '2 min' },
      { stage: 'Aguardando aprovação', duration: 'Agora', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 94,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 10:14',
    appliedRules: [{ ruleId: 'JUR-002', version: 4 }],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Enviar minuta de renovação a Carlos Mendes (Apto 302): R$ 3.200,00 → R$ 3.334,40 (IGP-M 4,2%), modelo sem alteração.',
      evidenceSource: 'Contrato CT-2024-0187 + Aditivo_Renovacao_CTR302.pdf (modelo aprovado)',
      evidenceExcerpt:
        'Minuta concluída e status atualizado de Em execução para Aguardando aprovação do Gestor em 8h (JUR-002 v4).',
    },
    links: [
      { type: 'Imóvel', code: 'IMV-302', label: 'Apto 302 · Ed. Vista Verde' },
      { type: 'Contrato', code: 'CTR-302', label: 'CTR-302 · Vigência 12/2026' },
      { type: 'Pessoa', code: 'PES-118', label: 'João Batista (Proprietário)' },
      { type: 'Pessoa', code: 'PES-410', label: 'Carlos Mendes (Inquilino)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 10:14',
      rawText:
        'Bom dia pessoal da Farina! Aqui é o João Batista, dono do Apto 302 do Edifício Vista Verde. O contrato do Carlos Mendes está fechando o ciclo agora e eu gostaria de renovar por mais 12 meses aplicando o reajuste do IGP-M previsto em contrato. Podem preparar a minuta e já mandar para ele revisar antes do vencimento? Se precisar de assinatura minha digital, pode mandar no meu e-mail cadastrado mesmo. Obrigado!',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp Business API' },
        { label: 'Número origem', value: '+55 11 99142-8810' },
        { label: 'ID da conversa', value: 'WPP-MSG-992841' },
      ],
    },
    timeline: [
      {
        id: 'tl-4812-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'João Batista',
        timestamp: '10:14 · 22/11',
        summary: 'Mensagem recebida via WhatsApp solicitando renovação do Apto 302.',
        details: 'Payload completo salvo sem alteração. Remetente validado pelo telefone cadastrado.',
      },
      {
        id: 'tl-4812-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '10:14 · 22/11',
        summary: 'Classificado em Locação e contratos > Renovação com prioridade Alta.',
        details: 'Confiança 96%. Vínculos automáticos identificados: IMV-302, CTR-302 e PES-410.',
      },
      {
        id: 'tl-4812-3',
        cycle: 1,
        type: 'Execução iniciada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '10:15 · 22/11',
        summary: 'Iniciado cálculo de IGP-M (4,2%) e geração do aditivo de renovação.',
        details: 'Aluguel base R$ 3.200,00 atualizado para R$ 3.334,40 conforme cláusula 4ª.',
      },
      {
        id: 'tl-4812-4',
        cycle: 1,
        type: 'Passo executado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '10:16 · 22/11',
        summary: 'Minuta gerada e prévia enviada ao inquilino Carlos Mendes para conferência.',
        details: 'Aguardando confirmação de recebimento do locatário para envio à assinatura digital.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4812-1',
        label: 'Validar cláusula de reajuste no contrato CTR-302',
        status: 'completed',
        duration: '0,9s',
      },
      {
        id: 'st-4812-2',
        label: 'Atualizar valor mensal do contrato com IGP-M (+4,2%)',
        status: 'completed',
        duration: '1,2s',
        change: {
          entity: 'Contrato CTR-302',
          field: 'Valor do aluguel projetado',
          before: 'R$ 3.200,00',
          after: 'R$ 3.334,40',
        },
      },
      {
        id: 'st-4812-3',
        label: 'Gerar minuta PDF de aditivo de renovação (+12 meses)',
        status: 'completed',
        duration: '2,1s',
      },
      {
        id: 'st-4812-4',
        label: 'Coletar aceite e disparar envelope para assinatura digital',
        status: 'running',
        duration: 'Em andamento',
      },
    ],
    delivery: {
      solutionSummary:
        'Minuta de renovação do Apto 302 gerada com novo valor de R$ 3.334,40 (IGP-M 4,2%) e encaminhada para conferência das partes.',
      artifacts: [
        { name: 'Aditivo_Renovacao_CTR302.pdf', type: 'PDF', meta: '3 páginas · pronto para assinatura' },
      ],
      systemChangesSummary: ['Contrato CTR-302: rascunho de renovação 2026/2027 criado'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá, João! Prepararamos a minuta de renovação do Apto 302 por +12 meses com reajuste IGP-M de 4,2% (novo aluguel: R$ 3.334,40). Assim que o Carlos confirmar, enviamos para sua assinatura digital.',
      },
    },
  },
  {
    id: 'ord-4809',
    protocol: 'PED-2026-004809',
    cycle: 1,
    channel: 'E-mail',
    category: 'Manutenção e vistoria',
    subtype: 'Chamado',
    subject: 'Orçamento R$ 2.350 Hidráulica Souza (Rua das Acácias 120)',
    objective: 'Autorizar pagamento e execução do reparo hidráulico de R$ 2.350,00 acima da alçada de R$ 1.500.',
    narrative:
      'Inquilina Maria Souza relatou vazamento ativo sob a pia da cozinha na Rua das Acácias, 120. Prestadora credenciada Hidráulica Souza realizou vistoria rápida e enviou orçamento de R$ 2.350,00, exigindo aprovação do gestor pela regra FIN-011 por exceder o limite automático de R$ 1.500,00.',
    requesterName: 'Maria Souza',
    requesterRole: 'Inquilina',
    requesterContact: 'maria.souza@email.com',
    priority: 'Urgente',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 42 min',
    slaRequested: 'Hoje, imediato',
    slaCommitted: 'Hoje, 14:40 (4 h)',
    stageDurations: [
      { stage: 'Triagem urgente', duration: '2 min' },
      { stage: 'Cotação prestador', duration: '44 min' },
      { stage: 'Aguardando aprovação', duration: '2h 32min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 94,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 10:40',
    appliedRules: [
      { ruleId: 'MAN-003', version: 2 },
      { ruleId: 'MAN-004', version: 1 },
      { ruleId: 'FIN-011', version: 2 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-120', label: 'Rua das Acácias, 120' },
      { type: 'Contrato', code: 'CTR-619', label: 'CTR-619 · Locação Residencial' },
      { type: 'Pessoa', code: 'PES-204', label: 'Maria Souza (Inquilina)' },
      { type: 'Pessoa', code: 'PES-118', label: 'Ivone Tavares (Proprietária · autorizou)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar pagamento de R$ 2.350,00 à Hidráulica Souza (2 cotações: vs Hidrotec R$ 2.680,00; dono Ivone Tavares autorizou; acima de R$ 1.500 FIN-011).',
      evidenceSource: 'E-mail de Maria Souza + 2 Orçamentos + Autorização Ivone Tavares',
      evidenceExcerpt:
        'Hidráulica Souza R$ 2.350,00 (garantia 12m) vs Hidrotec R$ 2.680,00. Troca de tubulação sob a pia da cozinha, execução hoje às 15h30.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 10:40',
      rawText:
        'Olá equipe Farina, tudo bem? Desde hoje cedo começou um vazamento forte embaixo da pia da cozinha aqui na Rua das Acácias 120. Tive que fechar o registro geral da cozinha para não alagar o armário planejado. Seguem duas fotos do ponto onde está pingando e o contato do zelador caso precisem liberar entrada urgente para o encanador.',
      attachments: [
        { name: 'foto_pia_vazamento_1.jpg', size: '1,4 MB', mime: 'image/jpeg' },
        { name: 'orcamento_hidraulica_souza_914.pdf', size: '310 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'E-mail (atendimento@farina.com.br)' },
        { label: 'Remetente', value: 'maria.souza@email.com' },
        { label: 'Assunto original', value: 'URGENTE - Vazamento na cozinha Rua das Acácias 120' },
      ],
    },
    timeline: [
      {
        id: 'tl-4809-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Maria Souza',
        timestamp: '10:40 · 22/11',
        summary: 'E-mail urgente recebido com fotos do vazamento sob a pia da cozinha.',
        details: 'Anexo foto_pia_vazamento_1.jpg analisado automaticamente pelo agente.',
      },
      {
        id: 'tl-4809-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '10:41 · 22/11',
        summary: 'Classificado em Manutenção e vistoria > Chamado · Prioridade Urgente.',
        details: 'Confirmação automática enviada em 1 min (meta ≤ 5 min).',
      },
      {
        id: 'tl-4809-3',
        cycle: 1,
        type: 'Passo executado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '11:25 · 22/11',
        summary: 'Prestadora Hidráulica Souza acionada e orçamento recebido no valor de R$ 2.350,00.',
        details: 'Valor excede o limite de aprovação autônoma de R$ 1.500,00 configurado na FIN-011.',
      },
      {
        id: 'tl-4809-4',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Sistema',
        actorName: 'Regra de alçada',
        timestamp: '11:26 · 22/11',
        summary: 'Aprovação exigida pela regra FIN-011 para liberar OS-914 acima de R$ 1.500.',
        details: 'Enviado também para a fila "Decisões do agente" no Painel inicial e Financeiro.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4809-1',
        label: 'Abrir ordem de manutenção urgente OS-914 para IMV-120',
        status: 'completed',
        duration: '1,1s',
        change: {
          entity: 'Manutenção OS-914',
          field: 'Status da OS',
          before: 'Inexistente',
          after: 'Orçada (Hidráulica Souza · R$ 2.350,00)',
        },
      },
      {
        id: 'st-4809-2',
        label: 'Solicitar orçamento emergencial à Hidráulica Souza',
        status: 'completed',
        duration: '44m',
      },
      {
        id: 'st-4809-3',
        label: 'Aguardar aprovação do gestor (orçamento R$ 2.350 > R$ 1.500 · FIN-011)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Diagnóstico e orçamento de R$ 2.350,00 prontos com a Hidráulica Souza para execução hoje às 15h30, pendente de liberação da alçada FIN-011.',
      artifacts: [
        { name: 'Orcamento_OS914_HidraulicaSouza.pdf', type: 'PDF', meta: 'R$ 2.350,00 · garantia 12m' },
      ],
      systemChangesSummary: ['OS-914 aberta e vinculada ao contrato CTR-619'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Re: Vazamento na cozinha Rua das Acácias 120 [PED-2026-004809]',
        body: 'Olá Maria, já identificamos o reparo necessário com a Hidráulica Souza e estamos concluindo a autorização de alçada para confirmar o atendimento ainda hoje às 15h30.',
      },
    },
  },
  {
    id: 'ord-4801',
    protocol: 'PED-2026-004801',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Consulta e relatório',
    subtype: 'Relatório',
    subject: 'Inadimplência por tipo de garantia',
    objective: 'Consolidar carteira inadimplente segregada por caução, fiador, seguro fiança e título.',
    narrative:
      'Gestor Farina solicitou pelo chat interno um relatório comparativo da taxa de inadimplência atual por modalidade de garantia locatícia para revisão da política comercial.',
    requesterName: 'Gestor Farina',
    requesterRole: 'Gestor',
    requesterContact: 'gestao@farina.com.br',
    priority: 'Normal',
    status: 'Entregue',
    slaSemaphore: 'no_prazo',
    slaText: 'em 1d 4h',
    slaRequested: 'Em 3 dias úteis',
    slaCommitted: '25/11, 18:00 (3 dias úteis)',
    stageDurations: [
      { stage: 'Leitura e extração', duration: '1 min' },
      { stage: 'Execução analítica', duration: '12s' },
      { stage: 'Entregue (aceite)', duration: '3h 10min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 99,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 09:50',
    links: [
      { type: 'Pessoa', code: 'PES-001', label: 'Gestor Farina (Diretoria)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 09:50',
      rawText:
        'Preciso de um levantamento completo da inadimplência atual separada por tipo de garantia (caução, fiador, seguro fiança e título de capitalização) com valor em aberto e sugestão de ajuste na política de aprovação.',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'Chat interno GoFAPE' },
        { label: 'Usuário', value: 'Gestor Farina (FIMP)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4801-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Gestor Farina',
        timestamp: '09:50 · 22/11',
        summary: 'Pedido recebido no chat do sistema para relatório de inadimplência por garantia.',
        details: 'Solicitação registrada via barra de comando.',
      },
      {
        id: 'tl-4801-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '09:50 · 22/11',
        summary: 'Classificado em Consulta e relatório > Relatório (Confiança 99%).',
        details: 'Escopo de 358 contratos ativos de locação.',
      },
      {
        id: 'tl-4801-3',
        cycle: 1,
        type: 'Execução iniciada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '09:50 · 22/11',
        summary: 'Cruzamento de títulos vencidos com garantias contratuais iniciado.',
        details: 'Apurados 16 contratos em atraso totalizando R$ 56.880,00.',
      },
      {
        id: 'tl-4801-4',
        cycle: 1,
        type: 'Entregue',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '09:51 · 22/11',
        summary: 'Relatório consolidado e planilha entregues para aceite do gestor.',
        details: 'Caução concentra 75% dos casos (12 de 16). Aceite automático em 3 dias úteis.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4801-1',
        label: 'Consultar 358 contratos ativos e faturas vencidas',
        status: 'completed',
        duration: '4,2s',
      },
      {
        id: 'st-4801-2',
        label: 'Agrupar inadimplência por modalidade de garantia',
        status: 'completed',
        duration: '3,8s',
      },
      {
        id: 'st-4801-3',
        label: 'Gerar relatório executivo PDF e exportar tabela analítica',
        status: 'completed',
        duration: '4,0s',
      },
    ],
    delivery: {
      solutionSummary:
        'Relatório entregue: inadimplência geral de 7,2% (16 contratos / R$ 56.880). Caução responde por 12 casos (10,4%), Seguro Fiança 2 (2,1%), Fiador 2 (3,0%) e Título 1 (4,5%).',
      artifacts: [
        { name: 'Relatorio_Inadimplencia_Garantias_Nov26.pdf', type: 'PDF', meta: '4 páginas · gráficos e recomendações' },
        { name: 'Base_Inadimplentes_Nov26.xlsx', type: 'Planilha', meta: '16 linhas detalhadas' },
      ],
      systemChangesSummary: ['Nenhuma alteração cadastral — relatório consultivo gerado'],
      requesterPreview: {
        channel: 'Chat do sistema',
        body: 'Relatório pronto: 75% da inadimplência atual está concentrada em contratos com caução (12 de 16 casos). Recomendo exigir seguro fiança ou caução de 3x para perfis com score abaixo de 650.',
      },
      autoAcceptNotice: true,
    },
  },
  {
    id: 'ord-4808',
    protocol: 'PED-2026-004808',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Vendas e captação',
    subtype: 'Captação de imóvel',
    subject: 'Publicar captação Rua das Acácias, 418 – R$ 680 mil',
    objective: 'Validar valor do condomínio transcrito com ruído e publicar anúncio nos portais.',
    narrative:
      'Corretor Roberto Farina enviou áudio de captação no WhatsApp com dados e 14 fotos do imóvel na Rua das Acácias, 418. O agente transcreveu tudo, porém detectou ruído no valor informado do condomínio (R$ 680 a R$ 780) e pausou para conferência.',
    requesterName: 'Roberto Farina',
    requesterRole: 'Corretor',
    requesterContact: '+55 11 98210-4402',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 3h15',
    slaRequested: 'Hoje, final do dia',
    slaCommitted: '23/11, 12:00 (1 dia útil)',
    stageDurations: [
      { stage: 'Transcrição áudio', duration: '45s' },
      { stage: 'Padronização fotos', duration: '3 min' },
      { stage: 'Aguardando aprovação', duration: '18 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 71,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:40',
    links: [
      { type: 'Imóvel', code: 'IMV-418', label: 'Rua das Acácias, 418 · Venda' },
      { type: 'Pessoa', code: 'PES-089', label: 'Roberto Farina (Corretor)' },
    ],
    decisionMeta: {
      pauseReason: 'Baixa confiança',
      proposedAction: 'Ativar anúncio nos portais ZAP e VivaReal com 14 fotos e descrição padronizada.',
      evidenceSource: 'Extraído do áudio do WhatsApp (01:42) de Roberto Farina',
      evidenceExcerpt:
        'Áudio com ruído no valor informado do condomínio ("entre seiscentos e oitenta e setecentos e oitenta reais").',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:40',
      rawText:
        '[Transcrição do áudio 01:42] Fala pessoal, acabei de captar um apartamento ótimo na Rua das Acácias, 418, Jardim América. São 94 m², 3 dormitórios sendo 1 suíte, 2 vagas, valor de venda R$ 680.000,00. IPTU R$ 240/mês e o condomínio [ruído de trânsito] está em torno de 680... ou 780 reais, vou confirmar o boleto mas já podem preparar o anúncio com essas 14 fotos.',
      attachments: [
        { name: 'audio_captacao_418.ogg', size: '640 KB', mime: 'audio/ogg' },
        { name: 'fotos_acacias_418.zip', size: '18,2 MB', mime: 'application/zip' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp Business' },
        { label: 'Duração do áudio', value: '01:42' },
      ],
    },
    timeline: [
      {
        id: 'tl-4808-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Roberto Farina',
        timestamp: '13:40 · 22/11',
        summary: 'Áudio de 01:42 e 14 fotos recebidos via WhatsApp para captação de venda.',
        details: 'Mídias armazenadas e enfileiradas para transcrição.',
      },
      {
        id: 'tl-4808-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:41 · 22/11',
        summary: 'Ficha pré-preenchida em Vendas e captação > Captação de imóvel.',
        details: 'Confiança 71% devido à ambiguidade no valor do condomínio.',
      },
      {
        id: 'tl-4808-3',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:44 · 22/11',
        summary: 'Publicação pausada aguardando aprovação do valor exato do condomínio.',
        details: 'Disponível para decisão rápida no Painel e na Central de Pedidos.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4808-1',
        label: 'Transcrever áudio e extrair ficha técnica do imóvel IMV-418',
        status: 'completed',
        duration: '45s',
        change: {
          entity: 'Imóvel IMV-418',
          field: 'Condomínio estimado',
          before: 'Não informado',
          after: 'R$ 730,00 (aguardando confirmação)',
        },
      },
      {
        id: 'st-4808-2',
        label: 'Tratar e ordenar 14 fotos em alta resolução',
        status: 'completed',
        duration: '3m',
      },
      {
        id: 'st-4808-3',
        label: 'Publicar nos portais ZAP e VivaReal após aprovação',
        status: 'pending',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Cadastro prévio de IMV-418 concluído com 14 fotos tratadas e texto comercial pronto; aguardando confirmação do valor de condomínio para publicar.',
      artifacts: [
        { name: 'Ficha_Captacao_IMV418.pdf', type: 'PDF', meta: '14 fotos + memorial descritivo' },
      ],
      systemChangesSummary: ['Imóvel IMV-418 criado em rascunho de publicação'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Roberto, já montei o anúncio da Rua das Acácias, 418 com as 14 fotos! Só preciso confirmar se o condomínio fica em R$ 680 ou R$ 780 para liberar a publicação nos portais.',
      },
    },
  },
  {
    id: 'ord-4807',
    protocol: 'PED-2026-004807',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Cobrança e financeiro',
    subtype: 'Repasse',
    subject: 'Liberar lote de 6 repasses que vencem hoje (R$ 28.450)',
    objective: 'Autorizar remessa bancária dos 6 repasses conciliados sem divergência de taxa.',
    narrative:
      'Agente conciliou o extrato bancário OFX da manhã com os 6 contratos de locação cujo repasse vence hoje, totalizando R$ 28.450,00 líquidos após retenção da taxa de administração.',
    requesterName: 'Gestor Farina',
    requesterRole: 'Gestor',
    requesterContact: 'financeiro@farina.com.br',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 2h10',
    slaRequested: 'Hoje, corte bancário 16:00',
    slaCommitted: 'Hoje, 16:00',
    stageDurations: [
      { stage: 'Conciliação OFX', duration: '2 min' },
      { stage: 'Conferência taxas', duration: '1 min' },
      { stage: 'Aguardando aprovação', duration: '31 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 98,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:27',
    appliedRules: [{ ruleId: 'FIN-003', version: 1 }],
    links: [
      { type: 'Pessoa', code: 'PES-001', label: 'Gestor Farina (Autorizador)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction: 'Autorizar remessa bancária para proprietários com aluguel já compensado.',
      evidenceSource: 'Extraído de extrato_oficina_nov.ofx + regra de repasse D+2',
      evidenceExcerpt:
        '6 contratos conferidos e conciliados sem divergência de taxa administrativa.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:27',
      rawText:
        'Solicitação automática agendada: conciliar recebimentos compensados do arquivo extrato_oficina_nov.ofx e preparar lote de repasses D+2 com vencimento em 22/11/2026 para autorização financeira.',
      attachments: [
        { name: 'extrato_oficina_nov.ofx', size: '84 KB', mime: 'application/octet-stream' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'Chat do sistema / Rotina Financeira' },
        { label: 'Lote', value: 'REM-20261122-06' },
      ],
    },
    timeline: [
      {
        id: 'tl-4807-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Sistema',
        actorName: 'Rotina Bancária',
        timestamp: '13:27 · 22/11',
        summary: 'Conciliação OFX recebida com 6 repasses elegíveis para pagamento hoje.',
        details: 'Total bruto R$ 31.611,10; taxa adm R$ 3.161,10; líquido R$ 28.450,00.',
      },
      {
        id: 'tl-4807-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:28 · 22/11',
        summary: 'Classificado em Cobrança e financeiro > Repasse · Confiança 98%.',
        details: 'Movimentação financeira exige aprovação humana antes do envio ao banco.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4807-1',
        label: 'Conciliar 6 boletos compensados no extrato OFX',
        status: 'completed',
        duration: '1,8s',
      },
      {
        id: 'st-4807-2',
        label: 'Montar arquivo de remessa CNAB-240 para aprovação',
        status: 'completed',
        duration: '1,1s',
        change: {
          entity: 'Lote REM-20261122-06',
          field: 'Situação da remessa',
          before: 'Pendente de conciliação',
          after: 'Pronta para autorização (R$ 28.450,00)',
        },
      },
    ],
    delivery: {
      solutionSummary:
        'Remessa bancária REM-20261122-06 pronta para disparo imediato após aprovação do gestor, cobrindo 6 proprietários.',
      artifacts: [
        { name: 'Remessa_Repasses_221126.rem', type: 'Link', meta: 'CNAB-240 · 6 favorecidos' },
      ],
      systemChangesSummary: ['6 lançamentos de repasse conciliados e vinculados ao lote'],
      requesterPreview: {
        channel: 'Chat do sistema',
        body: 'Lote de R$ 28.450,00 referente a 6 repasses conciliado sem divergências. Aguardando sua aprovação para envio antes do corte das 16h.',
      },
    },
  },
  {
    id: 'ord-4806',
    protocol: 'PED-2026-004806',
    cycle: 1,
    channel: 'E-mail',
    category: 'Cobrança e financeiro',
    subtype: 'Baixa de pagamento',
    subject: 'Vincular PIX de R$ 2.950 sem CPF à fatura da Casa 12',
    objective: 'Validar comprovante de terceiro (João P. Lima) e baixar parcela de novembro.',
    narrative:
      'Inquilina Fernanda Lima enviou por e-mail comprovante de PIX de R$ 2.950,00 pago por terceiro (João P. Lima) sem CPF no identificador bancário. O agente cruzou valor e imóvel e pausou por exceção para aceite do gestor.',
    requesterName: 'Fernanda Lima',
    requesterRole: 'Inquilina',
    requesterContact: 'fernanda.lima@email.com',
    priority: 'Normal',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 1d 6h',
    slaRequested: 'Hoje',
    slaCommitted: '25/11, 13:10 (3 dias úteis)',
    stageDurations: [
      { stage: 'OCR comprovante', duration: '3s' },
      { stage: 'Cruzamento fatura', duration: '2s' },
      { stage: 'Aguardando aprovação', duration: '47 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 74,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:11',
    appliedRules: [
      { ruleId: 'FIN-021', version: 1 },
      { ruleId: 'FIN-014', version: 3 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-012', label: 'Casa 12 · Vila Mariana' },
      { type: 'Contrato', code: 'CTR-712', label: 'CTR-712 · Fernanda Lima' },
      { type: 'Pessoa', code: 'PES-512', label: 'Fernanda Lima (Inquilina)' },
    ],
    decisionMeta: {
      pauseReason: 'Exceção',
      proposedAction: 'Baixar parcela de novembro e suspender envio de cobrança automática.',
      evidenceSource: 'Extraído de comprovante_pix.png + E-mail de Fernanda Lima',
      evidenceExcerpt:
        'Pagamento feito por conta de terceiro (João P. Lima) com valor idêntico ao boleto em aberto.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:11',
      rawText:
        'Boa tarde! Meu marido João Pedro Lima fez o PIX do aluguel deste mês da Casa 12 agora há pouco, mas saiu da conta dele e não colocou meu CPF na descrição. Segue o comprovante anexo para darem baixa e não gerarem multa por favor. Obrigada!',
      attachments: [
        { name: 'comprovante_pix.png', size: '245 KB', mime: 'image/png' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'E-mail (financeiro@farina.com.br)' },
        { label: 'Remetente', value: 'fernanda.lima@email.com' },
      ],
    },
    timeline: [
      {
        id: 'tl-4806-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Fernanda Lima',
        timestamp: '13:11 · 22/11',
        summary: 'E-mail com comprovante PIX de R$ 2.950,00 recebido para baixa da Casa 12.',
        details: 'OCR leu pagador João P. Lima e valor R$ 2.950,00 às 12:58.',
      },
      {
        id: 'tl-4806-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:11 · 22/11',
        summary: 'Classificado em Cobrança e financeiro > Baixa de pagamento (Exceção).',
        details: 'Titular da conta bancária difere do locatário cadastrado.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4806-1',
        label: 'Extrair dados do comprovante_pix.png via OCR',
        status: 'completed',
        duration: '2,4s',
      },
      {
        id: 'st-4806-2',
        label: 'Associar crédito de R$ 2.950,00 à fatura NOV/2026 (Casa 12)',
        status: 'completed',
        duration: '1,1s',
        change: {
          entity: 'Fatura FAT-1126-12',
          field: 'Vínculo proposto',
          before: 'Em aberto (R$ 2.950,00)',
          after: 'Conciliação pendente de aceite',
        },
      },
    ],
    delivery: {
      solutionSummary:
        'Comprovante PIX validado contra o crédito bancário de R$ 2.950,00; pronto para baixar a fatura da Casa 12 e pausar régua de cobrança.',
      artifacts: [
        { name: 'Comprovante_Conciliado_FAT1126.pdf', type: 'PDF', meta: 'Conciliação bancária' },
      ],
      systemChangesSummary: ['Pré-baixa preparada para fatura FAT-1126-12'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Re: Comprovante PIX Casa 12 [PED-2026-004806]',
        body: 'Olá Fernanda! Recebemos o comprovante do PIX realizado pelo Sr. João P. Lima no valor de R$ 2.950,00. Já pausamos os alertas de cobrança e estamos apenas finalizando a validação interna da baixa.',
      },
    },
  },
  {
    id: 'ord-4805',
    protocol: 'PED-2026-004805',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Jurídico e documentos',
    subtype: 'Aditivo contratual',
    subject: 'Incluir autorização de pet em aditivo do Apto 504',
    objective: 'Confirmar porte e taxa adicional antes de redigir aditivo contratual.',
    narrative:
      'Proprietária Marina Duarte pediu aditivo permitindo animal de estimação no Apto 504, mas não especificou se mantém exigência de pintura especial na desocupação. O agente enviou pergunta objetiva e pausou o prazo.',
    requesterName: 'Marina Duarte',
    requesterRole: 'Proprietária',
    requesterContact: '+55 11 99741-1020',
    priority: 'Alta',
    status: 'Aguardando esclarecimento',
    slaSemaphore: 'pausado',
    slaText: 'pausado · aguarda resposta',
    slaRequested: 'Amanhã, 12:00',
    slaCommitted: '23/11, 14:00 (pausado)',
    slaPausedReason: 'Aguardando resposta da proprietária Marina sobre cláusula de pintura na saída.',
    stageDurations: [
      { stage: 'Leitura e análise', duration: '2 min' },
      { stage: 'Aguardando esclarecimento', duration: '2h 15min (pausado)', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 88,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 11:42',
    links: [
      { type: 'Imóvel', code: 'IMV-504', label: 'Apto 504 · Ed. Bela Vista' },
      { type: 'Contrato', code: 'CTR-504', label: 'CTR-504 · Locação' },
      { type: 'Pessoa', code: 'PES-177', label: 'Marina Duarte (Proprietária)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 11:42',
      rawText:
        'Oi! O meu inquilino do 504 perguntou se pode ter um cachorro pequeno no apartamento. Eu libero sim, podem fazer um aditivo para registrar isso no contrato, só me avisem o que costuma ir na cláusula de conservação.',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp Business' },
        { label: 'Telefone', value: '+55 11 99741-1020' },
      ],
    },
    timeline: [
      {
        id: 'tl-4805-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Marina Duarte',
        timestamp: '11:42 · 22/11',
        summary: 'Solicitação de aditivo de permissão de pet recebida via WhatsApp.',
        details: 'Contrato CTR-504 localizado automaticamente.',
      },
      {
        id: 'tl-4805-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '11:43 · 22/11',
        summary: 'Classificado em Jurídico e documentos > Aditivo contratual.',
        details: 'Rascunho padrão exige confirmação de cláusula de vistoria de saída.',
      },
      {
        id: 'tl-4805-3',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '11:44 · 22/11',
        summary: 'Pergunta enviada à proprietária sobre cláusula de higienização na entrega.',
        details: 'Relógio de SLA pausado automaticamente até o retorno da solicitante.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4805-1',
        label: 'Consultar modelo padrão de aditivo para animais de estimação',
        status: 'completed',
        duration: '0,8s',
      },
      {
        id: 'st-4805-2',
        label: 'Enviar dúvida de confirmação e pausar SLA',
        status: 'completed',
        duration: '1,0s',
      },
    ],
    delivery: {
      solutionSummary:
        'Pergunta objetiva enviada no WhatsApp para definir a cláusula de conservação na saída antes de gerar o aditivo definitivo.',
      artifacts: [],
      systemChangesSummary: ['Aguardando retorno da proprietária Marina Duarte'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Oi Marina! Podemos incluir a cláusula padrão que exige sanitização profissional e reparo de eventuais arranhões na desocupação. Você aprova seguir com esse texto no aditivo do Apto 504?',
      },
    },
  },
  {
    id: 'ord-4811',
    protocol: 'PED-2026-004811',
    cycle: 1,
    channel: 'Portais',
    category: 'Vendas e captação',
    subtype: 'Lead de portal',
    subject: 'Qualificar lead ZAP Imóveis para Apto Jardins 1102',
    objective: 'Responder lead Juliana Martins, verificar forma de pagamento e agendar visita.',
    narrative:
      'Lead recebido do portal ZAP Imóveis demonstrando interesse no Apto 1102 do Ed. Jardins (R$ 1.150.000). Pedido recém-recebido na fila para triagem de compatibilidade e distribuição.',
    requesterName: 'Juliana Martins',
    requesterRole: 'Lead',
    requesterContact: '+55 11 98834-1900',
    priority: 'Normal',
    status: 'Recebido',
    slaSemaphore: 'no_prazo',
    slaText: 'em 2d 22h',
    slaRequested: 'Contato hoje',
    slaCommitted: '25/11, 13:50 (3 dias úteis)',
    stageDurations: [
      { stage: 'Recebido', duration: '4 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 92,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:53',
    links: [
      { type: 'Imóvel', code: 'IMV-1102', label: 'Apto 1102 · Ed. Jardins' },
      { type: 'Pessoa', code: 'PES-640', label: 'Juliana Martins (Lead)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 13:53',
      rawText:
        'Olá, vi o anúncio do apartamento de 3 suítes no Edifício Jardins (Ref. IMV-1102) no ZAP Imóveis. Gostaria de saber se aceita financiamento bancário e se há disponibilidade para visita amanhã pela manhã.',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'Webhook ZAP Imóveis' },
        { label: 'ID Anúncio', value: 'ZAP-7729103' },
      ],
    },
    timeline: [
      {
        id: 'tl-4811-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Juliana Martins',
        timestamp: '13:53 · 22/11',
        summary: 'Lead capturado via integração ZAP Imóveis para o imóvel IMV-1102.',
        details: 'Dados de contato e imóvel de interesse indexados.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4811-1',
        label: 'Verificar disponibilidade de agenda do corretor Lucas Andrade',
        status: 'pending',
        duration: 'Na fila',
      },
    ],
    delivery: {
      solutionSummary: 'Lead em fila inicial para qualificação e agendamento automático.',
      artifacts: [],
      systemChangesSummary: ['Registro de lead criado automaticamente'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Juliana! O Apto 1102 no Ed. Jardins aceita financiamento bancário sim. Temos horário disponível amanhã às 10h30 com o corretor Lucas. Posso confirmar para você?',
      },
    },
  },
  {
    id: 'ord-4810',
    protocol: 'PED-2026-004810',
    cycle: 1,
    channel: 'Upload de documentos',
    category: 'Cadastro e atualização',
    subtype: 'Cadastro de contrato',
    subject: 'Extrair e cadastrar contrato PDF Sala 804 Paulista',
    objective: 'Ler PDF assinado de 11 páginas e cadastrar partes, garantia e parcelas.',
    narrative:
      'Corretor Lucas Andrade subiu o PDF do contrato comercial assinado da Sala 804 (Av. Paulista). O agente já interpretou todas as cláusulas, datas e valores e aguarda início da gravação automática.',
    requesterName: 'Lucas Andrade',
    requesterRole: 'Corretor',
    requesterContact: 'lucas.andrade@farina.com.br',
    priority: 'Normal',
    status: 'Interpretado',
    slaSemaphore: 'no_prazo',
    slaText: 'em 2d 18h',
    slaRequested: 'Esta semana',
    slaCommitted: '25/11, 09:00 (3 dias úteis)',
    stageDurations: [
      { stage: 'OCR e leitura PDF', duration: '14s' },
      { stage: 'Interpretado', duration: '12 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 95,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:45',
    appliedRules: [{ ruleId: 'JUR-013', version: 1 }],
    links: [
      { type: 'Imóvel', code: 'IMV-804', label: 'Sala 804 · Av. Paulista' },
      { type: 'Pessoa', code: 'PES-045', label: 'Lucas Andrade (Corretor)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 13:45',
      rawText:
        'Upload do documento contrato_sala804_paulista_assinado.pdf (11 páginas). Favor cadastrar o contrato comercial com início em 01/12/2026, aluguel de R$ 5.800,00, garantia Seguro Fiança Porto e taxa de adm 8%.',
      attachments: [
        { name: 'contrato_sala804_paulista_assinado.pdf', size: '2,8 MB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'Upload direto GoFAPE' },
        { label: 'Páginas lidas', value: '11 / 11' },
      ],
    },
    timeline: [
      {
        id: 'tl-4810-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Lucas Andrade',
        timestamp: '13:45 · 22/11',
        summary: 'Arquivo contrato_sala804_paulista_assinado.pdf enviado para cadastro.',
        details: 'Documento assinado eletronicamente validado.',
      },
      {
        id: 'tl-4810-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:46 · 22/11',
        summary: 'Extraídos locador, locatário, aluguel R$ 5.800 e Seguro Fiança.',
        details: 'Classificado em Cadastro e atualização > Cadastro de contrato.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4810-1',
        label: 'Ler 11 páginas do PDF e extrair entidades jurídicas',
        status: 'completed',
        duration: '14,0s',
      },
      {
        id: 'st-4810-2',
        label: 'Criar contrato CTR-912 e programar 36 faturas mensais',
        status: 'pending',
        duration: 'A iniciar',
      },
    ],
    delivery: {
      solutionSummary: 'Contrato interpretado com 95% de confiança e pronto para gravação na carteira.',
      artifacts: [
        { name: 'contrato_sala804_paulista_assinado.pdf', type: 'PDF', meta: 'Documento original indexado' },
      ],
      systemChangesSummary: ['Aguardando início da gravação automática do contrato CTR-912'],
      requesterPreview: {
        channel: 'Chat do sistema',
        body: 'Contrato da Sala 804 interpretado (R$ 5.800,00 · Seguro Fiança · taxa 8%). Iniciando cadastro completo e geração da régua financeira.',
      },
    },
  },
  {
    id: 'ord-4804-1',
    protocol: 'PED-2026-004804.1',
    parentProtocol: 'PED-2026-004804',
    subOrders: ['PED-2026-004804.1', 'PED-2026-004804.2'],
    cycle: 1,
    channel: 'E-mail',
    category: 'Cobrança e financeiro',
    subtype: 'Segunda via de boleto',
    subject: 'Emitir segunda via atualizada do boleto de novembro',
    objective: 'Recalcular boleto vencido com multa/juros contratuais e enviar PDF ao inquilino.',
    narrative:
      'Sub-pedido 1 dividido do e-mail original de Marcos Prado: emissão de segunda via atualizada do boleto de novembro para o Apto 401 – Ed. Solaris com vencimento estendido para hoje.',
    requesterName: 'Marcos Prado',
    requesterRole: 'Inquilino',
    requesterContact: 'marcos.prado@email.com',
    priority: 'Baixa',
    status: 'Concluído',
    slaSemaphore: 'no_prazo',
    slaText: 'concluído no prazo',
    slaRequested: 'Esta semana',
    slaCommitted: '29/11, 10:00 (7 dias úteis)',
    stageDurations: [
      { stage: 'Desmembramento', duration: '4s' },
      { stage: 'Execução', duration: '6s' },
      { stage: 'Aceite', duration: '28 min' },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 99,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 08:20',
    appliedRules: [{ ruleId: 'FIN-014', version: 3 }],
    links: [
      { type: 'Imóvel', code: 'IMV-401', label: 'Apto 401 · Ed. Solaris' },
      { type: 'Contrato', code: 'CTR-401', label: 'CTR-401 · Marcos Prado' },
      { type: 'Pessoa', code: 'PES-311', label: 'Marcos Prado (Inquilino)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 08:20',
      rawText:
        'Bom dia! Gostaria de pedir duas coisas no mesmo e-mail: 1) Preciso da segunda via atualizada do meu boleto de novembro para pagar hoje ainda; 2) O interfone da cozinha está mudo desde segunda-feira, poderiam mandar alguém verificar na vistoria?',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'E-mail (atendimento@farina.com.br)' },
        { label: 'Origem dividida', value: 'Pedido original dividido em .1 e .2' },
      ],
    },
    timeline: [
      {
        id: 'tl-4804-1-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Marcos Prado',
        timestamp: '08:20 · 22/11',
        summary: 'E-mail com duas demandas distintas recebido e dividido em .1 e .2.',
        details: 'Sub-pedido .1 trata da segunda via financeira; .2 trata do reparo do interfone.',
      },
      {
        id: 'tl-4804-1-2',
        cycle: 1,
        type: 'Execução iniciada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '08:20 · 22/11',
        summary: 'Boleto atualizado gerado com código de barras e linha digitável PIX.',
        details: 'Valor original R$ 3.450,00 atualizado com encargos previstos em contrato.',
      },
      {
        id: 'tl-4804-1-3',
        cycle: 1,
        type: 'Entregue',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '08:21 · 22/11',
        summary: 'Segunda via enviada por e-mail para marcos.prado@email.com.',
        details: 'PDF anexado automaticamente.',
      },
      {
        id: 'tl-4804-1-4',
        cycle: 1,
        type: 'Aceito',
        actor: 'Solicitante',
        actorName: 'Marcos Prado',
        timestamp: '08:49 · 22/11',
        summary: 'Solicitante confirmou recebimento e avaliou atendimento com 5 estrelas.',
        details: 'Ciclo concluído na primeira entrega.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4804-1-1',
        label: 'Recalcular boleto vencido com atualização monetária',
        status: 'completed',
        duration: '2,1s',
        change: {
          entity: 'Fatura FAT-1126-401',
          field: 'Vencimento segunda via',
          before: '10/11/2026',
          after: '22/11/2026 (PIX ativo)',
        },
      },
      {
        id: 'st-4804-1-2',
        label: 'Disparar PDF da segunda via ao inquilino',
        status: 'completed',
        duration: '1,4s',
      },
    ],
    delivery: {
      solutionSummary:
        'Segunda via do boleto de novembro atualizada para pagamento hoje via boleto ou QR Code PIX e entregue no e-mail do inquilino.',
      artifacts: [
        { name: 'Boleto_2Via_Apto401_Nov26.pdf', type: 'PDF', meta: 'Vencimento 22/11/2026' },
      ],
      systemChangesSummary: ['Fatura FAT-1126-401 reemitida com novo vencimento'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Sua 2ª via do boleto de novembro - Apto 401 [PED-2026-004804.1]',
        body: 'Olá Marcos! Segue anexa a segunda via atualizada do seu boleto de novembro com vencimento para hoje (22/11), incluindo QR Code PIX para compensação imediata. Sobre o interfone, abrimos o protocolo PED-2026-004804.2 em paralelo.',
      },
      acceptedType: 'Aceito',
      rating: 5,
      feedbackComment: 'Super rápido, já paguei pelo QR Code!',
    },
  },
  {
    id: 'ord-4804-2',
    protocol: 'PED-2026-004804.2',
    parentProtocol: 'PED-2026-004804',
    subOrders: ['PED-2026-004804.1', 'PED-2026-004804.2'],
    cycle: 1,
    channel: 'E-mail',
    category: 'Manutenção e vistoria',
    subtype: 'Vistoria',
    subject: 'Verificar interfone mudo na cozinha do Apto 401',
    objective: 'Agendar visita técnica de manutenção elétrica/interfone com autorização do prédio.',
    narrative:
      'Sub-pedido 2 dividido do e-mail original de Marcos Prado: verificação e reparo do interfone da cozinha que está mudo no Apto 401 – Ed. Solaris.',
    requesterName: 'Marcos Prado',
    requesterRole: 'Inquilino',
    requesterContact: 'marcos.prado@email.com',
    priority: 'Normal',
    status: 'Em execução',
    slaSemaphore: 'no_prazo',
    slaText: 'em 1d 14h',
    slaRequested: 'Esta semana',
    slaCommitted: '25/11, 18:00 (3 dias úteis)',
    stageDurations: [
      { stage: 'Desmembramento', duration: '4s' },
      { stage: 'Em execução', duration: '5h 20min', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Beatriz Souza',
    confidence: 93,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 08:20',
    links: [
      { type: 'Imóvel', code: 'IMV-401', label: 'Apto 401 · Ed. Solaris' },
      { type: 'Pessoa', code: 'PES-311', label: 'Marcos Prado (Inquilino)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 08:20',
      rawText:
        'Bom dia! Gostaria de pedir duas coisas no mesmo e-mail: 1) Preciso da segunda via atualizada do meu boleto de novembro para pagar hoje ainda; 2) O interfone da cozinha está mudo desde segunda-feira, poderiam mandar alguém verificar na vistoria?',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'E-mail (atendimento@farina.com.br)' },
        { label: 'Origem dividida', value: 'Sub-pedido .2 de PED-2026-004804' },
      ],
    },
    timeline: [
      {
        id: 'tl-4804-2-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Marcos Prado',
        timestamp: '08:20 · 22/11',
        summary: 'Demanda de reparo de interfone separada no sub-pedido .2.',
        details: 'Sub-pedido independente do financeiro para não travar prazos distintos.',
      },
      {
        id: 'tl-4804-2-2',
        cycle: 1,
        type: 'Execução iniciada',
        actor: 'Gestor',
        actorName: 'Beatriz Souza',
        timestamp: '09:10 · 22/11',
        summary: 'Técnico do condomínio acionado para checar se o defeito é interno ou prumada.',
        details: 'Visita prevista para amanhã entre 09h e 11h.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4804-2-1',
        label: 'Abrir chamado de vistoria técnica para Apto 401',
        status: 'completed',
        duration: '1,0s',
      },
      {
        id: 'st-4804-2-2',
        label: 'Confirmar janela de atendimento com zeladoria do Ed. Solaris',
        status: 'running',
        duration: 'Em andamento',
      },
    ],
    delivery: {
      solutionSummary: 'Vistoria técnica em agendamento junto à zeladoria e prestador credenciado.',
      artifacts: [],
      systemChangesSummary: ['Chamado técnico vinculado ao imóvel IMV-401'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Agendamento técnico do interfone - Apto 401 [PED-2026-004804.2]',
        body: 'Olá Marcos, nossa equipe já contatou a zeladoria do Ed. Solaris para verificar o interfone da cozinha e confirmaremos o horário da visita técnica ainda hoje.',
      },
    },
  },
  {
    id: 'ord-4803',
    protocol: 'PED-2026-004803',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Cobrança e financeiro',
    subtype: 'Cobrança',
    subject: 'Executar cobrança escalonada dos 16 inquilinos em atraso',
    objective: 'Enviar lembrete amigável (+5d), aviso formal (+15d) e notificação (+30d).',
    narrative:
      'Gestor Farina solicitou disparo da régua escalonada de cobrança para os 16 contratos inadimplentes. Um lote com +30 dias aguarda retorno de protesto bancário, deixando o pedido atrasado em 1 dia.',
    requesterName: 'Gestor Farina',
    requesterRole: 'Gestor',
    requesterContact: 'gestao@farina.com.br',
    priority: 'Alta',
    status: 'Em execução',
    slaSemaphore: 'atrasado',
    slaText: 'atrasado 1 dia',
    slaRequested: '21/11, 18:00',
    slaCommitted: '21/11, 18:00 (1 dia útil)',
    stageDurations: [
      { stage: 'Segmentação faixas', duration: '1 min' },
      { stage: 'Disparo régua 13/16', duration: '4 min' },
      { stage: 'Retorno cartório 3/16', duration: '1 dia 4h', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 97,
    registeredBy: 'Registrado pelo agente',
    createdAt: '20/11, 14:10',
    appliedRules: [
      { ruleId: 'FIN-014', version: 3 },
      { ruleId: 'FIN-020', version: 2 },
    ],
    links: [
      { type: 'Pessoa', code: 'PES-001', label: 'Gestor Farina (Gestor)' },
    ],
    originalMessage: {
      receivedAt: '20/11/2026 às 14:10',
      rawText:
        'Enviar cobrança escalonada via WhatsApp e E-mail para os 16 inquilinos em atraso conforme faixa de dias (+5, +15 e +30 dias), registrando protocolo de entrega em cada contrato.',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'Chat do sistema' },
        { label: 'Lote', value: '16 contratos inadimplentes' },
      ],
    },
    timeline: [
      {
        id: 'tl-4803-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Gestor Farina',
        timestamp: '14:10 · 20/11',
        summary: 'Ordem de cobrança escalonada criada a partir dos alertas operacionais.',
        details: '9 contratos +5d, 4 contratos +15d, 3 contratos +30d.',
      },
      {
        id: 'tl-4803-2',
        cycle: 1,
        type: 'Passo executado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '14:14 · 20/11',
        summary: '13 cobranças (+5d e +15d) enviadas via WhatsApp e E-mail com sucesso.',
        details: '4 inquilinos já solicitaram segunda via ou prometeram pagamento até sexta.',
      },
      {
        id: 'tl-4803-3',
        cycle: 1,
        type: 'Passo executado',
        actor: 'Sistema',
        actorName: 'Regra FIN-014',
        timestamp: '10:00 · 22/11',
        summary: 'Aprovação exigida pela regra FIN-014 para acordos com desconto acima de 10%.',
        details: 'Reconsulta automática programada para os 3 contratos +30d.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4803-1',
        label: 'Disparar 9 lembretes amigáveis (+5 dias) com link PIX',
        status: 'completed',
        duration: '2,2s',
      },
      {
        id: 'st-4803-2',
        label: 'Enviar 4 avisos formais de multa contratual (+15 dias)',
        status: 'completed',
        duration: '1,9s',
      },
      {
        id: 'st-4803-3',
        label: 'Protocolar 3 notificações de garantia (+30 dias)',
        status: 'running',
        duration: 'Atrasado 1d',
      },
    ],
    delivery: {
      solutionSummary:
        '13 de 16 cobranças disparadas e entregues (4 compromissos de pagamento obtidos). Aguardando retorno de protocolo cartorário para os últimos 3 casos (+30 dias).',
      artifacts: [
        { name: 'Log_Cobranca_Escalonada_Nov26.pdf', type: 'PDF', meta: '16 contratos rastreados' },
      ],
      systemChangesSummary: ['13 contratos atualizados com registro de cobrança enviada'],
      requesterPreview: {
        channel: 'Chat do sistema',
        body: '13 cobranças enviadas com sucesso. 4 inquilinos responderam com previsão de pagamento. Restam 3 notificações (+30 dias) aguardando protocolo externo.',
      },
    },
  },
  {
    id: 'ord-4802',
    protocol: 'PED-2026-004802',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Triagem (não classificado)',
    subtype: 'Mensagem ambígua',
    subject: 'Mensagem sem identificação clara sobre chave e boleto',
    objective: 'Identificar solicitante e classificar demanda entre manutenção ou financeiro.',
    narrative:
      'Número desconhecido enviou áudio curto com ruído citando chave na portaria e boleto vencido sem informar endereço ou nome completo. Encaminhado para triagem humana assistida.',
    requesterName: 'Não identificado (+55 11 98412-3309)',
    requesterRole: 'Solicitante não identificado',
    requesterContact: '+55 11 98412-3309',
    priority: 'Normal',
    status: 'Recebido',
    slaSemaphore: 'em_risco',
    slaText: 'em 45 min',
    slaRequested: 'Hoje',
    slaCommitted: '25/11, 12:30 (triagem 1 h)',
    stageDurations: [
      { stage: 'Triagem humana', duration: '15 min', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Triagem Farina',
    confidence: 42,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:35',
    links: [],
    originalMessage: {
      receivedAt: '22/11/2026 às 13:35',
      rawText:
        'Oi boa tarde, deixei a chave com o rapaz aí ontem mas o boleto ainda aparece pra mim, vê isso aí pra mim por favor antes de fechar.',
      attachments: [
        { name: 'audio_sem_id_3309.ogg', size: '180 KB', mime: 'audio/ogg' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp Business' },
        { label: 'Telefone', value: '+55 11 98412-3309 (sem cadastro)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4802-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: '+55 11 98412-3309',
        timestamp: '13:35 · 22/11',
        summary: 'Mensagem de número não cadastrado recebida via WhatsApp.',
        details: 'Busca por telefone não retornou pessoa ou contrato ativo.',
      },
      {
        id: 'tl-4802-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:35 · 22/11',
        summary: 'Encaminhado para Triagem (não classificado) por baixa confiança (42%).',
        details: 'Possível rescisão/entrega de chaves ou baixa de boleto. Requer triagem humana.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4802-1',
        label: 'Buscar remetente na base de clientes e fiadores',
        status: 'completed',
        duration: '0,6s',
      },
      {
        id: 'st-4802-2',
        label: 'Aguardar confirmação de categoria na triagem',
        status: 'pending',
        duration: 'Em triagem',
      },
    ],
    delivery: {
      solutionSummary: 'Aguardando classificação e identificação do solicitante para resposta.',
      artifacts: [],
      systemChangesSummary: ['Nenhuma alteração executada antes da triagem'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá! Para agilizar seu atendimento na Farina Imobiliária, poderia me informar seu nome completo e o endereço do imóvel?',
      },
    },
  },
  {
    id: 'ord-4800',
    protocol: 'PED-2026-004800',
    cycle: 2,
    channel: 'E-mail',
    category: 'Jurídico e documentos',
    subtype: 'Notificação',
    subject: 'Revisar notificação extrajudicial Sala 902 Centro',
    objective: 'Corrigir memória de cálculo da multa rescisória para 3 aluguéis proporcionais.',
    narrative:
      'Ciclo 2: Proprietário Eduardo Tavares reabriu a entrega anterior apontando que a multa proporcional deveria considerar 14 meses restantes (e não 12) na notificação extrajudicial da Sala 902.',
    requesterName: 'Eduardo Tavares',
    requesterRole: 'Proprietário',
    requesterContact: 'eduardo.tavares@empresa.com.br',
    priority: 'Alta',
    status: 'Reaberto',
    slaSemaphore: 'atrasado',
    slaText: 'atrasado 4h',
    slaRequested: 'Hoje, 10:00',
    slaCommitted: 'Hoje, 10:00 (reaberto)',
    stageDurations: [
      { stage: 'Ciclo 1 (entregue)', duration: '6h 10min' },
      { stage: 'Ciclo 2 (revisão)', duration: '4h 12min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 91,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Ontem, 15:10',
    appliedRules: [{ ruleId: 'JUR-001', version: 1 }],
    links: [
      { type: 'Imóvel', code: 'IMV-902', label: 'Sala 902 · Centro' },
      { type: 'Contrato', code: 'CTR-902', label: 'CTR-902 · Comercial' },
      { type: 'Pessoa', code: 'PES-280', label: 'Eduardo Tavares (Proprietário)' },
    ],
    originalMessage: {
      receivedAt: '21/11/2026 às 15:10',
      rawText:
        'Prezados, solicito a emissão da notificação extrajudicial por falta de pagamento e abandono parcial da Sala 902 no Centro, com cálculo atualizado do débito e multa rescisória prevista na cláusula 11.',
      attachments: [
        { name: 'historico_ocorrencias_902.pdf', size: '410 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'E-mail (juridico@farina.com.br)' },
        { label: 'Ciclo atual', value: 'Ciclo 2 (Reaberto pelo solicitante)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4800-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Eduardo Tavares',
        timestamp: '15:10 · 21/11',
        summary: 'Solicitação de notificação extrajudicial recebida para Sala 902.',
        details: 'Contrato comercial CTR-902 vinculado.',
      },
      {
        id: 'tl-4800-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '15:11 · 21/11',
        summary: 'Classificado em Jurídico e documentos > Notificação.',
        details: 'Prioridade Alta.',
      },
      {
        id: 'tl-4800-3',
        cycle: 1,
        type: 'Entregue',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '18:05 · 21/11',
        summary: 'Minuta v1 da notificação entregue com multa calculada sobre 12 meses.',
        details: 'Enviada para conferência do proprietário.',
      },
      {
        id: 'tl-4800-4',
        cycle: 2,
        type: 'Reaberto',
        actor: 'Solicitante',
        actorName: 'Eduardo Tavares',
        timestamp: '09:40 · 22/11',
        summary: 'Reaberto no Ciclo 2: ajustar saldo restante para 14 meses conforme aditivo.',
        details: 'Comentário do cliente: "Considerar aditivo de prorrogação de fevereiro."',
      },
      {
        id: 'tl-4800-5',
        cycle: 2,
        type: 'Execução iniciada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '09:42 · 22/11',
        summary: 'Recalculando memória de cálculo da cláusula 11 para 14 meses restantes.',
        details: 'Aditivo de fevereiro localizado no repositório de documentos.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4800-1',
        label: 'Localizar aditivo de prorrogação de fevereiro/2026',
        status: 'completed',
        duration: '1,5s',
      },
      {
        id: 'st-4800-2',
        label: 'Recalcular multa proporcional (14/36 meses) na notificação',
        status: 'completed',
        duration: '2,0s',
        change: {
          entity: 'Notificação NOT-902',
          field: 'Valor da multa proporcional',
          before: 'R$ 2.900,00 (12 meses)',
          after: 'R$ 3.383,33 (14 meses)',
        },
      },
      {
        id: 'st-4800-3',
        label: 'Emitir minuta revisada v2 para aceite do proprietário',
        status: 'running',
        duration: 'Em finalização',
      },
    ],
    delivery: {
      solutionSummary:
        'Minuta v2 da notificação extrajudicial atualizada com base no aditivo de fevereiro (14 meses restantes, multa de R$ 3.383,33).',
      artifacts: [
        { name: 'Notificacao_Sala902_v2.pdf', type: 'PDF', meta: 'Ciclo 2 · memória revisada' },
      ],
      systemChangesSummary: ['Cálculo da notificação NOT-902 atualizado de R$ 2.900,00 para R$ 3.383,33'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Minuta revisada (v2) - Notificação Sala 902 [PED-2026-004800]',
        body: 'Prezado Eduardo, conforme sua observação, localizamos o aditivo de fevereiro e recalculamos a multa proporcional considerando os 14 meses restantes (R$ 3.383,33). Segue a versão revisada para seu aceite.',
      },
    },
  },
  {
    id: 'ord-4799',
    protocol: 'PED-2026-004799',
    cycle: 1,
    channel: 'Portais',
    category: 'Comunicação',
    subtype: 'Agendamento de visita',
    subject: 'Confirmar visita Apto 601 Perdizes com corretor Rafael',
    objective: 'Confirmar horário de visita amanhã às 10h30 e enviar localização ao lead.',
    narrative:
      'Lead Ricardo Mendes solicitou confirmação de visita para o Apto 601 em Perdizes. O agente cruzou a agenda do corretor Rafael Costa, reservou o horário e concluiu o aceite automático.',
    requesterName: 'Ricardo Mendes',
    requesterRole: 'Lead',
    requesterContact: '+55 11 97122-5501',
    priority: 'Normal',
    status: 'Concluído',
    slaSemaphore: 'no_prazo',
    slaText: 'concluído em 38s',
    slaRequested: 'Amanhã, 10:30',
    slaCommitted: 'Imediato',
    stageDurations: [
      { stage: 'Qualificação', duration: '18s' },
      { stage: 'Agendamento', duration: '20s' },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 98,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 09:12',
    links: [
      { type: 'Imóvel', code: 'IMV-601', label: 'Apto 601 · Perdizes' },
      { type: 'Pessoa', code: 'PES-618', label: 'Ricardo Mendes (Lead)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 09:12',
      rawText:
        'Olá, quero agendar visita no apartamento da Rua Cardoso de Almeida (Apto 601) amanhã de manhã por volta das 10h30.',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'Portal VivaReal' },
      ],
    },
    timeline: [
      {
        id: 'tl-4799-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Ricardo Mendes',
        timestamp: '09:12 · 22/11',
        summary: 'Pedido de agendamento recebido pelo portal VivaReal.',
        details: 'Imóvel IMV-601 disponível para visita.',
      },
      {
        id: 'tl-4799-2',
        cycle: 1,
        type: 'Entregue',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '09:12 · 22/11',
        summary: 'Visita confirmada para 23/11 às 10h30 com Rafael Costa.',
        details: 'Convite de calendário enviado ao corretor e ao lead.',
      },
      {
        id: 'tl-4799-3',
        cycle: 1,
        type: 'Aceito',
        actor: 'Sistema',
        actorName: 'Aceite automático',
        timestamp: '09:15 · 22/11',
        summary: 'Concluído automaticamente após confirmação na agenda.',
        details: 'Aceite automático aplicado conforme regra de agendamentos simples.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4799-1',
        label: 'Bloquear agenda do corretor Rafael Costa (23/11 10h30)',
        status: 'completed',
        duration: '1,2s',
        change: {
          entity: 'Agenda Comercial',
          field: 'Visita IMV-601',
          before: 'Livre',
          after: 'Reservada 23/11 10h30',
        },
      },
    ],
    delivery: {
      solutionSummary: 'Visita agendada para amanhã (23/11) às 10h30 com o corretor Rafael Costa.',
      artifacts: [
        { name: 'Convite_Visita_IMV601.ics', type: 'Link', meta: 'Evento de calendário' },
      ],
      systemChangesSummary: ['Visita registrada no funil comercial de IMV-601'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Visita confirmada! Amanhã às 10h30 o corretor Rafael Costa aguardará você na Rua Cardoso de Almeida (Apto 601, Perdizes).',
      },
      acceptedType: 'Aceite automático',
      rating: 5,
    },
  },
  {
    id: 'ord-4798',
    protocol: 'PED-2026-004798',
    cycle: 1,
    channel: 'Upload de documentos',
    category: 'Cadastro e atualização',
    subtype: 'Atualização cadastral',
    subject: 'Atualizar dados bancários da proprietária Helena Costa',
    objective: 'Validar comprovante de conta e substituir chave PIX de repasse.',
    narrative:
      'Proprietária Helena Costa enviou comprovante de nova conta Itaú para recebimento dos repasses de seus 2 imóveis administrados. Entregue aguardando confirmação final.',
    requesterName: 'Helena Costa',
    requesterRole: 'Proprietária',
    requesterContact: 'helena.costa@email.com',
    priority: 'Normal',
    status: 'Entregue',
    slaSemaphore: 'no_prazo',
    slaText: 'em 2d 6h',
    slaRequested: 'Próximo repasse',
    slaCommitted: '25/11, 18:00 (3 dias úteis)',
    stageDurations: [
      { stage: 'Validação documento', duration: '1 min' },
      { stage: 'Atualização bancária', duration: '2s' },
      { stage: 'Aguardando aceite', duration: '1h 40min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 97,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 11:15',
    links: [
      { type: 'Pessoa', code: 'PES-190', label: 'Helena Costa (Proprietária)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 11:15',
      rawText:
        'Upload de comprovante_conta_itau_helena.pdf. Solicitação de alteração de domicílio bancário para repasses a partir de dezembro/2026.',
      attachments: [
        { name: 'comprovante_conta_itau_helena.pdf', size: '190 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'Upload de documentos' },
      ],
    },
    timeline: [
      {
        id: 'tl-4798-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Helena Costa',
        timestamp: '11:15 · 22/11',
        summary: 'Comprovante bancário recebido para alteração de conta de repasse.',
        details: 'Titularidade validada pelo mesmo CPF.',
      },
      {
        id: 'tl-4798-2',
        cycle: 1,
        type: 'Entregue',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '11:17 · 22/11',
        summary: 'Domicílio bancário atualizado e resumo enviado para aceite da proprietária.',
        details: 'Aceite automático em 3 dias úteis caso não haja contestação.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4798-1',
        label: 'Conferir CPF da conta Itaú com cadastro de Helena Costa',
        status: 'completed',
        duration: '1,1s',
      },
      {
        id: 'st-4798-2',
        label: 'Atualizar conta bancária de repasse',
        status: 'completed',
        duration: '0,9s',
        change: {
          entity: 'Pessoa PES-190',
          field: 'Conta de repasse',
          before: 'Banco Santander Ag. 0214',
          after: 'Banco Itaú Ag. 4410 · CC 88120-4',
        },
      },
    ],
    delivery: {
      solutionSummary:
        'Conta Itaú (Ag. 4410 · CC 88120-4) validada pelo mesmo CPF e cadastrada para os próximos repasses.',
      artifacts: [],
      systemChangesSummary: ['Cadastro bancário de PES-190 atualizado'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Confirmação de alteração bancária [PED-2026-004798]',
        body: 'Olá Helena! Confirmamos a alteração da sua conta de repasse para o Banco Itaú (Ag. 4410, CC 88120-4), válida já para os próximos créditos.',
      },
      autoAcceptNotice: true,
    },
  },
  {
    id: 'ord-4822',
    protocol: 'PED-2026-004822',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Cobrança e financeiro',
    subtype: 'Repasse',
    subject: 'Repasse de R$ 24.800,00 ao Fundo Imobiliário Aurora',
    objective: 'Liberar transferência bancária consolidada de 9 imóveis administrados do Fundo Aurora.',
    narrative:
      'Agente conciliou os 9 aluguéis do Fundo Imobiliário Aurora (bruto R$ 27.555,56, taxa adm 10% R$ 2.755,56, líquido R$ 24.800,00). Como o repasse supera R$ 20.000,00, a regra FIN-003 v1 exige aprovação do Gestor em até 2h.',
    requesterName: 'Financeiro Farina',
    requesterRole: 'Financeiro',
    requesterContact: 'financeiro@farina.com.br',
    priority: 'Urgente',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 1h 25min',
    slaRequested: 'Hoje, corte TED/PIX 16:00',
    slaCommitted: 'Hoje, 16:00 (2h · FIN-003)',
    stageDurations: [
      { stage: 'Conciliação bancária', duration: '2 min' },
      { stage: 'Cálculo líquido', duration: '1 min' },
      { stage: 'Aguardando aprovação', duration: '35 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 99,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:05',
    appliedRules: [{ ruleId: 'FIN-003', version: 1 }],
    links: [
      { type: 'Pessoa', code: 'PES-880', label: 'Fundo Imobiliário Aurora (9 imóveis)' },
      { type: 'Contrato', code: 'CTR-AURORA', label: 'Portfólio 9 unidades · Taxa 10%' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction: 'Transferir R$ 24.800,00 líquidos da Conta de Terceiros para Fundo Imobiliário Aurora (9 imóveis).',
      evidenceSource: 'Extrato OFX conciliado + Demonstrativo consolidado Aurora #2211',
      evidenceExcerpt: 'Todos os 9 boletos compensados na Conta de Terceiros. Saldo disponível: R$ 241.000,00.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 14:05',
      rawText: 'Preparar e submeter repasse consolidado dos 9 imóveis do Fundo Imobiliário Aurora com vencimento hoje.',
      attachments: [
        { name: 'demonstrativo_aurora_nov26.pdf', size: '420 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'Rotina Financeira · Repasses' },
        { label: 'Regra aplicada', value: 'FIN-003 v1 (> R$ 20.000)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4822-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Sistema',
        actorName: 'Rotina Financeira',
        timestamp: '14:05 · 22/11',
        summary: 'Lote consolidado do Fundo Imobiliário Aurora (9 imóveis) montado pelo agente.',
        details: 'Aluguel bruto R$ 27.555,56; Taxa adm R$ 2.755,56; Líquido R$ 24.800,00.',
      },
      {
        id: 'tl-4822-2',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Sistema',
        actorName: 'Regra FIN-003 v1',
        timestamp: '14:06 · 22/11',
        summary: 'Aprovação exigida pela regra FIN-003: valor R$ 24.800,00 excede teto de R$ 20.000,00.',
        details: 'Prazo de aprovação: Gestor em até 2h.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4822-1',
        label: 'Validar compensação dos 9 recebimentos no extrato bancário',
        status: 'completed',
        duration: '1,4s',
      },
      {
        id: 'st-4822-2',
        label: 'Aguardar aprovação do Gestor (FIN-003 > R$ 20.000)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary: 'Repasse de R$ 24.800,00 ao Fundo Imobiliário Aurora pronto para TED/PIX após assinatura do Gestor.',
      artifacts: [
        { name: 'Demonstrativo_Aurora_9Imoveis.pdf', type: 'PDF', meta: 'R$ 24.800,00 líquido' },
      ],
      systemChangesSummary: ['Ordem de transferência #REP-AUR-2211 reservada na Conta de Terceiros'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Demonstrativo de Repasse Nov/2026 - Fundo Imobiliário Aurora [PED-2026-004822]',
        body: 'Prezados gestores do Fundo Imobiliário Aurora, segue o demonstrativo consolidado dos 9 imóveis referente a novembro/2026 no valor líquido de R$ 24.800,00.',
      },
    },
  },
  {
    id: 'ord-4823',
    protocol: 'PED-2026-004823',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Cobrança e financeiro',
    subtype: 'Acordo',
    subject: 'Desconto 15% multa e juros · Juliana Rocha (Apto 204)',
    objective: 'Avaliar concessão de 15% de desconto em encargos sobre débito de R$ 2.890,00 (24d atraso).',
    narrative:
      'Inquilina Juliana Rocha solicitou via WhatsApp desconto de 15% sobre multa e juros para quitação à vista do aluguel em atraso há 24 dias. Pela regra FIN-014 v3, descontos entre 10% e 30% exigem aprovação do Gestor em até 4h.',
    requesterName: 'Juliana Rocha',
    requesterRole: 'Inquilina',
    requesterContact: '+55 11 98650-2211',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 2h 50min',
    slaRequested: 'Hoje, 17:00',
    slaCommitted: 'Hoje, 17:30 (4h · FIN-014)',
    stageDurations: [
      { stage: 'Cálculo encargos', duration: '1 min' },
      { stage: 'Aguardando aprovação', duration: '1h 10min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 95,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:20',
    appliedRules: [{ ruleId: 'FIN-014', version: 3 }],
    links: [
      { type: 'Imóvel', code: 'IMV-204B', label: 'Apto 204 · Bela Vista' },
      { type: 'Contrato', code: 'CTR-204', label: 'CTR-204 · Caução' },
      { type: 'Pessoa', code: 'PES-319', label: 'Juliana Rocha (Inquilina)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction: 'Conceder 15% de desconto sobre multa/juros (economia de R$ 58,50) e emitir boleto à vista de R$ 2.831,50.',
      evidenceSource: 'Conversa WhatsApp Juliana Rocha + Regra FIN-014 v3 (faixa 10%–30%)',
      evidenceExcerpt: 'Principal R$ 2.500,00 + multa/juros R$ 390,00 = R$ 2.890,00. Com 15% de desconto nos encargos: R$ 2.831,50.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:20',
      rawText: 'Boa tarde, recebi o lembrete do Apto 204. Consigo quitar tudo hoje via PIX se vocês abaterem 15% da multa e dos juros. Podem gerar?',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp Business' },
        { label: 'Regra aplicada', value: 'FIN-014 v3 (10%–30%)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4823-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Juliana Rocha',
        timestamp: '13:20 · 22/11',
        summary: 'Pedido de desconto de 15% sobre multa e juros recebido via WhatsApp.',
        details: 'Contrato sem ação judicial ativa.',
      },
      {
        id: 'tl-4823-2',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Sistema',
        actorName: 'Regra FIN-014 v3',
        timestamp: '13:21 · 22/11',
        summary: 'Aprovação exigida pela regra FIN-014 v3: desconto de 15% na faixa 10%–30% (Gestor em 4h).',
        details: 'Aguardando liberação para gerar boleto atualizado.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4823-1',
        label: 'Calcular encargos de 24 dias e aplicar simulação de 15% (R$ 2.831,50)',
        status: 'completed',
        duration: '0,8s',
      },
      {
        id: 'st-4823-2',
        label: 'Aguardar aprovação do Gestor (FIN-014 v3 · até 4h)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary: 'Boleto/PIX atualizado de R$ 2.831,50 pronto para envio assim que o desconto de 15% for aprovado.',
      artifacts: [],
      systemChangesSummary: ['Proposta de quitação #AC-4823 preparada'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Juliana! Seu pedido de 15% de desconto sobre multa e juros (total R$ 2.831,50) foi aprovado. Segue o código PIX para pagamento hoje.',
      },
    },
  },
  {
    id: 'ord-4825',
    protocol: 'PED-2026-004825',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Cobrança e financeiro',
    subtype: 'Cobrança',
    subject: 'Notificação formal D+15 · Marcos Teixeira (Apto 702)',
    objective: 'Aprovar envio de notificação formal de cobrança D+15 para débito de R$ 4.200,00.',
    narrative:
      'Inquilino Marcos Teixeira atingiu 18 dias de atraso (Apto 702 - Jardins, R$ 4.200,00, Seguro fiança). Conforme a régua FIN-020 v2, o disparo da notificação formal D+15 exige aprovação humana prévia.',
    requesterName: 'Agente GoFAPE',
    requesterRole: 'Sistema',
    requesterContact: 'cobranca@farina.com.br',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 3h 15min',
    slaRequested: 'Janela 08h–19h hoje',
    slaCommitted: 'Hoje, 18:00 (FIN-020)',
    stageDurations: [
      { stage: 'Régua D+15', duration: '2 min' },
      { stage: 'Aguardando aprovação', duration: '42 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 97,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:48',
    appliedRules: [{ ruleId: 'FIN-020', version: 2 }],
    links: [
      { type: 'Imóvel', code: 'IMV-702J', label: 'Apto 702 · Jardins' },
      { type: 'Contrato', code: 'CTR-702', label: 'CTR-702 · Seguro fiança' },
      { type: 'Pessoa', code: 'PES-490', label: 'Marcos Teixeira (Inquilino)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction: 'Enviar notificação formal D+15 por e-mail e WhatsApp com aviso de acionamento da seguradora.',
      evidenceSource: 'Régua automática FIN-020 v2 · Atraso de 18 dias (R$ 4.200,00)',
      evidenceExcerpt: 'Lembretes D+1 e D+5 enviados sem resposta. Garantia ativa: Seguro fiança.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:48',
      rawText: 'Disparo programado da régua FIN-020 (etapa D+15) para Marcos Teixeira — Apto 702 Jardins.',
      attachments: [
        { name: 'minuta_notificacao_d15_marcos.pdf', size: '180 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'Régua de Cobrança FIN-020' },
        { label: 'Janela permitida', value: '08h às 19h' },
      ],
    },
    timeline: [
      {
        id: 'tl-4825-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Agente',
        actorName: 'Régua FIN-020',
        timestamp: '13:48 · 22/11',
        summary: 'Etapa D+15 atingida para Marcos Teixeira (18 dias de atraso, R$ 4.200,00).',
        details: 'Garantia Seguro fiança ativa; etapa anterior D+5 entregue sem pagamento.',
      },
      {
        id: 'tl-4825-2',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Sistema',
        actorName: 'Regra FIN-020 v2',
        timestamp: '13:48 · 22/11',
        summary: 'Aprovação exigida pela regra FIN-020 v2 antes do envio da notificação formal D+15.',
        details: 'Envio dentro da janela de 8h às 19h.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4825-1',
        label: 'Gerar minuta de notificação formal D+15 e atualizar encargos',
        status: 'completed',
        duration: '1,0s',
      },
      {
        id: 'st-4825-2',
        label: 'Aguardar aprovação para disparo na janela 8h–19h (FIN-020)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary: 'Notificação formal D+15 pronta para disparo a Marcos Teixeira dentro da janela 08h–19h.',
      artifacts: [
        { name: 'Notificacao_D15_MarcosTeixeira.pdf', type: 'PDF', meta: 'Apto 702 · R$ 4.200,00' },
      ],
      systemChangesSummary: ['Etapa D+15 preparada na régua FIN-020'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Notificação Formal de Débito em Aberto - Apto 702 Jardins [PED-2026-004825]',
        body: 'Prezado Marcos, consta em aberto o aluguel do Apto 702 (Jardins) vencido há 18 dias no valor atualizado de R$ 4.200,00. Caso não haja regularização em 48h, acionaremos a cobertura do Seguro fiança.',
      },
    },
  },
  {
    id: 'ord-4826',
    protocol: 'PED-2026-004826',
    cycle: 1,
    channel: 'E-mail',
    category: 'Locação e contratos',
    subtype: 'Renovação',
    subject: 'Renovação com cláusula alterada · Casa Rua dos Ipês 44',
    objective:
      'Aprovar envio de minuta de Daniel Freitas com alteração na cláusula 8ª (vistoria de saída de 5 para 10 dias úteis).',
    narrative:
      'Locatário Daniel Freitas solicitou ampliar o prazo da vistoria de saída na cláusula 8ª de 5 para 10 dias úteis na renovação da Casa Rua dos Ipês 44. Como há alteração em relação ao modelo homologado, a regra JUR-005 v2 sobrepõe a JUR-002 e exige aprovação do Jurídico em 24h.',
    requesterName: 'Daniel Freitas',
    requesterRole: 'Inquilino',
    requesterContact: 'daniel.freitas@email.com',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 24h (Jurídico)',
    slaRequested: '24/11/2026',
    slaCommitted: '23/11/2026 · 14:30 (24 h · JUR-005 v2)',
    stageDurations: [
      { stage: 'Comparação com modelo', duration: '1 min' },
      { stage: 'Aguardando aprovação', duration: '42 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 92,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:52',
    appliedRules: [
      { ruleId: 'JUR-005', version: 2 },
      { ruleId: 'JUR-002', version: 4 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-044', label: 'Casa Rua dos Ipês, 44' },
      { type: 'Contrato', code: 'CT-2024-0241', label: 'CT-2024-0241 · Residencial' },
      { type: 'Pessoa', code: 'PES-512', label: 'Daniel Freitas (Inquilino)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar alteração na cláusula 8ª (prazo da vistoria de saída de 5 para 10 dias úteis) e liberar envio a Daniel Freitas.',
      evidenceSource: 'Comparador de minuta CT-2024-0241 × Modelo Locação Residencial v7',
      evidenceExcerpt:
        'Cláusula 8ª alterada: "5 dias úteis" → "10 dias úteis". Regra mais restritiva aplicada: Jurídico 24h (JUR-005 v2).',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:52',
      rawText:
        'Boa tarde! Recebi a prévia de renovação da Casa Rua dos Ipês 44, mas preciso que a cláusula 8ª preveja 10 dias úteis para a vistoria de saída por conta da mudança. Se puderem ajustar e mandar para assinatura eu agradeço.',
      attachments: [],
      channelMetadata: [{ label: 'Canal', value: 'E-mail' }],
    },
    timeline: [
      {
        id: 'tl-4826-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Daniel Freitas',
        timestamp: '13:52 · 22/11',
        summary: 'Pedido de ajuste na cláusula 8ª da renovação da Casa Rua dos Ipês 44.',
        details: 'Solicitado prazo de 10 dias úteis na vistoria de saída.',
      },
      {
        id: 'tl-4826-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Sistema',
        actorName: 'Regra JUR-005 v2',
        timestamp: '13:53 · 22/11',
        summary: 'Aprovação exigida pela regra JUR-005 (cláusula alterada — Jurídico em 24h).',
        details: 'Prevalece sobre JUR-002 v4 (Gestor 8h) por ser mais restritiva.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4826-1',
        label: 'Comparar minuta ajustada com modelo homologado v7',
        status: 'completed',
        duration: '1,4s',
      },
      {
        id: 'st-4826-2',
        label: 'Aguardar parecer do Jurídico em 24h (JUR-005 v2)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Comparativo da cláusula 8ª (5 → 10 dias úteis) gerado para validação do Jurídico.',
      artifacts: [
        { name: 'Comparativo_CT20240241_Clausula8.pdf', type: 'PDF', meta: '1 alteração destacada' },
      ],
      systemChangesSummary: ['Rascunho de renovação pausado na aprovação jurídica'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Renovação Casa Rua dos Ipês 44 em análise jurídica',
        body: 'Olá Daniel, submetemos sua solicitação de ajuste na cláusula 8ª ao nosso Jurídico e retornaremos em até 24h.',
      },
    },
  },
  {
    id: 'ord-4827',
    protocol: 'PED-2026-004827',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Locação e contratos',
    subtype: 'Rescisão',
    subject: 'Rescisão antecipada · Apto 405 Ed. Vila Verde (Beatriz Moura)',
    objective:
      'Validar cálculo de multa proporcional de R$ 1.920,00 e autorizar termo de rescisão antecipada.',
    narrative:
      'Inquilina Beatriz Moura solicitou entrega antecipada do Apto 405 Ed. Vila Verde (contrato CT-2025-0098). O agente calculou multa proporcional de R$ 1.920,00 (4 meses restantes de 12 meses), submetendo à aprovação obrigatória do Jurídico em 24h conforme JUR-007 v1.',
    requesterName: 'Beatriz Moura',
    requesterRole: 'Inquilina',
    requesterContact: 'beatriz.moura@email.com',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 24h (Jurídico)',
    slaRequested: '23/11/2026',
    slaCommitted: '23/11/2026 · 14:00 (24 h · JUR-007 v1)',
    stageDurations: [
      { stage: 'Cálculo proporcional', duration: '2 min' },
      { stage: 'Aguardando aprovação', duration: '1h 05min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 91,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:10',
    appliedRules: [{ ruleId: 'JUR-007', version: 1 }],
    links: [
      { type: 'Imóvel', code: 'IMV-405', label: 'Apto 405 · Ed. Vila Verde' },
      { type: 'Contrato', code: 'CT-2025-0098', label: 'CT-2025-0098 · Residencial' },
      { type: 'Pessoa', code: 'PES-608', label: 'Beatriz Moura (Inquilina)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar termo de rescisão antecipada do Apto 405 com multa proporcional de R$ 1.920,00 (a conferir) e liberar vistoria de saída.',
      evidenceSource: 'Cláusula 11ª CT-2025-0098 + Calculadora de Rescisão (apoio ao cálculo)',
      evidenceExcerpt:
        'Multa base 3 aluguéis (R$ 5.760,00) × 4/12 meses restantes = R$ 1.920,00. Conferência humana obrigatória.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:10',
      rawText:
        'Oi, fui transferida de cidade e vou precisar entregar as chaves do Apto 405 do Ed. Vila Verde no dia 30/11. Podem calcular a multa proporcional e mandar os termos da rescisão?',
      attachments: [],
      channelMetadata: [{ label: 'Canal', value: 'WhatsApp Business API' }],
    },
    timeline: [
      {
        id: 'tl-4827-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Beatriz Moura',
        timestamp: '13:10 · 22/11',
        summary: 'Pedido de rescisão antecipada do Apto 405 Ed. Vila Verde para 30/11/2026.',
        details: 'Solicitada entrega de chaves e cálculo proporcional da multa contratual.',
      },
      {
        id: 'tl-4827-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Sistema',
        actorName: 'Regra JUR-007 v1',
        timestamp: '13:12 · 22/11',
        summary: 'Aprovação exigida pela regra JUR-007 (rescisão sempre exige Jurídico em 24h).',
        details: 'Multa estimada em R$ 1.920,00 com selo de conferência humana obrigatória.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4827-1',
        label: 'Calcular multa proporcional (4 meses restantes = R$ 1.920,00)',
        status: 'completed',
        duration: '1,2s',
      },
      {
        id: 'st-4827-2',
        label: 'Aguardar aprovação do Jurídico (JUR-007 v1)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Cálculo proporcional (R$ 1.920,00) e rascunho de rescisão prontos para conferência jurídica.',
      artifacts: [
        { name: 'Termo_Rescisao_Apto405_Rascunho.pdf', type: 'PDF', meta: 'Multa R$ 1.920,00' },
      ],
      systemChangesSummary: ['Rescisão aberta na etapa Calculada'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Beatriz, recebemos seu pedido de desocupação do Apto 405 e encaminhamos o cálculo para validação jurídica antes de confirmar a vistoria.',
      },
    },
  },
  {
    id: 'ord-4828',
    protocol: 'PED-2026-004828',
    cycle: 1,
    channel: 'E-mail',
    category: 'Locação e contratos',
    subtype: 'Garantia locatícia',
    subject: 'Troca de garantia: Seguro fiança → Fiador (Apto 1102)',
    objective:
      'Aprovar substituição de garantia de Seguro fiança para Fiador no contrato de Marina Cavalcanti (Apto 1102 Ed. Aurora).',
    narrative:
      'A apólice de Seguro fiança do Apto 1102 Ed. Aurora vence em 18/12/2026. Locatária Marina Cavalcanti propôs troca de garantia para Fiador (matrícula de imóvel apresentada). Pela regra JUR-010 v2, toda troca de garantia exige aprovação do Jurídico em 24h.',
    requesterName: 'Marina Cavalcanti',
    requesterRole: 'Inquilina',
    requesterContact: 'marina.cavalcanti@email.com',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 24h (Jurídico)',
    slaRequested: '23/11/2026',
    slaCommitted: '23/11/2026 · 15:00 (24 h · JUR-010 v2)',
    stageDurations: [
      { stage: 'Triagem documental', duration: '4 min' },
      { stage: 'Aguardando aprovação', duration: '35 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 89,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:15',
    appliedRules: [{ ruleId: 'JUR-010', version: 2 }],
    links: [
      { type: 'Imóvel', code: 'IMV-1102', label: 'Apto 1102 · Ed. Aurora' },
      { type: 'Contrato', code: 'CT-2023-0874', label: 'CT-2023-0874 · Residencial' },
      { type: 'Pessoa', code: 'PES-714', label: 'Marina Cavalcanti (Inquilina)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar troca de garantia de Seguro fiança (vence 18/12/2026) para Fiador e emitir aditivo contratual.',
      evidenceSource: 'E-mail Marina Cavalcanti + Matrícula fiador extraída (89% confiança)',
      evidenceExcerpt:
        'Substituição de modalidade de garantia requer análise jurídica do imóvel caucionado/fiador (JUR-010 v2).',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 14:15',
      rawText:
        'Olá, meu seguro fiança do Apto 1102 Ed. Aurora vence em 18/12 e o valor de renovação subiu muito. Gostaria de trocar a garantia para Fiador — segue a matrícula e documentos do meu tio em anexo.',
      attachments: [
        { name: 'matricula_fiador_aurora.pdf', size: '840 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [{ label: 'Canal', value: 'E-mail' }],
    },
    timeline: [
      {
        id: 'tl-4828-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Marina Cavalcanti',
        timestamp: '14:15 · 22/11',
        summary: 'Proposta de troca de Seguro fiança para Fiador no Apto 1102 Ed. Aurora.',
        details: 'Anexo matricula_fiador_aurora.pdf lido com 89% de confiança.',
      },
      {
        id: 'tl-4828-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Sistema',
        actorName: 'Regra JUR-010 v2',
        timestamp: '14:17 · 22/11',
        summary: 'Aprovação exigida pela regra JUR-010 (troca de garantia — Jurídico 24h).',
        details: 'Apólice atual vence em 18/12/2026 (26 dias restantes).',
      },
    ],
    executionSteps: [
      {
        id: 'st-4828-1',
        label: 'Extrair dados da matrícula e documentos do fiador',
        status: 'completed',
        duration: '2,3s',
      },
      {
        id: 'st-4828-2',
        label: 'Aguardar validação jurídica da troca de garantia (JUR-010 v2)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Dossiê do fiador extraído e pronto para aprovação jurídica de troca de garantia.',
      artifacts: [
        { name: 'Aditivo_Troca_Garantia_CT20230874.pdf', type: 'PDF', meta: 'Rascunho v1' },
      ],
      systemChangesSummary: ['Garantia marcada como Troca em aprovação'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Análise de troca de garantia - Apto 1102 Ed. Aurora',
        body: 'Olá Marina, recebemos os documentos do fiador para o Apto 1102 e encaminhamos ao Jurídico (prazo de análise: 24h).',
      },
    },
  },
  {
    id: 'ord-4829',
    protocol: 'PED-2026-004829',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Vendas e captação',
    subtype: 'Ajuste de preço',
    subject: 'Reduzir aluguel pedido Casa Rua das Figueiras 210 (-8,2%)',
    objective:
      'Reduzir aluguel pedido de R$ 3.800,00 para R$ 3.490,00 (-8,2%) após 68 dias vago e 0 visitas em 30 dias.',
    narrative:
      'Casa Rua das Figueiras 210 (IMV-104) está vaga há 68 dias, 12,1% acima do valor estimado de mercado (R$ 3.390,00) e com zero visitas nos últimos 30 dias. Proprietário Otávio Ramos autorizou redução de até 10% por WhatsApp. Variação de -8,2% enquadra-se na faixa 5% a 15% da regra LOC-001 v2.',
    requesterName: 'Otávio Ramos',
    requesterRole: 'Proprietário',
    requesterContact: '+55 11 98114-5021',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 4h (Gestor)',
    slaRequested: 'Hoje, 18:20',
    slaCommitted: 'Hoje, 18:20 (4 h · LOC-001 v2)',
    stageDurations: [
      { stage: 'Análise de comparáveis', duration: '12s' },
      { stage: 'Autorização proprietário', duration: '24 min' },
      { stage: 'Aguardando aprovação', duration: '18 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 91,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:22',
    appliedRules: [{ ruleId: 'LOC-001', version: 2 }],
    links: [
      { type: 'Imóvel', code: 'IMV-104', label: 'Casa Rua das Figueiras, 210' },
      { type: 'Pessoa', code: 'PES-318', label: 'Otávio Ramos (Proprietário)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Alterar aluguel pedido de R$ 3.800,00 para R$ 3.490,00 (-8,2%), com autorização registrada do proprietário Otávio Ramos (LOC-001 v2).',
      evidenceSource: 'WhatsApp Otávio Ramos (22/11 · 13:58) + 6 comparáveis Zona Sul',
      evidenceExcerpt:
        'A redução deixa o imóvel apenas +2,9% acima da mediana de mercado e tem recuperação estimada do desconto em 3 meses de locação ativa.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:58',
      rawText:
        'Oi equipe Farina, já faz mais de dois meses que a casa da Rua das Figueiras 210 está parada. Se ajudar a alugar rápido ainda este mês, autorizo baixar o pedido até R$ 3.420 (10%), mas tentem fechar em R$ 3.490 primeiro.',
      attachments: [],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp Business' },
        { label: 'Regra aplicada', value: 'LOC-001 v2' },
      ],
    },
    timeline: [
      {
        id: 'tl-4829-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Otávio Ramos',
        timestamp: '13:58 · 22/11',
        summary: 'Proprietário autorizou ajuste de até 10% no pedido da Casa Rua das Figueiras 210.',
        details: 'Autorização vinculada ao imóvel IMV-104.',
      },
      {
        id: 'tl-4829-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Sistema',
        actorName: 'Regra LOC-001 v2',
        timestamp: '14:22 · 22/11',
        summary: 'Variação -8,2% (faixa 5% a 15%) exige aprovação do Gestor em 4h.',
        details: 'Estimativa do agente com comparáveis: R$ 3.390,00 (confiança 91%).',
      },
    ],
    executionSteps: [
      {
        id: 'st-4829-1',
        label: 'Consultar 6 imóveis comparáveis na Zona Sul',
        status: 'completed',
        duration: '2,1s',
      },
      {
        id: 'st-4829-2',
        label: 'Aguardar aprovação do Gestor em 4h (LOC-001 v2)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Simulação concluída para IMV-104 (-8,2%, de R$ 3.800 para R$ 3.490) aguardando aprovação do Gestor para atualizar portais.',
      artifacts: [],
      systemChangesSummary: ['Proposta de ajuste -8,2% protocolada para IMV-104'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Otávio! Registramos sua autorização e encaminhamos o ajuste para R$ 3.490,00 para validação final da gestão hoje.',
      },
    },
  },
  {
    id: 'ord-4830',
    protocol: 'PED-2026-004830',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Locação e contratos',
    subtype: 'Análise cadastral',
    subject: 'Aprovar locação Apto 604 · Renata Duarte (31,5% renda)',
    objective:
      'Decidir aprovação cadastral da candidata Renata Duarte (comprometimento 31,5% com ressalva LOC-004 v1).',
    narrative:
      'Candidata Renata Duarte enviou proposta aceita para o Apto 604 (aluguel + encargos R$ 3.650,00/mês). Com consentimento LGPD assinado, o agente consultou o bureau (sem apontamentos) e apurou comprometimento de 31,5% — faixa "recomendar com ressalva" pela LOC-004 v1.',
    requesterName: 'Rafael Costa',
    requesterRole: 'Corretor',
    requesterContact: 'rafael.costa@farina.com.br',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 8h (Gestor)',
    slaRequested: 'Hoje, 22:30',
    slaCommitted: '23/11, 08:30 (8 h · LOC-004 v1)',
    stageDurations: [
      { stage: 'Conferência documental', duration: '8 min' },
      { stage: 'Consulta bureau (LGPD)', duration: '4s' },
      { stage: 'Aguardando aprovação', duration: '14 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 88,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:35',
    appliedRules: [{ ruleId: 'LOC-004', version: 1 }],
    links: [
      { type: 'Imóvel', code: 'IMV-604', label: 'Apto 604 · Ed. Jardins Sul' },
      { type: 'Pessoa', code: 'PES-790', label: 'Renata Duarte (Candidata)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar cadastro de Renata Duarte com ressalva (comprometimento 31,5%, acima de 30% e ≤ 35%) usando Seguro Fiança e liberar minuta de locação.',
      evidenceSource: 'Holerite_Renata_Nov26.pdf (pág. 1) + Consulta Bureau LGPD #8821',
      evidenceExcerpt:
        'Pela regra LOC-004 v1, o agente recomenda com ressalva (30% < 31,5% ≤ 35%) e nunca aprova nem reprova sozinho.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 14:35',
      rawText:
        'Candidata Renata Duarte completou upload do RG, 3 últimos holerites e termo de consentimento LGPD para consulta de crédito. Solicito aprovação do Gestor para seguir com o contrato do Apto 604.',
      attachments: [
        { name: 'Holerite_Renata_Nov26.pdf', size: '410 KB', mime: 'application/pdf' },
        { name: 'Termo_LGPD_Renata.pdf', size: '180 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Corretor', value: 'Rafael Costa' },
        { label: 'Regra aplicada', value: 'LOC-004 v1' },
      ],
    },
    timeline: [
      {
        id: 'tl-4830-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Rafael Costa',
        timestamp: '14:35 · 22/11',
        summary: 'Dossiê cadastral completo de Renata Duarte recebido para o Apto 604.',
        details: 'Consentimento LGPD validado antes da consulta ao bureau.',
      },
      {
        id: 'tl-4830-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Sistema',
        actorName: 'Regra LOC-004 v1',
        timestamp: '14:35 · 22/11',
        summary: 'Comprometimento 31,5%: recomendação com ressalva enviada ao Gestor (8h).',
        details: 'Score bureau sem apontamentos restritivos.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4830-1',
        label: 'Validar consentimento LGPD e consultar bureau de crédito',
        status: 'completed',
        duration: '3,2s',
      },
      {
        id: 'st-4830-2',
        label: 'Aguardar decisão humana do Gestor em 8h (LOC-004 v1)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Análise cadastral concluída (31,5% · recomendar com ressalva) aguardando decisão humana do Gestor.',
      artifacts: [],
      systemChangesSummary: ['Parecer cadastral anexado à proposta do Apto 604'],
      requesterPreview: {
        channel: 'Chat do sistema',
        body: 'Análise cadastral de Renata Duarte concluída com 88% de confiança. Aguardando decisão do Gestor.',
      },
    },
  },
  {
    id: 'ord-4831',
    protocol: 'PED-2026-004831',
    cycle: 1,
    channel: 'Upload de documentos',
    category: 'Cadastro e atualização',
    subtype: 'Cadastro de imóvel',
    subject: 'Captar Apto 1405 Ed. Horizonte (Lúcia Menezes · taxa 8%)',
    objective:
      'Aprovar taxa de administração de 8% (abaixo de 9%) para captação e contrato de administração v5.',
    narrative:
      'Proprietária Lúcia Menezes enviou matrícula e termo para captar o Apto 1405 Ed. Horizonte (aluguel estimado R$ 4.600,00) propondo taxa de administração de 8% ao invés de 9%. Extração concluída com 92% de confiança; regra LOC-005 v2 exige aprovação do Gestor em 8h.',
    requesterName: 'Lúcia Menezes',
    requesterRole: 'Proprietária',
    requesterContact: '+55 11 99612-7740',
    priority: 'Normal',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 8h (Gestor)',
    slaRequested: '23/11, 10:00',
    slaCommitted: '23/11, 08:40 (8 h · LOC-005 v2)',
    stageDurations: [
      { stage: 'Extração matrícula (92%)', duration: '4s' },
      { stage: 'Aguardando aprovação', duration: '11 min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 92,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:40',
    appliedRules: [{ ruleId: 'LOC-005', version: 2 }],
    links: [
      { type: 'Pessoa', code: 'PES-811', label: 'Lúcia Menezes (Proprietária)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar taxa de administração de 8% (padrão 9%) na minuta Administração v5 sem alteração de cláusula e ativar captação do Apto 1405.',
      evidenceSource: 'Matricula_Apto1405_Horizonte.pdf (pág. 1, 92% confiança) + Proposta WhatsApp',
      evidenceExcerpt:
        'Taxa de 8% situa-se na faixa de 7% a < 9% pela LOC-005 v2 (Gestor em 8h). Receita estimada: R$ 368,00/mês.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 14:38',
      rawText:
        'Segue a matrícula do Apto 1405 do Ed. Horizonte. Aceito exclusividade de 90 dias se a taxa de administração ficar em 8%.',
      attachments: [
        { name: 'Matricula_Apto1405_Horizonte.pdf', size: '1,1 MB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Canal', value: 'Upload de documentos' },
        { label: 'Regra aplicada', value: 'LOC-005 v2' },
      ],
    },
    timeline: [
      {
        id: 'tl-4831-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Lúcia Menezes',
        timestamp: '14:38 · 22/11',
        summary: 'Matrícula e proposta de captação recebidas para Apto 1405 Ed. Horizonte.',
        details: 'Confiança OCR 92% (≥ 85% conforme JUR-013 v3).',
      },
      {
        id: 'tl-4831-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Sistema',
        actorName: 'Regra LOC-005 v2',
        timestamp: '14:40 · 22/11',
        summary: 'Taxa de administração 8% submetida ao Gestor em 8h.',
        details: 'Minuta padrão Administração v5 sem cláusula alterada.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4831-1',
        label: 'Extrair matrícula do Apto 1405 (confiança 92%)',
        status: 'completed',
        duration: '4,1s',
      },
      {
        id: 'st-4831-2',
        label: 'Aguardar aprovação do Gestor para taxa de 8% (LOC-005 v2)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Pré-cadastro do Apto 1405 pronto com minuta Administração v5 (8%), aguardando aprovação do Gestor.',
      artifacts: [
        { name: 'Minuta_Administracao_v5_Apto1405.pdf', type: 'PDF', meta: 'Taxa 8% · 90 dias' },
      ],
      systemChangesSummary: ['Pré-ficha de captação criada para Apto 1405 Ed. Horizonte'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Lúcia! Recebemos a matrícula do Apto 1405 e encaminhamos sua condição de taxa de 8% para validação do Gestor hoje.',
      },
    },
  },
  {
    id: 'ord-4832',
    protocol: 'PED-2026-004832',
    cycle: 1,
    channel: 'Portais',
    category: 'Vendas e captação',
    subtype: 'Proposta de locação',
    subject: 'Proposta Bruno Vasconcelos Sala 301 · 1 mês de carência',
    objective:
      'Decisão humana sobre pedido de 1 mês de carência na Sala 301 (Lacuna de regra: concessões sem regra ativa).',
    narrative:
      'Candidato Bruno Vasconcelos enviou proposta de R$ 4.100,00/mês para a Sala 301 Ed. Comercial Paulista solicitando 1 mês de carência para adaptação de escritório. Não há regra ativa para concessões na negociação (Lacuna de regra — modo "só sugerir").',
    requesterName: 'Rafael Costa',
    requesterRole: 'Corretor',
    requesterContact: 'rafael.costa@farina.com.br',
    priority: 'Normal',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'sugestão · decisão humana',
    slaRequested: 'Hoje, 18:00',
    slaCommitted: 'Decisão humana (Lacuna de regra)',
    stageDurations: [
      { stage: 'Leitura da proposta', duration: '3s' },
      { stage: 'Simulação financeira', duration: '2s' },
      { stage: 'Aguardando decisão humana', duration: '9 min', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Gestor Farina (Decisão humana)',
    confidence: 90,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:46',
    links: [
      { type: 'Imóvel', code: 'IMV-301', label: 'Sala 301 · Ed. Comercial Paulista' },
      { type: 'Pessoa', code: 'PES-824', label: 'Bruno Vasconcelos (Candidato)' },
    ],
    decisionMeta: {
      pauseReason: 'Exceção',
      proposedAction:
        'Lacuna de regra: agente apenas sugere aceitar 15 dias de carência ou contrapropor 1 mês diluído em 12 meses (R$ 4.100/mês). Decisão humana necessária.',
      evidenceSource: 'Proposta WhatsApp + Comparativo Sala 301 (vaga há 52 dias)',
      evidenceExcerpt:
        'Não há regra cadastrada para concessões na negociação (carência / desconto 1º aluguel). 1 mês de carência equivale a -8,3% no 1º ano.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 14:45',
      rawText:
        'Proposta do candidato Bruno Vasconcelos para Sala 301: fecha no valor cheio de R$ 4.100/mês por 36 meses se tiver 1 mês de carência para instalação de divisórias e rede.',
      attachments: [],
      channelMetadata: [
        { label: 'Corretor', value: 'Rafael Costa' },
        { label: 'Política', value: 'Lacuna de regra (Concessões)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4832-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Rafael Costa',
        timestamp: '14:45 · 22/11',
        summary: 'Proposta com pedido de 1 mês de carência recebida para Sala 301.',
        details: 'Sem regra ativa para concessões na negociação.',
      },
      {
        id: 'tl-4832-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Motor de Políticas GoFAPE',
        timestamp: '14:46 · 22/11',
        summary: 'Lacuna de regra detectada: sugestão preparada para decisão humana.',
        details: 'Oferecido atalho para criar regra de concessões na negociação.',
      },
    ],
    executionSteps: [
      {
        id: 'st-4832-1',
        label: 'Calcular impacto líquido da carência de 1 mês (-8,3% no ano 1)',
        status: 'completed',
        duration: '1,0s',
      },
      {
        id: 'st-4832-2',
        label: 'Aguardar decisão humana (Lacuna de regra: só sugerir)',
        status: 'running',
        duration: 'Aguardando',
      },
    ],
    delivery: {
      solutionSummary:
        'Sugestão registrada para decisão humana: avaliar carência de 1 mês (impacto R$ 4.100 no ano 1) frente a 52 dias de vacância da Sala 301.',
      artifacts: [],
      systemChangesSummary: ['Proposta registrada na Sala 301 aguardando definição humana'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Recebemos sua proposta com pedido de carência para a Sala 301 e encaminhamos para análise da gestão e do proprietário.',
      },
    },
  },
  {
    id: 'ord-4833',
    protocol: 'PED-2026-004833',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Manutenção e vistoria',
    subtype: 'Orçamento de reparo',
    subject: 'Orçamento R$ 4.180 pintura e piso Cedro 57',
    objective: 'Aprovar orçamento vencedor (Reformas Alvorada) para destravar prontidão do imóvel há 24 dias em reparo.',
    narrative:
      'Casa Rua do Cedro 57 acumulou 24 dias em reparo pós-saída (acima da meta de 15d da MAN-006). Agente obteve 2 cotações homologadas (Reformas Alvorada R$ 4.180,00 vs Reforma Fácil Leste R$ 4.620,00) e autorização do proprietário Sérgio Valadares por e-mail em 21/11/2026; aguarda alçada FIN-011.',
    requesterName: 'Rafael Costa',
    requesterRole: 'Corretor',
    requesterContact: 'rafael.costa@farina.com.br',
    priority: 'Urgente',
    status: 'Aguardando aprovação',
    slaSemaphore: 'em_risco',
    slaText: 'em 1h 40min',
    slaRequested: 'Hoje, 16:00',
    slaCommitted: 'Hoje, 17:00 (4 h · FIN-011)',
    stageDurations: [
      { stage: 'Cotação fornecedores', duration: '3h 10min' },
      { stage: 'Autorização proprietário', duration: '45 min' },
      { stage: 'Aguardando aprovação', duration: '2h 20min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 93,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 11:20',
    appliedRules: [
      { ruleId: 'MAN-003', version: 2 },
      { ruleId: 'MAN-004', version: 1 },
      { ruleId: 'FIN-011', version: 2 },
      { ruleId: 'MAN-006', version: 1 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-057', label: 'Casa Rua do Cedro, 57' },
      { type: 'Pessoa', code: 'PES-312', label: 'Sérgio Valadares (Proprietário)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Aprovar orçamento Reformas Alvorada de R$ 4.180,00 (OS-921, conta de terceiros) para liberar prontidão da Casa Rua do Cedro 57. Cada dia de atraso custa R$ 90,00 de aluguel parado.',
      evidenceSource: '2 Cotações + E-mail Sérgio Valadares (21/11/2026)',
      evidenceExcerpt:
        'Reformas Alvorada R$ 4.180,00 (prazo 9 dias) vs Reforma Fácil Leste R$ 4.620,00 (prazo 7 dias). Imóvel parado há 24d.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 11:20',
      rawText:
        'Casa Rua do Cedro 57 já passou de 20 dias em reparo pós-saída. Proprietário Sérgio Valadares autorizou por e-mail em 21/11 a pintura e troca de piso para anunciar ainda nesta semana.',
      attachments: [
        { name: 'orcamento_reformas_alvorada_4180.pdf', size: '410 KB', mime: 'application/pdf' },
        { name: 'orcamento_reforma_facil_leste_4620.pdf', size: '380 KB', mime: 'application/pdf' },
      ],
      channelMetadata: [
        { label: 'Módulo', value: 'Manutenção e Vistorias' },
        { label: 'Regra aplicada', value: 'MAN-003 · MAN-004 · FIN-011' },
      ],
    },
    timeline: [
      {
        id: 'tl-4833-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Rafael Costa',
        timestamp: '11:20 · 22/11',
        summary: 'Solicitação de aprovação para orçamento OS-921 da Casa Rua do Cedro 57.',
        details: 'Autorização do proprietário anexada (e-mail 21/11/2026).',
      },
      {
        id: 'tl-4833-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Motor de Políticas GoFAPE',
        timestamp: '11:22 · 22/11',
        summary: 'Portões 1–3 OK (MAN-003 e MAN-004); Portão 4 requer Gestor pela FIN-011 (> R$ 1.500).',
        details: 'Enviado simultaneamente para Contas a Pagar (Financeiro) e Central de Decisões.',
      },
    ],
    executionSteps: [
      { id: 'st-4833-1', label: 'Validar 2 orçamentos homologados (MAN-003)', status: 'completed', duration: '0,6s' },
      { id: 'st-4833-2', label: 'Confirmar autorização do proprietário (MAN-004)', status: 'completed', duration: '0,4s' },
      { id: 'st-4833-3', label: 'Aguardar aprovação do Gestor (FIN-011 > R$ 1.500)', status: 'running', duration: 'Aguardando' },
    ],
    delivery: {
      solutionSummary:
        'Orçamento Reformas Alvorada (R$ 4.180,00) pronto para aprovação em alçada FIN-011.',
      artifacts: [{ name: 'Comparativo_Cedro57_OS921.pdf', type: 'PDF', meta: '2 cotações homologadas' }],
      systemChangesSummary: ['OS-921 vinculada a Contas a Pagar (conta de terceiros)'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Sérgio, recebemos sua autorização e os 2 orçamentos para a Casa Rua do Cedro 57; encaminhamos para liberação final hoje.',
      },
    },
  },
  {
    id: 'ord-4834',
    protocol: 'PED-2026-004834',
    cycle: 1,
    channel: 'Upload de documentos',
    category: 'Manutenção e vistoria',
    subtype: 'Vistoria',
    subject: 'Laudo saída Casa Rua do Lago 9 · R$ 1.640 danos',
    objective: 'Validar laudo comparativo entrada × saída, item < 80% de confiança e cobrança de R$ 1.640 ao inquilino.',
    narrative:
      'Vistoria de saída da Casa Rua do Lago 9 (inquilino Lucas Andrade, rescisão CT-2024-0818) comparada com entrada de 08/02/2023. Agente identificou R$ 1.150,00 de desgaste natural (proprietário) e R$ 1.640,00 de danos (inquilino), com 1 item em 76% de confiança exigindo conferência humana.',
    requesterName: 'Vistoriador Externo',
    requesterRole: 'Fornecedor',
    requesterContact: 'vistorias@farina.com.br',
    priority: 'Alta',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'em 5h 10min',
    slaRequested: 'Até 23/11',
    slaCommitted: 'Hoje, 19:00 (8 h · MAN-002 / MAN-005)',
    stageDurations: [
      { stage: 'Comparação 16 itens', duration: '18s' },
      { stage: 'Aguardando aprovação', duration: '1h 10min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 88,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:50',
    appliedRules: [
      { ruleId: 'MAN-005', version: 2 },
      { ruleId: 'MAN-002', version: 3 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-009', label: 'Casa Rua do Lago, 9' },
      { type: 'Contrato', code: 'CT-2024-0818', label: 'CT-2024-0818 · Rescisão' },
      { type: 'Pessoa', code: 'PES-502', label: 'Lucas Andrade (Inquilino)' },
    ],
    decisionMeta: {
      pauseReason: 'Ação sensível',
      proposedAction:
        'Conferir item com 76% (Chaves/medidores) e aprovar cobrança de R$ 1.640,00 de danos ao inquilino Lucas Andrade (MAN-002 v3).',
      evidenceSource: 'Laudo Saída 19/11/2026 × Entrada 08/02/2023 (18 fotos)',
      evidenceExcerpt:
        '3 danos sugeridos ao inquilino (pintura sala/corredor R$ 1.180, porta banheiro R$ 280, box trincado R$ 180) + 1 item 76% confiança.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:48',
      rawText:
        'Laudo fotográfico de saída da Casa Rua do Lago 9 enviado com 18 fotos comparativas da vistoria de entrada de 08/02/2023.',
      attachments: [{ name: 'laudo_saida_lago9_18fotos.pdf', size: '6,2 MB', mime: 'application/pdf' }],
      channelMetadata: [
        { label: 'Rescisão', value: 'CT-2024-0818 (Lucas Andrade)' },
        { label: 'Regras', value: 'MAN-005 v2 · MAN-002 v3' },
      ],
    },
    timeline: [
      {
        id: 'tl-4834-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Vistoriador Externo',
        timestamp: '13:48 · 22/11',
        summary: '18 fotos e checklist da vistoria de saída recebidos para Casa Rua do Lago 9.',
        details: 'Comparação automática iniciada com laudo de entrada de 08/02/2023.',
      },
      {
        id: 'tl-4834-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '13:50 · 22/11',
        summary: '3 danos sugeridos (R$ 1.640,00) + 1 item < 80% sinalizado para conferência humana.',
        details: 'MAN-002 v3 exige aprovação do Gestor antes de enviar cobrança ao inquilino.',
      },
    ],
    executionSteps: [
      { id: 'st-4834-1', label: 'Comparar 16 itens Entrada × Saída', status: 'completed', duration: '14s' },
      { id: 'st-4834-2', label: 'Aguardar conferência humana e aprovação (MAN-002 / MAN-005)', status: 'running', duration: 'Aguardando' },
    ],
    delivery: {
      solutionSummary:
        'Comparativo pronto (R$ 1.150 desgaste natural / R$ 1.640 danos sugeridos). Decisão humana necessária antes do envio ao inquilino.',
      artifacts: [{ name: 'Comparativo_Entrada_Saida_Lago9.pdf', type: 'PDF', meta: '16 itens · 18 fotos' }],
      systemChangesSummary: ['Vinculado à rescisão CT-2024-0818 em Contratos e Jurídico'],
      requesterPreview: {
        channel: 'E-mail',
        subject: 'Laudo comparativo de saída · Casa Rua do Lago 9 [PED-2026-004834]',
        body: 'Olá Lucas, concluímos a análise preliminar da vistoria de saída da Casa Rua do Lago 9 e estamos finalizando a conferência da equipe para envio formal.',
      },
    },
  },
  {
    id: 'ord-4835',
    protocol: 'PED-2026-004835',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Manutenção e vistoria',
    subtype: 'Chamado',
    subject: 'Reembolso dreno ar-condicionado R$ 420 Rodrigo Pires',
    objective: 'Decisão humana sobre reembolso de reparo feito pelo inquilino (Lacuna de regra: sem regra ativa).',
    narrative:
      'Inquilino Rodrigo Pires (Sala 05 Ed. Central) fez por conta própria o reparo do dreno do ar-condicionado, R$ 420,00, nota fiscal anexada, e pede reembolso. Não há regra cadastrada para reembolso de reparos feitos pelo inquilino (Lacuna de regra — modo só sugerir).',
    requesterName: 'Rodrigo Pires',
    requesterRole: 'Inquilino',
    requesterContact: '(11) 98412-5501',
    priority: 'Baixa',
    status: 'Aguardando aprovação',
    slaSemaphore: 'no_prazo',
    slaText: 'lacuna · decisão humana',
    slaRequested: 'Hoje',
    slaCommitted: 'Decisão humana (Lacuna de regra)',
    stageDurations: [
      { stage: 'Leitura nota fiscal', duration: '4s' },
      { stage: 'Aguardando decisão humana', duration: '1h 15min', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Gestor Farina (Decisão humana)',
    confidence: 91,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 13:15',
    links: [
      { type: 'Imóvel', code: 'IMV-505', label: 'Sala 05 · Ed. Central' },
      { type: 'Pessoa', code: 'PES-618', label: 'Rodrigo Pires (Inquilino)' },
    ],
    decisionMeta: {
      pauseReason: 'Exceção',
      proposedAction:
        'Lacuna de regra: agente leu NF-e R$ 420,00 (dreno do ar-condicionado) e sugere consultar o proprietário antes de responder.',
      evidenceSource: 'WhatsApp Rodrigo Pires + NF-e 88412 (R$ 420,00)',
      evidenceExcerpt:
        'Não há regra ativa para reembolso de reparos feitos pelo inquilino. Sugestão de criar regra em Manutenção > Definir regras.',
    },
    originalMessage: {
      receivedAt: '22/11/2026 às 13:15',
      rawText:
        'Boa tarde! O dreno do ar-condicionado da Sala 05 vazou e chamei um técnico por conta própria para não danificar o piso. Segue nota fiscal de R$ 420,00 para reembolso.',
      attachments: [{ name: 'nfe_dreno_ar_420.pdf', size: '145 KB', mime: 'application/pdf' }],
      channelMetadata: [
        { label: 'Canal', value: 'WhatsApp' },
        { label: 'Política', value: 'Lacuna de regra (Reembolso inquilino)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4835-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Rodrigo Pires',
        timestamp: '13:15 · 22/11',
        summary: 'Pedido de reembolso de R$ 420,00 com nota fiscal anexada via WhatsApp.',
        details: 'Sem regra cadastrada para reembolso de reparo feito pelo inquilino.',
      },
      {
        id: 'tl-4835-2',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Motor de Políticas GoFAPE',
        timestamp: '13:16 · 22/11',
        summary: 'Lacuna de regra detectada: sugestão preparada para consultar proprietário.',
        details: 'Oferecido atalho para criar regra de reembolso de reparos pelo inquilino.',
      },
    ],
    executionSteps: [
      { id: 'st-4835-1', label: 'Extrair NF-e de R$ 420,00 (confiança 91%)', status: 'completed', duration: '2,1s' },
      { id: 'st-4835-2', label: 'Aguardar decisão humana (Lacuna de regra: só sugerir)', status: 'running', duration: 'Aguardando' },
    ],
    delivery: {
      solutionSummary:
        'Nota fiscal R$ 420,00 conferida; sugestão de consultar o proprietário registrada por ausência de regra.',
      artifacts: [{ name: 'NFe_88412_Dreno_420.pdf', type: 'PDF', meta: 'R$ 420,00' }],
      systemChangesSummary: ['Aguarda decisão do Gestor / consulta ao proprietário'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Rodrigo! Recebemos a nota fiscal de R$ 420,00 e encaminhamos para validação do gestor e do proprietário.',
      },
    },
  },
  {
    id: 'ord-4836',
    protocol: 'PED-2026-004836',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Manutenção e vistoria',
    subtype: 'Chamado',
    subject: 'EMERGÊNCIA: Curto-circuito no quadro Loja 7 Galeria Norte',
    objective: 'Contenção imediata em plantão 24h (MAN-001 v2) e notificação imediata a gestor e proprietário.',
    narrative:
      'Inquilino Ivan Prates (Loja 7 Galeria Norte) reportou curto-circuito no quadro elétrico com cheiro de queimado. Agente classificou como EMERGÊNCIA, confirmou em 3 min, acionou plantão Elétrica Voltmax (contenção feita hoje; correção definitiva a orçar) e notificou gestor e dono.',
    requesterName: 'Ivan Prates',
    requesterRole: 'Inquilino',
    requesterContact: '(11) 97102-3310',
    priority: 'Urgente',
    status: 'Em execução',
    slaSemaphore: 'em_risco',
    slaText: 'em 1h 40min',
    slaRequested: 'Imediato (Emergência)',
    slaCommitted: 'Hoje, 16:30 (4 h · MAN-001)',
    stageDurations: [
      { stage: 'Confirmação 5 min', duration: '3 min' },
      { stage: 'Plantão em atendimento', duration: '1h 10min', active: true },
    ],
    assigneeType: 'Agente',
    assigneeName: 'Agente GoFAPE',
    confidence: 72,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 14:15',
    appliedRules: [
      { ruleId: 'MAN-001', version: 2 },
      { ruleId: 'MAN-003', version: 2 },
      { ruleId: 'MAN-004', version: 1 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-407', label: 'Loja 7 · Galeria Norte' },
      { type: 'Pessoa', code: 'PES-312', label: 'Sérgio Valadares (Proprietário)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 14:12',
      rawText:
        'URGENTE! Curto-circuito no quadro elétrico da Loja 7 Galeria Norte e cheiro forte de fio queimado.',
      attachments: [{ name: 'foto_quadro_molhado.jpg', size: '1,1 MB', mime: 'image/jpeg' }],
      channelMetadata: [
        { label: 'Classificação', value: 'EMERGÊNCIA (MAN-001 v2)' },
        { label: 'Plantão 24h', value: 'Elétrica Voltmax (plantão 24h) · R$ 1.180,00' },
      ],
    },
    timeline: [
      {
        id: 'tl-4836-1',
        cycle: 1,
        type: 'Recebido',
        actor: 'Solicitante',
        actorName: 'Ivan Prates',
        timestamp: '14:12 · 22/11',
        summary: 'Chamado emergencial de curto-circuito no quadro da Loja 7 Galeria Norte.',
        details: 'Classificado automaticamente como Emergência (MAN-001 v2).',
      },
      {
        id: 'tl-4836-2',
        cycle: 1,
        type: 'Passo executado',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '14:15 · 22/11',
        summary: 'Confirmado em 3 min, Elétrica Voltmax acionada e proprietário/gestor notificados.',
        details: 'Contenção feita hoje; responsável a definir após laudo do eletricista (confiança 72%, decisão humana).',
      },
    ],
    executionSteps: [
      { id: 'st-4836-1', label: 'Confirmar emergência em ≤ 5 min e notificar dono/gestor', status: 'completed', duration: '3 min' },
      { id: 'st-4836-2', label: 'Elétrica Voltmax (plantão 24h) executou contenção · correção a orçar', status: 'running', duration: 'Em andamento' },
    ],
    delivery: {
      solutionSummary: 'Contenção feita hoje pela Elétrica Voltmax; aguardando laudo para definir responsável e orçar correção definitiva.',
      artifacts: [],
      systemChangesSummary: ['OS-928 aberta como Emergência · contenção R$ 1.180,00'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Emergência confirmada (PED-2026-004836). Desligue o disjuntor geral se seguro; técnico da Elétrica Voltmax já realizou a contenção.',
      },
    },
  },
  {
    id: 'ord-4837',
    protocol: 'PED-2026-004837',
    cycle: 1,
    channel: 'E-mail',
    category: 'Manutenção e vistoria',
    subtype: 'Orçamento de reparo',
    subject: 'Orçamento R$ 1.920 Apto 306 Ed. Solar (aguarda dono)',
    objective: 'Obter autorização do proprietário (MAN-004 > R$ 800) para reparo que mantém imóvel parado há 24 dias.',
    narrative:
      'Apto 306 Ed. Solar aguarda reparo hidráulico/azulejo de R$ 1.920,00 (2 cotações homologadas obtidas). Proprietário Marta Siqueira ainda não respondeu à mensagem de autorização enviada há 3 dias pela MAN-004.',
    requesterName: 'Marta Siqueira',
    requesterRole: 'Proprietário',
    requesterContact: 'marta.siqueira@email.com',
    priority: 'Alta',
    status: 'Aguardando esclarecimento',
    slaSemaphore: 'atrasado',
    slaText: 'atrasado 1d',
    slaRequested: '21/11',
    slaCommitted: '21/11, 18:00 (MAN-004)',
    stageDurations: [
      { stage: '2 cotações obtidas', duration: '6h' },
      { stage: 'Aguarda proprietário', duration: '3d', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Marta Siqueira (Proprietária)',
    confidence: 95,
    registeredBy: 'Registrado pelo agente',
    createdAt: '19/11/2026',
    appliedRules: [
      { ruleId: 'MAN-003', version: 2 },
      { ruleId: 'MAN-004', version: 1 },
      { ruleId: 'MAN-006', version: 1 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-306', label: 'Apto 306 · Ed. Solar' },
      { type: 'Pessoa', code: 'PES-210', label: 'Marta Siqueira (Proprietária)' },
    ],
    originalMessage: {
      receivedAt: '19/11/2026 às 10:15',
      rawText: 'Encaminhando 2 orçamentos de reparo do banheiro do Apto 306 Ed. Solar (R$ 1.920,00 menor valor) para aceite da proprietária.',
      attachments: [{ name: 'orcamentos_apto306_solar.pdf', size: '420 KB', mime: 'application/pdf' }],
      channelMetadata: [
        { label: 'Portão bloqueado', value: 'Portão 3 · Autorização Proprietário (MAN-004)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4837-1',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '19/11 · 10:20',
        summary: 'Autorização de R$ 1.920,00 solicitada à proprietária Marta Siqueira (MAN-004).',
        details: 'Follow-up automático reenviado após 48h sem resposta.',
      },
    ],
    executionSteps: [
      { id: 'st-4837-1', label: 'Obter 2 orçamentos homologados (MAN-003)', status: 'completed', duration: '6h' },
      { id: 'st-4837-2', label: 'Aguardar aceite do proprietário > R$ 800 (MAN-004)', status: 'running', duration: '3d' },
    ],
    delivery: {
      solutionSummary: 'Bloqueado na MAN-004 aguardando aceite de Marta Siqueira para avançar à aprovação FIN-011.',
      artifacts: [],
      systemChangesSummary: ['Apto 306 sinalizado em Prontidão para alugar (24 dias parado)'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Marta! Lembrete sobre a autorização de R$ 1.920,00 para o Apto 306 Ed. Solar — com seu OK já liberamos o reparo para anunciar.',
      },
    },
  },
  {
    id: 'ord-4838',
    protocol: 'PED-2026-004838',
    cycle: 1,
    channel: 'WhatsApp',
    category: 'Manutenção e vistoria',
    subtype: 'Orçamento de reparo',
    subject: 'Vedação box banheiro R$ 1.120 Apto 504 Ed. Solar',
    objective: 'Obter autorização do proprietário > R$ 800 (MAN-004) antes da liberação autônoma FIN-011 (≤ R$ 1.500).',
    narrative:
      'Orçamento de R$ 1.120,00 da Vidraçaria Central para vedação do box do banheiro do Apto 504 Ed. Solar (solicitado pela inquilina Débora Queiroz). Embora esteja abaixo da alçada FIN-011 (≤ R$ 1.500), excede R$ 800 e aguarda autorização do proprietário pela MAN-004.',
    requesterName: 'Débora Queiroz',
    requesterRole: 'Inquilino',
    requesterContact: '(11) 99310-8821',
    priority: 'Normal',
    status: 'Recebido',
    slaSemaphore: 'no_prazo',
    slaText: 'no prazo',
    slaRequested: '24/11',
    slaCommitted: 'Aguarda proprietário (MAN-004)',
    stageDurations: [
      { stage: '1 orçamento obtido', duration: '2h' },
      { stage: 'Portão 3 · MAN-004', duration: '4h', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Marina Duarte (Proprietária)',
    confidence: 81,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 10:30',
    appliedRules: [
      { ruleId: 'MAN-003', version: 2 },
      { ruleId: 'MAN-004', version: 1 },
      { ruleId: 'FIN-011', version: 2 },
    ],
    links: [
      { type: 'Imóvel', code: 'IMV-504', label: 'Apto 504 · Ed. Solar' },
      { type: 'Pessoa', code: 'PES-289', label: 'Marina Duarte (Proprietária)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 10:30',
      rawText: 'A vedação do box do banheiro soltou e está vazando água no piso; Vidraçaria Central orçou R$ 1.120,00.',
      attachments: [],
      channelMetadata: [
        { label: 'Regra bloqueadora', value: 'MAN-004 v1 (> R$ 800 sem autorização do dono)' },
      ],
    },
    timeline: [
      {
        id: 'tl-4838-1',
        cycle: 1,
        type: 'Pergunta enviada',
        actor: 'Agente',
        actorName: 'Agente GoFAPE',
        timestamp: '10:40 · 22/11',
        summary: 'Solicitada autorização a Marina Duarte (R$ 1.120 > R$ 800 na MAN-004).',
        details: 'Após aceite do proprietário, pagamento ≤ R$ 1.500 segue automático pela FIN-011.',
      },
    ],
    executionSteps: [
      { id: 'st-4838-1', label: 'Portões 1 e 2 OK (1 orçamento homologado MAN-003)', status: 'completed', duration: '1h' },
      { id: 'st-4838-2', label: 'Portão 3 bloqueado: aguarda proprietário (MAN-004)', status: 'running', duration: 'Aguardando' },
    ],
    delivery: {
      solutionSummary: 'Aguarda aceite da proprietária (> R$ 800) pela MAN-004; após aceite, FIN-011 executa automático.',
      artifacts: [],
      systemChangesSummary: ['Mensagem enviada à proprietária Marina Duarte'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Marina, precisamos de sua autorização para vedação do box do Apto 504 Ed. Solar (R$ 1.120,00). Responda SIM para liberarmos.',
      },
    },
  },
  {
    id: 'ord-4790',
    protocol: 'PED-2026-004790',
    cycle: 1,
    channel: 'Chat do sistema',
    category: 'Manutenção e vistoria',
    subtype: 'Entrega de chaves',
    subject: 'Entrega de chaves Apto 1204 Ed. Aurora (sem laudo)',
    objective: 'Bloquear liberação das chaves até assinatura da vistoria de entrada pela inquilina (MAN-005 v2).',
    narrative:
      'Contrato novo do Apto 1204 Ed. Aurora solicitou entrega de chaves hoje, mas o laudo de vistoria de entrada ainda não possui assinatura digital da inquilina. Agente bloqueou automaticamente a entrega de chaves pela MAN-005 v2 e reenviou o link de assinatura.',
    requesterName: 'Rafael Costa',
    requesterRole: 'Corretor',
    requesterContact: 'rafael.costa@farina.com.br',
    priority: 'Urgente',
    status: 'Recebido',
    slaSemaphore: 'atrasado',
    slaText: 'bloqueado MAN-005',
    slaRequested: 'Hoje, 17:00',
    slaCommitted: 'Bloqueado até assinatura',
    stageDurations: [
      { stage: 'Checagem MAN-005', duration: '1s' },
      { stage: 'Bloqueado sem laudo', duration: '4h', active: true },
    ],
    assigneeType: 'Humano',
    assigneeName: 'Camila Duarte (Inquilina)',
    confidence: 99,
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Hoje, 09:15',
    appliedRules: [{ ruleId: 'MAN-005', version: 2 }],
    links: [
      { type: 'Imóvel', code: 'IMV-1204', label: 'Apto 1204 · Ed. Aurora' },
      { type: 'Pessoa', code: 'PES-809', label: 'Camila Duarte (Inquilina)' },
    ],
    originalMessage: {
      receivedAt: '22/11/2026 às 09:15',
      rawText: 'Inquilina do Apto 1204 Ed. Aurora quer retirar as chaves na recepção às 17h.',
      attachments: [],
      channelMetadata: [{ label: 'Regra bloqueadora', value: 'MAN-005 v2 (Entrada sem laudo assinado)' }],
    },
    timeline: [
      {
        id: 'tl-4790-1',
        cycle: 1,
        type: 'Classificado',
        actor: 'Agente',
        actorName: 'Motor de Políticas GoFAPE',
        timestamp: '09:15 · 22/11',
        summary: 'Entrega de chaves bloqueada pela MAN-005 v2: falta assinatura no laudo de entrada.',
        details: 'Link de assinatura digital reenviado via WhatsApp e E-mail para a inquilina.',
      },
    ],
    executionSteps: [
      { id: 'st-4790-1', label: 'Verificar assinatura do laudo de entrada (MAN-005)', status: 'completed', duration: '0,5s' },
      { id: 'st-4790-2', label: 'Aguardar assinatura digital da inquilina para liberar chaves', status: 'running', duration: 'Bloqueado' },
    ],
    delivery: {
      solutionSummary: 'Chaves retidas pela MAN-005 v2 até confirmação da assinatura da vistoria de entrada.',
      artifacts: [],
      systemChangesSummary: ['Lembrete de assinatura enviado à inquilina Camila Duarte'],
      requesterPreview: {
        channel: 'WhatsApp',
        body: 'Olá Camila! Para liberar as chaves do Apto 1204 às 17h, precisamos apenas da sua assinatura digital no laudo de vistoria de entrada.',
      },
    },
  },
];

export interface IntakeMessageItem {
  id: string;
  receivedAt: string;
  channel: OrderChannel;
  senderRaw: string;
  excerpt: string;
  fullText: string;
  outcomeType:
    | 'created_order'
    | 'attached_order'
    | 'split_orders'
    | 'triage_unclassified'
    | 'unidentified_requester';
  outcomeLabel: string;
  linkedProtocols: string[];
  suggestedCategory: OrderCategory;
  confirmedCategory?: OrderCategory;
  resolved?: boolean;
}

export const INITIAL_INTAKE_MESSAGES: IntakeMessageItem[] = [
  {
    id: 'int-1',
    receivedAt: '13:53',
    channel: 'Portais',
    senderRaw: 'ZAP Imóveis · Juliana Martins',
    excerpt: 'Interesse no Apto 1102 Ed. Jardins — aceita financiamento e visita amanhã?',
    fullText:
      'Olá, vi o anúncio do apartamento de 3 suítes no Edifício Jardins (Ref. IMV-1102) no ZAP Imóveis. Gostaria de saber se aceita financiamento bancário e se há disponibilidade para visita amanhã pela manhã.',
    outcomeType: 'created_order',
    outcomeLabel: 'Virou o pedido PED-2026-004811',
    linkedProtocols: ['PED-2026-004811'],
    suggestedCategory: 'Vendas e captação',
  },
  {
    id: 'int-2',
    receivedAt: '13:45',
    channel: 'Upload de documentos',
    senderRaw: 'Lucas Andrade (Corretor)',
    excerpt: 'contrato_sala804_paulista_assinado.pdf (11 páginas) enviado para cadastro.',
    fullText:
      'Upload do documento contrato_sala804_paulista_assinado.pdf (11 páginas). Favor cadastrar o contrato comercial com início em 01/12/2026, aluguel de R$ 5.800,00.',
    outcomeType: 'created_order',
    outcomeLabel: 'Virou o pedido PED-2026-004810',
    linkedProtocols: ['PED-2026-004810'],
    suggestedCategory: 'Cadastro e atualização',
  },
  {
    id: 'int-3',
    receivedAt: '13:35',
    channel: 'WhatsApp',
    senderRaw: '+55 11 98412-3309',
    excerpt: 'Áudio curto citando chave na portaria e boleto em aberto sem nome ou endereço.',
    fullText:
      'Oi boa tarde, deixei a chave com o rapaz aí ontem mas o boleto ainda aparece pra mim, vê isso aí pra mim por favor antes de fechar.',
    outcomeType: 'triage_unclassified',
    outcomeLabel: 'Não classificada: triagem humana',
    linkedProtocols: ['PED-2026-004802'],
    suggestedCategory: 'Triagem (não classificado)',
  },
  {
    id: 'int-4',
    receivedAt: '13:18',
    channel: 'E-mail',
    senderRaw: 'maria.souza@email.com',
    excerpt: 'Envio adicional de foto do registro hidráulico da cozinha (Rua das Acácias 120).',
    fullText:
      'Pessoal, esqueci de mandar no e-mail anterior a foto do registro fechado e o telefone do zelador Sr. Antônio para facilitar a entrada do encanador.',
    outcomeType: 'attached_order',
    outcomeLabel: 'Anexada ao pedido PED-2026-004809 (mesmo assunto)',
    linkedProtocols: ['PED-2026-004809'],
    suggestedCategory: 'Manutenção e vistoria',
  },
  {
    id: 'int-5',
    receivedAt: '12:52',
    channel: 'WhatsApp',
    senderRaw: '+55 11 97701-8843 (Não cadastrado)',
    excerpt: 'Pergunta sobre disponibilidade de apartamento de 2 quartos perto do metrô Paraíso.',
    fullText:
      'Boa tarde! Vocês ainda têm aquele apartamento de 2 dormitórios perto do metrô Paraíso para alugar sem fiador? Pode me responder por aqui.',
    outcomeType: 'unidentified_requester',
    outcomeLabel: 'Solicitante não identificado',
    linkedProtocols: [],
    suggestedCategory: 'Comunicação',
  },
  {
    id: 'int-6',
    receivedAt: '10:14',
    channel: 'WhatsApp',
    senderRaw: 'João Batista (+55 11 99142-8810)',
    excerpt: 'Solicitação de renovação do Apto 302 aplicando índice IGP-M por 12 meses.',
    fullText:
      'Bom dia pessoal da Farina! Aqui é o João Batista, dono do Apto 302 do Edifício Vista Verde. Gostaria de renovar por mais 12 meses aplicando IGP-M.',
    outcomeType: 'created_order',
    outcomeLabel: 'Virou o pedido PED-2026-004812',
    linkedProtocols: ['PED-2026-004812'],
    suggestedCategory: 'Locação e contratos',
  },
  {
    id: 'int-7',
    receivedAt: '09:50',
    channel: 'Chat do sistema',
    senderRaw: 'Gestor Farina',
    excerpt: 'Levantamento de inadimplência por tipo de garantia e sugestão de política.',
    fullText:
      'Preciso de um levantamento completo da inadimplência atual separada por tipo de garantia (caução, fiador, seguro fiança e título).',
    outcomeType: 'created_order',
    outcomeLabel: 'Virou o pedido PED-2026-004801',
    linkedProtocols: ['PED-2026-004801'],
    suggestedCategory: 'Consulta e relatório',
  },
  {
    id: 'int-8',
    receivedAt: '08:20',
    channel: 'E-mail',
    senderRaw: 'marcos.prado@email.com',
    excerpt: 'E-mail solicitando 2ª via do boleto de novembro + verificação de interfone mudo.',
    fullText:
      'Bom dia! Gostaria de pedir duas coisas no mesmo e-mail: 1) Segunda via atualizada do boleto de novembro; 2) Interfone da cozinha mudo desde segunda.',
    outcomeType: 'split_orders',
    outcomeLabel: 'Dividida em 2 pedidos',
    linkedProtocols: ['PED-2026-004804.1', 'PED-2026-004804.2'],
    suggestedCategory: 'Cobrança e financeiro',
  },
];

export const PERFORMANCE_STAGE_TIMES = [
  { stage: 'Recebimento → Classificação', minutes: 1.5, label: '1m 30s' },
  { stage: 'Classificação → Execução', minutes: 14, label: '14m' },
  { stage: 'Aprovação humana (quando há)', minutes: 48, label: '48m' },
  { stage: 'Execução pelo agente', minutes: 32, label: '32m' },
  { stage: 'Entrega → Aceite do solicitante', minutes: 124, label: '2h 04m' },
];

export const PERFORMANCE_BY_CHANNEL: { channel: OrderChannel; count: number; slaPct: number }[] = [
  { channel: 'WhatsApp', count: 142, slaPct: 92 },
  { channel: 'E-mail', count: 96, slaPct: 87 },
  { channel: 'Chat do sistema', count: 68, slaPct: 96 },
  { channel: 'Portais', count: 54, slaPct: 91 },
  { channel: 'Upload de documentos', count: 31, slaPct: 84 },
];

export const PERFORMANCE_BY_CATEGORY: { category: OrderCategory; count: number }[] = [
  { category: 'Cobrança e financeiro', count: 94 },
  { category: 'Locação e contratos', count: 76 },
  { category: 'Vendas e captação', count: 63 },
  { category: 'Manutenção e vistoria', count: 51 },
  { category: 'Cadastro e atualização', count: 44 },
  { category: 'Comunicação', count: 29 },
  { category: 'Consulta e relatório', count: 19 },
  { category: 'Jurídico e documentos', count: 11 },
  { category: 'Triagem (não classificado)', count: 4 },
];

export const PERFORMANCE_DAILY_30D: { day: string; pedidos: number; concluidos: number }[] = [
  { day: '24/10', pedidos: 14, concluidos: 13 },
  { day: '25/10', pedidos: 9, concluidos: 9 },
  { day: '26/10', pedidos: 11, concluidos: 10 },
  { day: '27/10', pedidos: 18, concluidos: 16 },
  { day: '28/10', pedidos: 21, concluidos: 19 },
  { day: '29/10', pedidos: 19, concluidos: 18 },
  { day: '30/10', pedidos: 17, concluidos: 16 },
  { day: '31/10', pedidos: 16, concluidos: 15 },
  { day: '01/11', pedidos: 10, concluidos: 10 },
  { day: '02/11', pedidos: 8, concluidos: 8 },
  { day: '03/11', pedidos: 22, concluidos: 20 },
  { day: '04/11', pedidos: 24, concluidos: 22 },
  { day: '05/11', pedidos: 20, concluidos: 19 },
  { day: '06/11', pedidos: 19, concluidos: 18 },
  { day: '07/11', pedidos: 17, concluidos: 16 },
  { day: '08/11', pedidos: 12, concluidos: 11 },
  { day: '09/11', pedidos: 9, concluidos: 9 },
  { day: '10/11', pedidos: 23, concluidos: 21 },
  { day: '11/11', pedidos: 25, concluidos: 23 },
  { day: '12/11', pedidos: 21, concluidos: 20 },
  { day: '13/11', pedidos: 19, concluidos: 18 },
  { day: '14/11', pedidos: 22, concluidos: 20 },
  { day: '15/11', pedidos: 13, concluidos: 12 },
  { day: '16/11', pedidos: 11, concluidos: 11 },
  { day: '17/11', pedidos: 26, concluidos: 24 },
  { day: '18/11', pedidos: 24, concluidos: 22 },
  { day: '19/11', pedidos: 22, concluidos: 21 },
  { day: '20/11', pedidos: 27, concluidos: 25 },
  { day: '21/11', pedidos: 23, concluidos: 20 },
  { day: '22/11', pedidos: 28, concluidos: 21 },
];
