// admin.test.js

const request = require("supertest");
const express = require("express");
const path = require("path");
const adminRouter = require("../routes/admin.js"); // Ajuste o caminho para seu arquivo admin.js

// --- Configuração do Ambiente de Teste ---

// 1. Criamos um app Express "falso" para os testes
const app = express();
// Habilita o parsing de formulários para os posts de login, criação e edição
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
// Montamos nosso router na rota '/admin'. Isso é importante!
// Significa que todas as requisições de teste devem começar com /admin
app.use("/admin", adminRouter);

// 2. Mock (simulação) do banco de dados para as funções de admin
const mockDb = {
  buscarAdmin: jest.fn(),
  buscarEventos: jest.fn(),
  cadastrarEvento: jest.fn(),
  atualizarEvento: jest.fn(),
  apagarEvento: jest.fn(),
  listarInscricoes: jest.fn(),
  listarUsuarios: jest.fn(),
};

// --- Início dos Testes ---

describe("Testes das Rotas do Painel de Administração", () => {
  // beforeEach é executado antes de cada teste para garantir um ambiente limpo
  beforeEach(() => {
    // Atribuímos nosso banco falso ao objeto global
    global.banco = mockDb;
    // Limpamos as variáveis de "sessão" do admin
    global.adminCodigo = null;
    global.adminEmail = null;
    // Limpa o histórico de chamadas das funções mockadas entre os testes
    jest.clearAllMocks();
  });

  // --- Testes de Autenticação e Acesso ---
  describe("Autenticação do Admin", () => {
    test("GET /admin/ -> Deve renderizar a página de login se não estiver logado", async () => {
      const res = await request(app).get("/admin/");
      expect(res.statusCode).toBe(200);
    });

    test("GET /admin/ -> Deve redirecionar para /admin/gerenciamento se estiver logado", async () => {
      global.adminEmail = "admin@logado.com"; // Simula admin logado
      const res = await request(app).get("/admin/");
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/admin/gerenciamento");
    });

    test("POST /admin/login -> Deve logar o admin e redirecionar com sucesso", async () => {
      const mockAdmin = {
        admcodigo: 42,
        admemail: "admin@teste.com",
      };
      mockDb.buscarAdmin.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post("/admin/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ email: "admin@teste.com", senha: "123" });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/admin/gerenciamento");
      expect(global.adminCodigo).toBe(mockAdmin.admcodigo); // Verifica se a "sessão" foi criada
      expect(global.adminEmail).toBe(mockAdmin.admemail);
      expect(mockDb.buscarAdmin).toHaveBeenCalledWith({
        email: "admin@teste.com",
        senha: "123",
      });
    });

    test("GET /admin/dashboard -> Deve redirecionar para /admin se não estiver logado", async () => {
      const res = await request(app).get("/admin/dashboard");
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/admin");
    });
  });

  // --- Testes de Gerenciamento de Eventos (CRUD) ---
  describe("Gerenciamento de Eventos (CRUD)", () => {
    // Antes de cada teste de CRUD, simulamos o login
    beforeEach(() => {
      global.adminCodigo = 1;
      global.adminEmail = "admin@logado.com";
    });

    test("GET /admin/dashboard -> Deve buscar e exibir os eventos", async () => {
      const mockEventos = [
        {
          codevento: 1,
          nomeevento: "Evento de Teste Completo",
          descevento: "Descrição do evento de teste.",
          dataevento: new Date(), // <-- MUITO IMPORTANTE: Precisa ser um objeto Date real.
          imgevento: "caminho/para/imagem.jpg",
          tipoevento: 1, // ou qualquer outro valor esperado
        },
      ];
      mockDb.buscarEventos.mockResolvedValue(mockEventos); // Prepara resposta do banco

      const res = await request(app).get("/admin/dashboard");
      expect(res.statusCode).toBe(200);
      expect(mockDb.buscarEventos).toHaveBeenCalledTimes(1);
    });

    test("POST /admin/eventos -> Deve criar um novo evento com sucesso e redirecionar", async () => {
      const novoEvento = {
        nomeevento: "Novo Evento Criado",
        descevento: "Descrição do novo evento",
        dataevento: "2025-12-25",
        imgevento: "img.jpg",
        categoria: 1,
      };
      mockDb.cadastrarEvento.mockResolvedValue({}); // Simula que o cadastro funcionou

      const res = await request(app)
        .post("/admin/eventos")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(novoEvento);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/admin/dashboard");
      expect(mockDb.cadastrarEvento).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeevento: "Novo Evento Criado", // Checa se a função foi chamada com os dados corretos
        })
      );
    });

    test("POST /admin/eventos -> Deve retornar erro se campos obrigatórios estiverem vazios", async () => {
      const eventoInvalido = {
        nomeevento: "", // Campo obrigatório vazio
        descevento: "Descrição",
        dataevento: "2025-12-25",
        categoria: 1,
      };

      const res = await request(app)
        .post("/admin/eventos")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(eventoInvalido);

      expect(res.statusCode).toBe(200); // O código re-renderiza a página com status 200
      expect(mockDb.cadastrarEvento).not.toHaveBeenCalled(); // Garante que o evento não foi cadastrado
    });

    test("POST /admin/eventos/:id -> Deve atualizar um evento e redirecionar", async () => {
      const eventoAtualizado = {
        nomeevento: "Evento Atualizado",
        descevento: "Descrição atualizada",
        dataevento: "2026-01-01",
        imgevento: "img2.jpg",
        categoria: 2,
      };
      mockDb.atualizarEvento.mockResolvedValue({});

      const res = await request(app)
        .post("/admin/eventos/5")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(eventoAtualizado);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/admin/dashboard");
      expect(mockDb.atualizarEvento).toHaveBeenCalledWith(
        expect.objectContaining({
          codevento: "5",
          nomeevento: "Evento Atualizado",
        })
      );
    });

    test("POST /admin/eventos/delete/:id -> Deve apagar um evento e redirecionar", async () => {
      mockDb.apagarEvento.mockResolvedValue({});

      const res = await request(app).post("/admin/eventos/delete/7"); // Testando apagar o evento com id 7

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/admin/dashboard");
      expect(mockDb.apagarEvento).toHaveBeenCalledWith("7"); // Verifica se a função foi chamada com o ID correto
    });
  });

  describe("Páginas de Visualização de Dados do Admin", () => {
    // Simula o login do admin antes de cada teste neste grupo
    beforeEach(() => {
      global.adminCodigo = 1;
      global.adminEmail = "admin@logado.com";
    });

    // Teste para a rota GET /inscricoes
    describe("GET /admin/inscricoes", () => {
      test("Deve renderizar a página de inscrições com os dados do banco", async () => {
        // Arrange: Preparamos a resposta falsa do banco
        const mockInscricoes = [
          {
            nomeusuario: "Ana Silva",
            nomeevento: "Festival de Verão",
            data_inscricao: new Date(),
          },
          {
            nomeusuario: "Bruno Costa",
            nomeevento: "Tech Conference 2025",
            data_inscricao: new Date(),
          },
        ];
        mockDb.listarInscricoes.mockResolvedValue(mockInscricoes);

        // Act: Fazemos a requisição
        const res = await request(app).get("/admin/inscricoes");

        // Assert: Verificamos os resultados
        expect(res.statusCode).toBe(200);
        expect(mockDb.listarInscricoes).toHaveBeenCalledTimes(1);
      });
    });

    // Teste para a rota GET /lista_usuarios
    describe("GET /admin/lista_usuarios", () => {
      test("Deve renderizar a página de usuários com os dados do banco", async () => {
        // Arrange
        const mockUsuarios = [
          {
            usucodigo: 1,
            nomeusuario: "Leonardo",
            usuemail: "leonardo@gmail.com",
          },
          {
            usucodigo: 2,
            nomeusuario: "Ana Silva",
            usuemail: "ana.silva@example.com",
          },
        ];
        mockDb.listarUsuarios.mockResolvedValue(mockUsuarios);

        // Act
        const res = await request(app).get("/admin/lista_usuarios");

        // Assert
        expect(res.statusCode).toBe(200);
        expect(mockDb.listarUsuarios).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Páginas Estáticas do Admin (Protegidas)", () => {
    // Usamos test.each para testar múltiplas rotas com a mesma lógica, evitando repetição de código.
    const rotasProtegidas = [
      "/admin/gerenciamento",
      "/admin/usuarios_pendentes",
      "/admin/lista_eventos",
    ];

    // Teste para acesso não autorizado
    test.each(rotasProtegidas)(
      "Deve redirecionar a rota %s para /admin se não estiver logado",
      async (rota) => {
        // Arrange: Garantimos que o admin NÃO está logado
        global.adminCodigo = null;
        global.adminEmail = null;

        // Act
        const res = await request(app).get(rota);

        // Assert
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe("/admin");
      }
    );

    // Teste para acesso autorizado
    test.each(rotasProtegidas)(
      "Deve renderizar a rota %s com sucesso se estiver logado",
      async (rota) => {
        // Arrange: Simulamos o login
        global.adminCodigo = 1;
        global.adminEmail = "admin@logado.com";

        // Act
        const res = await request(app).get(rota);

        // Assert
        expect(res.statusCode).toBe(200);
      }
    );
  });
});
