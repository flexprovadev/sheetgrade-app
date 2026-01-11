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
import { useProvas, useImportMarcacoesCsv } from "@/lib/queries";

export default function ImportarRespostasPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: provasData, isLoading: loadingProvas } = useProvas();
  const importMarcacoes = useImportMarcacoesCsv();

  const [provaId, setProvaId] = useState("");
  const [colControle, setColControle] = useState("col01");
  const [colImagem, setColImagem] = useState("col02");
  const [colAluno, setColAluno] = useState("col03");
  const [file, setFile] = useState<File | null>(null);

  const provas = provasData?.items || [];

  const handleImport = async () => {
    if (!provaId || !file) {
      addToast("error", "Selecione uma prova e um arquivo");
      return;
    }

    try {
      const result = await importMarcacoes.mutateAsync({
        provaId: Number(provaId),
        file,
        colControle,
        colImagem,
        colAluno,
      });
      addToast("success", result.message);
      router.push(`/provas/${provaId}`);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao importar");
    }
  };

  return (
    <PageContainer
      title="Importar Respostas"
      description="Importe as marcacoes dos alunos a partir de um arquivo CSV (OLAP)"
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
            label="Arquivo CSV (OLAP)"
            accept=".csv"
            onFileSelect={setFile}
            helperText="O arquivo deve conter as marcacoes dos alunos"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Coluna Controle"
              value={colControle}
              onChange={(e) => setColControle(e.target.value)}
            />
            <Input
              label="Coluna Imagem"
              value={colImagem}
              onChange={(e) => setColImagem(e.target.value)}
            />
            <Input
              label="Coluna Aluno"
              value={colAluno}
              onChange={(e) => setColAluno(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Formato esperado:</h3>
            <p className="text-sm text-gray-600 mb-2">
              As 3 primeiras colunas sao mapeadas acima. As demais colunas devem
              conter as respostas, na mesma ordem das questoes cadastradas.
            </p>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`col01,col02,col03,col04,col05,col06
1,img1.png,ALU001,C,E,A
2,img2.png,ALU002,E,C,B
3,img3.png,ALU003,C,C,A`}
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
              isLoading={importMarcacoes.isPending}
              disabled={!provaId || !file}
            >
              Importar Respostas
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
