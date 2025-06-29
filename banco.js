const mysql = require("mysql2/promise");

async function conectarBD() {
  if (global.conexao && global.conexao.state !== "disconnected") {
    return global.conexao;
  }

  /*
    const connectionString = 'mysql://root:senha@localhost:3306/livraria' 
    const connection= await mysql.createConnection(connectionString)
    */

  const conexao = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "EventHub",
  });

  console.log("Conectou no MySQL pelo arquivo correto!");

  global.conexao = conexao;
  return global.conexao;
}

async function buscarUsuario(usuario) {
  const conexao = await conectarBD();
  const sql = "select * from usuarios where usuemail=? and ususenha=?;";
  const [usuarioEcontrado] = await conexao.query(sql, [
    usuario.email,
    usuario.senha,
  ]);
  return usuarioEcontrado && usuarioEcontrado.length > 0
    ? usuarioEcontrado[0]
    : {};
}

async function listarUsuarios() {
  const conexao = await conectarBD();
  const sql = "SELECT * FROM usuarios";
  const [listaUsuarios] = await conexao.query(sql);
  return listaUsuarios;
}

async function buscarAdmin(admin) {
  const conexao = await conectarBD();
  const sql = "select * from admin where admemail=? and admsenha=?;";
  const [admEcontrado] = await conexao.query(sql, [admin.email, admin.senha]);
  return admEcontrado && admEcontrado.length > 0 ? admEcontrado[0] : {};
}

async function buscarEventos() {
  const conexao = await conectarBD();
  const sql = "select * from eventos;";
  const [eventosEncontrados] = await conexao.query(sql);
  return eventosEncontrados;
}

async function buscarEventoPorCodigo(codigo) {
  const conexao = await conectarBD();
  const sql = "select * from eventos where codevento=?;";
  const [evento] = await conexao.query(sql, [codigo]);
  return evento[0];
}

async function buscarCategorias() {
  const conexao = await conectarBD();
  const sql = "select * from categorias;";
  const [categoriasEncontradas] = await conexao.query(sql);
  return categoriasEncontradas;
}

async function buscarEventosPorCategoria(codcategoria) {
  const conexao = await conectarBD();
  const sql = "select * from eventos where categoria = ?;";
  const [eventos] = await conexao.query(sql, [codcategoria]);
  return eventos;
}

async function cadastrarEvento(evento) {
  const conexao = await conectarBD();
  const sql =
    "insert into eventos (nomeevento, descevento, dataevento, imgevento, categoria) values (?, ?, ?, ?, ?);";
  await conexao.query(sql, [
    evento.nomeevento,
    evento.descevento,
    evento.dataevento,
    evento.imgevento,
    evento.categoria,
  ]);
}

async function atualizarEvento(evento) {
  const conexao = await conectarBD();
  const sql =
    "update eventos set nomeevento = ?, descevento = ?, dataevento = ?, imgevento = ?, categoria = ? where codevento = ?";
  await conexao.query(sql, [
    evento.nomeevento,
    evento.descevento,
    evento.dataevento,
    evento.imgevento,
    evento.categoria,
    evento.codevento,
  ]);
}

async function apagarEvento(codevento) {
  const conexao = await conectarBD();
  const sql = "delete from eventos where codevento = ?";
  await conexao.query(sql, [codevento]);
}

async function buscarFavoritosDoUsuario(codusuario) {
  const conexao = await conectarBD();
  const sql = "SELECT codevento FROM favoritos WHERE codusuario = ?";
  const [eventosFavoritos] = await conexao.query(sql, [codusuario]);
  return eventosFavoritos;
}

async function buscarEventosFavoritados(codusuario) {
  const conexao = await conectarBD();
  const sql = "SELECT * FROM lista_favoritos WHERE usuario = ?";
  const [eventosFavoritados] = await conexao.query(sql, [codusuario]);
  return eventosFavoritados;
}

async function verificarFavorito(codusuario, codevento) {
  const conexao = await conectarBD();
  const sql =
    "SELECT COUNT(*) as count FROM favoritos WHERE codusuario = ? AND codevento = ?";
  const [ehFavorito] = await conexao.query(sql, [codusuario, codevento]);
  return ehFavorito;
}

async function favoritarEvento(codusuario, codevento) {
  const conexao = await conectarBD();
  const sql = "INSERT INTO favoritos (codusuario, codevento) VALUES (?, ?)";
  await conexao.query(sql, [codusuario, codevento]);
}

async function listarInscricoes() {
  const conexao = await conectarBD();
  const sql =
    "select i.codinscricao, u.nomeusuario, e.nomeevento, i.datainscricao, i.status_inscricao from inscricoes as i inner join eventos as e on e.codevento = i.codevento inner join usuarios as u on u.usucodigo = i.codusuario;";
  const [listaInscricoes] = await conexao.query(sql);
  return listaInscricoes;
}

async function desfavoritarEvento(codusuario, codevento) {
  const conexao = await conectarBD();
  const sql = "DELETE FROM favoritos WHERE codusuario = ? AND codevento = ?";
  await conexao.query(sql, [codusuario, codevento]);
}

async function verificarInscricao(codusuario, codevento) {
  const conexao = await conectarBD();
  const sql = `
    SELECT * FROM inscricoes 
    WHERE codusuario = ? AND codevento = ?
  `;
  const [resultado] = await conexao.query(sql, [codusuario, codevento]);
  return resultado.length > 0; // retorna true se já estiver inscrito
}

async function inscreverUsuario(codusuario, codevento) {
  const conexao = await conectarBD();
  const sql = `
    INSERT INTO inscricoes (codusuario, codevento)
    VALUES (?, ?)
  `;
  await conexao.query(sql, [codusuario, codevento]);
}

conectarBD();

module.exports = {
  buscarUsuario,
  buscarAdmin,
  buscarEventos,
  buscarEventoPorCodigo,
  buscarCategorias,
  cadastrarEvento,
  atualizarEvento,
  apagarEvento,
  buscarEventosPorCategoria,
  buscarFavoritosDoUsuario,
  verificarFavorito,
  favoritarEvento,
  desfavoritarEvento,
  buscarEventosFavoritados,
  listarUsuarios,
  listarInscricoes,
  verificarInscricao,
  inscreverUsuario,
};
