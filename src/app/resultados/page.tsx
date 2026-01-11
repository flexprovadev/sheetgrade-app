"use client";

import Link from "next/link";
import { Eye, BarChart3 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
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
import { useProvas } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function ResultadosPage() {
  const { data: provasData, isLoading } = useProvas();
  const provas = provasData?.items || [];

  return (
    <PageContainer
      title="Resultados"
      description="Visualize os resultados das provas corrigidas"
    >
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Prova</TableHeader>
              <TableHeader>Versao</TableHeader>
              <TableHeader>Alunos</TableHeader>
              <TableHeader>Questoes</TableHeader>
              <TableHeader>Data</TableHeader>
              <TableHeader className="w-24">Acoes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                </TableCell>
              </TableRow>
            ) : provas.length === 0 ? (
              <TableEmptyState message="Nenhuma prova cadastrada" />
            ) : (
              provas.map((prova) => (
                <TableRow key={prova.id}>
                  <TableCell className="font-medium">{prova.codigo}</TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">
                      {prova.versao}
                    </Badge>
                  </TableCell>
                  <TableCell>{prova.total_alunos}</TableCell>
                  <TableCell>{prova.total_questoes}</TableCell>
                  <TableCell>{formatDate(prova.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/resultados/${prova.id}`}>
                      <button className="p-1 text-gray-400 hover:text-primary-600 rounded flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Ver</span>
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
