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

  res.status(200).render("index", { titulo: "EventHub - Login" });
});

/* GET browse */
router.get("/browse", verificarLogin, async function (req, res, next) {
  // Busca as categorias e eventos como antes
  const categorias = await global.banco.buscarCategorias();
  const eventos = await global.banco.buscarEventos();

  // NOVO: Busca os favoritos do usuário logado
  const favoritos = await global.banco.buscarFavoritosDoUsuario(
    global.usuarioCodigo
  );

  // NOVO: Transforma o array de objetos em um array simples de IDs para facilitar o uso no template
  // Ex: de [{codevento: 1}, {codevento: 11}] para [1, 11]
  const favoritosIds = favoritos.map((f) => f.codevento);

  // Renderiza a página passando a lista de IDs favoritados
  res.render("browse", {
    categorias,
    eventos,
    favoritosIds, // Enviando a nova variável para o front-end
  });
});

/*GET evento */
router.get("/evento/:id", verificarLogin, async function (req, res, next) {
  const codevento = req.params.id;

  const evento = await global.banco.buscarEventoPorCodigo(codevento);
  const jaInscrito = await global.banco.verificarInscricao(
    global.usuarioCodigo,
    codevento
  );
  const comentarios = await global.banco.buscarComentarios(codevento);
  res.render("evento", {
    evento,
    jaInscrito,
    comentarios,
  });
});

router.post("/inscrever", verificarLogin, async function (req, res) {
  const codusuario = global.usuarioCodigo;
  const codevento = req.body.codevento;

  await global.banco.inscreverUsuario(codusuario, codevento);

  res.redirect("/evento/" + codevento);
});

/*GET categoria_evento */
router.get(
  "/categoria_evento/:id",
  verificarLogin,
  async function (req, res, next) {
    const codcategoria = req.params.id;
    const categorias = await global.banco.buscarCategorias();
    const eventos = await global.banco.buscarEventosPorCategoria(codcategoria);
    res.render("categoria_evento", {
      categorias,
      eventos,
    });
  }
);

/* GET Favoritos */

router.get("/favoritos", verificarLogin, async function (req, res, next) {
  const eventos = await global.banco.buscarEventosFavoritados(
    global.usuarioCodigo
  );
  res.render("favoritos", { eventos });
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

/* POST para Favoritar/Desfavoritar Evento */
router.post("/favoritar/:id", verificarLogin, async function (req, res, next) {
  const codevento = req.params.id;
  const codusuario = global.usuarioCodigo; // Pegando o código do usuário logado

  // Verifica se o evento já está favoritado
  const jaEhFavorito = await global.banco.verificarFavorito(
    codusuario,
    codevento
  );

  if (jaEhFavorito[0].count) {
    // Se já for favorito, desfavorita
    await global.banco.desfavoritarEvento(codusuario, codevento);
  } else {
    // Se não for favorito, favorita
    await global.banco.favoritarEvento(codusuario, codevento);
  }

  res.redirect(req.get("referer") || "/browse");
});

//feedback
router.post(
  "/evento/:id/feedback",
  verificarLogin,
  async function (req, res, next) {
    const { comentario } = req.body;
    const codevento = req.params.id;
    const codusuario = global.usuarioCodigo;

    await global.banco.registrarComentario(codevento, codusuario, comentario);

    res.redirect("/evento/" + codevento);
  }
);

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
