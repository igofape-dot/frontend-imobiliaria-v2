export type NavItemId =
  | 'painel'
  | 'gestor'
  | 'agente-ia'
  | 'locacao-administracao'
  | 'vendas'
  | 'captacao-marketing'
  | 'financeiro'
  | 'contratos-juridico'
  | 'manutencao-vistorias'
  | 'clientes'
  | 'equipe'
  | 'relatorios'
  | 'regras-agente';

export interface NavSubItem {
  id: NavItemId;
  label: string;
}

export interface NavItem {
  id: NavItemId;
  label: string;
  icon:
    | 'home'
    | 'key'
    | 'tag'
    | 'megaphone'
    | 'wallet'
    | 'scale'
    | 'wrench'
    | 'users'
    | 'user-check'
    | 'chart'
    | 'bot';
  subItems?: NavSubItem[];
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    id: 'painel',
    label: 'Início',
    icon: 'home',
    subItems: [
      { id: 'painel', label: 'Painel' },
      { id: 'gestor', label: 'Gestor' },
      { id: 'agente-ia', label: 'Agente de IA' },
    ],
  },
  { id: 'locacao-administracao', label: 'Locação e Administração', icon: 'key' },
  { id: 'vendas', label: 'Vendas', icon: 'tag' },
  { id: 'captacao-marketing', label: 'Captação e Marketing', icon: 'megaphone' },
  { id: 'financeiro', label: 'Financeiro', icon: 'wallet' },
  { id: 'contratos-juridico', label: 'Contratos e Jurídico', icon: 'scale' },
  { id: 'manutencao-vistorias', label: 'Manutenção e Vistorias', icon: 'wrench' },
  { id: 'clientes', label: 'Clientes', icon: 'users' },
  { id: 'equipe', label: 'Equipe', icon: 'user-check' },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart' },
  { id: 'regras-agente', label: 'Regras do agente', icon: 'bot' },
];

export interface SearchRecord {
  id: string;
  type: 'Imóvel' | 'Pessoa' | 'Contrato';
  title: string;
  subtitle: string;
  registeredBy: string;
  targetItem: NavItemId;
}

export const SEARCH_RECORDS: SearchRecord[] = [
  {
    id: 'IMV-302',
    type: 'Imóvel',
    title: 'Apto 302 — Ed. Vista Verde (Carlos Mendes)',
    subtitle: 'Locação · R$ 3.200,00/mês · Renovação IGP-M 4,2%',
    registeredBy: 'Registrado pelo agente via WhatsApp',
    targetItem: 'locacao-administracao',
  },
  {
    id: 'IMV-418',
    type: 'Imóvel',
    title: 'Rua das Acácias, 418 — Jardim América',
    subtitle: 'Venda · R$ 680.000,00 · Captação recente',
    registeredBy: 'Registrado pelo agente via PDF',
    targetItem: 'captacao-marketing',
  },
  {
    id: 'PES-410',
    type: 'Pessoa',
    title: 'Carlos Mendes',
    subtitle: 'Inquilino · Minuta aguardando aprovação',
    registeredBy: 'Registrado pelo agente via E-mail',
    targetItem: 'clientes',
  },
  {
    id: 'CTR-884',
    type: 'Contrato',
    title: 'Contrato #CTR-884 — Sala Comercial Centro',
    subtitle: 'Reajuste anual pendente · Vence em 52 dias',
    registeredBy: 'Registrado pelo agente via contrato.pdf',
    targetItem: 'contratos-juridico',
  },
];

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: '4 decisões aguardam sua aprovação',
    detail: 'O agente pausou ações sensíveis e itens de baixa confiança.',
    time: 'Agora',
    unread: true,
  },
  {
    id: 'n2',
    title: '6 repasses a proprietários vencem hoje',
    detail: 'Há também 2 repasses atrasados sinalizados nos alertas.',
    time: 'Há 14 min',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Lote de PDFs processado',
    detail: '12 imóveis extraídos de ficha_captacao_nov.pdf.',
    time: 'Hoje, 09:40',
    unread: false,
  },
];

export interface WorkspaceTenant {
  id: string;
  name: string;
  shortName: string;
  code: string;
}

export const WORKSPACES: WorkspaceTenant[] = [
  {
    id: 'farina',
    name: 'Farina Imobiliária',
    shortName: 'Farina',
    code: 'FIMP',
  },
  {
    id: 'farina-matriz',
    name: 'Farina Matriz',
    shortName: 'Matriz',
    code: 'FMAT',
  },
];
