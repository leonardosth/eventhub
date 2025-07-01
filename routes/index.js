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

// GET para exibir a página de cadastro
router.get("/cadastro", function (req, res, next) {
  // O 'error: null' garante que a variável exista no template na primeira carga
  res.render("cadastro", { titulo: "EventHub - Cadastro", error: null });
});

// POST para processar o formulário de cadastro
router.post("/cadastro", async function (req, res, next) {
  // 1. Pega os dados do corpo da requisição
  const { nomeusuario, email, senha, confirmar_senha } = req.body;

  // 2. Validação simples: as senhas conferem?
  if (senha !== confirmar_senha) {
    // Se não conferem, renderiza a página de novo com uma mensagem de erro
    return res.render("cadastro", {
      titulo: "EventHub - Cadastro",
      error: "As senhas não conferem. Tente novamente.",
    });
  }

  try {
    // 3. Tenta cadastrar o usuário no banco
    await global.banco.cadastrarUsuario({ nomeusuario, email, senha });

    // 4. Se o cadastro for bem-sucedido, redireciona para a página de login
    res.redirect("/");
  } catch (error) {
    // 5. Se der erro (provavelmente e-mail duplicado), trata o erro
    console.error("Erro ao cadastrar usuário:", error);

    // Verifica se o erro é de entrada duplicada (padrão do MySQL/MariaDB)
    if (error.code === "ER_DUP_ENTRY") {
      return res.render("cadastro", {
        titulo: "EventHub - Cadastro",
        error: "Este e-mail já está em uso. Por favor, tente outro.",
      });
    }

    // Para outros erros, envia para o handler de erro do Express
    next(error);
  }
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
