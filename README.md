# PlanOFit

Gerenciador de rotinas diárias com notificações push persistentes.

## Funcionalidades

- **Dashboard diário** — veja todas as rotinas do dia por status (pendente / feito / pulado)
- **Categorias** — Skin Care, Sono, Remédio, Alimentação, Bomba, Trabalho, Outros
- **Registro de conclusão** — registre o valor real feito (ex: 240ml quando a meta era 300ml)
- **Notificações push** — avisos persistentes que repetem até você confirmar
- **Relatórios** — acompanhe sua taxa de conclusão por dia, categoria e rotina
- **PWA** — instale no celular como app nativo

## Setup

### 1. Instale dependências

```bash
npm install
```

### 2. Gere as chaves VAPID (para notificações push)

```bash
npx web-push generate-vapid-keys
```

Cole as chaves no `.env`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="sua-chave-publica"
VAPID_PRIVATE_KEY="sua-chave-privada"
VAPID_EMAIL="mailto:seu@email.com"
DATABASE_URL="file:/caminho/absoluto/para/dev.db"
```

### 3. Configure o banco de dados

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts   # popula rotinas de exemplo
```

### 4. Rode o servidor

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Notificações Push

1. Abra o app no navegador
2. Clique em "Ativar notificações" no header
3. Permita as notificações quando o navegador perguntar
4. As notificações aparecem nos horários configurados em cada rotina
5. Ações: **Feito ✅** | **Snooze ⏰** | **Pular ❌**

> As notificações repetem conforme o intervalo configurado em cada rotina até você confirmar.

## Categorias

| Categoria | Emoji | Exemplos |
|-----------|-------|---------|
| Skin Care | ✨ | Hidratante, protetor solar |
| Sono | 😴 | Hora de dormir, meta de horas |
| Remédio | 💊 | Medicamentos |
| Alimentação | 🍽️ | Refeições, água |
| Bomba | 💪 | Pré-treino, proteína |
| Trabalho | 💼 | Reuniões, relatórios |
| Outros | 📌 | Qualquer outra rotina |

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma 7 + SQLite (via libsql)
- Web Push API (notificações nativas)
- PWA / Service Worker
- Tailwind CSS
