# Mentary

Extrator de Questões e Módulo de Inteligência Avaliativa.

## Requisitos atuais

- Node.js **22.13 ou superior** (ou Node.js 24 ou superior) e npm.
- Conexão com a internet durante a instalação das dependências. No primeiro uso do OCR, o Tesseract.js também pode precisar baixar os dados do idioma português.
- Windows, macOS ou Linux.

Por enquanto, o projeto tem o backend de upload e extração. A interface frontend e a integração com banco de dados ainda não fazem parte deste passo; não é necessário configurar um banco para iniciar a API.

## Instalar e iniciar o backend

Abra um terminal na pasta do projeto e execute:

```powershell
cd src/backend
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3000`. Para confirmar que iniciou, acesse `http://localhost:3000/health` ou execute em outro terminal:

```powershell
curl.exe http://localhost:3000/health
```

A resposta esperada é:

```json
{"status":"ok"}
```

## Enviar um documento

O endpoint `POST /documents` recebe o arquivo no campo `document`. Neste momento, são aceitos PDF, PNG e JPG/JPEG, com tamanho máximo de 20 MB. PDFs podem ter até 50 páginas.

Exemplo no PowerShell, substituindo o caminho pelo arquivo desejado:

```powershell
curl.exe -F "document=@C:\caminho\para\prova.pdf" http://localhost:3000/documents
```

PDFs que já contêm texto são processados por extração direta. Imagens e PDFs escaneados passam pelo OCR em português. A resposta inclui o texto extraído, a quantidade de páginas e o método usado (`pdf-text` ou `ocr`).

## Verificar o projeto

Execute os comandos a partir de `src/backend`:

```powershell
npm test
npm run build
```

`npm test` executa os testes automatizados. `npm run build` verifica e compila o TypeScript para a pasta `src/backend/dist`.

## Estrutura

- `src/backend` — API e regras de negócio
- `src/frontend` — interface da aplicação (em desenvolvimento)
- `docs` — documentação do projeto
- `database` — scripts e estrutura do banco de dados
- `test` — testes automatizados do backend
