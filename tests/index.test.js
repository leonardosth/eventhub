// index.test.js

const request = require("supertest");
const express = require("express");
const path = require("path");
const indexRouter = require("../routes/index"); // Ajuste o caminho para o seu arquivo de rotas

// --- Configuração do Ambiente de Teste ---

// 1. Criamos um app Express "falso" que usa nossas rotas
const app = express();
app.use(express.urlencoded({ extended: false })); // Habilita o parsing de formulários (para o login)
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use("/", indexRouter);

// 2. Mock (simulação) do banco de dados. Usamos jest.fn() para criar funções falsas.
const mockDb = {
  buscarCategorias: jest.fn(),
  buscarEventos: jest.fn(),
  buscarFavoritosDoUsuario: jest.fn(),
  buscarUsuario: jest.fn(),
  verificarFavorito: jest.fn(),
  favoritarEvento: jest.fn(),
  desfavoritarEvento: jest.fn(),
  buscarEventoPorCodigo: jest.fn(),
  buscarEventosPorCategoria: jest.fn(),
  verificarInscricao: jest.fn(),
  inscreverUsuario: jest.fn(),
  buscarEventosFavoritados: jest.fn(),
  buscarComentarios: jest.fn(),
  registrarComentario: jest.fn(),
  cadastrarUsuario: jest.fn(),
};

// --- Início dos Testes ---

describe("Testes das Rotas de Eventos", () => {
  // A função beforeEach() é executada ANTES de cada teste neste bloco.
  // É perfeita para limpar o estado entre os testes.
  beforeEach(() => {
    // 3. Atribuímos nosso banco falso ao objeto global antes de cada teste
    global.banco = mockDb;

    // 4. Limpamos as variáveis de "sessão" e os mocks
    global.usuarioCodigo = null;
    global.usuarioEmail = null;
    jest.clearAllMocks(); // Limpa o histórico de chamadas das funções mockadas
  });

  // --- Testes para a Rota GET / ---
  describe("GET /", () => {
    test("Deve renderizar a página de login se o usuário não estiver logado", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200); // Esperamos um status OK
      // O supertest não renderiza o HTML, mas podemos checar se o redirect não aconteceu
    });

    test("Deve redirecionar para /browse se o usuário estiver logado", async () => {
      global.usuarioEmail = "logado@teste.com"; // Simulando usuário logado
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(302); // 302 é o status de redirecionamento
      expect(res.headers.location).toBe("/browse"); // Verifica se redirecionou para o lugar certo
    });
  });

  // --- Testes para a Rota POST /login ---
  describe("POST /login", () => {
    test("Deve definir os dados do usuário e redirecionar para /browse com sucesso", async () => {
      const mockUsuario = { usucodigo: 1, usuemail: "teste@exemplo.com" };
      // Quando buscarUsuario for chamado, ele deve retornar nosso usuário falso
      mockDb.buscarUsuario.mockResolvedValue(mockUsuario);

      const res = await request(app)
        .post("/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ email: "teste@exemplo.com", senha: "123" }); // Enviando dados do formulário

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/browse");
      expect(global.usuarioCodigo).toBe(mockUsuario.usucodigo); // Verifica se a "sessão" foi criada
      expect(global.usuarioEmail).toBe(mockUsuario.usuemail);
      expect(mockDb.buscarUsuario).toHaveBeenCalledWith({
        email: "teste@exemplo.com",
        senha: "123",
      }); // Verifica se o banco foi chamado corretamente
    });
  });

  // --- Testes para a Rota GET /browse ---
  describe("GET /browse", () => {
    test("Deve redirecionar para / se o usuário não estiver logado", async () => {
      const res = await request(app).get("/browse");
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/");
    });

    test("Deve renderizar a página browse com os dados corretos", async () => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "logado@teste.com";

      // Preparamos as respostas falsas do banco
      mockDb.buscarEventos.mockResolvedValue([{ nomeevento: "Evento Teste" }]);
      mockDb.buscarCategorias.mockResolvedValue([
        { nomecategoria: "Categoria Teste" },
      ]);
      mockDb.buscarFavoritosDoUsuario.mockResolvedValue([{ codevento: 5 }]);

      const res = await request(app).get("/browse");

      expect(res.statusCode).toBe(200);
      expect(mockDb.buscarEventos).toHaveBeenCalledTimes(1);
      expect(mockDb.buscarCategorias).toHaveBeenCalledTimes(1);
      expect(mockDb.buscarFavoritosDoUsuario).toHaveBeenCalledWith(1); // Verifica se buscou favoritos do usuário logado
    });
  });

  // Adicione este bloco ao seu index.test.js
  describe("GET /favoritos", () => {
    // Simula o login antes de cada teste
    beforeEach(() => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "teste@logado.com";
    });

    test("Deve renderizar a página de favoritos com os eventos corretos", async () => {
      // Arrange: Criamos um mock completo para evitar erros de renderização no EJS
      const mockEventosFavoritados = [
        {
          codevento: 10,
          nomeevento: "Evento Favoritado 1",
          descevento: "Descrição.",
          dataevento: new Date(),
        },
      ];
      mockDb.buscarEventosFavoritados.mockResolvedValue(mockEventosFavoritados);

      // Act
      const res = await request(app).get("/favoritos");

      // Assert
      expect(res.statusCode).toBe(200);
      // Verifica se a função correta do banco foi chamada com o ID do usuário logado
      expect(mockDb.buscarEventosFavoritados).toHaveBeenCalledWith(1);
    });
  });

  // --- Testes para a Rota POST /favoritar/:id ---
  describe("POST /favoritar/:id", () => {
    test("Deve redirecionar para / se o usuário não estiver logado", async () => {
      const res = await request(app).post("/favoritar/1");
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/");
    });

    test("Deve chamar favoritarEvento se o evento ainda não for favorito", async () => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "logado@teste.com";

      // Simula que o evento NÃO é favorito (verificarFavorito retorna count 0)
      mockDb.verificarFavorito.mockResolvedValue([{ count: 0 }]);
      mockDb.favoritarEvento.mockResolvedValue({}); // Apenas simula que a função existe e termina

      const res = await request(app).post("/favoritar/10");

      expect(res.statusCode).toBe(302); // Espera um redirecionamento
      expect(mockDb.verificarFavorito).toHaveBeenCalledWith(1, "10");
      expect(mockDb.favoritarEvento).toHaveBeenCalledTimes(1); // Verifica se a função de favoritar foi chamada
      expect(mockDb.desfavoritarEvento).not.toHaveBeenCalled(); // Garante que a de desfavoritar NÃO foi chamada
    });

    test("Deve chamar desfavoritarEvento se o evento já for favorito", async () => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "logado@teste.com";

      // Simula que o evento JÁ é favorito (verificarFavorito retorna count 1)
      mockDb.verificarFavorito.mockResolvedValue([{ count: 1 }]);
      mockDb.desfavoritarEvento.mockResolvedValue({});

      const res = await request(app).post("/favoritar/10");

      expect(res.statusCode).toBe(302);
      expect(mockDb.verificarFavorito).toHaveBeenCalledWith(1, "10");
      expect(mockDb.desfavoritarEvento).toHaveBeenCalledTimes(1); // Verifica se a função de desfavoritar foi chamada
      expect(mockDb.favoritarEvento).not.toHaveBeenCalled(); // Garante que a de favoritar NÃO foi chamada
    });
  });

  // Adicione este bloco ao seu index.test.js
  describe("GET /evento/:id", () => {
    // Simula o login antes de cada teste deste grupo
    beforeEach(() => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "teste@logado.com";
    });

    test("Deve renderizar a página do evento com todos os dados (evento, inscrição e comentários)", async () => {
      // Arrange: Preparamos as respostas falsas para todas as chamadas ao banco
      const eventoId = "5";
      const mockEvento = {
        codevento: eventoId,
        nomeevento: "Show de Teste",
        dataevento: new Date(),
      };
      const mockInscricaoStatus = [{ count: 0 }]; // Simula que o usuário NÃO está inscrito
      const mockComentarios = [
        { comentario: "Comentário de teste!", nomeusuario: "Ana" },
      ];

      mockDb.buscarEventoPorCodigo.mockResolvedValue(mockEvento);
      mockDb.verificarInscricao.mockResolvedValue(mockInscricaoStatus);
      mockDb.buscarComentarios.mockResolvedValue(mockComentarios); // Mock da busca de comentários

      // Act: Fazemos a requisição
      const res = await request(app).get(`/evento/${eventoId}`);

      // Assert: Verificamos os resultados
      expect(res.statusCode).toBe(200);

      // Verifica se cada função do banco foi chamada com os parâmetros corretos
      expect(mockDb.buscarEventoPorCodigo).toHaveBeenCalledWith(eventoId);
      expect(mockDb.verificarInscricao).toHaveBeenCalledWith(1, eventoId);
      // VERIFICAÇÃO CHAVE: Garante que buscarComentarios foi chamado com o ID do evento
      expect(mockDb.buscarComentarios).toHaveBeenCalledWith(eventoId);
    });

    test("Deve redirecionar para a home se o usuário não estiver logado", async () => {
      // Arrange: Garantimos que o usuário não está logado
      global.usuarioCodigo = null;
      global.usuarioEmail = null;

      // Act
      const res = await request(app).get("/evento/5");

      // Assert
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/");
    });
  });

  // Adicione este bloco ao seu index.test.js
  describe("POST /inscrever", () => {
    // Simula o login antes de cada teste
    beforeEach(() => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "teste@logado.com";
    });

    test("Deve inscrever o usuário no evento e redirecionar para a página do evento", async () => {
      // Arrange: Simulamos que a função de inscrever no banco funciona
      mockDb.inscreverUsuario.mockResolvedValue({});
      const eventoIdParaInscrever = 7;

      // Act: Fazemos a requisição POST, enviando o ID do evento no corpo
      const res = await request(app)
        .post("/inscrever")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ codevento: eventoIdParaInscrever });

      // Assert
      expect(res.statusCode).toBe(302);
      // Verifica se redirecionou de volta para a página do evento correto
      expect(res.headers.location).toBe(`/evento/${eventoIdParaInscrever}`);
      // Garante que a função do banco foi chamada com os IDs corretos
      expect(mockDb.inscreverUsuario).toHaveBeenCalledWith(
        1,
        String(eventoIdParaInscrever)
      );
    });
  });

  // Em index.test.js
  describe("POST /evento/:id/feedback", () => {
    beforeEach(() => {
      global.usuarioCodigo = 1;
      global.usuarioEmail = "teste@logado.com";
    });

    test("Deve salvar o comentário e redirecionar de volta para a página do evento", async () => {
      // Arrange
      const comentarioEnviado = "Feedback final: muito bom!";
      const eventoId = "8";
      mockDb.registrarComentario.mockResolvedValue({}); // Simula sucesso no cadastro

      // Act
      const res = await request(app)
        .post(`/evento/${eventoId}/feedback`)
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ comentario: comentarioEnviado });

      // Assert
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe(`/evento/${eventoId}`);
      // Garante que a função do banco foi chamada com os dados corretos (ID da rota, ID do usuário, comentário do body)
      expect(mockDb.registrarComentario).toHaveBeenCalledWith(
        eventoId, // ID do evento da URL
        1, // ID do usuário logado (global)
        comentarioEnviado // Comentário do corpo da requisição
      );
    });

    test("Deve redirecionar para o login se o usuário não estiver logado", async () => {
      // Arrange
      global.usuarioCodigo = null;
      global.usuarioEmail = null;

      // Act
      const res = await request(app)
        .post("/evento/8/feedback")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ comentario: "Qualquer comentário" });

      // Assert
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/");
      // Garante que o comentário não foi registrado
      expect(mockDb.registrarComentario).not.toHaveBeenCalled();
    });
  });

  // Em index.test.js
  describe("GET /cadastro", () => {
    test("Deve renderizar a página de cadastro com sucesso", async () => {
      // Act: Fazemos a requisição para a página
      const res = await request(app).get("/cadastro");

      // Assert: Verificamos se a página foi retornada com status 200
      expect(res.statusCode).toBe(200);
      // Podemos também verificar se o título está correto (opcional)
      expect(res.text).toContain("Cadastro de Usuário");
    });
  });

  // Em index.test.js
  describe("POST /cadastro", () => {
    // Limpa os mocks antes de cada teste para garantir isolamento
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("Deve criar um novo usuário e redirecionar para a home em caso de sucesso", async () => {
      // Arrange: Preparamos os dados do novo usuário e simulamos sucesso no banco
      const novoUsuario = {
        nomeusuario: "Usuário Teste",
        email: "teste@exemplo.com",
        senha: "123",
        confirmar_senha: "123",
      };
      mockDb.cadastrarUsuario.mockResolvedValue(); // Simula que a inserção no banco deu certo

      // Act: Enviamos os dados para a rota de cadastro
      const res = await request(app)
        .post("/cadastro")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(novoUsuario);

      // Assert: Verificamos o resultado
      expect(res.statusCode).toBe(302); // Esperamos um redirecionamento
      expect(res.headers.location).toBe("/"); // Para a página de login (home)
      expect(mockDb.cadastrarUsuario).toHaveBeenCalledTimes(1); // O banco foi chamado uma vez
      // Verifica se a função do banco foi chamada com os dados corretos (sem a confirmação de senha)
      expect(mockDb.cadastrarUsuario).toHaveBeenCalledWith({
        nomeusuario: novoUsuario.nomeusuario,
        email: novoUsuario.email,
        senha: novoUsuario.senha,
      });
    });

    test("Deve mostrar uma mensagem de erro se as senhas não conferirem", async () => {
      // Arrange: Preparamos dados onde as senhas são diferentes
      const dadosInvalidos = {
        nomeusuario: "Usuário Teste",
        email: "teste@exemplo.com",
        senha: "123",
        confirmar_senha: "456", // Senha diferente
      };

      // Act
      const res = await request(app)
        .post("/cadastro")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(dadosInvalidos);

      // Assert
      expect(res.statusCode).toBe(200); // Esperamos que a página seja renderizada novamente
      expect(res.text).toContain("As senhas não conferem"); // Verifica se a mensagem de erro está na página
      expect(mockDb.cadastrarUsuario).not.toHaveBeenCalled(); // Garante que o banco NÃO foi chamado
    });

    test("Deve mostrar uma mensagem de erro se o e-mail já estiver em uso", async () => {
      // Arrange: Preparamos dados válidos, mas simulamos um erro de e-mail duplicado vindo do banco
      const novoUsuario = {
        nomeusuario: "Usuário Teste",
        email: "email.repetido@exemplo.com",
        senha: "123",
        confirmar_senha: "123",
      };
      // mockRejectedValue simula uma falha (uma Promise rejeitada) na chamada do banco
      // O objeto de erro imita o erro que o MariaDB/MySQL retorna para entradas duplicadas
      mockDb.cadastrarUsuario.mockRejectedValue({ code: "ER_DUP_ENTRY" });

      // Act
      const res = await request(app)
        .post("/cadastro")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(novoUsuario);

      // Assert
      expect(res.statusCode).toBe(200); // A página deve ser renderizada novamente
      expect(res.text).toContain("Este e-mail já está em uso"); // Verifica a mensagem de erro específica
      expect(mockDb.cadastrarUsuario).toHaveBeenCalledTimes(1); // O banco foi chamado, mas falhou
    });
  });
});
