# Funil da página de sugestões

Mede quantas pessoas abrem `/sugestao`, quantas começam a preencher e quantas
enviam, cruzando por aparelho, sistema e origem do QR code.

## Como está montado

A página **não fala com o banco**. Ela envia para dois endpoints do próprio
servidor, que gravam usando a chave de serviço:

| Etapa | Quando dispara | Para onde vai |
|---|---|---|
| **A — acesso** | ao carregar a página | `POST /api/funil` |
| **B — interação** | primeiro foco ou digitação em qualquer campo | `POST /api/funil` (`acao: "interacao"`) |
| **C — envio** | ao enviar a sugestão | `POST /api/sugestao` |

Nenhuma credencial do Supabase existe no HTML da página. O papel `anon` não tem
permissão alguma nas tabelas novas — abrir o código-fonte não dá acesso a nada.

Recarregar a página na mesma aba **reaproveita** o registro: o identificador
fica em `sessionStorage` e a gravação é um `upsert` que ignora conflito. Um
segundo identificador, em `localStorage`, estima pessoas únicas.

## Configuração

### 1. Aplicar a migração

```bash
supabase db push
```

Ou cole o conteúdo de `supabase/migrations/20260819210000_funil_sugestoes.sql`
no SQL Editor do painel do Supabase.

Isso cria `visitas`, `sugestoes`, `painel_admins`, as cinco visões do funil e as
regras de acesso. **Nenhuma tabela existente é alterada.**

### 2. Definir a chave de serviço

Os endpoints precisam de `SUPABASE_SERVICE_ROLE_KEY`, que hoje **não existe** no
ambiente — sem ela o funil não grava (mas o site continua funcionando normalmente).

Pegue em: Supabase → Project Settings → API → `service_role`.

No `.env` local:

```
SUPABASE_SERVICE_ROLE_KEY=cole_a_chave_aqui
```

E também no ambiente do deploy. **Esta chave ignora todas as regras de acesso do
banco — ela nunca pode ir para o navegador nem para o repositório.**

> Ao concluir este passo o funil comeca a gravar IP e identificador de aparelho.
> **Descomente o aviso de LGPD no `index.html` antes de publicar.**

### 3. Liberar o seu acesso ao painel

O painel fica em `/painel` e exige conta criada em `/auth/signup`. Depois de
criar a conta, rode no SQL Editor:

```sql
INSERT INTO public.painel_admins (email) VALUES ('seu-email@exemplo.com');
```

Sem essa linha, a tela mostra "Sem permissão" — e o banco não devolve nenhum
dado, mesmo que alguém chame a API por fora.

### 4. Marcar a origem de cada QR code

Acrescente `?src=` ao endereço de cada material impresso:

```
https://seusite.com/sugestao?src=cartaz-portaria
https://seusite.com/sugestao?src=elevador-bloco-a
https://seusite.com/sugestao?src=panfleto
```

Sem o parâmetro, a visita entra como "sem origem". O painel agrupa por esse
valor, e é assim que você descobre qual material converteu melhor.

## Como testar se está registrando

1. Abra `/sugestao?src=teste` numa aba anônima.
2. Confira no banco que apareceu uma linha nova:
   ```sql
   SELECT criado_em, origem, tipo_aparelho, sistema, navegador, iniciou_em, enviou_em
   FROM visitas ORDER BY criado_em DESC LIMIT 5;
   ```
   Deve haver uma linha com `origem = 'teste'` e `iniciou_em` nulo.
3. Clique em qualquer campo do formulário e rode a consulta de novo:
   `iniciou_em` deve estar preenchido.
4. Recarregue a página (F5) e confira que **não** surgiu uma segunda linha.
5. Envie uma mensagem de teste. Agora `enviou_em` fica preenchido e a sugestão
   aparece em `SELECT * FROM sugestoes ORDER BY criado_em DESC LIMIT 1`.
6. Abra `/painel` e veja os quatro números.

Para limpar os dados de teste depois:

```sql
DELETE FROM sugestoes WHERE visita_id IN (SELECT id FROM visitas WHERE origem = 'teste');
DELETE FROM visitas WHERE origem = 'teste';
```

### Se o funil não registrar

O rastreio é silencioso de propósito: ele **nunca** mostra erro ao visitante nem
interrompe o envio da sugestão. Para descobrir o motivo, olhe o log do servidor
— as falhas saem com o prefixo `[funil]`.

Causas mais comuns: `SUPABASE_SERVICE_ROLE_KEY` ausente, migração não aplicada,
ou bloqueador de anúncios no navegador do visitante (nesse caso o envio da
sugestão continua funcionando, só a medição se perde).

## Limitações conhecidas

- **`memoria_gb` e `conexao` só existem em navegadores Chromium.** No iPhone
  vêm sempre nulos. Como boa parte do acesso por QR code é iOS, espere essas
  duas colunas majoritariamente vazias. Núcleos de CPU funciona em todo lugar.
- **A cidade depende da Cloudflare.** O IP e o país vêm por padrão; a cidade só
  aparece se `request.cf` estiver disponível no runtime. Quando não vem, fica
  nula e o resto segue normal.
- **Pessoas únicas é estimativa.** Quem limpa o navegador, usa aba anônima ou
  troca de aparelho conta de novo.
- **A gravação da sugestão é "melhor esforço".** O e-mail e o WhatsApp continuam
  sendo os canais principais e disparam antes: se o banco estiver fora do ar, a
  mensagem chega a você do mesmo jeito, só não fica registrada.

## Privacidade (LGPD)

- O IP é gravado **mascarado**: `189.45.12.77` vira `189.45.12.0`.
- Não há GPS, câmera, notificação nem fingerprinting de canvas, WebGL ou áudio.
  Nada pede permissão ao visitante.
- **O aviso na página está desativado.** Enquanto o funil não grava nada, ele
  foi comentado no HTML a pedido. O bloco continua em `index.html`, logo
  abaixo do `<div class="status">`, pronto para descomentar.
  **Descomente ao concluir os passos 1 e 2 desta página**: a partir dali
  passam a ser gravados IP e identificador de aparelho, que são dados
  pessoais pela Lei 13.709/2018.
- Para atender a um pedido de exclusão:
  ```sql
  DELETE FROM sugestoes WHERE telefone = '51999998888';
  ```
