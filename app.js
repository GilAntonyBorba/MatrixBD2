const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bodyParser = require('body-parser'); // para processar os dados enviados pelo formulário
const argon2 = require('argon2');
const multer = require('multer'); 

const app = express();
app.use(cors());  // Habilita CORS para permitir requisições do front-end

app.use(bodyParser.json());  // Para processar JSON
app.use(bodyParser.urlencoded({ extended: true }));  //permite que o servidor Express processe dados de formulários HTML, enviados via POST

// Configuração do cliente PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Matrix4',
  password: 'phoenix',
  port: 5432,
});

// Conecta ao banco de dados
client.connect()
  .then(() => console.log('Conectado ao banco de dados!'))
  .catch(err => console.error('Erro de conexão!', err.stack));

// Rota para pegar os dados dos jogadores
app.get('/usuarios', (req, res) => {
  const query = 'SELECT login, id_user, senha FROM Usuario';
  
  client.query(query, (err, result) => {
    if (err) {
      console.error('Erro na consulta', err.stack);
      res.status(500).send('Erro ao consultar jogadores');
    } else {
      res.json(result.rows);  // Retorna os dados em formato JSON
    }
  });
});


//Para receber os dados de criação de conta e os inserir na tabela correspondente
//OBS: npm install body-parser

// Rota para criar um novo usuário, via (POST)
app.post('/createAccount', async (req, res) => {
  //async transforma a função em uma função assíncrona, permitindo o uso de await dentro dela. Isso faz com que o código espere pela conclusão de uma operação assíncrona (como o hashing da senha) antes de continuar para a próxima linha.
  const { user_login, user_senha } = req.body;  // Obtém dados do formulário

  if (!user_login || !user_senha) {
    return res.status(400).send('Login e user_senha são obrigatórios!'); //status 400 (Bad Request)
  }

  try {
    // Faz o hash da senha
    const hashedPassword = await argon2.hash(user_senha);

    const query = 'INSERT INTO Usuario (login, senha) VALUES ($1, $2)';  //Placeholders para injeção SQL
    //RETURNING id_user: util caso você precise usá-lo mais tarde, mas aqui ele não está sendo utilizado.
  
    client.query(query, [user_login, hashedPassword], (err, result) => {
      if (err) {
        //console.error('Erro ao inserir usuário', err.stack); //stack trace do erro (err.stack), contém informações detalhadas sobre onde e como o erro ocorreu.
        const errorMessage = err.detail || err.message || 'Erro ao criar conta - Internal Server Error!';
        return res.status(500).send(`Erro ao criar conta! ${errorMessage}`); //status 500 (Internal Server Error) 
      } else {
        res.status(200).send('Conta criada com sucesso!'); // status 200 (OK) 
      }
    });
  } catch (error) {
    console.error('ERRO ao criar conta!', error);
    res.status(500).send('ERRO ao criar conta!');
  }

});


// Rota para login do usuário (POST)
app.post('/login', async (req, res) => {
  //async transforma a função em uma função assíncrona, permitindo o uso de await dentro dela. Isso faz com que o código espere pela conclusão de uma operação assíncrona (como o hashing da senha) antes de continuar para a próxima linha.
  const { user_login, user_senha } = req.body;// Obtém dados do formulário

  if (!user_login || !user_senha) {
    return res.status(400).send('Login e senha são obrigatórios!'); //status 400 (Bad Request)
  }

  try {
    const query = 'SELECT * FROM Usuario WHERE login = $1';
    const result = await client.query(query, [user_login]);

    if (result.rows.length === 0) {
      return res.status(401).send('Usuário não encontrado!');
    }

    const user = result.rows[0];

    // Verifica se a senha coincide
    const validPassword = await argon2.verify(user.senha, user_senha);
    if (!validPassword) {
      return res.status(401).send('Senha incorreta!');
    }

    res.status(200).send('Login realizado com sucesso!');
  } catch (error) {
    console.error('ERRO ao fazer login!', error);
    res.status(500).send('ERRO ao fazer login!');
  }

  
});


// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage(); // Armazena o arquivo na memória do servidor temporariamente
const upload = multer({ storage: storage }); //configura o multer para utilizar o armazenamento que acabamos de definir

// Rota para upload de imagem de usuário
app.post('/uploadImage', upload.single('imagem_do_formData'), async (req, res) => {// upload.single('imagem_do_formData') significa que a rota espera um arquivo no campo imagem_do_formData, upload.single processa apenas um arquivo por vez
  const {id_user} = req.body;
  const imagem = req.file;

  if (!id_user || !imagem) {
    return res.status(400).send('ID de usuário e imagem são obrigatórios!');
  }

  try {
    const query = 'INSERT INTO UsuarioImagem (id_user, imagem) VALUES ($1, $2)';
    await client.query(query, [id_user, imagem.buffer]); //O buffer do arquivo contém os dados binários da imagem

    res.status(200).send('Imagem carregada com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar imagem', error);
    res.status(500).send('Erro ao salvar imagem!');
  }
});


// Inicia o servidor na porta 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
