import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const prisma = new PrismaClient();

export const register = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        res.status(201).json({
            message: "Registrasi berhasil!",
            data: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan server internal", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Password salah!" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: "Login berhasil!", token });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan server internal", error: err.message });
    }
};