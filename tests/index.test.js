// index.test.js

const request = require("supertest");
const express = require("express");
const indexRouter = require("../routes/index"); // Ajuste o caminho para o seu arquivo de rotas

// --- Configuração do Ambiente de Teste ---

// 1. Criamos um app Express "falso" que usa nossas rotas
const app = express();
app.use(express.urlencoded({ extended: false })); // Habilita o parsing de formulários (para o login)
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
});
