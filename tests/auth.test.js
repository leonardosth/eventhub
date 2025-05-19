//const jest = require("jest");

describe("Favoritar evento", () => {
  let evento = {
    nome: "Show",
    desc: "show",
    data: "2025-05-08",
    favorito: false,
  };

  it("Quando estiver null deve favoritar", () => {
    favoritar(evento);
    expect(evento.favorito).toBe(true);
  });

  it("Quando já favorito deve remover o favorito", () => {
    favoritar(evento);
    expect(evento.favorito).toBe(false);
  });
});
