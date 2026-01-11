"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Upload, Search, Trash2, Edit2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableEmptyState,
  TablePagination,
} from "@/components/ui/Table";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAlunos, useProvas, useDeleteAluno } from "@/lib/queries";

export default function AlunosPage() {
  const [page, setPage] = useState(1);
  const [provaId, setProvaId] = useState<number | undefined>();
  const [busca, setBusca] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { addToast } = useToast();
  const { data: provasData } = useProvas();
  const { data: alunosData, isLoading } = useAlunos(page, 20, provaId, busca);
  const deleteAluno = useDeleteAluno();

  const provas = provasData?.items || [];
  const alunos = alunosData?.items || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAluno.mutateAsync(deleteId);
      addToast("success", "Aluno excluido com sucesso");
      setDeleteId(null);
    } catch (error) {
      addToast("error", "Erro ao excluir aluno");
    }
  };

  return (
    <PageContainer
      title="Alunos"
      description="Gerencie os alunos cadastrados no sistema"
      action={
        <div className="flex gap-2">
          <Link href="/alunos/importar">
            <Button variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
          </Link>
          <Link href="/alunos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          </Link>
        </div>
      }
    >
      <Card>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou ID..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={provaId?.toString() || ""}
              onChange={(e) => {
                setProvaId(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              options={[
                { value: "", label: "Todas as provas" },
                ...provas.map((p) => ({ value: p.id, label: p.codigo })),
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID Externo</TableHeader>
              <TableHeader>Nome</TableHeader>
              <TableHeader>Prova</TableHeader>
              <TableHeader className="w-24">Acoes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                </TableCell>
              </TableRow>
            ) : alunos.length === 0 ? (
              <TableEmptyState
                message="Nenhum aluno encontrado"
                action={
                  <Link href="/alunos/novo">
                    <Button size="sm">Cadastrar aluno</Button>
                  </Link>
                }
              />
            ) : (
              alunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className="font-mono">
                    {aluno.aluno_id_externo}
                  </TableCell>
                  <TableCell>{aluno.nome}</TableCell>
                  <TableCell>
                    {provas.find((p) => p.id === aluno.prova_id)?.codigo || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/alunos/${aluno.id}/editar`}>
                        <button className="p-1 text-gray-400 hover:text-primary-600 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteId(aluno.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {alunosData && alunosData.pages > 1 && (
          <TablePagination
            currentPage={page}
            totalPages={alunosData.pages}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Aluno"
        message="Tem certeza que deseja excluir este aluno? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        isLoading={deleteAluno.isPending}
      />
    </PageContainer>
  );
}
