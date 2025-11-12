# ClimaBot
ClimaBot es una aplicación web desarrollada en Vue 3 que funciona como
un asistente conversacional para consultar el clima de distintas ciudades
de Argentina.

## Objetivo
El objetivo del proyecto es crear una aplicación interactiva que 
permita comunicarse con un bot para obtener información meteorológica
en tiempo real, integrando frontend, backend y base de datos.

## Funcionalidades
- Chat interactivo.  
- Historial de conversaciones.  
- Creacion de multiples chats.  
- Actualización automática del estado de conexión.  

## Tecnologías utilizadas
- *Frontend:* Vue 3, Vite, Axios, HTML, CSS  
- *Backend:* Node.js, Express  
- *Comunicación en tiempo real:* Socket.io
- *API Utilizada:* OpenWeatherMap
- *Base de datos:* MySQL en XAMPP

## ¿Como se inicializa?
*Requisitos previos*
- Node.js (para ejecutar el servidor y el cliente)
- XAMPP (para usar Apache y MySQL)
- npm (para ejecutar comandos)

*Pasos de instalación*
1. Descargá el proyecto como ZIP y descomprimilo en tu computadora.
2. Abrí XAMPP y activá los servicios Apache y MySQL.
3. Ingresá al panel de administración de MySQL (botón Admin en XAMPP).
4. En la pestaña SQL, copiá y pegá el contenido del archivo "SQL - create database.txt", luego ejecutalo para crear la base de datos.
5. Abrí la consola (CMD) y, usando el comando cd, navegá hasta la carpeta server del proyecto.
6. Una vez allí, ejecutá npm install para descargar todas las dependencias necesarias.
7. Iniciá el servidor con el comando npm run dev.
8. En otra consola, usá nuevamente cd para entrar a la carpeta client del proyecto.
9. Dentro del cliente, ejecutá npm run dev para iniciar la parte visual (frontend).
10. Por último, abrí en tu navegador la dirección que aparece en la consola (por ejemplo, http://localhost:5173) y comenzá a usar ClimaBot.

## Autores
Proyecto desarrollado por Emilio Lodi y Juan Giaveno como trabajo práctico de Base de Datos II.
