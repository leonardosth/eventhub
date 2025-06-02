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
