import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from 'morgan'
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import ProjectRoutes from "./routes/projectRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();
connectDB();


const app = express();//aqui agregamos toda la configuracion del proyecto
app.use(cors(corsConfig)); // con esta linea habilitamos CORS, para permitir las peticiones que estan en la whitelist


//Loggin
app.use(morgan('dev'));

//Leer datos de formulario
app.use(express.json()); //Esto habilita el body parser para que pueda leer los datos que le enviamos desde el cliente


//Routes
app.use('/api/auth', authRoutes)//auth
app.use('/api/projects', ProjectRoutes)//proyectos



export default app;