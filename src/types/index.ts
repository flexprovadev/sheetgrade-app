// Tipos baseados na API SheetGrade

export interface Aluno {
  id: number;
  prova_id: number;
  aluno_id_externo: string;
  nome: string;
  dados_extras: Record<string, unknown>;
}

export interface AlunoCreate {
  aluno_id_externo: string;
  nome: string;
  dados_extras?: Record<string, unknown>;
}

export interface AlunoUpdate {
  aluno_id_externo?: string;
  nome?: string;
  dados_extras?: Record<string, unknown>;
}

export interface AlunosPaginados {
  items: Aluno[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Prova {
  id: number;
  codigo: string;
  versao: string;
  descricao: string | null;
  config_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  total_alunos: number;
  total_questoes: number;
}

export interface ProvaCreate {
  codigo: string;
  versao: string;
  descricao?: string;
  config_json?: Record<string, unknown>;
}

export interface ProvaUpdate {
  codigo?: string;
  versao?: string;
  descricao?: string;
  config_json?: Record<string, unknown>;
}

export interface ProvaListResponse {
  items: Prova[];
  total: number;
}

export interface Questao {
  id: number;
  prova_id: number;
  questao_id_externo: string;
  codigo_questao: string;
  tipo: string;
  gabarito: string;
  ordem: number;
  dados_extras: Record<string, unknown>;
}

export interface QuestaoCreate {
  questao_id_externo: string;
  codigo_questao: string;
  tipo: string;
  gabarito: string;
  ordem: number;
  dados_extras?: Record<string, unknown>;
}

export interface QuestaoUpdate {
  questao_id_externo?: string;
  codigo_questao?: string;
  tipo?: string;
  gabarito?: string;
  ordem?: number;
  dados_extras?: Record<string, unknown>;
}

export interface Marcacao {
  id: number;
  aluno_id: number;
  questao_id: number;
  controle: string;
  imagem: string | null;
  resposta: string;
  pontuacao: number | null;
}

export interface MarcacaoCreate {
  aluno_id: number;
  questao_id: number;
  controle: string;
  imagem?: string;
  resposta: string;
}

export interface MarcacaoLoteCreate {
  aluno_id: number;
  controle: string;
  imagem?: string;
  respostas: Array<{ questao_id: string; resposta: string }>;
}

export interface Resultado {
  id: number;
  prova_id: number;
  aluno_id: number;
  aluno_nome: string;
  aluno_id_externo: string;
  nota_total: number;
  nota_objetivas: number;
  nota_dissertativas: number;
  detalhes_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AlunoAusente {
  id: string;
  nome: string;
}

export interface Estatisticas {
  n_participantes: number;
  maior_nota: number;
  menor_nota: number;
  media: number;
  desvio_padrao: number;
}

export interface ResultadoProvaResponse {
  prova_id: number;
  prova_codigo: string;
  resultados: Resultado[];
  estatisticas: Estatisticas;
  ausentes: AlunoAusente[];
}

export interface MessageResponse {
  message: string;
  details?: Record<string, unknown>;
}

export interface TipoQuestao {
  code: string;
  description: string;
  format: {
    values: string[] | string;
  };
  grading: {
    correct: number;
    intermediate_values: boolean;
    incorrect: number;
    blank: number;
    invalid: number;
    null: number;
  };
}

export interface TiposQuestaoResponse {
  version: string;
  blank_mark: string;
  invalid_mark: string;
  null_mark: string;
  types: Record<string, TipoQuestao>;
}

export type ConfigKind =
  | "student_columns"
  | "exam_map"
  | "question_types"
  | "olap_columns";

export interface ConfigGlobal {
  id: number;
  kind: ConfigKind;
  version: string;
  payload: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface ConfigGlobalList {
  items: ConfigGlobal[];
}

export interface SelfTestResponse {
  message: string;
  prova_id: number;
  prova_codigo: string;
  estatisticas: Estatisticas;
  total_alunos: number;
  ausentes: AlunoAusente[];
  config_versions: Record<string, string>;
}
