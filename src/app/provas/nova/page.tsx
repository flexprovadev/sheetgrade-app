"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCreateProva } from "@/lib/queries";

const schema = z.object({
  codigo: z.string().min(1, "Codigo e obrigatorio"),
  versao: z.string().min(1, "Versao e obrigatoria"),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NovaProvaPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const createProva = useCreateProva();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      versao: "1.0",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const prova = await createProva.mutateAsync({
        codigo: data.codigo,
        versao: data.versao,
        descricao: data.descricao,
      });
      addToast("success", "Prova criada com sucesso");
      router.push(`/provas/${prova.id}`);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Erro ao criar prova");
    }
  };

  return (
    <PageContainer
      title="Nova Prova"
      description="Crie uma nova prova no sistema"
    >
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Codigo da Prova"
            placeholder="Ex: PROVA-2024-01"
            error={errors.codigo?.message}
            {...register("codigo")}
          />

          <Input
            label="Versao"
            placeholder="Ex: 1.0"
            error={errors.versao?.message}
            {...register("versao")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descricao
            </label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 transition-colors"
              rows={3}
              placeholder="Descricao opcional da prova..."
              {...register("descricao")}
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
            <Button type="submit" isLoading={createProva.isPending}>
              Criar Prova
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
