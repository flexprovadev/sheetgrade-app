"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, RefreshCw, Users, Award, TrendingUp, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableEmptyState,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useProva, useResultados, useCorrigirProva } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";

export default function ResultadoDetalhesPage() {
  const params = useParams();
  const provaId = Number(params.id);
  const { addToast } = useToast();

  const { data: prova, isLoading: loadingProva } = useProva(provaId);
  const { data: resultadosData, isLoading: loadingResultados } = useResultados(provaId);
  const corrigir = useCorrigirProva();

  const handleReprocessar = async () => {
    try {
      const result = await corrigir.mutateAsync({
        provaId,
        incluirDetalhes: true,
      });
      addToast("success", result.message);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao reprocessar");
    }
  };

  const handleExportarCSV = () => {
    if (!resultadosData) return;

    const headers = ["ID", "Nome", "Nota"];
    const rows = resultadosData.resultados.map((r) => [
      r.aluno_id_externo,
      r.aluno_nome,
      r.nota_total.toString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados-${prova?.codigo || provaId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Arquivo exportado com sucesso");
  };

  if (loadingProva || loadingResultados) {
    return (
      <PageContainer title="Carregando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </PageContainer>
    );
  }

  if (!prova) {
    return (
      <PageContainer title="Prova nao encontrada">
        <Card>
          <p className="text-gray-500">A prova solicitada nao foi encontrada.</p>
          <Link href="/resultados">
            <Button className="mt-4">Voltar para resultados</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  const resultados = resultadosData?.resultados || [];
  const estatisticas = resultadosData?.estatisticas;
  const ausentes = resultadosData?.ausentes || [];

  const getNotaBadge = (nota: number, media: number) => {
    if (nota >= media * 1.2) return "success";
    if (nota >= media * 0.8) return "info";
    if (nota >= media * 0.5) return "warning";
    return "error";
  };

  return (
    <PageContainer
      title={`Resultados: ${prova.codigo}`}
      description={prova.descricao || `Versao ${prova.versao}`}
      action={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleReprocessar}
            isLoading={corrigir.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reprocessar
          </Button>
          <Button onClick={handleExportarCSV} disabled={!resultados.length}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      }
    >
      {/* Estatisticas */}
      {estatisticas && estatisticas.n_participantes > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Participantes"
            value={estatisticas.n_participantes}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Media"
            value={formatNumber(estatisticas.media)}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            title="Maior Nota"
            value={formatNumber(estatisticas.maior_nota)}
            icon={<Award className="w-6 h-6" />}
          />
          <StatCard
            title="Desvio Padrao"
            value={formatNumber(estatisticas.desvio_padrao)}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>
      ) : (
        <Card className="mb-8">
          <div className="flex items-center gap-3 text-yellow-700 bg-yellow-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <p>
              Nenhum resultado encontrado. Execute a correcao da prova para gerar os resultados.
            </p>
          </div>
        </Card>
      )}

      {/* Distribuicao de Notas (Simples) */}
      {resultados.length > 0 && estatisticas && (
        <Card className="mb-8">
          <CardHeader title="Distribuicao de Notas" />
          <div className="flex items-end gap-1 h-32">
            {(() => {
              const faixas = [
                { min: 0, max: 20, label: "0-20%" },
                { min: 20, max: 40, label: "20-40%" },
                { min: 40, max: 60, label: "40-60%" },
                { min: 60, max: 80, label: "60-80%" },
                { min: 80, max: 100, label: "80-100%" },
              ];

              const maxNota = estatisticas.maior_nota || 100;
              const contagens = faixas.map((f) => ({
                ...f,
                count: resultados.filter((r) => {
                  const percentual = (r.nota_total / maxNota) * 100;
                  return percentual >= f.min && percentual < f.max;
                }).length,
              }));

              const maxCount = Math.max(...contagens.map((c) => c.count), 1);

              return contagens.map((faixa, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{
                      height: `${(faixa.count / maxCount) * 100}%`,
                      minHeight: faixa.count > 0 ? "4px" : "0",
                    }}
                  />
                  <span className="text-xs text-gray-500">{faixa.label}</span>
                  <span className="text-xs font-medium">{faixa.count}</span>
                </div>
              ));
            })()}
          </div>
        </Card>
      )}

      {/* Tabela de Resultados */}
      <Card className="mb-8">
        <CardHeader
          title="Resultados por Aluno"
          description={`${resultados.length} resultado(s)`}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Nome</TableHeader>
              <TableHeader>Nota Total</TableHeader>
              <TableHeader>Objetivas</TableHeader>
              <TableHeader>Dissertativas</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultados.length === 0 ? (
              <TableEmptyState
                message="Nenhum resultado disponivel"
                action={
                  <Button size="sm" onClick={handleReprocessar}>
                    Executar correcao
                  </Button>
                }
              />
            ) : (
              resultados
                .sort((a, b) => b.nota_total - a.nota_total)
                .map((resultado, index) => (
                  <TableRow key={resultado.id}>
                    <TableCell className="font-mono">
                      {resultado.aluno_id_externo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Award className="w-4 h-4 text-yellow-500" />
                        )}
                        {resultado.aluno_nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatNumber(resultado.nota_total)}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(resultado.nota_objetivas)}</TableCell>
                    <TableCell>
                      {formatNumber(resultado.nota_dissertativas)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getNotaBadge(
                          resultado.nota_total,
                          estatisticas?.media || 0
                        )}
                        size="sm"
                      >
                        {resultado.nota_total >= (estatisticas?.media || 0)
                          ? "Acima da media"
                          : "Abaixo da media"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Ausentes */}
      {ausentes.length > 0 && (
        <Card>
          <CardHeader
            title="Alunos Ausentes"
            description={`${ausentes.length} aluno(s) nao realizaram a prova`}
          />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ausentes.map((ausente) => (
              <div
                key={ausente.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ausente.nome}</p>
                  <p className="text-sm text-gray-500">ID: {ausente.id}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
