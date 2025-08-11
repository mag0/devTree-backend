import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization

    if (!bearer) {
        return res.status(401).json({ error: 'No Autorizado' })
    }

    const [, token] = bearer.split(' ')

    if (!token) {
        return res.status(401).json({ error: 'No Autorizado' })
    }

    try {
        const result = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof result == 'object' && result.id) {
            const user = await User.findById(result.id).select('-password')
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' })
            }
            req.user = user
            next()
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Token No Válido' })
    }
}