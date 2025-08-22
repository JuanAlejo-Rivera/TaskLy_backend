import type { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

//este middleware se encarga de manejar los errores de validacion
//valida que los datos enviados en el body no esten vacios 
export const handleInputErrors = (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let error = validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })
        return;
    }
    next();
    return;
}

