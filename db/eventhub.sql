-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: eventhub
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `admcodigo` int(11) NOT NULL AUTO_INCREMENT,
  `admemail` varchar(50) DEFAULT NULL,
  `admsenha` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`admcodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'leonardo@gmail.com','123');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `codcategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nomecategoria` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`codcategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Festas'),(2,'Teatro'),(3,'Standup'),(4,'passeios'),(5,'M?sica'),(6,'Esportes'),(7,'Tecnologia'),(8,'Gastronomia'),(9,'Arte e Cultura'),(10,'Neg?cios'),(11,'Com?dia'),(12,'Cinema'),(13,'Workshop'),(14,'Palestras'),(15,'Feiras'),(16,'Festivais'),(17,'Shows'),(18,'Confer?ncias'),(19,'Lan?amentos'),(20,'Encontros'),(21,'Competi??es'),(22,'Exposi??es'),(23,'Cursos');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventos` (
  `codevento` int(11) NOT NULL AUTO_INCREMENT,
  `nomeevento` varchar(50) NOT NULL,
  `descevento` varchar(250) NOT NULL,
  `dataevento` date NOT NULL,
  `imgevento` varchar(100) DEFAULT NULL,
  `categoria` int(11) DEFAULT NULL,
  PRIMARY KEY (`codevento`),
  KEY `categoria` (`categoria`),
  CONSTRAINT `categoria` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`codcategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (1,'System of a Down','Turnê sul-americana SOAD em curituba','2025-05-24','https://drive.google.com/uc?id=14KNkRDaO2eB7EDILthK1w8IhjD-w73TS',4),(2,'Startup weekend','Encontro de empresas de tecnlogia','2025-05-31','https://tinyurl.com/yx36zpf4',1),(3,'Comic Con Experience','Comic Con Experience SP','2025-06-28','https://tinyurl.com/297p5brn',1),(11,'Codecon - Tecnologia','Convenção de programação e desenvolvimento de software','2025-05-31','https://media.licdn.com/dms/image/v2/C4D0BAQEl8cfA_Gq7RQ/company-logo_200_200/company-logo_200_200/0',1),(12,'Festival de Ver?o','O maior festival de m?sica da esta??o com artistas nacionais e internacionais.','2025-07-15','/img/festival_verao.jpg',13),(13,'Maratona de Joinville','Corra pelas ruas da cidade na 10? edi??o da maratona anual.','2025-08-22','/img/maratona_jlle.jpg',2),(14,'Tech Conference 2025','Palestras sobre o futuro da intelig?ncia artificial e desenvolvimento de software.','2025-09-05','/img/tech_conf.jpg',3),(15,'Sabores da Serra','Festival gastron?mico com comidas t?picas da serra catarinense.','2025-07-20','/img/sabores_serra.jpg',4),(16,'Exposi??o Arte Moderna','Obras de artistas contempor?neos em exibi??o no museu da cidade.','2025-10-01','/img/arte_moderna.jpg',5),(17,'Startup Summit','Encontro de empreendedores e investidores para alavancar novos neg?cios.','2025-11-10','/img/startup_summit.jpg',6),(18,'Noite de Stand-Up','Os melhores comediantes do sul do pa?s em uma noite de muitas risadas.','2025-08-01','/img/standup.jpg',7),(19,'Pe?a \"O Auto da Compadecida\"','A cl?ssica pe?a de Ariano Suassuna em cartaz no teatro municipal.','2025-09-18','/img/auto_compadecida.jpg',8),(20,'Mostra de Cinema Franc?s','Exibi??o dos filmes mais aclamados do cinema franc?s recente.','2025-07-25','/img/cinema_frances.jpg',9),(21,'Workshop de Fotografia','Aprenda t?cnicas de fotografia com o renomado fot?grafo Carlos azevedo.','2025-08-12','/img/workshop_foto.jpg',10),(22,'Palestra sobre Finan?as','Como organizar suas finan?as pessoais e come?ar a investir.','2025-11-20','/img/palestra_financas.jpg',11),(23,'Feira de Livros','Grande feira com descontos incr?veis em livros de diversas editoras.','2025-08-30','/img/feira_livros.jpg',12),(24,'Show Ac?stico de Ana Vilela','Uma noite especial com os maiores sucessos da cantora.','2025-10-10','/img/show_anavilela.jpg',14),(25,'Confer?ncia de Marketing Digital','As ?ltimas tend?ncias e estrat?gias para o marketing online.','2025-10-25','/img/conf_mkt.jpg',15),(26,'Lan?amento do Livro \"A Ilha\"','Sess?o de aut?grafos com o autor do novo best-seller de fic??o.','2025-09-15','/img/lancamento_livro.jpg',16),(27,'Encontro de Colecionadores','Encontro para troca e venda de itens colecion?veis como selos e moedas.','2025-07-18','/img/encontro_colecionadores.jpg',17),(28,'Campeonato de Skate','Competi??o de skate com as categorias amador e profissional.','2025-09-07','/img/camp_skate.jpg',18),(29,'Exposi??o de Carros Antigos','Uma viagem no tempo com os carros que marcaram ?poca.','2025-11-02','/img/carros_antigos.jpg',19),(30,'Curso de Culin?ria Italiana','Aprenda a fazer massas frescas e molhos tradicionais.','2025-08-08','/img/curso_italiano.jpg',20),(31,'Oktoberfest Joinville','A tradicional festa alem? com muita m?sica, dan?a e chopp.','2025-10-17','/img/oktoberfest.jpg',13);
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favoritos` (
  `codusuario` int(11) NOT NULL,
  `codevento` int(11) NOT NULL,
  PRIMARY KEY (`codusuario`,`codevento`),
  KEY `codevento` (`codevento`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`codusuario`) REFERENCES `usuarios` (`usucodigo`),
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`codevento`) REFERENCES `eventos` (`codevento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
INSERT INTO `favoritos` VALUES (1,1),(1,2),(2,3),(2,12),(3,13),(4,14),(5,15),(6,16),(7,18),(8,31),(9,20),(10,11),(11,21),(12,23),(13,24),(14,28),(15,30),(18,1),(21,29);
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `usucodigo` int(11) NOT NULL AUTO_INCREMENT,
  `nomeusuario` varchar(100) NOT NULL,
  `usuemail` varchar(50) DEFAULT NULL,
  `ususenha` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`usucodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Leonardo','leonardo@gmail.com','123'),(2,'Ana Silva','ana.silva@example.com','senha123'),(3,'Bruno Costa','bruno.costa@example.com','senha123'),(4,'Carla Dias','carla.dias@example.com','senha123'),(5,'Diego Fernandes','diego.fernandes@example.com','senha123'),(6,'Elisa Gomes','elisa.gomes@example.com','senha123'),(7,'F?bio Lima','fabio.lima@example.com','senha123'),(8,'Gisela Melo','gisela.melo@example.com','senha123'),(9,'Hugo Nogueira','hugo.nogueira@example.com','senha123'),(10,'Isabela Oliveira','isabela.oliveira@example.com','senha123'),(11,'Jo?o Pereira','joao.pereira@example.com','senha123'),(12,'K?tia Rocha','katia.rocha@example.com','senha123'),(13,'Lucas Souza','lucas.souza@example.com','senha123'),(14,'Maria Teixeira','maria.teixeira@example.com','senha123'),(15,'Nelson Vieira','nelson.vieira@example.com','senha123'),(16,'Ot?vio Almeida','otavio.almeida@example.com','senha123'),(17,'Paula Barros','paula.barros@example.com','senha123'),(18,'Ricardo Campos','ricardo.campos@example.com','senha123'),(19,'Sofia Esteves','sofia.esteves@example.com','senha123'),(20,'Tiago Freitas','tiago.freitas@example.com','senha123'),(21,'V?nia Lopes','vania.lopes@example.com','senha123');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-22 21:58:45
