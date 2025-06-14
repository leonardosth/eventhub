const request = require("supertest");
const admin = require("../routes/admin");

describe("Favoritar evento", () => {
  let evento = {
    nome: "Show",
    desc: "show",
    data: "2025-05-08",
    favorito: false,
  };

  it("Quando estiver null deve favoritar", () => {
    admin.favoritar(evento);
    expect(evento.favorito).toBe(true);
  });

  it("Quando já favorito deve remover o favorito", () => {
    favoritar(evento);
    admin.expect(evento.favorito).toBe(false);
  });
});

describe("Post login", () => {
  it("Enviando os dados de login do usuário deve retornar sucesso", async () => {
    const res = await request(admin)
      .post("/api/posts")
      .send({
        body: {
          email: "leonardo@gmail.com",
          senha: "123",
        },
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("post");
  });
});

test('Deve retornar erro para cadastro com e-mail inválido', () => {
    const resultado = validarCadastro({
        nome: 'Usuário Teste',
        email: 'email-invalido',
        senha: 'senhaSegura123'
    });
    expect(resultado).toEqual({ sucesso: false, mensagem: 'E-mail inválido' });
});

test('Deve retornar erro ao tentar autenticar com senha incorreta', async () => {
    const resultado = await autenticarUsuario('usuario@email.com', 'senhaErrada');
    expect(resultado).toEqual({ sucesso: false, mensagem: 'Credenciais inválidas' });
});

test('Deve retornar erro ao enviar feedback com texto muito longo', () => {
    const resultado = enviarFeedback(eventoId, 'a'.repeat(1001)); // 1001 caracteres
    expect(resultado).toEqual({ sucesso: false, mensagem: 'Feedback excede o limite de caracteres' });
});

test('Deve agendar notificação para evento favoritado', () => {
    const resultado = agendarNotificacao(usuarioId, eventoId);
    expect(resultado).toEqual({ sucesso: true, mensagem: 'Notificação agendada' });
});