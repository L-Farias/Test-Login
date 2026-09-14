// server.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 8888;
const JWT_SECRET = 'sua_chave_secreta_super_segura_aqui';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

// ==========================================
// CONFIGURAÇÃO DO BANCO DE DADOS (SQLITE)
// ==========================================
async function initDB() {
    const dbSource = process.env.NODE_ENV === 'test' ? ':memory:' : './database.sqlite';
    db = await open({ filename: dbSource, driver: sqlite3.Database });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, usuario TEXT UNIQUE, senha TEXT);
        CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, preco REAL);
    `);

    const countUsers = await db.get('SELECT COUNT(*) as count FROM usuarios');
    if (countUsers.count === 0) {
        const salt = await bcrypt.genSalt(10);
        const senhaSegura = await bcrypt.hash('Admin@2026', salt); 
        
        await db.run('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', ['Admin do Sistema', 'admin', senhaSegura]);
        await db.run('INSERT INTO produtos (nome, preco) VALUES (?, ?)', ['Televisão 4K 55"', 2899.00]);
        await db.run('INSERT INTO produtos (nome, preco) VALUES (?, ?)', ['PC Gamer RTX 4060', 4599.00]);
        await db.run('INSERT INTO produtos (nome, preco) VALUES (?, ?)', ['Home Theater', 1150.00]);
    }
}

// ==========================================
// MIDDLEWARES E VALIDAÇÕES
// ==========================================
function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acesso negado.' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        req.user = user;
        next();
    });
}

function validarRegrasUsuario(usuario, senha) {
    const loginValido = /^[a-zA-Z0-9]/.test(usuario);
    const senhaValida = /(?=.*\d)(?=.*[^a-zA-Z0-9\s])/.test(senha);
    return { loginValido, senhaValida };
}

// ==========================================
// ROTAS DA API
// ==========================================

app.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;
    const user = await db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    if (!user) return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ success: false, message: 'Senha incorreta.' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token });
});

app.get('/api/usuarios', verificarToken, async (req, res) => {
    // Retorna todos os usuários EXCETO a senha (Confidencialidade)
    const usuarios = await db.all('SELECT id, nome, usuario FROM usuarios');
    res.json(usuarios);
});

app.post('/api/usuarios', verificarToken, async (req, res) => {
    const { nome, usuario, senha } = req.body;
    
    const { loginValido, senhaValida } = validarRegrasUsuario(usuario, senha);
    if (!loginValido) return res.status(400).json({ success: false, message: 'Login não pode iniciar com caracteres especiais.' });
    if (!senhaValida) return res.status(400).json({ success: false, message: 'Senha deve conter números e caracteres especiais.' });

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        await db.run('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', [nome, usuario, senhaHash]);
        res.status(201).json({ success: true, message: 'Usuário criado!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login já existe.' });
    }
});

app.get('/api/produtos', verificarToken, async (req, res) => {
    const produtos = await db.all('SELECT * FROM produtos');
    res.json(produtos);
});

app.post('/api/checkout', verificarToken, async (req, res) => {
    const { itensCarrinho, valorPago } = req.body;
    if (!itensCarrinho || itensCarrinho.length === 0) return res.status(400).json({ success: false, message: 'Carrinho vazio.' });

    let totalCalculado = 0;
    for (let item of itensCarrinho) {
        const produtoDb = await db.get('SELECT preco FROM produtos WHERE id = ?', [item.id]);
        if (produtoDb) totalCalculado += produtoDb.preco * item.quantidade;
    }

    if (totalCalculado <= 0) return res.status(400).json({ success: false, message: 'Valor inválido.' });
    if (parseFloat(valorPago).toFixed(2) !== parseFloat(totalCalculado).toFixed(2)) {
        return res.status(400).json({ success: false, message: `O valor pago diverge do total (R$ ${totalCalculado}).` });
    }

    res.status(200).json({ success: true, message: 'Pagamento aprovado!', total: totalCalculado });
});

app.get(/'*'/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


initDB().then(() => {
    if (require.main === module) {
        app.listen(PORT, () => console.log(`🚀 Servidor rodando: http://localhost:${PORT}`));
    }
});

module.exports = app;