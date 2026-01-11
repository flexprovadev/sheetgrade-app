"use client";

import { useMemo, useState } from "react";
import { Settings, RefreshCw, PlayCircle, CheckCircle } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  useActivateConfig,
  useConfig,
  useConfigVersions,
  useCreateConfig,
  useResetDatabase,
  useSelfTest,
} from "@/lib/queries";
import type { ConfigKind } from "@/types";

const templates: Record<ConfigKind, string> = {
  student_columns: `col01: "ID"
col02: "NOME_COMPLETO"
col03: "TURMA"
col04: "SALA_DE_PROVA"`,
  exam_map: `col01: "ID"
col02: "QUESTAO_LABEL"
col03: "TIPO"
col04: "GAB"
col05: "DISCIPLINA"`,
  question_types: `version: "1.0"
BLANK_MARK: "NP"
INVALID_MARK: "INV"
NULL_MARK: "NL"
types:
  A:
    code: "A"
    description: "Certo/Errado estilo CEBRASPE"
    format:
      values: ["C", "E"]
    grading:
      correct: 1
      incorrect: -1
      blank: 0
      invalid: 0
      null: 1
      intermediate_values: false`,
  olap_columns: `col01: "CONTROLE"
col02: "IMAGEM"
col03: "ID"
col04: "Q001"
col05: "Q002"
col06: "Q003"`,
};

const kindLabels: Record<ConfigKind, string> = {
  student_columns: "Colunas de Alunos",
  exam_map: "Mapa da Prova",
  question_types: "Tipos de Questão",
  olap_columns: "Colunas do OLAP",
};

export default function ConfigPage() {
  const { addToast } = useToast();
  const { mutateAsync: resetDb, isLoading: resetting } = useResetDatabase();
  const { mutateAsync: selfTest, isLoading: testing } = useSelfTest();
  const [selfTestResult, setSelfTestResult] = useState<string | null>(null);

  const handleResetDb = async () => {
    const firstConfirm = window.confirm("Tem certeza que deseja resetar o banco?");
    if (!firstConfirm) return;
    const secondConfirm = window.confirm(
      "Todos os dados de alunos e provas serão excluídos definitivamente. Deseja prosseguir?"
    );
    if (!secondConfirm) return;
    await resetDb();
    addToast("success", "Banco resetado e tabelas recriadas.");
  };

  const handleSelfTest = async () => {
    const res = await selfTest(true);
    setSelfTestResult(
      `${res.message} Estatísticas: média ${res.estatisticas.media}, participantes ${res.estatisticas.n_participantes}.`
    );
    addToast("success", "Self-test executado com sucesso.");
  };

  return (
    <PageContainer
      title="Configurações Globais"
      description="Defina colunas e tipos usados em todas as provas. As versões ativas são usadas por padrão nos uploads."
      action={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleResetDb} disabled={resetting}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {resetting ? "Limpando..." : "Resetar banco"}
          </Button>
          <Button onClick={handleSelfTest} disabled={testing}>
            <PlayCircle className="w-4 h-4 mr-2" />
            {testing ? "Rodando self-test..." : "Self-test"}
          </Button>
        </div>
      }
    >
      {selfTestResult && (
        <Card className="mb-6 bg-primary-50 border-primary-100 text-primary-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Self-test</p>
              <p className="text-sm">{selfTestResult}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {(Object.keys(kindLabels) as ConfigKind[]).map((kind) => (
          <ConfigCard key={kind} kind={kind} />
        ))}
      </div>
    </PageContainer>
  );
}

function ConfigCard({ kind }: { kind: ConfigKind }) {
  const { addToast } = useToast();
  const { data: active } = useConfig(kind);
  const { data: versions } = useConfigVersions(kind);
  const { mutateAsync: createConfig, isLoading } = useCreateConfig();
  const { mutateAsync: activateConfig, isLoading: activating } = useActivateConfig();

  const [version, setVersion] = useState(active?.version || "1.0");
  const [payloadText, setPayloadText] = useState<string>(() => templates[kind] || "");

  const latestVersions = useMemo(() => versions?.items || [], [versions]);

  const handleSubmit = async () => {
    await createConfig({
      kind,
      version: version || "1.0",
      payload: payloadText,
      activate: true,
    });
    addToast("success", `${kindLabels[kind]} salva e ativada.`);
  };

  const handleActivate = async (id: number) => {
    await activateConfig(id);
    addToast("success", "Versão ativada.");
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-primary-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{kindLabels[kind]}</h2>
          <p className="text-sm text-gray-500">
            Versão ativa: {active ? active.version : "nenhuma"} • {active ? "configurada" : "defina uma versão"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Versão"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payload (YAML ou JSON)</label>
          <textarea
            className="w-full min-h-[160px] rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            spellCheck={false}
          />
          <p className="text-xs text-gray-500 mt-1">
            O backend aceita YAML/JSON. Ao salvar, esta versão fica ativa e usada em novas provas/importações.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar e ativar"}
          </Button>
          {latestVersions.length > 0 && (
            <select
              className="text-sm border rounded-lg px-3 py-2"
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) handleActivate(id);
              }}
              defaultValue=""
              disabled={activating}
            >
              <option value="">Ativar versão existente</option>
              {latestVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version} {v.is_active ? "(ativa)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        {active?.payload && (
          <details className="mt-2">
            <summary className="text-sm text-gray-600 cursor-pointer">Ver payload ativo</summary>
            <pre className="mt-2 bg-gray-50 border rounded-lg p-3 text-xs overflow-x-auto">
              {JSON.stringify(active.payload, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </Card>
  );
}
