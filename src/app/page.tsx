"use client";

import Link from "next/link";
import { Users, FileText, BarChart3, Plus, Upload } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProvas } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: provasData, isLoading } = useProvas();

  const provas = provasData?.items || [];
  const totalAlunos = provas.reduce((acc, p) => acc + p.total_alunos, 0);
  const totalQuestoes = provas.reduce((acc, p) => acc + p.total_questoes, 0);

  return (
    <PageContainer
      title="Dashboard"
      description="Visao geral do sistema de correcao de provas"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total de Provas"
          value={isLoading ? "..." : provas.length}
          icon={<FileText className="w-6 h-6" />}
        />
        <StatCard
          title="Total de Alunos"
          value={isLoading ? "..." : totalAlunos}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="Total de Questoes"
          value={isLoading ? "..." : totalQuestoes}
          icon={<BarChart3 className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acoes Rapidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/provas/nova">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Prova
            </Button>
          </Link>
          <Link href="/alunos?action=importar">
            <Button variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              Importar Alunos
            </Button>
          </Link>
          <Link href="/respostas">
            <Button variant="secondary">
              <FileText className="w-4 h-4 mr-2" />
              Inserir Respostas
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Exams */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Provas Recentes
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : provas.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Nenhuma prova cadastrada</p>
            <Link href="/provas/nova">
              <Button>Criar primeira prova</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {provas.slice(0, 5).map((prova) => (
              <Link
                key={prova.id}
                href={`/provas/${prova.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{prova.codigo}</h3>
                  <p className="text-sm text-gray-500">
                    {prova.descricao || "Sem descricao"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {prova.total_alunos} alunos
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(prova.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
