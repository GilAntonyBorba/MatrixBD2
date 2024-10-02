const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bodyParser = require('body-parser'); // para processar os dados enviados pelo formulário
const argon2 = require('argon2'); // MODIFICADO: substituímos bcrypt por argon2

const app = express();
app.use(cors());  // Habilita CORS para permitir requisições do front-end

app.use(bodyParser.json());  // Para processar JSON
app.use(bodyParser.urlencoded({ extended: true }));  //permite que o servidor Express processe dados de formulários HTML, enviados via POST

// Configuração do cliente PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Matrix1',
  password: 'phoenix',
  port: 5432,
});

// Conecta ao banco de dados
client.connect()
  .then(() => console.log('Conectado ao banco de dados'))
  .catch(err => console.error('Erro de conexão', err.stack));

// Rota para pegar os dados dos jogadores
// app.get('/players', (req, res) => {
//   const query = 'SELECT id_player, nome_player, mana, classe FROM Player';
  
//   client.query(query, (err, result) => {
//     if (err) {
//       console.error('Erro na consulta', err.stack);
//       res.status(500).send('Erro ao consultar jogadores');
//     } else {
//       res.json(result.rows);  // Retorna os dados em formato JSON
//     }
//   });
// });


//Para receber os dados de criação de conta e os inserir na tabela correspondente
//OBS: npm install body-parser

// Rota para criar um novo usuário, via (POST)
app.post('/createAccount', async (req, res) => {
  //async transforma a função em uma função assíncrona, permitindo o uso de await dentro dela. Isso faz com que o código espere pela conclusão de uma operação assíncrona (como o hashing da senha) antes de continuar para a próxima linha.
  const { user_login, user_senha } = req.body;  // Obtém dados do formulário

  if (!user_login || !user_senha) {
    return res.status(400).send('Login e user_senha são obrigatórios'); //status 400 (Bad Request)
  }

  try {
    // Faz o hash da senha
    const hashedPassword = await argon2.hash(user_senha);

    const query = 'INSERT INTO Usuario (login, senha) VALUES ($1, $2)';  //Placeholders para injeção SQL
    //RETURNING id_user: util caso você precise usá-lo mais tarde, mas aqui ele não está sendo utilizado.
  
    client.query(query, [user_login, hashedPassword], (err, result) => {
      if (err) {
        //console.error('Erro ao inserir usuário', err.stack); //stack trace do erro (err.stack), contém informações detalhadas sobre onde e como o erro ocorreu.
        const errorMessage = err.detail || err.message || 'Erro ao criar conta - Internal Server Error';
        return res.status(500).send(`Erro ao criar conta: ${errorMessage}`); //status 500 (Internal Server Error) 
      } else {
        res.status(200).send('Conta criada com sucesso'); // status 200 (OK) 
      }
    });
  } catch (error) {
    console.error('Erro ao criar conta', error);
    res.status(500).send('Erro ao criar conta');
  }

});


// Inicia o servidor na porta 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
