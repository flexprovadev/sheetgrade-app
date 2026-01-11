"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { useToast } from "@/components/ui/Toast";
import { useProvas, useImportAlunosCsv } from "@/lib/queries";

export default function ImportarAlunosPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: provasData, isLoading: loadingProvas } = useProvas();
  const importAlunos = useImportAlunosCsv();

  const [provaId, setProvaId] = useState("");
  const [colId, setColId] = useState("col01");
  const [colNome, setColNome] = useState("col02");
  const [file, setFile] = useState<File | null>(null);

  const provas = provasData?.items || [];

  const handleImport = async () => {
    if (!provaId || !file) {
      addToast("error", "Selecione uma prova e um arquivo");
      return;
    }

    try {
      const result = await importAlunos.mutateAsync({
        provaId: Number(provaId),
        file,
        colId,
        colNome,
      });
      addToast("success", result.message);
      router.push("/alunos");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao importar alunos");
    }
  };

  return (
    <PageContainer
      title="Importar Alunos"
      description="Importe alunos a partir de um arquivo CSV"
    >
      <Card className="max-w-xl">
        <div className="space-y-6">
          <Select
            label="Prova"
            placeholder="Selecione uma prova"
            value={provaId}
            onChange={(e) => setProvaId(e.target.value)}
            options={provas.map((p) => ({ value: p.id, label: p.codigo }))}
            disabled={loadingProvas}
          />

          <FileUpload
            label="Arquivo CSV"
            accept=".csv"
            onFileSelect={setFile}
            helperText="O arquivo deve conter colunas com ID e nome dos alunos"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Coluna do ID"
              value={colId}
              onChange={(e) => setColId(e.target.value)}
              helperText="Nome da coluna com o ID externo"
            />
            <Input
              label="Coluna do Nome"
              value={colNome}
              onChange={(e) => setColNome(e.target.value)}
              helperText="Nome da coluna com o nome"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              isLoading={importAlunos.isPending}
              disabled={!provaId || !file}
            >
              Importar Alunos
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
