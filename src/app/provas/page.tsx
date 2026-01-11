"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye, Upload } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
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
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useProvas, useDeleteProva } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function ProvasPage() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { addToast } = useToast();
  const { data: provasData, isLoading } = useProvas();
  const deleteProva = useDeleteProva();

  const provas = provasData?.items || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProva.mutateAsync(deleteId);
      addToast("success", "Prova excluida com sucesso");
      setDeleteId(null);
    } catch (error) {
      addToast("error", "Erro ao excluir prova");
    }
  };

  return (
    <PageContainer
      title="Provas"
      description="Gerencie as provas cadastradas no sistema"
      action={
        <div className="flex gap-2">
          <Link href="/provas/importar">
            <Button variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              Importar YAML
            </Button>
          </Link>
          <Link href="/provas/nova">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Prova
            </Button>
          </Link>
        </div>
      }
    >
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Codigo</TableHeader>
              <TableHeader>Versao</TableHeader>
              <TableHeader>Descricao</TableHeader>
              <TableHeader>Alunos</TableHeader>
              <TableHeader>Questoes</TableHeader>
              <TableHeader>Criado em</TableHeader>
              <TableHeader className="w-24">Acoes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                </TableCell>
              </TableRow>
            ) : provas.length === 0 ? (
              <TableEmptyState
                message="Nenhuma prova cadastrada"
                action={
                  <Link href="/provas/nova">
                    <Button size="sm">Criar prova</Button>
                  </Link>
                }
              />
            ) : (
              provas.map((prova) => (
                <TableRow key={prova.id}>
                  <TableCell className="font-medium">{prova.codigo}</TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">
                      {prova.versao}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {prova.descricao || "-"}
                  </TableCell>
                  <TableCell>{prova.total_alunos}</TableCell>
                  <TableCell>{prova.total_questoes}</TableCell>
                  <TableCell>{formatDate(prova.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/provas/${prova.id}`}>
                        <button className="p-1 text-gray-400 hover:text-primary-600 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteId(prova.id)}
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
      </Card>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Prova"
        message="Tem certeza que deseja excluir esta prova? Todos os alunos, questoes e resultados serao removidos."
        confirmLabel="Excluir"
        isLoading={deleteProva.isPending}
      />
    </PageContainer>
  );
}
