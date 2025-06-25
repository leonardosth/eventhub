var express = require("express");
var router = express.Router();

/* GET login */
router.get("/", function (req, res, next) {
  if (global.adminEmail && global.adminEmail != "") {
    res.redirect("/admin/gerenciamento");
  }
  res.render("admin/admin", { titulo: "EventHub Admin - Login" });
});

/* GET deshboard - busca eventos */
router.get("/dashboard", verificarLoginAdmin, async function (req, res, next) {
  try {
    const listaDeEventos = await global.banco.buscarEventos();

    // CORREÇÃO: Mude a chave do objeto de 'event' para 'eventos'
    res.render("admin/dashboard", {
      eventos: listaDeEventos, // <--- AQUI ESTÁ A MUDANÇA
      mensagem: "",
      sucesso: false,
    });
  } catch (error) {
    console.error("Erro ao buscar eventos para o dashboard:", error);
    next(error);
  }
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
    categoria: req.body.categoria,
  };

  if (
    evento.nomeevento == "" ||
    evento.descevento == "" ||
    evento.dataevento == "" ||
    evento.categoria == ""
  ) {
    const listaDeEventos = await global.banco.buscarEventos();
    res.render("admin/dashboard", {
      eventos: listaDeEventos,
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
      categoria: req.body.categoria,
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
  console.log(req.body);
  const email = req.body.email;
  const senha = req.body.senha;

  const admin = await global.banco.buscarAdmin({ email, senha });

  global.adminCodigo = admin.admcodigo;
  global.adminEmail = admin.admemail;
  res.redirect("/admin/gerenciamento");
});

function verificarLoginAdmin(req, res, next) {
  if (!global.adminEmail || global.adminEmail == "") {
    return res.redirect("/admin");
  }
  next();
}

module.exports = router;
