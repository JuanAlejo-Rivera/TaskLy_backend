import {CorsOptions} from 'cors'

export const corsConfig: CorsOptions ={
    origin: function (origin, callback){


        const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_PROD_URL];// el undefined es para permitir las peticiones desde postman 

        if(process.argv[2] === '--api'){
            whitelist.push(undefined)
        }

        if(whitelist.includes(origin)){
                callback(null, true)
        }else{
            callback(new Error('No permitido por CORS'))
        }
    }
}