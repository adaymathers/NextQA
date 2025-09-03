# Despliegue QA Panel

## Backend

- Para iniciar el backend, usa el comando:

```
npm start
```

Ejecuta este comando en la carpeta `backend-prisma`.

El backend quedará disponible en:
```
http://<IP_LOCAL>:5000
```
(Reemplaza `<IP_LOCAL>` por la IP de tu servidor en la red local, por ejemplo `192.168.0.97`)

## Frontend

- Para iniciar el frontend y exponerlo en la red local, usa:

```
```
npx vite --host
```

Ejecuta este comando en la carpeta `frontend-prototype`.

El frontend quedará disponible en:
```
http://<IP_LOCAL>:5173
```

## Variables de entorno

Asegúrate de tener el archivo `.env` en la carpeta `frontend-prototype` con:
```
VITE_API_URL=http://<IP_LOCAL>:5000
```

## Acceso desde otros dispositivos

- Accede desde cualquier dispositivo en la misma red usando la IP local y el puerto correspondiente.
- Ejemplo en tablet:
```
http://192.168.0.97:5173
```

## Notas
- El backend debe estar configurado para escuchar en `0.0.0.0`.
- El frontend debe usar la variable de entorno para conectar correctamente con el backend.
