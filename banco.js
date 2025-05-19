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

async function buscarAdmin(admin) {
  const conexao = await conectarBD();
  const sql = "select * from admin where admemail=? and admsenha=?;";
  const [admEcontrado] = await conexao.query(sql, [admin.email, admin.senha]);
  return admEcontrado && admEcontrado.length > 0 ? admEcontrado[0] : {};
}

async function buscarEventos() {
  const conexao = await conectarBD();
  const sql = "select * from eventos";
  const [eventosEncontrados] = await conexao.query(sql);
  return eventosEncontrados;
}

async function cadastrarEvento(evento) {
  const conexao = await conectarBD();
  const sql =
    "insert into eventos (nomeevento, descevento, dataevento, imgevento, tipoevento) values (?, ?, ?, ?, ?);";
  await conexao.query(sql, [
    evento.nomeevento,
    evento.descevento,
    evento.dataevento,
    evento.imgevento,
    evento.tipoevento,
  ]);
}

async function atualizarEvento(evento) {
  const conexao = await conectarBD();
  const sql =
    "update eventos set nomeevento = ?, descevento = ?, dataevento = ?, imgevento = ?, tipoevento = ? where codevento = ?";
  await conexao.query(sql, [
    evento.nomeevento,
    evento.descevento,
    evento.dataevento,
    evento.imgevento,
    evento.tipoevento,
    evento.codevento,
  ]);
}

async function apagarEvento(codevento) {
  const conexao = await conectarBD();
  const sql = "delete from eventos where codevento = ?";
  await conexao.query(sql, [codevento]);
}

conectarBD();

module.exports = {
  buscarUsuario,
  buscarAdmin,
  buscarEventos,
  cadastrarEvento,
  atualizarEvento,
  apagarEvento,
};
