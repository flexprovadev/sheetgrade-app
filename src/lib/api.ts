import type {
  Aluno,
  AlunoCreate,
  AlunosPaginados,
  AlunoUpdate,
  Estatisticas,
  Marcacao,
  MarcacaoCreate,
  MarcacaoLoteCreate,
  MessageResponse,
  Prova,
  ProvaCreate,
  ProvaListResponse,
  ProvaUpdate,
  Questao,
  QuestaoCreate,
  QuestaoUpdate,
  ResultadoProvaResponse,
  TiposQuestaoResponse,
  ConfigGlobal,
  ConfigGlobalList,
  SelfTestResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }

  return response.json();
}

async function uploadFile<T>(
  endpoint: string,
  file: File,
  params?: Record<string, string>
): Promise<T> {
  const formData = new FormData();
  formData.append("arquivo", file);

  const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${API_URL}${endpoint}${queryString}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }

  return response.json();
}

// === ALUNOS ===

export async function getAlunos(
  page = 1,
  pageSize = 20,
  provaId?: number,
  busca?: string
): Promise<AlunosPaginados> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (provaId) params.append("prova_id", provaId.toString());
  if (busca) params.append("busca", busca);

  return fetchApi(`/alunos?${params}`);
}

export async function getAluno(id: number): Promise<Aluno> {
  return fetchApi(`/alunos/${id}`);
}

export async function createAluno(
  provaId: number,
  data: AlunoCreate
): Promise<Aluno> {
  return fetchApi(`/alunos?prova_id=${provaId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAluno(
  id: number,
  data: AlunoUpdate
): Promise<Aluno> {
  return fetchApi(`/alunos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAluno(id: number): Promise<MessageResponse> {
  return fetchApi(`/alunos/${id}`, { method: "DELETE" });
}

export async function importAlunosCsv(
  provaId: number,
  file: File,
  colId?: string,
  colNome?: string
): Promise<MessageResponse> {
  const params: Record<string, string> = { prova_id: provaId.toString() };
  if (colId) params.col_id = colId;
  if (colNome) params.col_nome = colNome;
  return uploadFile(`/alunos/importar`, file, params);
}

// === PROVAS ===

export async function getProvas(): Promise<ProvaListResponse> {
  return fetchApi("/provas");
}

export async function getProva(id: number): Promise<Prova> {
  return fetchApi(`/provas/${id}`);
}

export async function createProva(data: ProvaCreate): Promise<Prova> {
  return fetchApi("/provas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProva(
  id: number,
  data: ProvaUpdate
): Promise<Prova> {
  return fetchApi(`/provas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProva(id: number): Promise<MessageResponse> {
  return fetchApi(`/provas/${id}`, { method: "DELETE" });
}

export async function importProvaYaml(file: File): Promise<Prova> {
  return uploadFile("/provas/importar", file);
}

// === QUESTOES ===

export async function getQuestoes(provaId: number): Promise<Questao[]> {
  return fetchApi(`/provas/${provaId}/questoes`);
}

export async function getQuestao(id: number): Promise<Questao> {
  return fetchApi(`/questoes/${id}`);
}

export async function createQuestao(
  provaId: number,
  data: QuestaoCreate
): Promise<Questao> {
  return fetchApi(`/provas/${provaId}/questoes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuestao(
  id: number,
  data: QuestaoUpdate
): Promise<Questao> {
  return fetchApi(`/questoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteQuestao(id: number): Promise<MessageResponse> {
  return fetchApi(`/questoes/${id}`, { method: "DELETE" });
}

export async function importQuestoesCsv(
  provaId: number,
  file: File,
  colId?: string,
  colQuestao?: string,
  colTipo?: string,
  colGabarito?: string
): Promise<MessageResponse> {
  const params: Record<string, string> = {};
  if (colId) params.col_id = colId;
  if (colQuestao) params.col_questao = colQuestao;
  if (colTipo) params.col_tipo = colTipo;
  if (colGabarito) params.col_gabarito = colGabarito;
  return uploadFile(`/provas/${provaId}/questoes/importar`, file, params);
}

// === MARCACOES ===

export async function getMarcacoes(
  provaId: number,
  alunoId?: number
): Promise<Marcacao[]> {
  const params = alunoId ? `?aluno_id=${alunoId}` : "";
  return fetchApi(`/provas/${provaId}/marcacoes${params}`);
}

export async function getMarcacao(id: number): Promise<Marcacao> {
  return fetchApi(`/marcacoes/${id}`);
}

export async function createMarcacao(data: MarcacaoCreate): Promise<Marcacao> {
  return fetchApi("/marcacoes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createMarcacoesLote(
  data: MarcacaoLoteCreate
): Promise<MessageResponse> {
  return fetchApi("/marcacoes/lote", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteMarcacao(id: number): Promise<MessageResponse> {
  return fetchApi(`/marcacoes/${id}`, { method: "DELETE" });
}

export async function importMarcacoesCsv(
  provaId: number,
  file: File,
  colControle?: string,
  colImagem?: string,
  colAluno?: string
): Promise<MessageResponse> {
  const params: Record<string, string> = {};
  if (colControle) params.col_controle = colControle;
  if (colImagem) params.col_imagem = colImagem;
  if (colAluno) params.col_aluno = colAluno;
  return uploadFile(`/provas/${provaId}/marcacoes/importar`, file, params);
}

// === RESULTADOS ===

export async function getResultados(
  provaId: number
): Promise<ResultadoProvaResponse> {
  return fetchApi(`/provas/${provaId}/resultados`);
}

export async function corrigirProva(
  provaId: number,
  incluirDetalhes = false
): Promise<MessageResponse> {
  const params = incluirDetalhes ? "?incluir_detalhes=true" : "";
  return fetchApi(`/provas/${provaId}/corrigir${params}`, { method: "POST" });
}

export async function getEstatisticas(provaId: number): Promise<Estatisticas> {
  return fetchApi(`/provas/${provaId}/estatisticas`);
}

export async function limparResultados(
  provaId: number
): Promise<MessageResponse> {
  return fetchApi(`/provas/${provaId}/resultados`, { method: "DELETE" });
}

// === TIPOS DE QUESTAO ===

export async function getTiposQuestao(): Promise<TiposQuestaoResponse> {
  // Endpoint original da API de grading
  const response = await fetch(
    `${API_URL.replace("/api/v1", "")}/api/v1/tipos-questao`
  );
  if (!response.ok) {
    throw new Error("Erro ao buscar tipos de questão");
  }
  return response.json();
}

// === CONFIGS ===

export async function getConfig(kind: string): Promise<ConfigGlobal> {
  return fetchApi(`/config/${kind}`);
}

export async function listConfigVersions(kind: string): Promise<ConfigGlobalList> {
  return fetchApi(`/config/${kind}/versions`);
}

export async function createConfig(data: {
  kind: string;
  version?: string;
  payload: unknown;
  activate?: boolean;
}): Promise<ConfigGlobal> {
  return fetchApi("/config", {
    method: "POST",
    body: JSON.stringify({
      kind: data.kind,
      version: data.version || "1.0",
      payload: data.payload,
      activate: data.activate ?? true,
    }),
  });
}

export async function activateConfig(configId: number): Promise<MessageResponse> {
  return fetchApi(`/config/${configId}/activate`, { method: "POST" });
}

// === DIAGNOSTICS ===

export async function resetDatabase(): Promise<MessageResponse> {
  return fetchApi("/diagnostics/reset-db?confirm=true", { method: "POST" });
}

export async function selfTest(resetDb = true): Promise<SelfTestResponse> {
  const qs = resetDb ? "?reset_db=true" : "?reset_db=false";
  return fetchApi(`/diagnostics/self-test${qs}`, { method: "POST" });
}
