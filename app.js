const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());  // Habilita CORS para permitir requisições do front-end

// Configuração do cliente PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'PlayerInterface',
  password: 'phoenix',
  port: 5432,
});

// Conecta ao banco de dados
client.connect()
  .then(() => console.log('Conectado ao banco de dados'))
  .catch(err => console.error('Erro de conexão', err.stack));

// Rota para pegar os dados dos jogadores
app.get('/players', (req, res) => {
  const query = 'SELECT id_player, nome_player, mana, classe FROM Player';
  
  client.query(query, (err, result) => {
    if (err) {
      console.error('Erro na consulta', err.stack);
      res.status(500).send('Erro ao consultar jogadores');
    } else {
      res.json(result.rows);  // Retorna os dados em formato JSON
    }
  });
});

// Inicia o servidor na porta 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
