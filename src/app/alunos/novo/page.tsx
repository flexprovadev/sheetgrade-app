"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useProvas, useCreateAluno } from "@/lib/queries";

const schema = z.object({
  prova_id: z.string().min(1, "Selecione uma prova"),
  aluno_id_externo: z.string().min(1, "ID externo e obrigatorio"),
  nome: z.string().min(1, "Nome e obrigatorio"),
});

type FormData = z.infer<typeof schema>;

export default function NovoAlunoPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: provasData, isLoading: loadingProvas } = useProvas();
  const createAluno = useCreateAluno();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const provas = provasData?.items || [];

  const onSubmit = async (data: FormData) => {
    try {
      await createAluno.mutateAsync({
        provaId: Number(data.prova_id),
        data: {
          aluno_id_externo: data.aluno_id_externo,
          nome: data.nome,
        },
      });
      addToast("success", "Aluno cadastrado com sucesso");
      router.push("/alunos");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao cadastrar aluno");
    }
  };

  return (
    <PageContainer
      title="Novo Aluno"
      description="Cadastre um novo aluno no sistema"
    >
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Select
            label="Prova"
            placeholder="Selecione uma prova"
            options={provas.map((p) => ({ value: p.id, label: p.codigo }))}
            error={errors.prova_id?.message}
            disabled={loadingProvas}
            {...register("prova_id")}
          />

          <Input
            label="ID Externo"
            placeholder="Ex: 12345"
            error={errors.aluno_id_externo?.message}
            {...register("aluno_id_externo")}
          />

          <Input
            label="Nome Completo"
            placeholder="Ex: Joao da Silva"
            error={errors.nome?.message}
            {...register("nome")}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={createAluno.isPending}>
              Cadastrar Aluno
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
