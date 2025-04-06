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
router.get("/browse", function (req, res, next) {
  verificarLogin(res);
  res.render("browse", { titulo: "EventHub - Navegação" });
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

function verificarLogin(res) {
  if (!global.usuarioEmail || global.usuarioEmail == "") res.redirect("/");
}

module.exports = router;
