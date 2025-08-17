import User from "../models/User"
import { Request, Response } from 'express'
import { checkPassword, hashPassword } from "../utils/auth"
import slug from 'slug'
import { generateJWT } from "../utils/jwt"

export const createAccount = async (req: Request, res: Response) => {

    const { email, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
        const error = new Error('Un usuario con ese email ya esta registrado')
        return res.status(409).json({ error: error.message })
    }

    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({ handle })
    if (handleExists) {
        const error = new Error('Nombre de usuario no disponible')
        return res.status(409).json({ error: error.message })
    }

    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = handle

    await user.save()

    res.status(201).send('Registro Creado Correctamente')
}

export const login = async (req: Request, res: Response) => {

    const { email, password } = req.body

    // Revisar si el usuario esta registrado
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ error: error.message })
    }

    // Comprobar el password
    const isPasswordCorrect = await checkPassword(password, user.password)
    if (!isPasswordCorrect) {
        const error = new Error('Contraseña incorrecta')
        return res.status(401).json({ error: error.message })
    }

    const token = generateJWT({ id: user._id })

    res.status(200).send(token)

}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description } = req.body

        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({ handle })
        if (handleExists && handleExists.email !== req.user.email) {
            const error = new Error('Nombre de usuario no disponible')
            return res.status(409).json({ error: error.message })
        }

        // Actualizar el usuario
        req.user.handle = handle
        req.user.description = description
        await req.user.save()

        res.send('Perfil actualizado correctamente')
    } catch (e) {
        const error = new Error('Hubo un error al actualizar el perfil')
        return res.status(500).json({ error: error.message })
    }
}