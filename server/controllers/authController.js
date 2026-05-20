import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Konfigurasi Pengirim Email Otomatis
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const register = async (req, res) => {
    
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().custom((value, helpers) => {
            if (!value.toLowerCase().endsWith('@gmail.com')) {
                return helpers.message("Validasi Gagal: Pendaftaran hanya diizinkan menggunakan email @gmail.com");
            }
            return value;
        }).required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Buat 6 digit kode OTP acak
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                otp: otpCode,
                isVerified: false
            }
        });

        await transporter.sendMail({
            from: `"EatSistent AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Kode Verifikasi EatSistent Anda",
            html: `<h3>Halo ${name}!</h3><p>Kode verifikasi (OTP) Anda adalah: <b>${otpCode}</b></p><p>Masukkan kode ini di aplikasi untuk mengaktifkan akun Anda.</p>`
        });

        res.status(201).json({ message: "Registrasi berhasil! Silakan periksa kotak masuk Gmail Anda untuk kode OTP.", email: newUser.email });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan server internal saat mengirim email", error: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan!" });

        if (user.otp !== otp) return res.status(400).json({ message: "Kode OTP salah atau tidak valid!" });
i
        await prisma.user.update({
            where: { email },
            data: { isVerified: true, otp: null } 
        });

        res.status(200).json({ message: "Email berhasil diverifikasi! Anda sekarang bisa Login." });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan internal server", error: err.message });
    }
};

// Fungsi Login dengan pengecekan status verifikasi
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan!" });

        // Tolak login jika email belum di verifikasi OTP
        if (!user.isVerified) return res.status(403).json({ message: "Email belum diverifikasi. Silakan verifikasi OTP terlebih dahulu!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Password salah!" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: "Login berhasil!", token });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan server internal", error: err.message });
    }
};