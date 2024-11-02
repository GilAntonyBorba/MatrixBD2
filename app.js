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


// Rota para pegar os dados dos usuários, incluindo imagens
app.get('/usuarios', async (req, res) => {
  const query = `
    SELECT usuario.id_user, usuario.login, usuarioimg.imagem, usuarioimg.tipo_imagem
    FROM Usuario usuario LEFT JOIN UsuarioImagem usuarioimg ON usuario.id_user = usuarioimg.id_user
  `;

  try {
    const result = await client.query(query);
    const usuarios = result.rows.map(usuario => {
      // Converte a imagem de binário para base64(formato que pode ser manipulado) se ela existir
      //base64 é usada para representar dados binários em uma string de texto, o que facilita o envio de imagens para o front-end.
      if (usuario.imagem) {
        usuario.imagem = Buffer.from(usuario.imagem).toString('base64');
      }
      return usuario;
    });
    res.json(usuarios); // Retorna os dados em formato JSON
  } catch (error) {
    console.error('Erro ao buscar usuários e imagens', error.stack);
    res.status(500).send('Erro ao buscar usuários e imagens');
  }
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
const upload = multer({
  storage: storage, // Usa o armazenamento configurado acima
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de tamanho do arquivo (1 MB = 1024 KB e 1 KB = 1024 bytes)
  fileFilter: (req, file, cb) => { // Função para limitar tipos de arquivos
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Aceita o arquivo
    } else {
      cb(new Error("Tipo de arquivo inválido! Apenas JPG, PNG, GIF e MP4 são permitidos."), false);
    }
  }
});

// Rota para upload de imagem de usuário
app.post('/uploadImage', (req, res) => {
  upload.single('imagem_do_formData')(req, res, async (err) => { // upload.single('imagem_do_formData') significa que a rota espera um arquivo no campo imagem_do_formData, upload.single processa apenas um arquivo por vez
    //(req, res, async (err) => { ... }) chamada após o multer processar o arquivo

    if (err instanceof multer.MulterError) {
      return res.status(400).send('O arquivo ultrapassa o tamanho máximo permitido de 10MB!');
    } else if (err) {
      return res.status(400).send(err.message); // Erro de tipo de arquivo
    }
  
    const {id_user} = req.body;
    const imagem = req.file;

    if (!id_user || !imagem) {
      return res.status(400).send('ID de usuário e imagem são obrigatórios!');
    }

    try {
      const tipoImagem = imagem.mimetype.split('/')[1]; // extrai "jpeg", "png", etc...

      const query = 'INSERT INTO UsuarioImagem (id_user, imagem, tipo_imagem) VALUES ($1, $2, $3)';
      await client.query(query, [id_user, imagem.buffer, tipoImagem]); //O buffer do arquivo contém os dados binários da imagem

      res.status(200).send('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar imagem', error);
      res.status(500).send('Erro ao salvar imagem!');
    }
  });
});


// Inicia o servidor na porta 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
