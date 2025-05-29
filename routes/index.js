var express = require("express");
var router = express.Router();

/**
 *
 * GETS
 *
 *
 */

/* GET home page. */
router.get("/", function (req, res, next) {
  if (global.usuarioEmail && global.usuarioEmail != "") {
    res.redirect("/browse");
  }

  res.render("index", { titulo: "EventHub - Login" });
});

/* GET browse */
router.get("/browse", verificarLogin, async function (req, res, next) {
  const categorias = await global.banco.buscarCategorias();
  const eventos = await global.banco.buscarEventos();
  res.render("browse", {
    categorias,
    eventos
   });
});

/*GET evento */
router.get("/evento/:id", verificarLogin, async function(req, res, next){
  const codevento = req.params.id;
  const evento = await global.banco.buscarEventoPorCodigo(codevento);
  res.render("evento", {
    evento
  });
});

/**
 *
 * POSTS
 *
 *
 */

/* POST login */
router.post("/login", async function (req, res, next) {
  const email = req.body.email;
  const senha = req.body.senha;

  const usuario = await global.banco.buscarUsuario({ email, senha });

  global.usuarioCodigo = usuario.usucodigo;
  global.usuarioEmail = usuario.usuemail;
  res.redirect("/browse");
});

/**
 *
 * Funções diversas
 *
 */

function verificarLogin(req, res, next) {
  if (!global.usuarioEmail || global.usuarioEmail == "") {
    return res.redirect("/");
  }
  next();
}

module.exports = router;
