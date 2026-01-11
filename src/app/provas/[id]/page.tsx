"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Upload,
  Play,
  Trash2,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader } from "@/components/ui/Card";
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
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { FileUpload } from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  useProva,
  useQuestoes,
  useAlunos,
  useCorrigirProva,
  useDeleteQuestao,
  useImportQuestoesCsv,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function ProvaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const provaId = Number(params.id);
  const { addToast } = useToast();

  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteQuestaoId, setDeleteQuestaoId] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [colId, setColId] = useState("col01");
  const [colQuestao, setColQuestao] = useState("col02");
  const [colTipo, setColTipo] = useState("col03");
  const [colGabarito, setColGabarito] = useState("col04");

  const { data: prova, isLoading: loadingProva } = useProva(provaId);
  const { data: questoes, isLoading: loadingQuestoes } = useQuestoes(provaId);
  const { data: alunosData } = useAlunos(1, 5, provaId);

  const corrigir = useCorrigirProva();
  const deleteQuestao = useDeleteQuestao();
  const importQuestoes = useImportQuestoesCsv();

  const handleCorrigir = async () => {
    try {
      const result = await corrigir.mutateAsync({
        provaId,
        incluirDetalhes: true,
      });
      addToast("success", result.message);
      router.push(`/resultados/${provaId}`);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro na correcao");
    }
  };

  const handleDeleteQuestao = async () => {
    if (!deleteQuestaoId) return;
    try {
      await deleteQuestao.mutateAsync(deleteQuestaoId);
      addToast("success", "Questao excluida");
      setDeleteQuestaoId(null);
    } catch (error) {
      addToast("error", "Erro ao excluir questao");
    }
  };

  const handleImportQuestoes = async () => {
    if (!importFile) return;
    try {
      const result = await importQuestoes.mutateAsync({
        provaId,
        file: importFile,
        colId,
        colQuestao,
        colTipo,
        colGabarito,
      });
      addToast("success", result.message);
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao importar");
    }
  };

  if (loadingProva) {
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
          <Link href="/provas">
            <Button className="mt-4">Voltar para provas</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  const alunos = alunosData?.items || [];

  return (
    <PageContainer
      title={prova.codigo}
      description={prova.descricao || `Versao ${prova.versao}`}
      action={
        <Button
          onClick={handleCorrigir}
          isLoading={corrigir.isPending}
          disabled={!questoes?.length || !alunos.length}
        >
          <Play className="w-4 h-4 mr-2" />
          Corrigir Prova
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Alunos</p>
              <p className="text-xl font-semibold">{prova.total_alunos}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Questoes</p>
              <p className="text-xl font-semibold">{prova.total_questoes}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Criada em</p>
              <p className="text-xl font-semibold">{formatDate(prova.created_at)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Questoes */}
      <Card className="mb-8">
        <CardHeader
          title="Questoes (Gabarito)"
          description="Lista de questoes com suas respostas corretas"
          action={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
              <Link href={`/provas/${provaId}/questoes/nova`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Questao
                </Button>
              </Link>
            </div>
          }
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Ordem</TableHeader>
              <TableHeader>Codigo</TableHeader>
              <TableHeader>Tipo</TableHeader>
              <TableHeader>Gabarito</TableHeader>
              <TableHeader className="w-16">Acoes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingQuestoes ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
                </TableCell>
              </TableRow>
            ) : !questoes?.length ? (
              <TableEmptyState
                message="Nenhuma questao cadastrada"
                action={
                  <Button size="sm" onClick={() => setShowImportModal(true)}>
                    Importar gabarito
                  </Button>
                }
              />
            ) : (
              questoes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.ordem}</TableCell>
                  <TableCell className="font-mono">{q.codigo_questao}</TableCell>
                  <TableCell>
                    <Badge size="sm">{q.tipo}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{q.gabarito}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => setDeleteQuestaoId(q.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Alunos Preview */}
      <Card>
        <CardHeader
          title="Alunos"
          description={`${prova.total_alunos} aluno(s) cadastrado(s)`}
          action={
            <Link href={`/alunos?prova_id=${provaId}`}>
              <Button variant="secondary" size="sm">
                Ver todos
              </Button>
            </Link>
          }
        />
        {alunos.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Nenhum aluno cadastrado</p>
            <Link href={`/alunos/importar?prova_id=${provaId}`}>
              <Button size="sm">Importar alunos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {alunos.map((aluno) => (
              <div
                key={aluno.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{aluno.nome}</p>
                  <p className="text-sm text-gray-500">
                    ID: {aluno.aluno_id_externo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importar Gabarito (CSV)"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleImportQuestoes}
              isLoading={importQuestoes.isPending}
              disabled={!importFile}
            >
              Importar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FileUpload
            accept=".csv"
            onFileSelect={setImportFile}
            helperText="Arquivo CSV com o mapa/gabarito da prova"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Coluna ID"
              value={colId}
              onChange={(e) => setColId(e.target.value)}
            />
            <Input
              label="Coluna Questao"
              value={colQuestao}
              onChange={(e) => setColQuestao(e.target.value)}
            />
            <Input
              label="Coluna Tipo"
              value={colTipo}
              onChange={(e) => setColTipo(e.target.value)}
            />
            <Input
              label="Coluna Gabarito"
              value={colGabarito}
              onChange={(e) => setColGabarito(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteQuestaoId !== null}
        onClose={() => setDeleteQuestaoId(null)}
        onConfirm={handleDeleteQuestao}
        title="Excluir Questao"
        message="Tem certeza que deseja excluir esta questao?"
        isLoading={deleteQuestao.isPending}
      />
    </PageContainer>
  );
}
