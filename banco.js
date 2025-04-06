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

conectarBD();

module.exports = { buscarUsuario };
