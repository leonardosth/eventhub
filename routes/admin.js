var express = require("express");
var router = express.Router();

/* GET login */
router.get("/", function (req, res, next) {
  if (global.adminEmail && global.adminEmail != "") {
    res.redirect("/admin/gerenciamento");
  }

  res.status(200).render("admin/admin", { titulo: "EventHub Admin - Login" });
});

/* GET deshboard - busca eventos */
router.get("/dashboard", verificarLoginAdmin, async function (req, res, next) {
  eventos = await global.banco.buscarEventos();
  res.status(200).render("admin/dashboard", {
    event: eventos,
    mensagem: "",
    sucesso: false,
  });
});

/*Get gerenciamento */
router.get(
  "/gerenciamento",
  verificarLoginAdmin,
  async function (req, res, next) {
    res.render("admin/gerenciamento", {});
  }
);

/* GET Inscrções*/
router.get("/inscricoes", verificarLoginAdmin, async function (req, res, next) {
  res.render("admin/inscricoes", {});
});

/* POST deshboard - cadastra eventos */
router.post("/eventos", verificarLoginAdmin, async function (req, res, next) {
  const evento = {
    nomeevento: req.body.nomeevento,
    descevento: req.body.descevento,
    dataevento: req.body.dataevento,
    imgevento: req.body.imgevento,
    tipoevento: req.body.tipoevento,
  };

  if (
    evento.nomeevento == "" ||
    evento.descevento == "" ||
    evento.dataevento == "" ||
    evento.tipoevento == ""
  ) {
    res.render("admin/dashboard", {
      admNome: global.admNome,
      mensagem:
        "Todos os campos devem ser preenchidos: Nome, Descrição, Data e Tipo.",
      sucesso: false,
    });
  } else {
    try {
      global.banco.cadastrarEvento(evento);
      res.status(201).redirect("/admin/dashboard");
    } catch (error) {
      console.alert("Não foi possível cadastrar o evento");
      res.status(500).redirect("/admin/dashboard");
    }
  }
});

/* PUT deshboard - atualiza eventos */
router.post(
  "/eventos/:id",
  verificarLoginAdmin,
  async function (req, res, next) {
    const evento = {
      codevento: req.params.id,
      nomeevento: req.body.nomeevento,
      descevento: req.body.descevento,
      dataevento: req.body.dataevento,
      imgevento: req.body.imgevento,
      tipoevento: req.body.tipoevento,
    };

    global.banco.atualizarEvento(evento);

    res.status(201).redirect("/admin/dashboard");
  }
);

/* DELETE deshboard - apaga eventos */
router.post(
  "/eventos/delete/:id",
  verificarLoginAdmin,
  async function (req, res, next) {
    const codevento = req.params.id;

    global.banco.apagarEvento(codevento);

    res.status(201).redirect("/admin/dashboard");
  }
);

/* POST login */
router.post("/login", async function (req, res, next) {
  const email = req.body.email;
  const senha = req.body.senha;

  const admin = await global.banco.buscarAdmin({ email, senha });

  global.adminCodigo = admin.admcodigo;
  global.adminEmail = admin.admemail;
  res.status(200).redirect("/admin/gerenciamento");
});

function verificarLoginAdmin(req, res, next) {
  if (!global.adminEmail || global.adminEmail == "") {
    return res.redirect("/admin");
  }
  next();
}

module.exports = router;
