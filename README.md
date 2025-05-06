# KidsTube2--Backend

## Descripción
KidsTube2--Backend es la API backend para una plataforma de videos diseñada para niños. Proporciona funcionalidades como la gestión de usuarios, videos, playlists y usuarios restringidos, además de autenticación y verificación de usuarios.

## Tecnologías utilizadas
- **Node.js**: Entorno de ejecución para JavaScript.
- **Express.js**: Framework para construir la API REST.
- **MongoDB**: Base de datos NoSQL para almacenar la información.
- **Mongoose**: ODM para interactuar con MongoDB.
- **JWT (JSON Web Tokens)**: Para autenticación y autorización.
- **Twilio**: Para enviar mensajes SMS.
- **Mailjet**: Para enviar correos electrónicos de verificación.
- **Google OAuth**: Para autenticación con cuentas de Google.

## Instalación
1. Clona este repositorio:
   ```bash
   git clone https://github.com/StivenAAJ/KidsTube---Backend.git

2. Navega al directorio del proyecto:
    cd KidsTube2--Backend

3. Instala las dependencias:
    npm install

4. Crea un archivo .env en la raíz del proyecto con las siguientes variables de entorno:

PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<base_de_datos>
JWT_SECRET=tu_secreto_jwt
GOOGLE_CLIENT_ID=tu_google_client_id
MAILJET_API_KEY=tu_mailjet_api_key
MAILJET_API_SECRET=tu_mailjet_api_secret
MAILJET_VERIFIED_SENDER=tu_email_verificado
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=tu_twilio_phone_number
FRONTEND_URL=http://localhost:5173


5. Inicia el servidor:
    npm start

## Endpoints principales

## Usuarios

POST /users: Crear un usuario.

GET /users: Obtener todos los usuarios o un usuario por ID.

PATCH /users/:id: Actualizar un usuario.

DELETE /users/:id: Eliminar un usuario.

POST /users/validate-pin: Validar el PIN de un usuario.

POST /auth/google-signup: Registro con Google.

## Videos

POST /videos: Crear un video.

GET /videos: Obtener todos los videos o un video por ID.

PATCH /videos/:id: Actualizar un video.

DELETE /videos/:id: Eliminar un video.
Playlists
POST /playlists: Crear una playlist.
GET /playlists: Obtener todas las playlists o una por ID.
PATCH /playlists/:id: Actualizar una playlist.
DELETE /playlists/:id: Eliminar una playlist.
Usuarios restringidos
POST /restrictedUsers: Crear un usuario restringido.
GET /restrictedUsers: Obtener todos los usuarios restringidos o uno por ID.
GET /restrictedUsers/by-parent/:parentAccount: Obtener usuarios restringidos por cuenta padre.
PATCH /restrictedUsers/:id: Actualizar un usuario restringido.
DELETE /restrictedUsers/:id: Eliminar un usuario restringido.

## Colección de Postman
Puedes importar la colección de Postman incluida en el archivo KidsTube.postman_collection.json para probar los endpoints.