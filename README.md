# Minhas Finanças

App pessoal e local para registrar gastos e recebimentos, ver o saldo e projetar os próximos 6 ou 12 meses.

## O que você precisa

- [Node.js](https://nodejs.org/) (já instalado no seu PC)

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`).

## Abrir no celular (mesma Wi‑Fi)

1. PC e celular na **mesma rede Wi‑Fi**.
2. No PC, na pasta do projeto:

```bash
npm run dev:mobile
```

3. No terminal, procure a linha **Network** — algo como `http://192.168.1.10:5173/`.
4. No celular, abra o Chrome/Safari e digite esse endereço (use o IP do **seu** PC, não esse exemplo).

**Achar o IP no Windows** (se o terminal não mostrar):

```bash
ipconfig
```

Use o **Endereço IPv4** da rede Wi‑Fi (ex.: `192.168.0.15`). No celular: `http://192.168.0.15:5173`

**Firewall:** na primeira vez o Windows pode pedir permissão para o Node — marque redes **privadas** e permita.

**Dados:** o que você lançar no celular fica no navegador do celular; o do PC fica no PC (são separados).

Para testar o build (sem hot reload) na rede:

```bash
npm run build
npm run preview:mobile
```

## Como funciona

- **Menu Lançamentos**: formulários, tabelas de receitas e gastos, saldo.
- **Menu Projeção**: tabela 6/12 meses com filtros por tipo (recebimento/gasto) e categoria.
- **Dois formulários**: um só para recebimentos e outro só para gastos.
- **Duas tabelas**: receitas (positivo) e gastos (negativo), separadas.
- **Categorias**: Moradia, Alimentação, Salário, etc.
- **Fixo vs variável**: fixo repete na projeção todo mês; variável conta só no mês da data que você informou.
- **Projeção**: 6 ou 12 meses, com colunas para receita/gasto fixo e variável.
- **Dados**: ficam no `localStorage` do navegador — só na sua máquina.

## Scripts

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Desenvolvimento no PC (localhost) |
| `npm run dev:mobile` | Desenvolvimento acessível pelo IP na Wi‑Fi |
| `npm run build`| Gera pasta `dist` estática   |
| `npm run preview` | Testa o build no PC |
| `npm run preview:mobile` | Testa o build pelo IP na Wi‑Fi |

## Stack (propositalmente simples)

- TypeScript + Vite
- Tailwind CSS
- Sem React, sem backend, sem publicação
