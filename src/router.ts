// router.ts
import { Router } from "express";
import { body } from "express-validator";
import { createAccount } from "./handlers";

const router = Router()

router.post('/auth/register', 
    body('handle')
        .notEmpty()
        .withMessage('El nombre de usuario no puede estar vacio'),
    body('nombre')
        .notEmpty()
        .withMessage('El nombre no puede estar vacio'),
    body('email')
        .isEmail()
        .withMessage('El email no es válido'),
    body('nombre')
        .isLength({min: 8})
        .withMessage('El password es muy corto, minimo 8 caracteres'),
    createAccount);


export default router;
