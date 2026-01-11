"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Save, CheckCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  useProvas,
  useAlunos,
  useQuestoes,
  useCreateMarcacoesLote,
} from "@/lib/queries";

export default function RespostasPage() {
  const { addToast } = useToast();

  const [provaId, setProvaId] = useState<number | undefined>();
  const [alunoId, setAlunoId] = useState<number | undefined>();
  const [controle, setControle] = useState("");
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  const { data: provasData } = useProvas();
  const { data: alunosData } = useAlunos(1, 100, provaId);
  const { data: questoes } = useQuestoes(provaId || 0);
  const createMarcacoes = useCreateMarcacoesLote();

  const provas = provasData?.items || [];
  const alunos = alunosData?.items || [];

  const handleRespostaChange = (questaoId: string, value: string) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: value.toUpperCase(),
    }));
  };

  const handleSalvar = async () => {
    if (!alunoId || !controle) {
      addToast("error", "Selecione um aluno e informe o controle");
      return;
    }

    const respostasArray = Object.entries(respostas).map(
      ([questao_id, resposta]) => ({
        questao_id,
        resposta,
      })
    );

    if (respostasArray.length === 0) {
      addToast("error", "Preencha pelo menos uma resposta");
      return;
    }

    try {
      await createMarcacoes.mutateAsync({
        aluno_id: alunoId,
        controle,
        respostas: respostasArray,
      });
      addToast("success", "Respostas salvas com sucesso");
      setRespostas({});
      setControle("");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao salvar");
    }
  };

  return (
    <PageContainer
      title="Inserir Respostas"
      description="Insira as respostas dos alunos manualmente ou via CSV"
      action={
        <Link href="/respostas/importar">
          <Button variant="secondary">
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV (OLAP)
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Selection Panel */}
        <Card className="lg:col-span-1">
          <CardHeader title="Selecao" />
          <div className="space-y-4">
            <Select
              label="Prova"
              placeholder="Selecione uma prova"
              value={provaId?.toString() || ""}
              onChange={(e) => {
                setProvaId(e.target.value ? Number(e.target.value) : undefined);
                setAlunoId(undefined);
                setRespostas({});
              }}
              options={provas.map((p) => ({ value: p.id, label: p.codigo }))}
            />

            <Select
              label="Aluno"
              placeholder="Selecione um aluno"
              value={alunoId?.toString() || ""}
              onChange={(e) =>
                setAlunoId(e.target.value ? Number(e.target.value) : undefined)
              }
              options={alunos.map((a) => ({
                value: a.id,
                label: `${a.aluno_id_externo} - ${a.nome}`,
              }))}
              disabled={!provaId}
            />

            <Input
              label="Controle/Lote"
              placeholder="Ex: LOTE-001"
              value={controle}
              onChange={(e) => setControle(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={handleSalvar}
              isLoading={createMarcacoes.isPending}
              disabled={!alunoId || !controle || Object.keys(respostas).length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Respostas
            </Button>
          </div>
        </Card>

        {/* Answer Form */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Respostas"
            description={
              questoes
                ? `${Object.keys(respostas).length} de ${questoes.length} preenchidas`
                : "Selecione uma prova para ver as questoes"
            }
          />

          {!provaId ? (
            <div className="text-center py-8 text-gray-500">
              Selecione uma prova para inserir respostas
            </div>
          ) : !questoes?.length ? (
            <div className="text-center py-8 text-gray-500">
              Esta prova nao possui questoes cadastradas
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {questoes.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {q.codigo_questao}
                      </span>
                      <Badge size="sm" variant="info">
                        {q.tipo}
                      </Badge>
                    </div>
                    <Input
                      value={respostas[q.id.toString()] || ""}
                      onChange={(e) =>
                        handleRespostaChange(q.id.toString(), e.target.value)
                      }
                      placeholder="Resposta"
                      className="text-center font-mono uppercase"
                    />
                  </div>
                  {respostas[q.id.toString()] && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
