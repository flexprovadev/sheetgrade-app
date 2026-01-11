"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { useToast } from "@/components/ui/Toast";
import { useImportProvaYaml } from "@/lib/queries";

export default function ImportarProvaPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const importProva = useImportProvaYaml();
  const [file, setFile] = useState<File | null>(null);

  const handleImport = async () => {
    if (!file) {
      addToast("error", "Selecione um arquivo YAML");
      return;
    }

    try {
      const prova = await importProva.mutateAsync(file);
      addToast("success", `Prova '${prova.codigo}' importada com sucesso`);
      router.push(`/provas/${prova.id}`);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao importar prova");
    }
  };

  return (
    <PageContainer
      title="Importar Prova"
      description="Importe uma prova a partir de um arquivo YAML de configuracao"
    >
      <Card className="max-w-xl">
        <div className="space-y-6">
          <FileUpload
            label="Arquivo YAML"
            accept=".yml,.yaml"
            onFileSelect={setFile}
            helperText="Arquivo de configuracao da prova (prova.yml)"
          />

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Formato esperado:</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`codigo: "PROVA-2024-01"
versao: "1.0"
descricao: "Prova de exemplo"
alunos:
  col01: "ID"
  col02: "NOME"
mapa:
  colunas:
    col01: "ID"
    col02: "Questao"
    col03: "Tipo"
    col04: "GAB"
  obrigatorias: ["ID", "Questao", "Tipo"]
olap:
  col01: "Controle"
  col02: "Imagem"
  col03: "ID"`}
            </pre>
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
              isLoading={importProva.isPending}
              disabled={!file}
            >
              Importar Prova
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
