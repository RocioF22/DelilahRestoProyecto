-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 13-01-2021 a las 16:36:02
-- Versión del servidor: 10.1.32-MariaDB
-- Versión de PHP: 7.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `delilah`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_pedido`
--

CREATE TABLE `estado_pedido` (
  `id` int(11) NOT NULL,
  `nombre` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `estado_pedido`
--

INSERT INTO `estado_pedido` (`id`, `nombre`) VALUES
(1, 'NUEVO'),
(2, 'CONFIRMADO'),
(3, 'PREPARANDO'),
(4, 'ENVIANDO'),
(5, 'CANCELADO'),
(6, 'ENTREGADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `forma_de_pago`
--

CREATE TABLE `forma_de_pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `forma_de_pago`
--

INSERT INTO `forma_de_pago` (`id`, `nombre`) VALUES
(1, 'Tarjeta de débito'),
(2, 'Tarjeta de crédito'),
(3, 'Efectivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `estado_pedido_id` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `forma_de_pago_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `hora` time NOT NULL,
  `direccion_envio` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id`, `estado_pedido_id`, `total`, `forma_de_pago_id`, `usuario_id`, `hora`, `direccion_envio`) VALUES
(1, 1, 1275, 3, 1, '15:00:00', 'Mi casa 123'),
(41, 1, 1450, 2, 4, '15:02:14', 'Entre Rios 22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_producto`
--

CREATE TABLE `pedido_producto` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `pedido_producto`
--

INSERT INTO `pedido_producto` (`id`, `pedido_id`, `producto_id`, `cantidad`) VALUES
(1, 1, 1, 3),
(69, 41, 1, 2),
(70, 41, 10, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `nombre` varchar(64) NOT NULL,
  `precio` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `img` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`nombre`, `precio`, `id`, `img`) VALUES
('Bagel de salmón', 425, 1, 'https://via.placeholder.com/150'),
('Hamburguesa clásica', 350, 8, 'https://via.placeholder.com/150'),
('Sandwich veggie', 350, 9, 'https://via.placeholder.com/150'),
('Focaccia', 300, 10, 'https://via.placeholder.com/150'),
('Ensalada veggie', 340, 11, 'https://via.placeholder.com/150'),
('Sandwich focaccia', 440, 12, 'https://via.placeholder.com/150'),
('Sandwich de Jamon y Queso', 260, 13, 'https://via.placeholder.com/150'),
('Milanesa de carne con Papas fritas', 380, 14, 'https://via.placeholder.com/150');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `correo` varchar(64) NOT NULL,
  `clave` varchar(64) NOT NULL,
  `telefono` varchar(64) NOT NULL,
  `direccion_envio` varchar(64) NOT NULL,
  `nombre_apellido` varchar(64) NOT NULL,
  `usuario` varchar(64) NOT NULL,
  `esAdmin` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `correo`, `clave`, `telefono`, `direccion_envio`, `nombre_apellido`, `usuario`, `esAdmin`) VALUES
(1, 'admin@yopmail.com', '12345', '134254', 'mi casa 222', 'Rodolfo Rodriguez', 'admin1', 1),
(2, 'lionelmessi@yopmail.com', 'argentina10', '454614', '9 de Julio 668', 'Lionel Andres Messi', 'Lio10', 0),
(4, 'mbappe@yopmail.com', 'francia10', '4546142', 'Entre Rios 22', 'Killiam Mbappe', 'mbappePSG', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `forma_de_pago`
--
ALTER TABLE `forma_de_pago`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_estado_pedido` (`estado_pedido_id`),
  ADD KEY `fk_forma_de_pago` (`forma_de_pago_id`),
  ADD KEY `fk_usuario` (`usuario_id`);

--
-- Indices de la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pedido` (`pedido_id`),
  ADD KEY `fk_producto` (`producto_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `forma_de_pago`
--
ALTER TABLE `forma_de_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_estado_pedido` FOREIGN KEY (`estado_pedido_id`) REFERENCES `estado_pedido` (`id`),
  ADD CONSTRAINT `fk_forma_de_pago` FOREIGN KEY (`forma_de_pago_id`) REFERENCES `forma_de_pago` (`id`),
  ADD CONSTRAINT `fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  ADD CONSTRAINT `fk_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`),
  ADD CONSTRAINT `fk_producto` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
