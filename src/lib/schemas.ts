import { z } from "zod";

// ─────────────────────────────────────────
// Campos compartilhados
// ─────────────────────────────────────────

const FonteSchema = z.object({
    fonteLivro: z.string(),
    fontePagina: z.string(),
});

// ─────────────────────────────────────────
// Poderes
// ─────────────────────────────────────────

export const PoderSchema = z
    .object({
        id: z.string(),
        codigo: z.number().int().positive(),
        nome: z.string(),
        tipo: z.enum(["Geral", "Combatente", "Especialista", "Ocultista", "Sacrifício", "Paranormal"]),
        elemento: z.string().nullable(),
        descricao: z.string(),
        preRequisitos: z.string().nullable(),
        afinidade: z.string().nullable(),
    })
    .merge(FonteSchema)
    .refine((p) => !(p.afinidade !== null && p.elemento === null), {
        message: "Poder com afinidade deve ter elemento",
        path: ["afinidade"],
    });

export type Poder = z.infer<typeof PoderSchema>;

// ─────────────────────────────────────────
// Equipamentos
// ─────────────────────────────────────────

const ArmaSchema = z.object({
    armaTipo: z.string(),
    empunhadura: z.string().nullable(),
    catArma: z.string().nullable(),
    municao: z.string().nullable(),
});

export const EquipamentoSchema = z
    .object({
        id: z.string(),
        codigo: z.number().int().positive(),
        nome: z.string(),
        tipo: z.array(z.string()).min(1),
        subtipo: z.string().nullable(),
        categoria: z.string().nullable(), 
        espaco: z.number().nullable(),
        descricao: z.string(),
        elemento: z.string().nullable(),
        dano: z.string().nullable(),
        critico: z.string().nullable(),
        alcance: z.string().nullable(),
        tipoDano: z.string().nullable(),
        arma: ArmaSchema.nullable(),
    })
    .merge(FonteSchema);

export type Equipamento = z.infer<typeof EquipamentoSchema>;

// ─────────────────────────────────────────
// Origens
// ─────────────────────────────────────────

export const OrigemSchema = z
    .object({
        id: z.string(),
        codigo: z.number().int().positive(),
        nome: z.string(),
        descricao: z.string(),
        pericias: z.string(),
        tecnicaNome: z.string(),
        tecnicaDescricao: z.string(),
    })
    .merge(FonteSchema);

export type Origem = z.infer<typeof OrigemSchema>;

// ─────────────────────────────────────────
// Rituais
// ─────────────────────────────────────────

const AprimoramentoSchema = z.object({
    nome: z.string(),
    custo: z.string(),
    descricao: z.string(),
});

export const RitualSchema = z
    .object({
        id: z.string(),
        codigo: z.number().int().positive(),
        nome: z.string(),
        elemento: z.array(z.string()).min(1),
        circulo: z.number().int().min(1).max(4),
        execucao: z.string(),
        alcance: z.string(),
        alvo: z.string().nullable(),
        area: z.string().nullable(),
        duracao: z.string().nullable(),
        resistencia: z.string().nullable(),
        descricao: z.string(),
        aprimoramentos: z.array(AprimoramentoSchema).nullable(),
    })
    .merge(FonteSchema);

export type Ritual = z.infer<typeof RitualSchema>;

// ─────────────────────────────────────────
// Trilhas
// ─────────────────────────────────────────

export const TrilhaSchema = z
    .object({
        id: z.string(),
        codigo: z.number().int().positive(),
        nome: z.string(),
        tipo: z.string(),
        descricao: z.string().nullable(),
        especial: z.string().nullable(),
        // nex10 e nex40 são obrigatórios; nex65 e nex99 podem não existir
        // (também usados para estágio 2 e 4 em trilhas de Sobrevivente)
        nex10: z.string(),
        nex40: z.string(),
        nex65: z.string().nullable(),
        nex99: z.string().nullable(),
    })
    .merge(FonteSchema);

export type Trilha = z.infer<typeof TrilhaSchema>;

export const RegraSchema = z
    .object({
        id: z.string(),
        codigo: z.number().int().positive(),
        nome: z.string(),
        categoria: z.array(z.string()).min(1),
        descricao: z.string(),
    })
    .merge(FonteSchema);

export type Regra = z.infer<typeof RegraSchema>;