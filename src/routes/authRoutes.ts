import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";



const router = Router();

router.post("/create-account",
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los passwords no son iguales');
        }
        return true;
    }),
    body('email')
        .isEmail().withMessage('E-mail no válido'),

    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('El token es obligatorio'),
    handleInputErrors,
    AuthController.confirmAccount

)
router.post('/login',
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    body('password')
        .notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    AuthController.login

)
router.post('/request-code',
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.requestConfirmationCode

)
router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.forgotPassword

)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('El token es obligatorio'),
    handleInputErrors,
    AuthController.validateToken
)
router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no válido'), // envia la ruta como parametro y se puede tomar la info de req.params
    body('password')
        .isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los passwords no son iguales');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updatepasswordWithToken
)
//codigo para obtener el usuario autenticado en el momento
// se usa el middleware authenticate para proteger la ruta y que solo usuarios autenticados puedan acceder
router.get('/user',
    authenticate,// se pune el  authenticate para proteger la ruta
    AuthController.user
)

/**Profile */

router.put('/profile',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .isEmail().withMessage('E-mail no válido'),

    handleInputErrors,
    AuthController.updateProfile
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los passwords no son iguales');
        }
        return true;
    }),

    handleInputErrors,
    AuthController.updateCurrentUserPassword
)
router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router;