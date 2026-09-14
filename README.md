# 🛡️ ERP Seguro & PDV

Um sistema leve e seguro de Planejamento de Recursos Empresariais (ERP) e Ponto de Venda (PDV), construído com arquitetura Client-Server, foco nos princípios da Segurança da Informação (CIDA) e navegação fluida via SPA (Single Page Application).

## ✨ Principais Funcionalidades

- **Segurança Robusta (CIDA):** Autenticação com JWT, hash de senhas com Bcrypt e validação via Regex.
- **Single Page Application (SPA):** Navegação instantânea utilizando a History API do HTML5, sem recarregamento de páginas.
- **PDV e Carrinho Antifraude:** Adição de produtos ao carrinho com recálculo e validação transacional realizada exclusivamente no backend.
- **Banco de Dados Embutido:** Utiliza SQLite para persistência de dados em produção e banco em memória (`:memory:`) para testes ultrarrápidos.
- **Gestão de Usuários:** Interface de cadastro com tabelas que omitem dados sensíveis (Confidencialidade).
- **Roteamento Inteligente:** Rotas de *Fallback (Catch-all)* no Express permitindo atualização (F5) em qualquer URL da aplicação.

## 🛠️ Tecnologias Utilizadas

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/) (via libs `sqlite3` e `sqlite`)
- [Bcrypt](https://www.npmjs.com/package/bcrypt) (Hash de senhas)
- [JSON Web Token (JWT)](https://jwt.io/) (Sessões seguras)

**Frontend:**
- HTML5, CSS3 e JavaScript Vanilla (Sem uso de frameworks para máxima performance)
- History API (Roteamento nativo)

**Testes e DevOps:**
- [Jest](https://jestjs.io/) & [Supertest](https://www.npmjs.com/package/supertest) (Testes Unitários e de Integração)
- [Cypress](https://www.cypress.io/) (Testes E2E - Interface)
- [PM2](https://pm2.keymetrics.io/) (Gerenciador de Processos para Produção)

---

## 🚀 Como Instalar e Executar

### Pré-requisitos
Certifique-se de ter o **Node.js** (versão 18+ recomendada) instalado na sua máquina.

### 1. Clonando e Instalando
```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/erp-seguro.git](https://github.com/seu-usuario/erp-seguro.git)
](https://github.com/L-Farias/Test-Login.git)

# Acesse a pasta do projeto
cd erp-seguro

# Instale as dependências
npm install
