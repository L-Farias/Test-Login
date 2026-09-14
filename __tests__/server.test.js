// __tests__/server.test.js
const request = require('supertest');

// Força a variável de ambiente para que o server.js use o banco ':memory:'
process.env.NODE_ENV = 'test';
const app = require('../server'); 

describe('Suíte de Testes - ERP Seguro com PDV e SQLite', () => {
    let tokenAuth = '';

    // Aguarda meio segundo para garantir que o SQLite em memória criou as tabelas 
    // e inseriu a massa de dados antes de iniciar os testes.
    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
    });

    describe('1. Autenticação e Regras de Negócio', () => {
        
        it('Deve bloquear acesso à rota de produtos sem token', async () => {
            const res = await request(app).get('/api/produtos');
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Acesso negado.');
        });

        it('Deve logar com a massa de dados padrão (admin / Admin@2026)', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({ usuario: 'admin', senha: 'Admin@2026' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            
            // Salva o token para ser usado nos próximos testes
            tokenAuth = res.body.token; 
        });
    });

    describe('2. Gestão de Usuários (Segurança CIDA)', () => {

        it('Deve REJEITAR usuário se o login iniciar com caractere especial', async () => {
            const res = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${tokenAuth}`)
                .send({ nome: 'Teste Inválido', usuario: '@admin2', senha: 'SenhaForte@123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Login não pode iniciar com caracteres especiais/);
        });

        it('Deve REJEITAR usuário se a senha não contiver número e símbolo', async () => {
            const res = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${tokenAuth}`)
                .send({ nome: 'Teste Inválido', usuario: 'admin3', senha: 'senhasemnada' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Senha deve conter números e caracteres especiais/);
        });

        it('Deve CRIAR um usuário válido e listar ocultando a senha', async () => {
            // 1. Criação do usuário
            const resCriar = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${tokenAuth}`)
                .send({ nome: 'Operador Padrão', usuario: 'operador1', senha: 'Operador@123' });
            
            expect(resCriar.statusCode).toBe(201);

            // 2. Busca dos usuários para validar a visualização e confidencialidade
            const resBuscar = await request(app)
                .get('/api/usuarios')
                .set('Authorization', `Bearer ${tokenAuth}`);
            
            expect(resBuscar.statusCode).toBe(200);
            
            // Procura o usuário que acabamos de criar na lista
            const usuarioCriado = resBuscar.body.find(u => u.usuario === 'operador1');
            expect(usuarioCriado).toBeDefined();
            expect(usuarioCriado.nome).toBe('Operador Padrão');
            
            // Garante que o Hash da senha NÃO foi enviado para a API (Confidencialidade)
            expect(usuarioCriado.senha).toBeUndefined();
        });
    });

    describe('3. Sistema de Checkout e Carrinho', () => {
        // ID 1: Televisão 4K 55" (R$ 2899.00) 
        // ID 2: PC Gamer RTX 4060 (R$ 4599.00)

        it('Deve REJEITAR pagamento se o valorPago não bater com os produtos', async () => {
            const res = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${tokenAuth}`)
                .send({ 
                    itensCarrinho: [{ id: 1, quantidade: 1 }], 
                    valorPago: 1500.00 // Errado, a TV custa 2899
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/diverge do total/);
        });

        it('Deve APROVAR pagamento com o valor exato calculado pelo backend', async () => {
            // 2 TVs (2 * 2899 = 5798) + 1 PC (4599) = 10397.00
            const res = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${tokenAuth}`)
                .send({ 
                    itensCarrinho: [{ id: 1, quantidade: 2 }, { id: 2, quantidade: 1 }], 
                    valorPago: 10397.00 
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.total).toBe(10397.00);
        });
    });
});