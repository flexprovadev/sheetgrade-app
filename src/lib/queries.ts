import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type {
  AlunoCreate,
  AlunoUpdate,
  MarcacaoCreate,
  MarcacaoLoteCreate,
  ProvaCreate,
  ProvaUpdate,
  QuestaoCreate,
  QuestaoUpdate,
} from "@/types";

// === ALUNOS ===

export function useAlunos(
  page = 1,
  pageSize = 20,
  provaId?: number,
  busca?: string
) {
  return useQuery({
    queryKey: ["alunos", page, pageSize, provaId, busca],
    queryFn: () => api.getAlunos(page, pageSize, provaId, busca),
  });
}

export function useAluno(id: number) {
  return useQuery({
    queryKey: ["aluno", id],
    queryFn: () => api.getAluno(id),
    enabled: !!id,
  });
}

export function useCreateAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provaId, data }: { provaId: number; data: AlunoCreate }) =>
      api.createAluno(provaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

export function useUpdateAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AlunoUpdate }) =>
      api.updateAluno(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["aluno", id] });
    },
  });
}

export function useDeleteAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAluno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

export function useImportAlunosCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provaId,
      file,
      colId,
      colNome,
    }: {
      provaId: number;
      file: File;
      colId?: string;
      colNome?: string;
    }) => api.importAlunosCsv(provaId, file, colId, colNome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

// === PROVAS ===

export function useProvas() {
  return useQuery({
    queryKey: ["provas"],
    queryFn: api.getProvas,
  });
}

export function useProva(id: number) {
  return useQuery({
    queryKey: ["prova", id],
    queryFn: () => api.getProva(id),
    enabled: !!id,
  });
}

export function useCreateProva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProvaCreate) => api.createProva(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

export function useUpdateProva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProvaUpdate }) =>
      api.updateProva(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["provas"] });
      queryClient.invalidateQueries({ queryKey: ["prova", id] });
    },
  });
}

export function useDeleteProva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProva,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

export function useImportProvaYaml() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.importProvaYaml,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

// === QUESTOES ===

export function useQuestoes(provaId: number) {
  return useQuery({
    queryKey: ["questoes", provaId],
    queryFn: () => api.getQuestoes(provaId),
    enabled: !!provaId,
  });
}

export function useQuestao(id: number) {
  return useQuery({
    queryKey: ["questao", id],
    queryFn: () => api.getQuestao(id),
    enabled: !!id,
  });
}

export function useCreateQuestao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provaId, data }: { provaId: number; data: QuestaoCreate }) =>
      api.createQuestao(provaId, data),
    onSuccess: (_, { provaId }) => {
      queryClient.invalidateQueries({ queryKey: ["questoes", provaId] });
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

export function useUpdateQuestao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuestaoUpdate }) =>
      api.updateQuestao(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questoes"] });
    },
  });
}

export function useDeleteQuestao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteQuestao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questoes"] });
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

export function useImportQuestoesCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provaId,
      file,
      colId,
      colQuestao,
      colTipo,
      colGabarito,
    }: {
      provaId: number;
      file: File;
      colId?: string;
      colQuestao?: string;
      colTipo?: string;
      colGabarito?: string;
    }) => api.importQuestoesCsv(provaId, file, colId, colQuestao, colTipo, colGabarito),
    onSuccess: (_, { provaId }) => {
      queryClient.invalidateQueries({ queryKey: ["questoes", provaId] });
      queryClient.invalidateQueries({ queryKey: ["provas"] });
    },
  });
}

// === MARCACOES ===

export function useMarcacoes(provaId: number, alunoId?: number) {
  return useQuery({
    queryKey: ["marcacoes", provaId, alunoId],
    queryFn: () => api.getMarcacoes(provaId, alunoId),
    enabled: !!provaId,
  });
}

export function useCreateMarcacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarcacaoCreate) => api.createMarcacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcacoes"] });
    },
  });
}

export function useCreateMarcacoesLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarcacaoLoteCreate) => api.createMarcacoesLote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcacoes"] });
    },
  });
}

export function useDeleteMarcacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMarcacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcacoes"] });
    },
  });
}

export function useImportMarcacoesCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provaId,
      file,
      colControle,
      colImagem,
      colAluno,
    }: {
      provaId: number;
      file: File;
      colControle?: string;
      colImagem?: string;
      colAluno?: string;
    }) => api.importMarcacoesCsv(provaId, file, colControle, colImagem, colAluno),
    onSuccess: (_, { provaId }) => {
      queryClient.invalidateQueries({ queryKey: ["marcacoes", provaId] });
    },
  });
}

// === RESULTADOS ===

export function useResultados(provaId: number) {
  return useQuery({
    queryKey: ["resultados", provaId],
    queryFn: () => api.getResultados(provaId),
    enabled: !!provaId,
  });
}

export function useCorrigirProva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provaId,
      incluirDetalhes,
    }: {
      provaId: number;
      incluirDetalhes?: boolean;
    }) => api.corrigirProva(provaId, incluirDetalhes),
    onSuccess: (_, { provaId }) => {
      queryClient.invalidateQueries({ queryKey: ["resultados", provaId] });
    },
  });
}

export function useEstatisticas(provaId: number) {
  return useQuery({
    queryKey: ["estatisticas", provaId],
    queryFn: () => api.getEstatisticas(provaId),
    enabled: !!provaId,
  });
}

export function useLimparResultados() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.limparResultados,
    onSuccess: (_, provaId) => {
      queryClient.invalidateQueries({ queryKey: ["resultados", provaId] });
    },
  });
}

// === TIPOS DE QUESTAO ===

export function useTiposQuestao() {
  return useQuery({
    queryKey: ["tipos-questao"],
    queryFn: api.getTiposQuestao,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
